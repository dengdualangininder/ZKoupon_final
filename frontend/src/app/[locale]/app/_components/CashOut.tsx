"use client";
// next
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/navigation";
// wagmi & viem & ethers
import { useConfig, useAccount, useClient } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { parseUnits, formatUnits, encodeFunctionData, isAddress } from "viem";
import { ethers } from "ethers";
// other
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useTheme } from "next-themes";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import { useTranslations, useLocale } from "next-intl";
// constants and functions
import { clientToProvider } from "@/utils/functions";
import { currency2decimal, currency2rateDecimal, currency2symbol } from "@/utils/constants";
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
// components
import ErrorModal from "./modals/ErrorModal";
// images
import SpinningCircleGray, { SpinningCircleGrayLarge } from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faArrowDown, faEllipsisVertical, faInfinity, faAngleDown, faAngleUp, faCircleCheck, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FaEllipsisVertical } from "react-icons/fa6";

import Lottie from "lottie-react";
import checkSimple from "@/utils/lotties/checkSimple.json";
// types
import { PaymentSettings, CashoutSettings, Transaction } from "@/db/models/UserModel";
import { Rates } from "@/utils/types";

const CashOut = ({
  paymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  transactionsState,
  isMobile,
  idToken,
  publicKey,
  isUsabilityTest,
}: {
  paymentSettingsState: PaymentSettings;
  cashoutSettingsState: CashoutSettings;
  setCashoutSettingsState: any;
  transactionsState: Transaction[];
  isMobile: boolean;
  idToken: string;
  publicKey: string;
  isUsabilityTest: boolean;
}) => {
  console.log("CashOut component rendered");

  const [flashBalance, setFlashBalance] = useState<string | null>(null);
  const [cexBalance, setCexBalance] = useState<string | null>(null);
  const [isCexAccessible, setIsCexAccessible] = useState(true);
  const [txnHash, setTxnHash] = useState("");
  const [usdcTransferToCex, setUsdcTransferToCex] = useState<string | null>(null);
  const [usdcTransferToBank, setUsdcTransferToBank] = useState<string | null>(null);
  const [usdcTransferToBankActual, setUsdcTransferToBankActual] = useState<string | null>(null);
  const [currencyDeposited, setCurrencyDeposited] = useState("");
  const [cbBankAccountName, setCbBankAccountName] = useState<any>("");
  const [rates, setRates] = useState<Rates>({ usdcToLocal: 0, usdToLocal: 0 });
  const [fiatDeposited, setFiatDeposited] = useState("");
  const [cexMoreOptions, setCexMoreOptions] = useState(false);
  const [flashMoreOptions, setFlashMoreOptions] = useState(false);
  const [blockchainFee, setBlockchainFee] = useState(0.05); // in USDC
  const [transferToAnyAddress, setTransferToAnyAddress] = useState(false);
  const [anyAddress, setAnyAddress] = useState<string | null>(null);
  // accordion states
  const [flashDetails, setFlashDetails] = useState(false);
  const [cexDetails, setCexDetails] = useState(false);
  const [savingsDetails, setSavingsDetails] = useState(false);
  // modal states
  const [transferToCexModal, setTransferToCexModal] = useState(false);
  const [transferToBankModal, setTransferToBankModal] = useState(false);
  const [transferToCexSuccessModal, setTransferToCexSuccessModal] = useState(false);
  const [transferToBankSuccessModal, setTransferToBankSuccessModal] = useState(false);
  const [transferState, setTransferState] = useState("initial"); // "initial" | "sending" | "sent"
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>();
  const [stats, setStats] = useState<any>({
    totalTxns: 0,
    totalCurrencyAmount: 0,
    totalCurrencyAmountAfterCashback: 0,
    totalCashbackGiven: 0,
    totalTokenAmount: 0,
    paymentRate: 0,
    currentRate: 0,
    cashoutRate: 0,
  });

  // hooks
  const router = useRouter();
  const account = useAccount();
  const config = useConfig();
  const client = useClient();
  const { theme } = useTheme();
  const t = useTranslations("App.CashOut");
  const tcommon = useTranslations("Common");

  // get Flash and CEX balance
  useEffect(() => {
    console.log("/app, Cashout, get balances useEffect start");
    const getBalances = async () => {
      // get rates
      if (paymentSettingsState?.merchantCurrency == "USD") {
        setRates({ usdcToLocal: 1, usdToLocal: 1 });
      } else {
        const ratesRes = await fetch("/api/getRates", {
          method: "POST",
          body: JSON.stringify({ merchantCurrency: paymentSettingsState?.merchantCurrency }),
          headers: { "content-type": "application/json" },
        });
        const ratesData = await ratesRes.json();
        console.log("ratesData", ratesData);
        if (ratesData.status == "success") {
          setRates({ usdcToLocal: ratesData.usdcToLocal, usdToLocal: ratesData.usdToLocal });
        }
      }

      // usability test
      if (isUsabilityTest) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setFlashBalance("325.12");
        setCexBalance("0.00");
        setIsCexAccessible(true);
        return;
      }

      // get flashBalance
      const flashBalanceBigInt = (await readContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [account.address],
      })) as bigint;
      const flashBalanceTemp = formatUnits(flashBalanceBigInt, 6);
      setFlashBalance((Math.floor(Number(flashBalanceTemp) * 100) / 100).toString());

      // get Coinbase balance
      if (cashoutSettingsState?.cex == "Coinbase") {
        // get access or refresh tokens
        const cbAccessToken = window?.sessionStorage.getItem("cbAccessToken") ?? "";
        const cbRefreshToken = window?.localStorage.getItem("cbRefreshToken") ?? "";
        // if one exists, call cbGetBalance
        if (cbAccessToken || cbRefreshToken) {
          console.log("calling cbGetBalance API...");
          const res = await fetch("/api/cbGetBalance", {
            method: "POST",
            body: JSON.stringify({ cbAccessToken, cbRefreshToken, idToken, publicKey }),
            headers: { "content-type": "application/json" },
          });
          const data = await res.json(); // if success, data.status | data.cbAccessToken | data.cbRefreshToken
          console.log(data);
          // if successful
          if (data.status === "success") {
            // set cexBalance
            setCexBalance((Math.floor(data.balance * 100) / 100).toString());
            // save new tokens to browser
            if (data.newAccessToken && data.newRefreshToken) {
              console.log("storing new tokens");
              window.sessionStorage.setItem("cbAccessToken", data.newAccessToken);
              window.localStorage.setItem("cbRefreshToken", data.newRefreshToken);
            }
            // update state
            setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: data.cexEvmAddress, cexAccountName: data.cexAccountName });
          } else if (data.status === "error") {
            setIsCexAccessible(false);
          }
        } else {
          console.log("no cbAccessToken or cbRefreshToken");
          setIsCexAccessible(false);
        }
      }

      // // calculate savings
      // let totalCurrencyAmount = 0;
      // let totalCurrencyAmountAfterCashback = 0;
      // let totalTokenAmount = 0;
      // if (transactionsState?.length > 0) {
      //   for (const txn of transactionsState) {
      //     totalCurrencyAmount = totalCurrencyAmount + Number(txn.currencyAmount);
      //     totalCurrencyAmountAfterCashback = totalCurrencyAmountAfterCashback + Number(txn.currencyAmountAfterCashback ?? 0);
      //     totalTokenAmount = totalTokenAmount + Number(txn.tokenAmount);
      //   }
      // }
      // setStats({
      //   totalTxns: transactionsState?.length,
      //   totalCurrencyAmount: totalCurrencyAmount.toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]),
      //   totalCurrencyAmountAfterCashback: totalCurrencyAmountAfterCashback.toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]),
      //   totalCashbackGiven: (totalCurrencyAmount - totalCurrencyAmountAfterCashback).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]),
      //   totalTokenAmount: totalTokenAmount.toFixed(2),
      //   paymentRate: (totalCurrencyAmountAfterCashback / totalTokenAmount).toFixed(currency2rateDecimal[paymentSettingsState?.merchantCurrency!]),
      //   currentRate: ratesData.usdcToLocal,
      //   cashoutRate: 0,
      // });
    };
    getBalances();
    console.log("/app, Cashout, get balances useEffect end");
  }, []);

  const onClickSIWC = async () => {
    const cbRandomSecure = uuidv4() + "SUBSTATEcashOut";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    const scope =
      paymentSettingsState?.merchantCurrency == "USD"
        ? "wallet:accounts:read,wallet:addresses:read,wallet:sells:create,wallet:buys:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read,wallet:withdrawals:read,wallet:orders:read,wallet:transactions:read"
        : "wallet:accounts:read,wallet:addresses:read,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read,wallet:withdrawals:read,wallet:orders:read,wallet:transactions:read";
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=${scope}`
    );
  };

  const onClickUnlink = () => {
    window.sessionStorage.removeItem("cbAccessToken");
    window.localStorage.removeItem("cbRefreshToken");
    setIsCexAccessible(false);
    setCexBalance(null);
  };

  const onClickTransferToCex = async () => {
    if (cashoutSettingsState?.cexEvmAddress) {
      setTransferToCexModal(true);
    } else {
      if (cashoutSettingsState?.cex == "Coinbase") {
        setErrorMsg(t("errors.linkCb"));
      } else {
        setErrorMsg(
          t.rich("errors.platformAddress", {
            span1: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
            span2: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
            span3: (chunks) => (
              <span
                className="link"
                onClick={() => {
                  setTransferToCexModal(true);
                  setTransferToAnyAddress(true);
                  setErrorModal(false);
                  setErrorMsg("");
                }}
              >
                {chunks}
              </span>
            ),
            icon: () => <FontAwesomeIcon icon={faEllipsisVertical} className="" />,
          })
        );
      }
      setErrorModal(true);
    }
  };

  //   <div className="">
  //   Please first enter your <span className="font-semibold">Cash Out Platform's Address</span> under <span className="font-semibold">Settings</span>. Or, click the menu
  //   icon (<FontAwesomeIcon icon={faEllipsisVertical} className="" />) and choose{" "}
  //   <span
  //     className="link"
  //     onClick={() => {
  //       setTransferToCexModal(true);
  //       setTransferToAnyAddress(true);
  //       setErrorModal(false);
  //       setErrorMsg("");
  //     }}
  //   >
  //     transfer to any EVM address
  //   </span>
  //   .
  // </div>

  const onClickTransferToCexSubmit = async () => {
    // for usability test
    if (isUsabilityTest) {
      setTransferState("sending");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setTransferState("sent");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setTransferToCexSuccessModal(true);
      setFlashBalance((Number(flashBalance) - Number(usdcTransferToCex)).toFixed(2));
      // update coinbase balance
      const usdcTransferToCexTemp = usdcTransferToCex;
      await new Promise((resolve) => setTimeout(resolve, 6000));
      setCexBalance((Number(cexBalance) + Number(usdcTransferToCexTemp)).toFixed(2));
      return;
    }

    // check if amount exists
    if (!usdcTransferToCex) {
      setErrorModal(true);
      setErrorMsg(t("errors.enterAmount"));
      return;
    }
    // check if amount >= 1
    if (Number(usdcTransferToCex) < 1) {
      setErrorModal(true);
      setErrorMsg(t("errors.minUSDC"));
      return;
    }

    // determine toAddress
    let toAddress;
    if (transferToAnyAddress) {
      if (anyAddress) {
        console.log("anyAddress:", anyAddress);
        toAddress = anyAddress;
      } else {
        setErrorModal(true);
        setErrorMsg(t("errors.toEvmAddress"));
        return;
      }
    } else {
      if (cashoutSettingsState?.cexEvmAddress) {
        toAddress = cashoutSettingsState?.cexEvmAddress;
      } else {
        // this condition should not be possible but will add anyway
        setErrorModal(true);
        <div className="">
          Please first enter your <span className="font-semibold">Cash Out Platform's Address</span> under <span className="font-semibold">Settings</span>
        </div>;
        return;
      }
    }

    // check if toAddress if valid
    if (!isAddress(toAddress)) {
      setErrorModal(true);
      setErrorMsg(t("errors.validEvmAddress"));
      return;
    }

    setTransferState("sending");

    // // sign EIP712 permit and make Gelato Relay API call
    // const usdcAddress = "";
    // const tokenContract = "";
    // const tokenName = await tokenContract.name();
    // const tokenVersion = await tokenContract.EIP712_VERSION();
    // const nonce = 1;
    // const chainId = 137;
    // const flashAddress = "";
    // const deadline = "";

    // // sign EIP712 permit
    // const permitDomain = { name: tokenName, version: tokenVersion, chainId: chainId, verifyingContract: flashAddress };
    // const permitTypes = {
    //   Permit: [
    //     { name: "owner", type: "address" },
    //     { name: "spender", type: "address" },
    //     { name: "value", type: "uint256" },
    //     { name: "nonce", type: "uint256" },
    //     { name: "deadline", type: "uint256" },
    //   ],
    // };
    // const permitValues = { owner: paymentSettingsState?.merchantEvmAddress, spender: flashAddress, value: usdcTransferToCex, nonce: nonce, deadline: deadline };
    // // get ethers provider
    // const provider = clientToProvider(client);
    // //@ts-ignore
    // const typedSignature = await signer._signTypedData(permitDomain, permitTypes, permitValues); // sign
    // const permitSignature = ethers.utils.splitSignature(typedSignature); // format signature

    // // make Gelato Relay API call
    // const payCallDataNotEncoded = { from: flashAddress, to: cashoutSettingsState?.cexEvmAddress, amount: usdcTransferToCex, permitData: { deadline: deadline, signature: permitSignature } };
    // const payCallData = encodeFunctionData("pay", [payCallDataNotEncoded]);
    // const gelatoRelay = new GelatoRelay();
    // const { taskId } = await gelatoRelay.callWithSyncFee({ chainId: chainId, target: flashAddress, data: payCallData, feeToken: usdcAddress, isRelayContext: true });
    // return;

    // normal txn
    try {
      const txnHashTemp = await writeContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on polygon
        abi: ERC20ABI,
        functionName: "transfer",
        args: [toAddress, parseUnits(usdcTransferToCex, 6)],
      });
      console.log(txnHashTemp);
      setTxnHash(txnHashTemp);
      setTransferState("sent");
      setTransferToCexSuccessModal(true);
    } catch (err) {
      console.log(err);
      console.log("transfer not sent");
      setErrorModal(true);
      setErrorMsg(t("errors.transferFailed"));
      setTransferState("initial");
    }
  };

  const onClickTransferToBank = async () => {
    // usability test
    if (isUsabilityTest) {
      setCbBankAccountName("Chase Bank, North America\n****9073");
      setTransferToBankModal(true);
      return;
    }
    // coinbase
    if (cashoutSettingsState?.cex == "Coinbase") {
      // get access or refresh tokens
      const cbAccessToken = window?.sessionStorage.getItem("cbAccessToken") ?? "";
      const cbRefreshToken = window?.localStorage.getItem("cbRefreshToken") ?? "";
      console.log("cbRefreshToken & cbAccessToken", cbRefreshToken, cbAccessToken);
      // if one exists, start withdraw
      if ((cbAccessToken || cbRefreshToken) && cexBalance) {
        console.log("getting bank info...");
        setTransferToBankModal(true);
        const res = await fetch("/api/cbGetBankInfo", {
          method: "POST",
          body: JSON.stringify({ cbRefreshToken, cbAccessToken }),
          headers: { "content-type": "application/json" },
        });
        const data = await res.json(); // if success, data.status | data.cbAccessToken | data.cbRefreshToken
        console.log(data);
        // if successful
        if (data.status === "success") {
          setCbBankAccountName(data.cbBankAccountName);
          if (data.newAccessToken && data.newRefreshToken) {
            console.log("storing new tokens");
            window.sessionStorage.setItem("cbAccessToken", data.newAccessToken);
            window.localStorage.setItem("cbRefreshToken", data.newRefreshToken);
          }
        } else if (data.status === "error") {
          console.log("could not get bank info");
        }
      } else {
        setErrorMsg(t("errors.linkCb"));
        setErrorModal(true);
      }
    }
  };

  const onClickTransferToBankSubmit = async () => {
    // for usability test
    if (isUsabilityTest) {
      setTransferState("sending");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setTransferState("sent");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setTransferToBankSuccessModal(true);
      setFiatDeposited((Number(usdcTransferToBank) * rates.usdcToLocal).toFixed(2));
      setCexBalance((Number(cexBalance) - Number(usdcTransferToBank)).toFixed(2));
      return;
    }

    // check if amount exists
    if (!usdcTransferToBank) {
      setErrorModal(true);
      setErrorMsg(t("enterAmount"));
      return;
    }
    // if amount exceeds Coinbase balance
    if (Number(usdcTransferToBank) > Number(cexBalance)) {
      setErrorModal(true);
      setErrorMsg(t("errors.lowBalance"));
      return;
    }
    // check if amount >= 1
    if (Number(usdcTransferToBank) < 11) {
      setErrorModal(true);
      setErrorMsg(t("errors.minUSDC11"));
      return;
    }
    if (Number(usdcTransferToBank) > 10000.1) {
      setErrorModal(true);
      setErrorMsg("errors.maxUSDC");
      return;
    }

    setTransferState("sending");
    try {
      const res = await fetch("/api/cbWithdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: usdcTransferToBank,
          merchantCurrency: paymentSettingsState?.merchantCurrency,
          cbAccessToken: window.sessionStorage.getItem("cbAccessToken"),
        }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      if (data.status == "success") {
        setFiatDeposited(data.fiatAmountBought);
        setUsdcTransferToBankActual(data.usdcAmountSold);
        setCexBalance((Number(cexBalance) - Number(data.usdcAmountSold)).toFixed(2));
        setTransferToBankSuccessModal(true);
        setTransferToBankModal(false);
      } else if (data.status == "error") {
        setErrorMsg(data.message);
        setErrorModal(true);
      }
    } catch (e) {
      setErrorModal(true);
      setErrorMsg(t("errors.unknownTransferError"));
    }
    setTransferState("initial");
  };

  const hideCexMoreOptions = () => {
    setCexMoreOptions(false);
    document.removeEventListener("click", hideCexMoreOptions);
  };

  const hideFlashMoreOptions = () => {
    setFlashMoreOptions(false);
    document.removeEventListener("click", hideFlashMoreOptions);
  };

  console.log("usdcTransferToCex", usdcTransferToCex);
  console.log("before render", "\nflashBalance:", flashBalance, "\nisCexAccessible", isCexAccessible, "\ncexBalance:", cexBalance);
  return (
    // 96px is height of mobile top menu bar + 14px mt
    <section className="appSectionSize bg-light2 dark:bg-dark1">
      {/*---Flash Account + Coinbase Account + Statistics ---*/}
      <div className="py-[24px] portrait:sm:py-[32px] landscape:lg:py-[32px] w-[88%] portrait:sm:w-[480px] landscape:lg:w-[480px] landscape:xl:desktop:w-[400px] flex flex-col space-y-[24px] portrait:sm:space-y-[32px] landscape:lg:space-y-[32px]">
        {/*---FLASH CARD ---*/}
        <div className="cashoutContainer">
          {/*--- title ---*/}
          <div className="w-full flex justify-between items-center">
            <div className="cashoutHeader h-[36px] flex items-center">Flash {tcommon("account")}</div>
            <div
              className={`${flashBalance ? "" : "hidden"} w-[24px] flex items-center justify-center cursor-pointer group relative`}
              onClick={() => {
                setFlashMoreOptions(!flashMoreOptions);
                if (!flashMoreOptions) {
                  document.addEventListener("click", hideFlashMoreOptions);
                }
              }}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} className={`${flashMoreOptions ? "text-slate-500" : ""} textXl desktop:group-hover:text-slate-500`} />
              <div
                className={`${flashMoreOptions ? "absolute" : "hidden"} cashoutMoreOptionsContainer`}
                onClick={() => {
                  setTransferToCexModal(true);
                  setTransferToAnyAddress(true);
                }}
              >
                {t("transferToAny")}
              </div>
            </div>
          </div>
          {/*--- balance + details ---*/}
          <div className="cashoutBalanceContainer">
            {/*--- balance ---*/}
            {flashBalance ? (
              <div className={`cashoutBalance`}>
                <div>
                  {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
                  <span>{(Number(flashBalance) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}</span>
                </div>
                {/*--- down arrow ---*/}
                <div className="cashoutArrowContainer" onClick={() => setFlashDetails(!flashDetails)}>
                  <FontAwesomeIcon icon={flashDetails ? faAngleUp : faAngleDown} className="cashoutArrow" />
                </div>
              </div>
            ) : (
              <div className="cashoutBalance text-transparent w-[150px] bg-slate-300 dark:bg-dark5 animate-pulse rounded-md">0000</div>
            )}
            {/*---details---*/}
            <div className={`${flashDetails ? "max-h-[120px]" : "max-h-[0px]"} cashoutDetailsContainer`}>
              <div className="cashoutDetailsContainer2">
                {/*--- usdc balance ---*/}
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="relative w-[20px] h-[20px] portrait:sm:w-[24px] landscape:lg:w-[24px] portrait:sm:h-[24px] landscape:lg:h-[24px] mr-[3px]">
                      <Image src="/usdc.svg" alt="USDC" fill />
                    </div>
                    USDC
                  </div>
                  <div className="">{flashBalance}</div>
                </div>
                {/*--- rate ---*/}
                <div className="flex justify-between">
                  <div className="flex items-center">
                    {t("rate")}
                    <div className="group flex items-center">
                      <FontAwesomeIcon icon={faCircleInfo} className="px-2 info" />
                      <div className="w-full top-0 left-0 cashoutTooltip">{t("rateTooltip", { merchantCurrency: paymentSettingsState.merchantCurrency })}</div>
                    </div>
                  </div>
                  <div className="">{rates.usdcToLocal}</div>
                </div>
              </div>
            </div>
          </div>
          {/*--- button ---*/}
          {flashBalance && (
            <div className="cashoutButtonContainer">
              <button className="cashoutButton" onClick={onClickTransferToCex}>
                {cashoutSettingsState.cex ? tcommon("transferToCEX", { cex: cashoutSettingsState.cex }) : tcommon("transfer")}
              </button>
            </div>
          )}
        </div>

        {/*--- CEX CARD ---*/}
        <div className={`${paymentSettingsState?.merchantCountry != "Other" && cashoutSettingsState?.cex == "Coinbase" ? "" : "hidden"} cashoutContainer`}>
          {/*--- header + linkPopup ---*/}
          <div className="w-full flex justify-between items-center">
            <div className="cashoutHeader">Coinbase {tcommon("account")}</div>

            <div
              className={`${cexBalance ? "" : "hidden"} w-[24px] flex items-center justify-center cursor-pointer group relative`}
              onClick={() => {
                setCexMoreOptions(!cexMoreOptions);
                if (!cexMoreOptions) {
                  document.addEventListener("click", hideCexMoreOptions);
                }
              }}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} className={`${cexMoreOptions ? "text-slate-500" : ""} textXl desktop:group-hover:text-slate-500`} />
              <div className={`${cexMoreOptions ? "absolute" : "hidden"} cashoutMoreOptionsContainer`} onClick={onClickUnlink}>
                {t("unlink")}
              </div>
            </div>
          </div>

          {/*---balance + details ---*/}
          {isCexAccessible ? (
            <div className="cashoutBalanceContainer">
              {/*--- balance ---*/}
              {cexBalance ? (
                <div className="cashoutBalance">
                  <div className="flex items-center">
                    {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
                    {(Number(cexBalance) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
                  </div>
                  <div className="cashoutArrowContainer" onClick={() => setCexDetails(!cexDetails)}>
                    <FontAwesomeIcon icon={cexDetails ? faAngleUp : faAngleDown} className="cashoutArrow" />
                  </div>
                </div>
              ) : (
                <div className="cashoutBalance text-transparent w-[150px] bg-slate-300 dark:bg-dark5 animate-pulse rounded-md">0000</div>
              )}
              {/*---details---*/}
              <div className={`${cexDetails ? "max-h-[120px]" : "max-h-[0px]"} ${isCexAccessible ? "" : "hidden"} cashoutDetailsContainer`}>
                <div className="cashoutDetailsContainer2">
                  {/*--- usdc balance ---*/}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="relative w-[20px] h-[20px] portrait:sm:w-[24px] landscape:lg:w-[24px] portrait:sm:h-[24px] landscape:lg:h-[24px] mr-[3px]">
                        <Image src="/usdc.svg" alt="USDC" fill />
                      </div>
                      USDC
                    </div>
                    <div className="flex items-center">{cexBalance}</div>
                  </div>
                  {/*--- rate ---*/}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      {t("rate")}
                      <div className="group flex items-center">
                        <FontAwesomeIcon icon={faCircleInfo} className="px-2 text-gray-400 textXs" />
                        <div className="w-full top-0 left-0 cashoutTooltip">{t("rateTooltip", { merchantCurrency: paymentSettingsState.merchantCurrency })}</div>
                      </div>
                    </div>
                    <div className="">{rates.usdcToLocal}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full flex justify-center items-center">
              <div className="link textBase" onClick={onClickSIWC}>
                {t("linkCoinbase")}
              </div>
            </div>
          )}
          {/*--- button ---*/}
          <div className="cashoutButtonContainer">
            {cexBalance && (
              <button className="cashoutButton" onClick={onClickTransferToBank}>
                {tcommon("transferToBank")}
              </button>
            )}
          </div>
        </div>

        {/*--- Your Savings ---*/}
        <div className="hidden cashoutContainer min-h-0">
          {/*--- header ---*/}
          <div className="flex items-center">
            <span className="cashoutHeader">Your Savings</span>
            <FontAwesomeIcon icon={savingsDetails ? faAngleUp : faAngleDown} className="ml-4 pt-1 cashoutArrow" onClick={() => setSavingsDetails(!savingsDetails)} />
          </div>
          {/*--- earnings ---*/}
          <div className="mt-2 px-2 flex justify-between">
            <div>Earnings</div>
            <div>
              {currency2symbol[paymentSettingsState?.merchantCurrency!]}
              {stats.totalCurrencyAmount}
            </div>
          </div>

          {/*--- Flash costs ---*/}
          <div className={`${savingsDetails ? "max-h-[150px]" : "max-h-0"} overflow-hidden transition-all duration-500`}>
            <div className="cashoutStats2">Flash Costs</div>
            <div className="p-2 border border-gray-400 rounded-md">
              {/*---Cashback Given = totalCurrencyAmount - totalCurrencyAmountAfterCashback ---*/}
              <div className="flex justify-between">
                <div>Cashback Given</div>
                <div>
                  - {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                  {stats.totalCashbackGiven}
                </div>
              </div>
              {/*---gain/loss from rates---*/}
              <div className="flex justify-between">
                <div>Est. Gain/Loss from Rates</div>
                {/*---# times cashout * 0.015 USDC * USDC To currency rate + future ---*/}
              </div>
              {/*---gain/loss from rates details---*/}
              <div className="hidden">
                <div className="flex justify-between">
                  <div>USDC Received</div>
                  <div>{stats.totalTokenAmount} USDC</div>
                </div>
                <div className="flex justify-between">
                  <div>Avg. USDC to EUR Rate</div>
                  <div>{stats.paymentRate}</div>
                </div>
              </div>
              {/*---total transaction fees---*/}
              <div className="flex justify-between">
                <div>Transaction Fees</div>
                <div>
                  - {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                  {(1 * 0.015 * stats.currentRate).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
                </div>
              </div>
            </div>
          </div>

          {/*--- net earnings ---*/}
          <div className="px-2 flex justify-between">
            <div>Net Earnings</div>
            <div>
              {currency2symbol[paymentSettingsState?.merchantCurrency!]}
              {stats.totalCurrencyAmount}
            </div>
          </div>

          {/*--- credit card costs ---*/}
          <div className={`${savingsDetails ? "max-h-[120px]" : "max-h-0"} overflow-hidden transition-all duration-500`}>
            <div className="cashoutStats2">Credit Card Costs</div>
            <div className="p-2 border border-gray-400 rounded-md">
              <div className="flex justify-between">
                <div>Fee Percentage (2.7%)</div>
                <div>
                  - {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                  {(stats.totalCurrencyAmount * 0.03).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Fee per Txn ($0.10)</div>
                <div>
                  - {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                  {(transactionsState?.length! * 0.1).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
                </div>
              </div>
            </div>
          </div>

          {/*--- savings over credit card ---*/}
          <div className="px-2 flex justify-between">
            <div>Savings Over Credit Card</div>
            <div>
              {currency2symbol[paymentSettingsState?.merchantCurrency!]}
              {(stats.totalCurrencyAmount * 0.03 + transactionsState?.length! * 0.1 - stats.totalCashbackGiven).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
            </div>
          </div>
        </div>

        {/*--- Transfer History ---*/}
        <div className="hidden cashoutContainer min-h-0">
          {/*--- header ---*/}
          <div className="cashoutHeader">Transfer History</div>
          {/*--- table ---*/}
          <div className="mt-2 px-2 flex justify-between"></div>
        </div>
      </div>

      {/*--- 5 modals---*/}
      {transferToCexModal && (
        <div className="">
          <div className="transferModal">
            {/*--- desktop/tablet close ---*/}
            <div
              className="xButtonContainer"
              onClick={() => {
                setTransferToCexModal(false);
                setUsdcTransferToCex(null);
                setTransferToAnyAddress(false);
              }}
            >
              <div className="xButton">&#10005;</div>
            </div>
            {/*--- mobile back ---*/}
            <div className="mobileBack">
              <FontAwesomeIcon
                icon={faAngleLeft}
                onClick={() => {
                  setTransferToCexModal(false);
                  setUsdcTransferToCex(null);
                  setTransferToAnyAddress(false);
                }}
              />
            </div>

            {/*--- header ---*/}
            <div className="transferModalHeader whitespace-nowrap">{tcommon("transferToCEX", { cex: cashoutSettingsState.cex ? cashoutSettingsState.cex : tcommon("CEX") })}</div>

            {/*--- CONTENT ---*/}
            <div className="transferModalContentContainer">
              {/*--- FROM container ---*/}
              <div className="transferFromCard">
                {/*--- info ---*/}
                <div className="w-full flex items-center">
                  <div className="transferIcon">
                    <Image src="/logoBlackBgNoText.svg" alt="flashLogo" fill />
                  </div>
                  <div className="ml-[12px] flex flex-col">
                    <div className="textBase leading-none font-medium">{tcommon("fromFlash")}</div>
                    <div className="textBasePx leading-tight text-slate-500 line-clamp-1">{paymentSettingsState?.merchantName}</div>
                    <div className="textBasePx leading-tight break-all text-slate-500">
                      {paymentSettingsState?.merchantEvmAddress.slice(0, 10)}...{paymentSettingsState?.merchantEvmAddress.slice(-8)}
                    </div>
                  </div>
                </div>
                {/*--- from amount ---*/}
                <div className="mt-[16px] w-full flex items-center relative">
                  <input
                    className="transferAmountFromBox inputColor border-slate-500 placeholderColor placeholder:not-italic dark:bg-dark2"
                    type="number"
                    inputMode="decimal"
                    onChange={(e) => setUsdcTransferToCex(e.currentTarget.value)}
                    value={usdcTransferToCex || ""}
                    onBlur={(e) => (e.currentTarget.value ? setUsdcTransferToCex(Number(e.currentTarget.value).toFixed(2)) : null)}
                    placeholder="0"
                  />
                  {/*--- max + USDC ---*/}
                  <div className="h-full right-0 absolute flex space-x-[12px] items-center">
                    <div className="text-base landscape:xl:desktop:text-sm font-bold text-blue-500 cursor-pointer" onClick={() => setUsdcTransferToCex(flashBalance)}>
                      {tcommon("max")}
                    </div>
                    <div className="transferUsdc">USDC</div>
                  </div>
                </div>
                {/*--- balance ---*/}
                <div className="textBase w-full pl-[4px] mt-[1px] flex items-center text-slate-500">
                  {tcommon("balance")}: {flashBalance} USDC
                </div>
              </div>

              {/*--- ARROW ---*/}
              <div className="flex-none w-full h-[24px] landscape:xl:desktop:h-[16px] flex justify-center relative z-[1]">
                <div className="transferArrowContainer">
                  <FontAwesomeIcon icon={faArrowDown} className="transferArrowArrow" />
                  <div className="transferArrowFont">
                    {blockchainFee} USDC <br />
                    {tcommon("blockchainFee")}
                  </div>
                </div>
              </div>

              {/*--- TO container ---*/}
              <div className="transferToCard">
                {/*--- info ---*/}
                {!transferToAnyAddress && (
                  <div className="w-full flex items-center">
                    <div className="transferIcon">
                      {cashoutSettingsState?.cex == "Coinbase" && <Image src="/coinbase.svg" alt="coinbase" fill />}
                      {cashoutSettingsState?.cex == "MAX" && <Image src="/max.svg" alt="max" fill />}
                      {cashoutSettingsState?.cex == "BitoPro" && <Image src="/coinbase.svg" alt="bitopro" fill />}
                      {cashoutSettingsState?.cex == "Other" && <Image src="/coinbase.svg" alt="other" fill />}
                    </div>
                    <div className="ml-[12px] flex flex-col">
                      <div className="textBase leading-none font-medium">
                        {tcommon("toCEX", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}
                      </div>
                      <div className="textBasePx leading-tight text-slate-500 line-clamp-1">{cashoutSettingsState?.cexAccountName}</div>
                      <div className="textBasePx leading-tight break-all text-slate-500">
                        {cashoutSettingsState?.cexEvmAddress.slice(0, 10)}...{cashoutSettingsState?.cexEvmAddress.slice(-8)}
                      </div>
                    </div>
                  </div>
                )}
                {transferToAnyAddress && (
                  <div className="w-full flex flex-col">
                    <label className="w-full font-medium">{t("toAddress")}:</label>
                    <textarea
                      id="settingsCexDepositAddress"
                      rows={1}
                      className="mt-[1px] py-[8px] px-[12px] textLgPx leading-normal inputColor border-slate-500 placeholderColor rounded-[6px] dark:bg-dark2 resize-none"
                      placeholder={t("enterAnEvmAddress")}
                      onChange={(e) => {
                        let element = document.getElementById("settingsCexDepositAddress") as HTMLTextAreaElement;
                        e.target.value ? (element.rows = 2) : (element.rows = 1);
                        setAnyAddress(e.target.value);
                      }}
                    />
                  </div>
                )}
                {/*--- to amount ---*/}
                <div className="transferAmountToBox">
                  <div className="">{Number(usdcTransferToCex) >= 1 ? (Number(usdcTransferToCex) - blockchainFee).toFixed(2) : "0"}</div>
                  <div className="transferUsdc">USDC</div>
                </div>
              </div>

              {/*--- buttons ---*/}
              <div className="transferModalButtonContainer">
                {transferState == "initial" ? (
                  <button onClick={onClickTransferToCexSubmit} className="buttonPrimary">
                    {tcommon("transferToCEX", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex).replace(" Exchange", "") : tcommon("CEX") })}
                  </button>
                ) : (
                  <div className="w-full flex justify-center items-center h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] landscape:xl:desktop:h-[48px] textXl font-medium text-slate-500">
                    <SpinningCircleGray />
                    &nbsp; {tcommon("transferring")}...
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}

      {/*--- loading bar ---*/}
      {/* <div
              className={`hidden absolute left-0 bottom-0 h-[10%] bg-blue-500 animate-pulse ease-linear ${transferState == "initial" ? "w-[0%]" : ""} ${
                transferState == "sending" ? "w-[80%] duration-[3000ms]" : ""
              } ${transferState == "sent" ? "w-[100%] duration-[300ms]" : ""} transition-all`}
            ></div> */}

      {transferToBankModal && (
        <div className="">
          <div className="transferModal">
            {/*--- tablet/desktop close ---*/}
            <div
              className="xButtonContainer"
              onClick={() => {
                setTransferToBankModal(false);
                setUsdcTransferToBank(null);
              }}
            >
              <div className="xButton">&#10005;</div>
            </div>
            {/*--- mobile back ---*/}
            <div className="mobileBack">
              <FontAwesomeIcon
                icon={faAngleLeft}
                onClick={() => {
                  setTransferToBankModal(false);
                  setUsdcTransferToBank(null);
                }}
              />
            </div>

            {/*--- header ---*/}
            <div className="transferModalHeader whitespace-nowrap">{tcommon("transferToBank")}</div>

            {/*--- CONTENT ---*/}
            <div className="transferModalContentContainer">
              {/*--- FROM container ---*/}
              <div className="transferFromCard">
                {/*--- info ---*/}
                <div className="w-full flex items-center">
                  <div className="transferIcon">
                    {cashoutSettingsState?.cex == "Coinbase" && <Image src="/coinbase.svg" alt="coinbase" fill />}
                    {cashoutSettingsState?.cex == "MAX" && <Image src="/max.svg" alt="coinbase" fill />}
                    {cashoutSettingsState?.cex == "BitoPro" && <Image src="/coinbase.svg" alt="coinbase" fill />}
                    {cashoutSettingsState?.cex == "Other" && <Image src="/coinbase.svg" alt="coinbase" fill />}
                  </div>
                  <div className="ml-[12px] flex flex-col">
                    <div className="textBase leading-none font-medium">{tcommon("fromCoinbase")}</div>
                    <div className="textBasePx leading-tight text-slate-500 line-clamp-1">{cashoutSettingsState?.cexAccountName}</div>
                    <div className="textBasePx leading-tight break-all text-slate-500">
                      {cashoutSettingsState?.cexEvmAddress.slice(0, 10)}...{cashoutSettingsState?.cexEvmAddress.slice(-8)}
                    </div>
                  </div>
                </div>
                {/*--- from amount ---*/}
                <div className="mt-4 w-full flex items-center relative">
                  <input
                    className="transferAmountFromBox inputColor border2Color placeholderColor placeholder:not-italic dark:bg-dark2"
                    type="number"
                    inputMode="decimal"
                    onChange={(e) => setUsdcTransferToBank(e.currentTarget.value)}
                    value={usdcTransferToBank || ""}
                    onBlur={(e) => (e.currentTarget.value ? setUsdcTransferToBank(Number(e.currentTarget.value).toFixed(2)) : null)}
                    placeholder="0"
                  />
                  {/*--- max + USDC ---*/}
                  <div className="h-full right-0 absolute flex space-x-4 items-center">
                    <div className="text-base landscape:xl:desktop:text-sm font-bold text-blue-500 cursor-pointer" onClick={() => setUsdcTransferToBank(cexBalance)}>
                      {tcommon("max")}
                    </div>
                    <div className="pr-[16px] text-2xl landscape:xl:desktop:text-xl font-semibold leading-none">USDC</div>
                  </div>
                </div>
                {/*--- balance ---*/}
                <div className="pl-[4px] mt-[2px] w-full textBase text-slate-500">
                  {tcommon("balance")}: {cexBalance} USDC
                </div>
              </div>

              {/*--- ARROW ---*/}
              <div className="flex-none w-full h-[24px] flex justify-center relative z-[1]">
                <div className="transferArrowContainer">
                  <FontAwesomeIcon icon={faArrowDown} className="transferArrowArrow" />
                  <div className="transferArrowFont">
                    <div className="">
                      1 USDC <span>={paymentSettingsState?.merchantCurrency != "USD" && <br />}</span> {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                      {rates.usdcToLocal}
                    </div>
                    {paymentSettingsState?.merchantCurrency == "USD" && <div>~0.001% fee</div>}
                  </div>
                </div>
              </div>

              {/*--- TO container ---*/}
              <div className="transferToCard">
                {/*--- info ---*/}
                <div className="w-full flex items-center">
                  <div className="transferIcon bg-light5 dark:bg-slate-700">
                    <Image src={theme == "dark" ? "/bankWhite.svg" : "/bankWhite.svg"} alt="bank" fill />
                  </div>
                  <div className="ml-[12px] flex flex-col">
                    <div className="textBase leading-none font-medium">{tcommon("toBank")}</div>
                    <div className="textBasePx leading-tight text-slate-500">{cbBankAccountName}</div>
                  </div>
                </div>
                {/*--- to amount ---*/}
                <div className="transferAmountToBox">
                  <div className="">
                    {currency2symbol[paymentSettingsState?.merchantCurrency!]}{" "}
                    {usdcTransferToBank
                      ? paymentSettingsState?.merchantCurrency == "USD"
                        ? ((Number(usdcTransferToBank) - 0.01) * 0.99987).toFixed(2)
                        : (Number(usdcTransferToBank) * rates.usdcToLocal * 0.99988).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])
                      : (0).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
                  </div>
                </div>
              </div>

              {/*--- buttons ---*/}
              <div className="transferModalButtonContainer">
                {transferState == "initial" ? (
                  <button onClick={onClickTransferToBankSubmit} className="buttonPrimary">
                    {tcommon("transferToBank")}
                  </button>
                ) : (
                  <div className="w-full flex justify-center items-center h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] landscape:xl:desktop:h-[48px] textXl font-medium text-slate-500">
                    <SpinningCircleGray />
                    &nbsp; {tcommon("transferring")}...
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}

      {transferToCexSuccessModal && (
        <div className="transferModal">
          {/*--- HEADER ---*/}
          <div className="transferSuccessModalHeaderContainer">
            <div
              className="xButtonContainerNotHidden"
              onClick={() => {
                setTransferState("initial");
                setTransferToCexSuccessModal(false);
                setTransferToCexModal(false);
                setUsdcTransferToCex(null);
              }}
            >
              <div className="xButton">&#10005;</div>
            </div>
          </div>
          {/*--- CONTENT ---*/}
          <div className="px-8 portrait:sm:px-16 landscape:lg:px-16 landscape:xl:desktop:px-12 flex flex-col items-center space-y-8">
            <FontAwesomeIcon icon={faCircleCheck} className="text-6xl text-green-500" />
            <div className="text3xl font-medium">{tcommon("transferSuccessful")}!</div>
            <div className="text2xl font-bold">{usdcTransferToCex} USDC</div>
            <div className="textLg text-center">{t("successModal", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}</div>
            {/*--- button ---*/}
            <div className="w-full py-8">
              <button
                className="buttonSecondary"
                onClick={() => {
                  setTransferState("initial");
                  setTransferToCexSuccessModal(false);
                  setTransferToCexModal(false);
                  setUsdcTransferToCex(null);
                }}
              >
                {tcommon("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {transferToBankSuccessModal && (
        <div className="transferModal">
          {/*--- HEADER ---*/}
          <div className="transferSuccessModalHeaderContainer">
            <div
              className="xButtonContainerNotHidden"
              onClick={() => {
                setTransferState("initial");
                setTransferToBankSuccessModal(false);
                setTransferToBankModal(false);
                setUsdcTransferToBank(null);
              }}
            >
              <div className="xButton">&#10005;</div>
            </div>
          </div>

          {/*--- CONTENT ---*/}
          <div className="px-8 portrait:sm:px-16 landscape:lg:px-16 landscape:xl:desktop:px-12 flex flex-col items-center space-y-8">
            <FontAwesomeIcon icon={faCircleCheck} className="text-6xl text-green-500" />
            <div className="text3xl font-medium">{tcommon("transferSuccessful")}</div>
            <div className="textLg space-y-3">
              <div>
                <span className="font-bold">{Number(usdcTransferToBank).toFixed(2)} USDC</span> {t("transferToBankSuccessModal.text-1")}
              </div>
              <div>
                <span className="font-bold">
                  {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                  {fiatDeposited}
                </span>{" "}
                {t("transferToBankSuccessModal.text-2")}
              </div>
              <div>{t("transferToBankSuccessModal.text-3")}</div>
            </div>
            {/*--- button ---*/}
            <div className="w-full py-8">
              <button
                className="buttonSecondary"
                onClick={() => {
                  setTransferState("initial");
                  setTransferToBankSuccessModal(false);
                  setTransferToBankModal(false);
                  setUsdcTransferToBank(null);
                }}
              >
                {tcommon("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </section>
  );
};

export default CashOut;
