"use client";
// next
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// wagmi & viem
import { useConfig, useAccount } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { parseUnits, formatUnits } from "viem";
// other
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
// constants
import { currency2decimal, currency2rateDecimal, currency2symbol } from "@/utils/constants";
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
// components
import ErrorModal from "./modals/ErrorModal";
// images
import SpinningCircleGray, { SpinningCircleGrayLarge } from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faArrowDown, faCircleQuestion, faInfinity, faAngleDown, faAngleUp, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
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
}: {
  paymentSettingsState: PaymentSettings | null;
  cashoutSettingsState: CashoutSettings | null;
  setCashoutSettingsState: any;
  transactionsState: Transaction[] | null;
  isMobile: boolean;
  idToken: string;
  publicKey: string;
}) => {
  console.log("CashOut component rendered");

  const [flashBalance, setFlashBalance] = useState("325.55");
  const [cexBalance, setCexBalance] = useState("0.00");
  const [isCexAccessible, setIsCexAccessible] = useState(true);
  const [txnHash, setTxnHash] = useState("");
  const [usdcTransferToCex, setUsdcTransferToCex] = useState("");
  const [usdcTransferToBank, setUsdcTransferToBank] = useState("");
  const [currencyDeposited, setCurrencyDeposited] = useState("");
  const [cbBankAccountName, setCbBankAccountName] = useState<any>("");
  const [rates, setRates] = useState<Rates>({ usdcToLocal: 0, usdToLocal: 0 });
  const [fiatDeposited, setFiatDeposited] = useState("");
  // accordion states
  const [flashDetails, setFlashDetails] = useState(false);
  const [cexDetails, setCexDetails] = useState(false);
  const [statDetails, setStatDetails] = useState(false);
  // modal states
  const [transferToCexModal, setTransferToCexModal] = useState(false);
  const [transferToCexSuccessModal, setTransferToCexSuccessModal] = useState(false);
  const [transferToBankSuccessModal, setTransferToBankSuccessModal] = useState(false);
  const [transferToBankModal, setTransferToBankModal] = useState(false);
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

  // get Flash and CEX balance
  useEffect(() => {
    console.log("/app, Cashout, get balances useEffect start");
    const getBalances = async () => {
      // get rates
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

      // usability test
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setFlashBalance("325.12");
      setCexBalance("0.00");
      setIsCexAccessible(true);
      return;

      // get flashBalance
      const flashBalanceBigInt = (await readContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [account.address],
      })) as bigint;
      const flashBalanceTemp = Number(formatUnits(flashBalanceBigInt, 6)).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]);
      setFlashBalance(flashBalanceTemp);
      console.log("flashBalanceTemp", flashBalanceTemp);

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
            setCexBalance(Number(data.balance).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]));
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

      // calculate savings
      let totalCurrencyAmount = 0;
      let totalCurrencyAmountAfterCashback = 0;
      let totalTokenAmount = 0;
      if (transactionsState?.length) {
        for (const txn of transactionsState) {
          totalCurrencyAmount = totalCurrencyAmount + Number(txn.currencyAmount);
          totalCurrencyAmountAfterCashback = totalCurrencyAmountAfterCashback + Number(txn.currencyAmountAfterCashback ?? 0);
          totalTokenAmount = totalTokenAmount + Number(txn.tokenAmount);
        }
      }
      setStats({
        totalTxns: transactionsState?.length,
        totalCurrencyAmount: totalCurrencyAmount.toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]),
        totalCurrencyAmountAfterCashback: totalCurrencyAmountAfterCashback.toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]),
        totalCashbackGiven: (totalCurrencyAmount - totalCurrencyAmountAfterCashback).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]),
        totalTokenAmount: totalTokenAmount.toFixed(2),
        paymentRate: (totalCurrencyAmountAfterCashback / totalTokenAmount).toFixed(currency2rateDecimal[paymentSettingsState?.merchantCurrency!]),
        currentRate: ratesData.usdcToLocal,
        cashoutRate: 0,
      });
    };
    getBalances();
    console.log("/app, Cashout, get balances useEffect end");
  }, []);

  const onClickSIWC = async () => {
    const cbRandomSecure = uuidv4() + "SUBSTATEcashOut";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:buys:create,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read`
    );
  };

  const onClickUnlink = () => {
    window.sessionStorage.removeItem("cbAccessToken");
    window.localStorage.removeItem("cbRefreshToken");
    setIsCexAccessible(false);
    setCexBalance("");
  };

  const onClickTransferToCex = async () => {
    if (cashoutSettingsState?.cexEvmAddress) {
      setTransferToCexModal(true);
    } else {
      if (cashoutSettingsState?.cex == "Coinbase") {
        setErrorMsg("Please first link your Coinbase account");
      } else {
        setErrorMsg("Please go to Settings > Cash Out Settings and add your CEX's EVM address, specifically the USDC deposit address on the Polygon network");
      }
      setErrorModal(true);
    }
  };

  const onClickTransferToCexSubmit = async () => {
    // for usability test
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

    setTransferState("sending");
    try {
      const txnHashTemp = await writeContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on polygon
        abi: ERC20ABI,
        functionName: "transfer",
        args: [cashoutSettingsState?.cexEvmAddress, parseUnits(usdcTransferToCex, 6)],
      });
      console.log(txnHashTemp);
      setTxnHash(txnHashTemp);
      setTransferState("sent");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setTransferToCexSuccessModal(true);
    } catch (err) {
      console.log(err);
      console.log("transfer not sent");
      setTransferState("inital");
    }
  };

  const onClickTransferToBank = async () => {
    // usability test
    setCbBankAccountName("Chase Bank, North America\n****9073");
    setTransferToBankModal(true);
    return;

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
        setErrorMsg(<div>Please first link your Coinbase account</div>);
        setErrorModal(true);
      }
    }
  };

  const onClickTransferToBankSubmit = async () => {
    // for usability test
    setTransferState("sending");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setTransferState("sent");
    await new Promise((resolve) => setTimeout(resolve, 300));
    setTransferToBankSuccessModal(true);
    setFiatDeposited((Number(usdcTransferToBank) * rates.usdcToLocal).toFixed(2));
    setCexBalance((Number(cexBalance) - Number(usdcTransferToBank)).toFixed(2));
    return;

    // setModalText("sending");

    // const clientOrderId = uuidv4();

    const res = await fetch("/api/cbWithdraw", {
      method: "POST",
      body: JSON.stringify({ cbAccessToken: window.sessionStorage.getItem("cbAccessToken"), amount: usdcTransferToBank }),
      headers: { "content-type": "application/json" },
    });
    const data = await res.json();
    console.log(data);
  };

  console.log("before render", "\nflashBalance:", flashBalance, "\nisCexAccessible", isCexAccessible, "\ncexBalance:", cexBalance);
  return (
    // 96px is height of mobile top menu bar + 14px mt
    <section className="py-8 portrait:sm:py-8 landscape:lg:py-8 portrait:min-h-[calc(100vh-84px)] portrait:sm:min-h-[calc(100vh-140px)] w-full flex flex-col items-center overflow-y-auto bg-white">
      {/*---Flash Account + Coinbase Account + Statistics ---*/}
      <div className="w-[88%] max-w-[620px] portrait:sm:w-[70%] landscape:lg:w-[70%] flex flex-col space-y-5 portrait:sm:space-y-8 landscape:lg:space-y-8">
        {/*---Flash Account---*/}
        <div className="cashoutContainer">
          {/*--- header ---*/}
          <div className="cashoutHeader">Flash Account</div>
          {/*--- balance + details ---*/}
          <div className="flex-1 flex flex-col mt-5 portrait:sm:mt-6 landscape:lg:mt-6">
            {/*--- balance ---*/}
            {flashBalance ? (
              <div className={`cashoutBalance`}>
                <div>
                  {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
                  <span>{(Number(flashBalance) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}</span>
                </div>
                <div
                  className="ml-4 w-[36px] h-[24px] flex items-center justify-center bg-slate-300 rounded-sm cursor-pointer active:opacity-50"
                  onClick={() => setFlashDetails(!flashDetails)}
                >
                  <FontAwesomeIcon icon={faAngleDown} className="pt-0.5 text-xl" />
                </div>
              </div>
            ) : (
              <div className="cashoutBalance text-transparent w-[150px] bg-slate-300 animate-pulse rounded-md">0000</div>
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
                    Rate
                    <div className="group flex items-center">
                      <FontAwesomeIcon icon={faCircleInfo} className="px-2 text-gray-400 textXs" />
                      <div className="w-full top-0 left-0 cashoutTooltip">The USDC to EUR rate if you cash out now</div>
                    </div>
                  </div>
                  <div className="">{rates.usdcToLocal}</div>
                </div>
              </div>
            </div>
          </div>
          {/*--- button ---*/}
          {flashBalance ? (
            <button className="cashoutButton" onClick={onClickTransferToCex}>
              Transfer to {cashoutSettingsState?.cex ?? "CEX"}
            </button>
          ) : (
            <button className="cashoutButton text-transparent bg-slate-300 animate-pulse">0000</button>
          )}
        </div>

        {/*---CEX---*/}
        <div className={`${paymentSettingsState?.merchantCountry != "Any country" && cashoutSettingsState?.cex == "Coinbase" ? "" : "hidden"} cashoutContainer`}>
          {/*--- header + unlink ---*/}
          <div className="w-full flex justify-between items-center">
            <div className="cashoutHeader">Coinbase Account</div>
            <div className={`${isCexAccessible ? "" : "hidden"} link underline underline-offset-2`} onClick={onClickUnlink}>
              {isCexAccessible ? "unlink" : ""}
            </div>
          </div>
          {/*---balance + details ---*/}
          {isCexAccessible ? (
            <div className="flex-1 flex flex-col mt-5 portrait:sm:mt-6 landscape:lg:mt-6">
              {/*--- balance ---*/}
              {cexBalance ? (
                <div className="cashoutBalance">
                  <div className="flex items-center">
                    {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
                    {(Number(cexBalance) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
                  </div>
                  <div
                    className="ml-4 w-[36px] h-[24px] flex items-center justify-center bg-slate-300 rounded-sm cursor-pointer active:opacity-50"
                    onClick={() => setCexDetails(!cexDetails)}
                  >
                    <FontAwesomeIcon icon={faAngleDown} className="pt-0.5 text-xl" />
                  </div>
                </div>
              ) : (
                <div className="cashoutBalance text-transparent w-[150px] bg-slate-300 animate-pulse rounded-md">0000</div>
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
                      Rate
                      <div className="group flex items-center">
                        <FontAwesomeIcon icon={faCircleInfo} className="px-2 text-gray-400 textXs" />
                        <div className="w-full top-0 left-0 cashoutTooltip">The USDC to EUR rate if you cash out now</div>
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
                Link Your Coinbase Account
              </div>
            </div>
          )}
          {/*---transfer to bank ---*/}
          {cexBalance ? (
            <button className="cashoutButton" onClick={onClickTransferToBank}>
              Transfer to Bank
            </button>
          ) : (
            <button className={`${isCexAccessible ? "" : "hidden"} cashoutButton text-transparent bg-slate-300 animate-pulse`}>0000</button>
          )}
        </div>

        {/*--- Your Savings ---*/}
        <div className="hidden cashoutContainerStats cashoutStats">
          {/*--- header ---*/}
          <div className="w-full flex items-center justify-between">
            <div className="textBase font-bold">Your Savings</div>
            <div className="cashoutShow" onClick={() => setStatDetails(!statDetails)}>
              {statDetails ? "hide" : "show"} details
            </div>
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
          <div className={`${statDetails ? "max-h-[150px]" : "max-h-0"} overflow-hidden transition-all duration-500`}>
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
          <div className={`${statDetails ? "max-h-[120px]" : "max-h-0"} overflow-hidden transition-all duration-500`}>
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
      </div>

      {/*--- 3 modals---*/}
      {transferToCexModal && (
        <div className="w-full flex flex-col items-center h-screen absolute inset-0 bg-white z-[100]">
          {/*--- title ---*/}
          <div className="w-full h-[10%] min-h-[80px] textXl flex justify-center items-center relative">
            <div className="textXl font-semibold text-2xl">Transfer USDC</div>
            {/*--- info  ---*/}
            <div className="group">
              <FontAwesomeIcon icon={faCircleInfo} className="ml-3 text-lg text-gray-400" />
              <div className="cashoutTooltip w-[330px] left-[calc((100vw-330px)/2)] top-[100%] text-base">
                To cash out your earnings to your bank, you must first transfer USDC from Flash to{" "}
                {cashoutSettingsState ? (cashoutSettingsState?.cex == "Coinbase" ? "Coinbase" : cashoutSettingsState?.cex) : "a platform where you can convert USDC to fiat"}.
              </div>
            </div>
            {/*--- close button  ---*/}
            <div
              className="absolute right-3 text-3xl p-2 cursor-pointer"
              onClick={() => {
                setTransferToCexModal(false);
                setUsdcTransferToCex("");
              }}
            >
              &#10005;
            </div>
            {/*--- loading bar ---*/}
            <div
              className={`absolute left-0 bottom-0 w-full h-[10%] bg-blue-500 animate-pulse ease-linear  ${transferState == "initial" ? "translate-x-[-100%]" : ""} ${
                transferState == "sending" ? "translate-x-[-20%] duration-[3000ms]" : ""
              } ${transferState == "sent" ? "translate-x-[0%] duration-[300ms]" : ""} transition-all`}
            ></div>
          </div>
          {/*--- FROM container ---*/}
          <div className="w-full bg-slate-100 pt-[28px] pb-[40px] flex flex-col items-center relative">
            {/*--- FROM content ---*/}
            <div className="w-[330px] flex items-center">
              <div className="relative w-[60px] h-[60px] overflow-hidden rounded-lg">
                <Image src="/logoBlackBgNoText.svg" alt="flash" fill />
              </div>
              <div className="ml-4 flex flex-col">
                <div className="text-lg leading-tight font-medium">From: Flash</div>
                <div className="text-base leading-tight text-gray-500">{paymentSettingsState?.merchantName}</div>
                <div className="break-all text-base leading-tight text-gray-500">
                  {paymentSettingsState?.merchantEvmAddress.slice(0, 10)}...{paymentSettingsState?.merchantEvmAddress.slice(-8)}
                </div>
              </div>
            </div>
            {/*--- ARROW ---*/}
            <div className="absolute w-[48px] h-[48px] bottom-[-24px] flex items-center justify-center rounded-full bg-slate-400">
              <FontAwesomeIcon icon={faArrowDown} className="text-3xl text-white" />
            </div>
          </div>

          {/*--- TO container ---*/}
          <div className="w-full bg-slate-200 pt-[40px] pb-[28px] flex flex-col items-center">
            {/*--- TO content ---*/}
            <div className="w-[330px] flex items-center">
              <div className="relative w-[60px] h-[60px]">
                <Image src="/coinbase.svg" alt="coinbase" fill />
              </div>
              <div className="ml-4 flex flex-col">
                <div className="text-lg leading-tight font-medium">To: Coinbase</div>
                <div className="text-base leading-tight text-gray-500">{cashoutSettingsState?.cexAccountName}</div>
                <div className="break-all text-base leading-tight text-gray-500">
                  {cashoutSettingsState?.cexEvmAddress.slice(0, 10)}...{cashoutSettingsState?.cexEvmAddress.slice(-8)}
                </div>
              </div>
            </div>
            {/*--- TO amount ---*/}
            {/* <div className="w-[330px]">
              <div className="w-full flex items-center">
                <div className="px-4 flex-1 text-2xl font-bold">
                  {usdcTransferToCex ? (Number(usdcTransferToCex) - 0.1).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]) : "0"}
                </div>
                <div className="flex items-center">
                  <div className="relative w-[20px] h-[20px] mt-0.5">
                    <Image src="/usdc.svg" alt="USDC" fill />
                  </div>
                  <div className="ml-0.5 text-xl font-medium leading-none">USDC</div>
                </div>
                <div className="invisible mx-4 py-1 text-base font-bold text-blue-500">max</div>
              </div>
              <div className="px-1 h-[1px] bg-gray-400"></div>
            </div> */}
          </div>
          {/*--- AMOUNT ---*/}
          <div className="py-10 w-[340px]">
            <div className="hidden mb-6 textXl font-semibold text-center underline underline-offset-[3px]">Enter Amount USDC</div>
            {/*--- label + balance ---*/}
            <div className="w-full text-base flex justify-between relative">
              <div className="font-semibold">Amount</div>
              <div className="">Balance: {flashBalance} USDC</div>
            </div>
            {/*--- input box ---*/}
            <div className="my-1 w-full h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] flex items-center justify-between bg-white border border-gray-400 rounded-md">
              <div className="flex-1">
                <input
                  className="w-full px-4 font-bold text-2xl outline-none focus:border-blue-500 duration-300 focus:placeholder:invisible"
                  type="number"
                  inputMode="decimal"
                  onChange={(e) => setUsdcTransferToCex(e.currentTarget.value)}
                  value={usdcTransferToCex}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center">
                <div className="relative w-[22px] h-[22px]">
                  <Image src="/usdc.svg" alt="USDC" fill />
                </div>
                <div className="ml-1 text-xl font-medium leading-none">USDC</div>
              </div>
              <div className="mx-4 py-1 text-base font-bold text-blue-500 cursor-pointer" onClick={() => setUsdcTransferToCex(flashBalance)}>
                max
              </div>
            </div>
            {/*--- fee ---*/}
            <div className="hidden w-full flex justify-end relative">
              <div className="flex items-center">
                Fee: 0.10 USDC
                <span className="group">
                  <FontAwesomeIcon icon={faCircleInfo} className="ml-1 pt-0.5 text-sm text-gray-400" />
                  <div className="w-full left-0 top-[100%] cashoutTooltip textBase">
                    This fee is used to pay the transaction fee on the Polygon network. Flash does not charge any fees.
                  </div>
                </span>
              </div>
            </div>
          </div>

          {/*--- buttons ---*/}
          {transferState == "initial" ? (
            <div className="w-full flex flex-col items-center space-y-10">
              {/*--- transfer button ---*/}
              <button onClick={onClickTransferToCexSubmit} className="modalButtonBlue rounded-md">
                TRANSFER
              </button>
              {/*--- cancel button ---*/}
              <button
                onClick={() => {
                  setTransferToCexModal(false);
                  setUsdcTransferToCex("");
                }}
                className={`underline underline-offset-2 font-medium textLg`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] text-lg portrait:sm:text-xl landscape:lg:text-xl font-medium text-gray-500">
              <SpinningCircleGray />
              &nbsp; Transferring...
            </div>
          )}
        </div>
      )}

      {transferToBankModal && (
        <div className="w-full flex flex-col items-center h-screen absolute inset-0 bg-white z-[100]">
          {/*--- title ---*/}
          <div className="w-full h-[10%] min-h-[80px] textXl flex justify-center items-center relative">
            <div className="textXl font-semibold text-2xl">Cash Out</div>
            <div
              className="absolute right-3 text-3xl p-2 cursor-pointer"
              onClick={() => {
                setTransferToBankModal(false);
                setUsdcTransferToBank("");
              }}
            >
              &#10005;
            </div>
            {/*--- loading bar ---*/}
            <div
              className={`absolute left-0 bottom-0 w-full h-[10%] bg-blue-500 animate-pulse ease-linear  ${transferState == "initial" ? "translate-x-[-100%]" : ""} ${
                transferState == "sending" ? "translate-x-[-20%] duration-[3000ms]" : ""
              } ${transferState == "sent" ? "translate-x-[0%] duration-[300ms]" : ""} transition-all`}
            ></div>
          </div>
          {/*--- FROM container ---*/}
          <div className="w-full bg-slate-200 pt-[40px] pb-[60px] space-y-[20px] flex flex-col items-center relative">
            {/*--- FROM content ---*/}
            {cashoutSettingsState?.cex == "Coinbase" && (
              <div className="w-[330px] flex items-center">
                <div className="relative w-[60px] h-[60px]">
                  <Image src="/coinbase.svg" alt="coinbase" fill />
                </div>
                <div className="ml-4 flex flex-col">
                  <div className="text-lg leading-tight font-medium">From: Coinbase</div>
                  <div className="text-base leading-tight text-gray-500">{cashoutSettingsState?.cexAccountName}</div>
                  <div className="break-all text-base leading-tight text-gray-500">
                    {cashoutSettingsState?.cexEvmAddress.slice(0, 10)}...{cashoutSettingsState?.cexEvmAddress.slice(-8)}
                  </div>
                </div>
              </div>
            )}
            {cashoutSettingsState?.cex != "Coinbase" && <div className="mt-2 w-full text-gray-400"></div>}
            {/*--- FROM amount ---*/}
            <div className="w-[330px]">
              {/*--- label + balance ---*/}
              <div className="pl-2 pr-1 w-full flex justify-between">
                <div className="font-medium textBase">Amount</div>
                <div className="text-base">
                  Balance <span className={` text-blue-600`}>{cexBalance}</span>
                </div>
              </div>
              {/*--- input box ---*/}
              <div className="w-full h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] flex items-center justify-between bg-white border border-gray-400 rounded-md">
                <div className="flex-1">
                  <input
                    className="w-full px-4 font-bold text-2xl outline-none focus:border-blue-500 duration-300 focus:placeholder:invisible"
                    type="number"
                    inputMode="decimal"
                    onChange={(e) => setUsdcTransferToBank(e.currentTarget.value)}
                    value={usdcTransferToBank}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center">
                  <div className="relative w-[20px] h-[20px] mt-0.5">
                    <Image src="/usdc.svg" alt="USDC" fill />
                  </div>
                  <div className="ml-0.5 text-xl font-medium leading-none">USDC</div>
                </div>
                <div className="mx-4 py-1 text-base font-bold text-blue-500 cursor-pointer" onClick={() => setUsdcTransferToBank(cexBalance)}>
                  max
                </div>
              </div>
            </div>
            {/*--- ARROW ---*/}
            <div className="absolute w-[52px] h-[52px] bottom-[-26px] flex items-center justify-center rounded-full bg-slate-400">
              <FontAwesomeIcon icon={faArrowDown} className="text-4xl text-white" />
            </div>
          </div>

          {/*--- TO container ---*/}
          <div className="w-full bg-slate-100 pt-[50px] pb-[44px] space-y-[30px] flex flex-col items-center">
            {/*--- TO content ---*/}
            <div className="w-[330px] flex items-center">
              <div className="w-[60px] h-[60px] bg-slate-300 flex justify-center items-center rounded-[8px]">
                <div className="relative w-[44px] h-[44px]">
                  <Image src="/ani-bank-solid.svg" alt="bank" fill />
                </div>
              </div>
              <div className="ml-4 flex flex-col">
                <div className="text-lg leading-tight font-medium">To: Bank</div>
                <div className="text-base leading-tight text-gray-500">{cbBankAccountName}</div>
              </div>
            </div>
            {/*--- TO amount ---*/}
            <div className="w-[330px]">
              <div className="text-2xl font-bold">
                {currency2symbol[paymentSettingsState?.merchantCurrency!]}{" "}
                {(Number(usdcTransferToBank) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
              </div>
              <div className="px-1 h-[1px] bg-gray-400"></div>
            </div>
          </div>
          {/*--- rate ---*/}
          <div className="h-[70px] flex justify-center items-center">
            1 USDC = {rates.usdcToLocal} {paymentSettingsState?.merchantCurrency}
          </div>

          {/*--- buttons ---*/}
          {transferState == "initial" ? (
            <div className="w-full flex flex-col items-center space-y-6">
              {/*--- transfer button ---*/}
              <button onClick={onClickTransferToBankSubmit} className="modalButtonBlue rounded-md">
                CASH OUT
              </button>
              {/*--- cancel button ---*/}
              <button
                onClick={() => {
                  setTransferToBankModal(false);
                  setUsdcTransferToBank("");
                }}
                className="underline underline-offset-2 font-medium textLg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] text-lg portrait:sm:text-xl landscape:lg:text-xl font-medium text-gray-500">
              <SpinningCircleGray />
              &nbsp; Transferring...
            </div>
          )}
        </div>
      )}

      {transferToCexSuccessModal && (
        <div className="w-full flex flex-col items-center h-screen absolute inset-0 bg-white z-[110]">
          <div className="flex-1 w-[88%] min-w-[348px] max-w-[500px] flex flex-col items-center space-y-8">
            {/*--- close button ---*/}
            <div className="w-full h-[10%] min-h-[60px] textXl flex justify-end">
              <div
                className="absolute right-3 text-3xl p-2 cursor-pointer"
                onClick={() => {
                  setTransferState("initial");
                  setTransferToCexSuccessModal(false);
                  setTransferToCexModal(false);
                  setUsdcTransferToCex("");
                }}
              >
                &#10005;
              </div>
            </div>
            {/*--- content ---*/}
            <FontAwesomeIcon icon={faCircleCheck} className="text-6xl text-green-500" />
            <div className="text-3xl font-medium">Transfer successful!</div>
            <div className="text3xl font-bold">{usdcTransferToCex} USDC</div>
            <div className="textXl text-center">was sent to your Coinbase account. Please wait a few minutes for your Coinbase balance to update.</div>
          </div>
          <button
            className="mb-20 modalButtonWhite"
            onClick={() => {
              setTransferState("initial");
              setTransferToCexSuccessModal(false);
              setTransferToCexModal(false);
              setUsdcTransferToCex("");
            }}
          >
            CLOSE
          </button>
        </div>
      )}

      {transferToBankSuccessModal && (
        <div className="w-full flex flex-col items-center h-screen absolute inset-0 bg-white z-[110]">
          {/*--- close button ---*/}
          <div className="w-full h-[9%] min-h-[54px] textXl flex justify-center items-center">
            <div
              className="absolute right-3 text-3xl p-2 cursor-pointer"
              onClick={() => {
                setTransferState("initial");
                setTransferToBankSuccessModal(false);
                setTransferToBankModal(false);
                setUsdcTransferToBank("");
              }}
            >
              &#10005;
            </div>
          </div>
          {/*--- content ---*/}
          <div className="flex-1 w-[90%] max-w-[500px] flex flex-col items-center space-y-8">
            <FontAwesomeIcon icon={faCircleCheck} className="text-6xl text-green-500" />
            <div className="text-3xl font-medium">Deposit successful!</div>
            <div className="text3xl font-bold">{usdcTransferToBank} USDC</div>
            <div className="textXl text-center">
              was converted to{" "}
              <span className="font-bold">
                {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                {fiatDeposited}
              </span>
              , and the money deposited to your bank. You should see the deposit within 1-2 business days.
            </div>
          </div>
          <button
            className="mb-20 modalButtonWhite"
            onClick={() => {
              setTransferState("initial");
              setTransferToBankSuccessModal(false);
              setTransferToBankModal(false);
              setUsdcTransferToBank("");
            }}
          >
            CLOSE
          </button>
        </div>
      )}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </section>
  );
};

export default CashOut;
