import { useState, useEffect, useRef } from "react";
// context
import { useW3Info } from "../../../Web3AuthProvider";
// hooks
import { useNullaBalanceQuery } from "../../../hooks";
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
import { FaAngleLeft, FaArrowUpRightFromSquare } from "react-icons/fa6";
import Toggle from "@/utils/components/Toggle";
import { SpinningCircleWhiteSm } from "@/utils/components/SpinningCircleWhite";
import { LuCopy } from "react-icons/lu";
// utils
import { currency2decimal } from "@/utils/constants";
import { PaymentSettings, Transaction } from "@/db/UserModel";
import { NullaInfo } from "@/utils/types";
import { networkToInfo } from "@/utils/web3Constants";
import erc20Abi from "@/utils/abis/erc20Abi";
import nullaAbi from "@/utils/abis/nullaAbi";

const DetailsModal = ({
  paymentSettings,
  nullaInfo,
  clickedTxn,
  setClickedTxn,
  setDetailsModal,
  setErrorModal,
}: {
  paymentSettings: PaymentSettings;
  nullaInfo: NullaInfo;
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
  const { queryKey: nullaBalanceQueryKey } = useNullaBalanceQuery();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // states
  const [refundState, setRefundState] = useState(clickedTxn?.refund ? "refunded" : "notRefunded"); // notRefunded | refunding | refunded
  const [note, setNote] = useState(clickedTxn?.note);
  const [refundTxnHash, setRefundTxnHash] = useState(clickedTxn?.refund ?? "");
  const [popup, setPopup] = useState("");

  useEffect(() => {
    onChangeTextarea(); // resizes textarea based on mount
  }, []);

  const onClickToRefund = async () => {
    if (!clickedTxn) return;
    setClickedTxn({ ...clickedTxn, toRefund: !clickedTxn.toRefund }); // optimistic feedback
    try {
      const res = await fetch("/api/mutateTxn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          w3Info,
          nullaInfo,
          txnHash: clickedTxn.txnHash,
          change: { key: "toRefund", value: !clickedTxn.toRefund },
        }),
      });
      if (!res.ok) throw new Error("error");
      const resJson = await res.json();
      if (resJson === "saved") {
        queryClient.invalidateQueries({ queryKey: ["txns"] });
        return;
      }
    } catch (e) {}
    // if resJson != "saved" or error
    setErrorModal("Error in saving To Refund status");
    setClickedTxn({ ...clickedTxn }); // this should revert to previous note
  };

  const onChangeTextarea = async () => {
    if (textareaRef.current) {
      setNote(textareaRef.current.value);
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 4}px`; // Set height to fit content
    }
  };

  const handleOnBlurNote = async () => {
    if (!clickedTxn) return; // for TS
    try {
      const res = await fetch("/api/mutateTxn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          w3Info,
          nullaInfo,
          txnHash: clickedTxn.txnHash,
          change: { key: "note", value: note },
        }),
      });
      if (!res.ok) throw new Error("error");
      const resJson = await res.json();
      if (resJson === "saved") {
        queryClient.invalidateQueries({ queryKey: ["txns"] });
        return;
      }
    } catch (e) {}
    // if resJson != "saved" or error
    setErrorModal("Error in saving To Refund status");
    setNote(clickedTxn.note); // this should revert to previous note
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
    const nullaAddress = networkToInfo[String(chainId)].nullaAddress;
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
        spender: nullaAddress,
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
      domain: { name: "NullaPayments", version: "1", chainId: chainId, verifyingContract: nullaAddress },
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
    const payCalldata = encodeFunctionData({ abi: nullaAbi, functionName: "pay", args: [paymentData, paySignature] }); // GelatoRelay request.data only takes encoded calldata

    // 5. make Gelato Relay API call
    const relay = new GelatoRelay();
    const request: CallWithSyncFeeRequest = {
      chainId: BigInt(chainId),
      target: nullaAddress,
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
    let refundTxnHashTemp: string | undefined = "";
    for (let i = 1; i < 50; i++) {
      try {
        var taskStatus = await relay.getTaskStatus(taskId);
      } catch {}
      if (taskStatus && taskStatus.taskState == "ExecSuccess") {
        refundTxnHashTemp = taskStatus.transactionHash;
        queryClient.invalidateQueries({ queryKey: [nullaBalanceQueryKey] });
        console.log("txn executed, try:", i);
        console.log("refundTxnHash:", refundTxnHashTemp);
        break;
      }
      if (taskStatus?.taskState == "ExecReverted" || taskStatus?.taskState == "Cancelled") {
        setErrorModal("Your withdrawal failed. Please try again.");
        setRefundState("notRefunded");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!refundTxnHashTemp) {
      setErrorModal("We were unable to confirm if the refund was successful. Please check your wallet balance to confirm. We apologize for the inconvenience.");
      setRefundState("notRefunded");
    }

    //save to db
    if (refundTxnHashTemp) {
      try {
        const res = await fetch("/api/refund", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            w3Info: w3Info,
            refundTxnHash: refundTxnHashTemp,
            txnHash: clickedTxn?.txnHash,
          }),
        });
        const resJson = await res.json();
        if (resJson === "saved") {
          setRefundTxnHash(refundTxnHashTemp);
          setRefundState("refunded");
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
      <div className="fullModal">
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
        <div className="fullModalContentContainer settingsFont pb-[16px]">
          <div className="fullModalContentContainer2 max-w-[600px]">
            {/*--- details ---*/}
            <div className="detailsField">
              <p className="detailsLabelText">{t("time")}</p>
              <p className="detailsValueText">
                {getLocalDate(clickedTxn?.date)} | {getLocalTime(clickedTxn?.date)?.time} {getLocalTime(clickedTxn?.date)?.ampm}
              </p>
            </div>
            {/*--- value & value after cashback ---*/}
            <div className="detailsField">
              <p className="detailsLabelText">{t("value")}</p>
              <div className="flex items-center">
                <p className="detailsValueText">{clickedTxn?.currencyAmount}</p>
                {/*--- 2% cashback arrow ---*/}
                <div className="ml-[8px] mr-[16px] w-[48px] h-[1.5px] bg-lightText1 dark:bg-darkText1 relative">
                  <p className="text-[14px] absolute translate-x-[3px] bottom-[calc(100%-3px)] tracking-tight">2% off</p>
                  <div className="absolute left-[100%] translate-y-[-4px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[9px] border-l-darkText1"></div>
                </div>
                <p className="detailsValueText">
                  {clickedTxn?.currencyAmountAfterCashback ?? clickedTxn?.currencyAmount
                    ? (clickedTxn?.currencyAmount * 0.98).toFixed(currency2decimal[paymentSettings.merchantCurrency])
                    : ""}{" "}
                  {clickedTxn?.merchantCurrency}
                </p>
              </div>
            </div>
            <div className="detailsField">
              <p className="detailsLabelText">{t("tokens")}</p>
              <div className="detailsValueText flex items-center">
                {clickedTxn?.currencyAmountAfterCashback ?? clickedTxn?.currencyAmount
                  ? (clickedTxn?.currencyAmount * 0.98).toFixed(currency2decimal[paymentSettings.merchantCurrency])
                  : ""}
                &nbsp;&#247;&nbsp;
                {clickedTxn?.blockRate} = {clickedTxn?.tokenAmount} USDC
              </div>
            </div>
            <div className="detailsField">
              <p className="detailsLabelText pr-[16px]">{t("customerAddress")}</p>
              <div
                className="detailsValueText relative desktop:cursor-pointer desktop:hover:textGray"
                onClick={() => {
                  setPopup("copyAddress");
                  setTimeout(() => setPopup(""), 1500);
                  navigator.clipboard.writeText(clickedTxn?.customerAddress ?? "");
                }}
              >
                {clickedTxn?.customerAddress.slice(0, 7)}...
                {clickedTxn?.customerAddress.slice(-5)} <LuCopy className="inline-block pb-[3px] ml-[6px] w-[20px] h-[20px]" />
                {/*--- "copied" popup ---*/}
                {popup == "copyAddress" && (
                  <div className="textSmApp font-normal absolute left-[50%] bottom-[calc(100%+4px)] translate-x-[-50%] px-[12px] py-[4px] bg-slate-700 text-white rounded-full">
                    {tcommon("copied")}
                  </div>
                )}
              </div>
            </div>
            <div className="detailsField">
              <p className="detailsLabelText pr-[16px]">{t("notes")}</p>
              <textarea
                className="inputColor font-normal px-[8px] py-[4px] w-full rounded-[8px] h-auto"
                ref={textareaRef}
                onChange={onChangeTextarea}
                onBlur={handleOnBlurNote}
                value={note}
                rows={2}
                placeholder="Enter notes here"
              />
            </div>

            {/*--- REFUND STATUS ---*/}
            <div className="mt-[14px] w-full bg-light3 dark:bg-dark3 rounded-[16px] px-[24px] py-[20px]">
              <div className="text-center pb-[24px]">Refund Status</div>
              {refundState === "refunded" ? (
                <div className="textSmApp w-full flex flex-col items-center gap-[8px]">
                  <div className="textGray">{t("refunded")}</div>
                  <a className="flex items-center link gap-[8px]" href={`https://polygonscan.com/tx/${refundTxnHash}`} target="_blank">
                    See transaction <FaArrowUpRightFromSquare className="inline-block text-[16px]" />
                  </a>
                </div>
              ) : (
                <div className="space-y-[44px]">
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
                          <button className="button1Color refundButtonBase" onClick={() => setRefundState("confirmRefund")}>
                            {t("refund")}
                          </button>
                        </>
                      )}
                      {refundState === "confirmRefund" && (
                        <>
                          <div className="font-medium">Confirm refund?</div>
                          <div className="flex gap-[24px]">
                            <button className="button1Color refundButtonBase" onClick={onClickRefund}>
                              {t("refund")}
                            </button>
                            <button className="button2Color refundButtonBase" onClick={() => setRefundState("notRefunded")}>
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
        </div>
      </div>
      <div className="modalBlackout"></div>
    </>
  );
};

export default DetailsModal;
