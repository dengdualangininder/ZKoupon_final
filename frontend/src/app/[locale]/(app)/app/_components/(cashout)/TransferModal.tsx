"use client";
// next
import { useState } from "react";
import Image from "next/image";
// custom hooks
import { useNullaBalanceQuery, useCexBalanceQuery, useCexTxnsQuery } from "../../../hooks";
// wagmi & viem
import { useConfig, useAccount } from "wagmi";
import { readContract, signTypedData, getTransactionReceipt } from "@wagmi/core";
import { parseUnits, formatUnits, encodeFunctionData, hexToSignature, isAddress, Address, TypedData, hexToBigInt } from "viem";
// gelato relay
import { GelatoRelay, CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
// i18n
import { useTranslations } from "next-intl";
// images
import { CiBank } from "react-icons/ci";
import { FaCircleCheck, FaAngleLeft, FaArrowUpRightFromSquare } from "react-icons/fa6";
// utils
import { formatUsd } from "@/utils/functions";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import { CashoutSettings, PaymentSettings } from "@/db/UserModel";
import { currency2decimal, currency2symbol } from "@/utils/constants";
import { networkToInfo } from "@/utils/web3Constants";
import erc20Abi from "@/utils/abis/erc20Abi";
import nullaAbi from "@/utils/abis/nullaAbi";
import { NullaInfo } from "@/utils/types";

export default function TransferModal({
  transferModal,
  setTransferModal,
  paymentSettings,
  cashoutSettings,
  rates,
  setErrorModal,
  nullaInfo,
  cbEvmAddress,
  cbAccountName,
  cbBankAccountName,
}: {
  transferModal: "toCex" | "toAny" | "toBank" | null;
  setTransferModal: any;
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  rates: any;
  setErrorModal: any;
  nullaInfo: NullaInfo;
  cbEvmAddress: string;
  cbAccountName: string;
  cbBankAccountName: string;
}) {
  // hooks
  const t = useTranslations("App.CashOut");
  const tcommon = useTranslations("Common");
  const account = useAccount();
  const config = useConfig();
  const { data: nullaBalance, refetch: refetchNullaBalance } = useNullaBalanceQuery();
  const { data: cexBalance } = useCexBalanceQuery();
  const { refetch: refetchCexTxns } = useCexTxnsQuery();

  // states
  const [blockchainFee, setBlockchainFee] = useState(0.01); // TODO: poll gas fee
  const [usdcTransferAmount, setUsdcTransferAmount] = useState<string>("");
  const [anyAddress, setAnyAddress] = useState<string>("");
  const [transferState, setTransferState] = useState("initial"); // "initial" | "sending" | "sent"
  const [txHash, setTxHash] = useState<string | undefined>(); // nulla to cex txHash
  const [usdcTransferToBankActual, setUsdcTransferToBankActual] = useState("");
  const [usdcTransferToCexActual, setUsdcTransferToCexActual] = useState("");
  const [fiatDeposited, setFiatDeposited] = useState<string>("");

  const onClickTransferToCexSubmit = async () => {
    // check if amount exists
    if (!usdcTransferAmount) {
      setErrorModal(t("errors.enterAmount"));
      return;
    }
    // check min amount
    if (Number(usdcTransferAmount) < 0.1) {
      setErrorModal(t("errors.minUSDC"));
      return;
    }
    // check if exceed balance
    if (Number(usdcTransferAmount) > Number(nullaBalance)) {
      setErrorModal(t("errors.lowBalance"));
      return;
    }

    // determine toAddress
    if (transferModal === "toAny") {
      if (anyAddress) {
        var toAddress = anyAddress;
      } else {
        setErrorModal(t("errors.toEvmAddress"));
        return;
      }
    } else {
      if (cashoutSettings.cex === "Coinbase" && paymentSettings.merchantCountry != "Other") {
        if (cbEvmAddress) {
          var toAddress = cbEvmAddress;
        } else {
          setErrorModal("Error: Did not detect a deposit address"); // should not be possible
          return;
        }
      } else {
        if (cashoutSettings?.cexEvmAddress) {
          var toAddress = cashoutSettings?.cexEvmAddress;
        } else {
          setErrorModal("Error: Did not detect a deposit address"); // should not be possible
          return;
        }
      }
    }

    // check if toAddress if valid
    if (!isAddress(toAddress)) {
      setErrorModal(t("errors.validEvmAddress"));
      return;
    }

    const makeGaslessTransfer = async () => {
      const chainId = account.chainId;
      if (!chainId) return;
      setTransferState("sending");

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
        domain: { name: "FlashPayments", version: "1", chainId: chainId, verifyingContract: nullaAddress },
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
        setErrorModal("Withdrawal failed. Please try again or contact us.");
        setTransferState("initial");
        return;
      }

      // 6. poll for completion
      for (let i = 1; i < 50; i++) {
        try {
          var taskStatus = await relay.getTaskStatus(taskId);
        } catch {} // try needed so one failed request won't exit function
        if (taskStatus && taskStatus.taskState == "ExecSuccess") {
          setTxHash(taskStatus.transactionHash);
          const receipt = await getTransactionReceipt(config, { hash: taskStatus.transactionHash as `0x${string}` });
          setUsdcTransferToCexActual(formatUnits(hexToBigInt(receipt.logs[3].data), 6));
          refetchNullaBalance();
          setTransferState("sent");
          if (cashoutSettings.cex === "Coinbase") {
            setTimeout(() => refetchCexTxns(), 10000); // 10s likely not be enough. sometimes wait ~3min for Coinbase's pending txns to appear
          }
          return;
        }
        if (taskStatus?.taskState == "ExecReverted" || taskStatus?.taskState == "Cancelled") {
          setErrorModal("Your withdrawal failed. Please try again.");
          setTransferState("initial");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // if polling time out
      setErrorModal("We were unable to confirm if the withdrawal was successful. Please check your wallet balance to confirm. We apologize for the inconvenience.");
      setTransferState("initial");
    };
    await makeGaslessTransfer();
  };

  const onClickTransferToBankSubmit = async () => {
    // check if amount exists
    if (!usdcTransferAmount) {
      setErrorModal(t("errors.enterAmount"));
      return;
    }
    // check if exceed balance
    if (Number(usdcTransferAmount) > Number(cexBalance)) {
      setErrorModal(t("errors.lowBalance"));
      return;
    }
    // check min and max amounts
    if (Number(usdcTransferAmount) < 11) {
      setErrorModal(t("errors.minUSDC11"));
      return;
    }
    if (Number(usdcTransferAmount) > 10000.1) {
      setErrorModal("errors.maxUSDC");
      return;
    }

    setTransferState("sending");
    try {
      const res = await fetch("/api/cbWithdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: usdcTransferAmount,
          merchantCurrency: paymentSettings?.merchantCurrency,
          cbAccessToken: window.sessionStorage.getItem("cbAccessToken"),
        }),
        headers: { "content-type": "application/json" },
      });
      if (!res.ok) throw new Error("error");
      const resJson = await res.json();
      if (resJson.status === "success") {
        setFiatDeposited(resJson.fiatAmountBought);
        setUsdcTransferToBankActual(resJson.usdcAmountSold);
        setTransferState("sent");
        return;
      } else if (resJson.status === "error") {
        setErrorModal(resJson.message);
      } else {
        setErrorModal(t("errors.unknownTransferError"));
      }
    } catch (e) {
      setErrorModal(t("errors.unknownTransferError"));
    }
    setTransferState("initial");
  };

  return (
    <div>
      <div className="transferModal">
        {/*--- CLOSE/BACK BUTTON ---*/}
        {transferState === "initial" && (
          <>
            {/*--- close (tablet/desktop) ---*/}
            <div
              className="xButtonContainer"
              onClick={() => {
                setTransferModal(null);
                setUsdcTransferAmount("");
              }}
            >
              <div className="xButton">&#10005;</div>
            </div>
            {/*--- back (mobile) ---*/}
            <FaAngleLeft
              className="mobileBack"
              onClick={() => {
                setTransferModal(null);
                setUsdcTransferAmount("");
              }}
            />
          </>
        )}

        {/*--- title ---*/}
        <div className={`${transferState === "sent" ? "invisible" : ""} fullModalHeader whitespace-nowrap`}>
          {transferModal === "toCex" && tcommon("transferToCEX", { cex: cashoutSettings.cex ? cashoutSettings.cex : tcommon("CEX") })}
          {transferModal === "toAny" && tcommon("transfer")}
          {transferModal === "toBank" && tcommon("transferToBank")}
        </div>

        {/*--- CONTENT ---*/}
        <div className="fullModalContentContainer scrollbar">
          <div className="fullModalContentContainer2 max-w-[440px]">
            {transferState != "sent" && (
              <>
                {/*--- FROM CARD ---*/}
                <div className="transferCard z-2">
                  {/*--- from info ---*/}
                  <div className="flex items-center gap-x-[12px]">
                    <div className="transferIcon">
                      {(transferModal === "toCex" || transferModal === "toAny") && <Image src="/logoIcon.svg" alt="logo" fill />}
                      {transferModal === "toBank" && <Image src="/coinbase.svg" alt="logo" fill />}
                    </div>
                    {(transferModal === "toCex" || transferModal === "toAny") && (
                      <div>
                        <p className="transferText">{tcommon("from")}: Nulla</p>
                        <p className="transferSubtext truncate">{paymentSettings.merchantName}</p>
                        <p className="transferSubtext">
                          {tcommon("address")}: {paymentSettings?.merchantEvmAddress.slice(0, 7)}...
                          {paymentSettings?.merchantEvmAddress.slice(-5)}
                        </p>
                      </div>
                    )}
                    {transferModal === "toBank" && (
                      <div className="">
                        <div className="transferText">{tcommon("fromCoinbase")}</div>
                        {cbEvmAddress ? (
                          <div className="transferSubtext">
                            <p>
                              {tcommon("address")}: {cbEvmAddress.slice(0, 7)}...{cbEvmAddress.slice(-5)}
                            </p>
                            <p>{cbAccountName}</p>
                          </div>
                        ) : (
                          <div className="transferSubtext skeleton w-[160px]">
                            <p>0</p>
                            <p>0</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/*--- from amount ---*/}
                  <div className="pl-[2px] mt-[20px] transferSubtext">
                    {tcommon("balance")}: {(Math.floor(Number(transferModal === "toBank" ? cexBalance : nullaBalance) * 100) / 100).toFixed(2)} USDC
                  </div>
                  <div className="w-full flex items-center relative">
                    <input
                      className="transferAmountFromBox inputColor placeholder:not-italic"
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => setUsdcTransferAmount(e.currentTarget.value)}
                      onBlur={(e) => setUsdcTransferAmount(Number(e.currentTarget.value).toFixed(2))}
                      value={usdcTransferAmount || ""}
                      placeholder="0"
                      disabled={transferState === "sending" ? true : false}
                    />
                    {/*--- max + USDC ---*/}
                    <div className="h-full right-0 absolute flex space-x-[12px] items-center">
                      <div
                        className="text-base desktop:text-sm font-bold text-blue-500 hover:text-blue-400 cursor-pointer"
                        onClick={() => setUsdcTransferAmount(transferModal === "toBank" ? cexBalance ?? "" : nullaBalance ?? "")}
                      >
                        {tcommon("max")}
                      </div>
                      <div className="transferUsdc">USDC</div>
                    </div>
                  </div>
                </div>

                {/*--- ARROW ---*/}
                <div className="mx-auto flex items-center relative">
                  <Image src="./transferArrow.svg" alt="arrow" width={38} height={50} className="my-[8px] mx-auto" />
                  {/*--- TRANSFER FEE ---*/}
                  <div className="w-[150px] absolute left-[calc(100%+12px)] text-base desktop:text-xs desktop:leading-[1.2] textGray leading-tight">
                    {transferModal === "toCex" || transferModal === "toAny" ? (
                      <>
                        ~{blockchainFee} USDC
                        <br />
                        {tcommon("transferCost")}
                      </>
                    ) : (
                      <>
                        <div className="">
                          1 USDC <span>={paymentSettings?.merchantCurrency != "USD"}</span> {currency2symbol[paymentSettings?.merchantCurrency!]}
                          {rates.usdcToLocal}
                        </div>
                        {paymentSettings?.merchantCurrency == "USD" && <div>~0.001% fee</div>}
                      </>
                    )}
                  </div>
                </div>

                {/*--- TO CARD ---*/}
                <div className="transferCard">
                  {/*--- to info ---*/}
                  {(transferModal === "toCex" || transferModal === "toBank") && (
                    <div className="flex items-center gap-x-[12px]">
                      {/*--- icon ---*/}
                      {transferModal === "toCex" && (
                        <div className="transferIcon">
                          {cashoutSettings?.cex == "Coinbase" && <Image src="/coinbase.svg" alt="Coinbase icon" fill />}
                          {cashoutSettings?.cex == "MAX" && <Image src="/max.svg" alt="MAX icon" fill />}
                          {cashoutSettings?.cex == "BitoPro" && <Image src="/coinbase.svg" alt="BitoPro icon" fill />}
                          {cashoutSettings?.cex == "Other" && <Image src="/coinbase.svg" alt="other" fill />}{" "}
                        </div>
                      )}
                      {transferModal === "toBank" && (
                        <div className="transferIcon flex items-center justify-center border border-dark6">
                          <CiBank className="text-[40px] text-slate-600 dark:text-white" />
                        </div>
                      )}
                      {/*--- text ---*/}
                      {transferModal === "toCex" && (
                        <div>
                          <p className="transferText">
                            {tcommon("to")}: {cashoutSettings.cex ? tcommon(cashoutSettings.cex) : tcommon("CEX")}
                          </p>
                          {cashoutSettings.cex === "Coinbase" ? (
                            cbEvmAddress ? (
                              <div className="transferSubtext">
                                <p>{cbAccountName}</p>
                                <p>
                                  {tcommon("address")}: {cbEvmAddress.slice(0, 7)}...{cbEvmAddress.slice(-5)}
                                </p>
                              </div>
                            ) : (
                              <div className="transferSubtext skeleton w-[160px]">
                                <p>0</p>
                                <p>0</p>
                              </div>
                            )
                          ) : (
                            <p>
                              {cashoutSettings?.cexEvmAddress.slice(0, 7)}...${cashoutSettings?.cexEvmAddress.slice(-5)}
                            </p>
                          )}
                        </div>
                      )}
                      {transferModal === "toBank" && (
                        <div>
                          <div className="transferText">{tcommon("toBank")}</div>
                          {cbBankAccountName ? (
                            <p className="transferSubtext">{cbBankAccountName}</p>
                          ) : (
                            <div className="transferSubtext skeleton w-[160px]">
                              <p>0</p>
                              <p>0</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {transferModal === "toAny" && (
                    <>
                      <div className="font-medium">
                        {tcommon("to")}: {t("toAddress")} <Image src="./polygon.svg" alt="polygon" width={20} height={18} className="inline-block pb-[4px] mx-[2px]" /> Polygon
                      </div>
                      <textarea
                        id="settingsCexDepositAddress"
                        rows={2}
                        className="mt-[2px] w-full py-[6px] px-[8px] textSmAppPx leading-tight! inputColor rounded-[8px] resize-none"
                        placeholder={t("enterAnEvmAddress")}
                        onChange={(e) => setAnyAddress(e.target.value)}
                        value={anyAddress}
                      />
                    </>
                  )}
                  {/*--- to amount ---*/}
                  <div className="transferAmountToBox">
                    {transferModal != "toBank" && (
                      <>
                        <div className="">{Number(usdcTransferAmount) >= 1 ? (Number(usdcTransferAmount) - blockchainFee).toFixed(2) : "0"}</div>
                        <div className="transferUsdc">USDC</div>
                      </>
                    )}
                    {transferModal === "toBank" && (
                      <>
                        <div className="">
                          {currency2symbol[paymentSettings?.merchantCurrency!]}{" "}
                          {usdcTransferAmount
                            ? paymentSettings?.merchantCurrency == "USD"
                              ? ((Number(usdcTransferAmount) - 0.01) * 0.99987).toFixed(2)
                              : (Number(usdcTransferAmount) * rates.usdcToLocal * 0.99988).toFixed(currency2decimal[paymentSettings?.merchantCurrency!])
                            : (0).toFixed(currency2decimal[paymentSettings?.merchantCurrency!])}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {transferState === "sent" && (
              <div className="h-[420px] portrait:sm:h-[450px] landscape:lg:h-[450px] desktop:h-[380px]! flex flex-col justify-center gap-[60px]">
                <div className="w-full flex flex-col items-center gap-[16px]">
                  <FaCircleCheck className="text-[100px] text-green-500" />
                  <div className="text2XlApp font-medium">{tcommon("transferSuccessful")}!</div>
                </div>
                {(transferModal === "toCex" || transferModal === "toAny") && (
                  <div className="text-center flex flex-col items-center gap-[40px]">
                    <p>
                      {t.rich("transferToCexSuccessModal", {
                        span1: (chunks) => <span className="font-bold">{chunks}</span>,
                        amount: usdcTransferAmount,
                        cex: cashoutSettings.cex ? tcommon(cashoutSettings.cex) : tcommon("CEX"),
                      })}
                    </p>
                    <a className="flex items-center link gap-[8px]" href={`https://polygonscan.com/tx/${txHash}`} target="_blank">
                      {tcommon("viewTxn")} <FaArrowUpRightFromSquare className="inline-block text-[16px]" />
                    </a>
                  </div>
                )}
                {transferModal === "toBank" && (
                  <div className="space-y-[16px] text-center">
                    <div>
                      <span className="font-bold">{formatUsd(usdcTransferToCexActual)} USDC</span> {t("transferToBankSuccessModal.text-1")}
                    </div>
                    <div>
                      <span className="font-bold">
                        {currency2symbol[paymentSettings?.merchantCurrency!]}
                        {fiatDeposited}
                      </span>{" "}
                      {t("transferToBankSuccessModal.text-2")}
                    </div>
                    <div>{t("transferToBankSuccessModal.text-3")}</div>
                  </div>
                )}
              </div>
            )}

            {/*--- BUTTON ---*/}
            <div className="flex-1 flex items-center min-h-[140px]">
              {transferState == "initial" && (
                <>
                  {transferModal === "toCex" && (
                    <button
                      className="appButton1 w-full disabled:bg-slate-500 disabled:border-slate-500 disabled:pointer-events-none"
                      onClick={onClickTransferToCexSubmit}
                      disabled={!cbEvmAddress ? true : false}
                    >
                      {tcommon("transferToCEX", {
                        cex: cashoutSettings.cex ? tcommon(cashoutSettings.cex).replace(" Exchange", "") : tcommon("CEX"),
                      })}
                    </button>
                  )}
                  {transferModal === "toAny" && (
                    <button
                      className="appButton1 w-full disabled:bg-slate-500 disabled:border-slate-500 disabled:pointer-events-none"
                      onClick={onClickTransferToCexSubmit}
                      disabled={!cbEvmAddress || !anyAddress ? true : false}
                    >
                      {tcommon("transfer")}
                    </button>
                  )}
                  {transferModal === "toBank" && (
                    <button
                      className="appButton1 w-full disabled:bg-slate-500 disabled:border-slate-500 disabled:pointer-events-none"
                      onClick={onClickTransferToBankSubmit}
                      disabled={!cbBankAccountName ? true : false}
                    >
                      {tcommon("transferToBank")}
                    </button>
                  )}
                </>
              )}
              {transferState === "sending" && (
                <button className="flex items-center justify-center w-full appButtonPending">
                  <SpinningCircleWhite />
                  &nbsp; {tcommon("transferring")}...
                </button>
              )}
              {transferState === "sent" && (
                <button
                  className="appButton1 w-full"
                  onClick={() => {
                    setTransferState("initial");
                    setTransferModal(null);
                    setUsdcTransferAmount("");
                    if (transferModal === "toBank") {
                      setUsdcTransferToBankActual("");
                      setFiatDeposited("");
                    }
                  }}
                >
                  {tcommon("close")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
