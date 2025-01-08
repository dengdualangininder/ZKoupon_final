import { useState } from "react";
// context
import { useW3Info } from "../../../web3auth-provider";
// hooks
import { useFlashBalanceQuery } from "../../../hooks";
import { useQueryClient } from "@tanstack/react-query";
// i18n
import { useTranslations } from "next-intl";
// wagmi & viem
import { useConfig, useAccount } from "wagmi";
import { readContract, signTypedData } from "@wagmi/core";
import { parseUnits, formatUnits, encodeFunctionData, hexToSignature, isAddress, Abi, Address, TypedData } from "viem";
// gelato relay
import { GelatoRelay, CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
// constants
import { getLocalTime, getLocalDate } from "@/utils/functions";
// images
import { FaAngleLeft } from "react-icons/fa6";
import Toggle from "@/utils/components/Toggle";
import { SpinningCircleWhiteSm } from "@/utils/components/SpinningCircleWhite";
// types
import { PaymentSettings, Transaction } from "@/db/UserModel";
import { FlashInfo } from "@/utils/types";
import { networkToInfo } from "@/utils/web3Constants";
import erc20Abi from "@/utils/abis/erc20Abi";
import flashAbi from "@/utils/abis/flashAbi";

const DetailsModal = ({
  paymentSettings,
  flashInfo,
  clickedTxn,
  setClickedTxn,
  setDetailsModal,
  setErrorModal,
}: {
  paymentSettings: PaymentSettings;
  flashInfo: FlashInfo;
  clickedTxn: Transaction | null;
  setClickedTxn: any;
  setDetailsModal: any;
  setErrorModal: any;
}) => {
  console.log("DetailsModal.tsx, clickedTxn:", clickedTxn);

  // hooks
  const t = useTranslations("App.Payments.detailsModal");
  const tcommon = useTranslations("Common");
  const queryClient = useQueryClient();
  const account = useAccount();
  const config = useConfig();
  const w3Info = useW3Info();
  const { queryKey: flashBalanceQueryKey } = useFlashBalanceQuery();

  // states
  // const [showNote, setShowNote] = useState(false);
  const [refundState, setRefundState] = useState(clickedTxn?.refund ? "refunded" : "notRefunded"); // notRefunded | refunding | refunded

  const onClickToRefund = async () => {
    if (!clickedTxn) return;
    setClickedTxn({ ...clickedTxn, toRefund: !clickedTxn.toRefund });
    try {
      const res = await fetch("/api/toRefund", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          merchantEvmAddress: paymentSettings.merchantEvmAddress,
          txnHash: clickedTxn.txnHash,
          toRefund: clickedTxn.toRefund,
          w3Info,
          flashInfo,
        }),
      });
      if (!res.ok) throw new Error("error");
      const resJson = await res.json();
      if (resJson === "saved") {
        queryClient.invalidateQueries({ queryKey: ["txns"] });
        return;
      }
    } catch (e) {}
    setErrorModal("Error in saving To Refund status");
    setClickedTxn((prevState: Transaction) => ({ ...prevState, toRefund: !prevState.toRefund }));
  };

  async function onClickRefund() {
    // define variables and ensure they exist
    const chainId = account.chainId;
    const usdcTransferAmount = clickedTxn?.tokenAmount.toString();
    const toAddress = clickedTxn?.customerAddress;
    if (!chainId || !usdcTransferAmount || !toAddress) return;

    setRefundState("refunding");

    // 1. define variables
    const usdcAddress = networkToInfo[String(chainId)].usdcAddress;
    const flashAddress = networkToInfo[String(chainId)].flashAddress;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 3; // 3 minute deadline
    const nonce = (await readContract(config, {
      address: usdcAddress,
      abi: erc20Abi,
      functionName: "nonces",
      args: [account.address ?? "0x0"],
    })) as bigint;

    // 2. sign two EIP712 messages
    const permitSignatureHex = await signTypedData(config, {
      types: {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      } as const satisfies TypedData, // must const-assert
      primaryType: "Permit",
      domain: { name: "USD Coin", version: "2", chainId: chainId, verifyingContract: usdcAddress },
      message: {
        owner: paymentSettings?.merchantEvmAddress as Address,
        spender: flashAddress,
        value: parseUnits(usdcTransferAmount, 6),
        nonce: nonce,
        deadline: BigInt(deadline),
      },
    });
    const paySignatureHex = await signTypedData(config, {
      types: {
        Pay: [
          { name: "toAddress", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      } as const satisfies TypedData, // must const-assert
      primaryType: "Pay",
      domain: { name: "FlashPayments", version: "1", chainId: chainId, verifyingContract: flashAddress },
      message: { toAddress: toAddress as Address, nonce: nonce },
    });

    // 3. get v, r, s, from permitSignature and paySignature
    const permitSignature = hexToSignature(permitSignatureHex);
    const paySignature = hexToSignature(paySignatureHex);

    // 4. construct payCalldata & encode the function arguments
    const paymentData = {
      from: paymentSettings?.merchantEvmAddress,
      to: toAddress,
      amount: parseUnits(usdcTransferAmount, 6),
      permitData: { deadline: deadline, signature: { v: permitSignature.v, r: permitSignature.r, s: permitSignature.s } },
    };
    const payCalldata = encodeFunctionData({ abi: flashAbi, functionName: "pay", args: [paymentData, paySignature] }); // GelatoRelay request.data only takes encoded calldata

    // 5. make Gelato Relay API call
    const relay = new GelatoRelay();
    const request: CallWithSyncFeeRequest = {
      chainId: BigInt(chainId),
      target: flashAddress,
      data: payCalldata,
      feeToken: usdcAddress,
      isRelayContext: true,
    };
    try {
      var { taskId } = await relay.callWithSyncFee(request);
    } catch (e) {
      setErrorModal("Refund failed. Please try again or contact us.");
      setRefundState("notRefunded");
      return;
    }

    // 6. polling for refundTxnHash
    let refundTxnHash: string | undefined = "";
    for (let i = 1; i < 50; i++) {
      try {
        var taskStatus = await relay.getTaskStatus(taskId);
      } catch {}
      if (taskStatus && taskStatus.taskState == "ExecSuccess") {
        refundTxnHash = taskStatus.transactionHash;
        queryClient.invalidateQueries({ queryKey: [flashBalanceQueryKey] });
        console.log("txn executed, try:", i);
        console.log("refundTxnHash:", refundTxnHash);
        break;
      }
      if (taskStatus?.taskState == "ExecReverted" || taskStatus?.taskState == "Cancelled") {
        setErrorModal("Your withdrawal failed. Please try again.");
        setRefundState("notRefunded");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!refundTxnHash) {
      setErrorModal("We were unable to confirm if the refund was successful. Please check your wallet balance to confirm. We apologize for the inconvenience.");
      setRefundState("notRefunded");
    }

    //save to db
    if (refundTxnHash) {
      try {
        const res = await fetch("/api/refund", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            w3Info: w3Info,
            refundTxnHash: refundTxnHash,
            txnHash: clickedTxn?.txnHash,
          }),
        });
        const resJson = await res.json();
        if (resJson === "saved") {
          queryClient.invalidateQueries({ queryKey: ["txns"] });
          return;
        }
      } catch (e) {}
      setErrorModal("Refund was successful, but the status was not saved. Please contact support. We apologize for the inconvenience.");
      setRefundState("notRefunded");
    }
  }

  return (
    <>
      <div className="detailsModal">
        {/*--- tablet/desktop close ---*/}
        {refundState != "refunding" && (
          <>
            {/*--- desktop close ---*/}
            <div className="xButtonContainer" onClick={() => setDetailsModal(false)}>
              <div className="xButton">&#10005;</div>
            </div>
            {/*--- mobile back ---*/}
            <FaAngleLeft className="mobileBack" onClick={() => setDetailsModal(false)} />
          </>
        )}

        {/*--- HEADER ---*/}
        <div className="modalHeader">{t("title")}</div>

        {/*--- CONTENT ---*/}
        <div className="detailsModalContentContainer pb-[16px]">
          {/*--- details ---*/}
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("time")}</div>
            <div className="detailsValueText">
              {getLocalDate(clickedTxn?.date)} | {getLocalTime(clickedTxn?.date)?.time} {getLocalTime(clickedTxn?.date)?.ampm}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("value")}</div>
            <div className="detailsValueText">
              {clickedTxn?.currencyAmount} {clickedTxn?.merchantCurrency}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("tokens")}</div>
            <div className="detailsValueText">{clickedTxn?.tokenAmount} USDC</div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("rate")}</div>
            <div className="detailsValueText">
              1 USDC = {clickedTxn?.blockRate} {clickedTxn?.merchantCurrency}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("customerAddress")}</div>
            <div className="detailsValueText break-all">{clickedTxn?.customerAddress}</div>
          </div>

          {/*--- REFUND STATUS ---*/}
          <div className="modalHeaderFont pt-[28px] pb-[16px]">Refund Status</div>
          {clickedTxn?.refund ? (
            <div className="w-full text-center font-semibold text-slate-500 dark:text-slate-400">{t("refunded")}</div>
          ) : (
            <div className="space-y-[56px] desktop:space-y-[40px]">
              {/*--- "To Refund" toggle ---*/}
              <div className="w-full flex items-center justify-between">
                <div className="font-medium">{t("toRefund")}</div>
                <Toggle checked={clickedTxn?.toRefund} onClick={onClickToRefund} />
              </div>
              {/*--- refund button ---*/}
              {w3Info && (
                <div className="w-full h-[56px] flex items-center justify-between">
                  {refundState === "notRefunded" && (
                    <>
                      <div className="font-medium">{t("refundNow")}</div>
                      <button className="buttonPrimaryColor refundButtonBase" onClick={() => setRefundState("confirmRefund")}>
                        {t("refund")}
                      </button>
                    </>
                  )}
                  {refundState === "confirmRefund" && (
                    <>
                      <div className="font-medium">Confirm refund?</div>
                      <div className="flex gap-[24px]">
                        <button className="buttonPrimaryColor refundButtonBase" onClick={onClickRefund}>
                          {t("refund")}
                        </button>
                        <button className="buttonSecondaryColor refundButtonBase" onClick={() => setRefundState("notRefunded")}>
                          {tcommon("cancel")}
                        </button>
                      </div>
                    </>
                  )}
                  {refundState === "refunding" && (
                    <>
                      <div className="font-medium">{t("refunding")}</div>
                      <SpinningCircleWhiteSm />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="modalBlackout"></div>
    </>
  );
};

export default DetailsModal;
