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
import { useTheme } from "next-themes";

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
import { faCircleInfo, faArrowDown, faEllipsisVertical, faInfinity, faAngleDown, faAngleUp, faCircleCheck, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
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
  paymentSettingsState: PaymentSettings | null;
  cashoutSettingsState: CashoutSettings | null;
  setCashoutSettingsState: any;
  transactionsState: Transaction[];
  isMobile: boolean;
  idToken: string;
  publicKey: string;
  isUsabilityTest: boolean;
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
  const [cexMoreOptions, setCexMoreOptions] = useState(false);
  const [blockchainFee, setBlockchainFee] = useState(0.05); // in USDC
  // accordion states
  const [flashDetails, setFlashDetails] = useState(false);
  const [cexDetails, setCexDetails] = useState(false);
  const [savingsDetails, setSavingsDetails] = useState(false);
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
  const { theme } = useTheme();

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
      if (transactionsState?.length > 0) {
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
    // setIsCexAccessible(true);
    // return;
    const cbRandomSecure = uuidv4() + "SUBSTATEcashOut";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:buys:create,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read`
    );
  };

  const onClickUnlink = () => {
    // setIsCexAccessible(false);
    // return;
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
        setErrorMsg(<div>Please first link your Coinbase account</div>);
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

  const hideCexMoreOptions = () => {
    setCexMoreOptions(false);
    document.removeEventListener("click", hideCexMoreOptions);
  };

  console.log("before render", "\nflashBalance:", flashBalance, "\nisCexAccessible", isCexAccessible, "\ncexBalance:", cexBalance);
  return (
    // 96px is height of mobile top menu bar + 14px mt
    <section className="py-6 portrait:sm:py-8 landscape:lg:py-8 portrait:min-h-[calc(100vh-84px)] portrait:sm:min-h-[calc(100vh-140px)] w-full flex flex-col items-center overflow-y-auto">
      {/*---Flash Account + Coinbase Account + Statistics ---*/}
      <div className="w-[88%] portrait:sm:w-[480px] landscape:lg:w-[480px] landscape:xl:desktop:w-[500px] flex flex-col space-y-6 portrait:sm:space-y-8 landscape:lg:space-y-8">
        {/*---FLASH CARD ---*/}
        <div className="cashoutContainer">
          {/*--- title ---*/}
          <div className="cashoutHeader h-[36px] flex items-center">Flash Account</div>
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
              <div className="cashoutBalance text-transparent w-[150px] bg-light4 animate-pulse rounded-md">0000</div>
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
                      <FontAwesomeIcon icon={faCircleInfo} className="px-2 info" />
                      <div className="w-full top-0 left-0 cashoutTooltip">The USDC to EUR rate if you cash out now</div>
                    </div>
                  </div>
                  <div className="">{rates.usdcToLocal}</div>
                </div>
              </div>
            </div>
          </div>
          {/*--- button ---*/}
          <div className="cashoutButtonContainer">
            {flashBalance ? (
              <button className="cashoutButton" onClick={onClickTransferToCex}>
                Transfer to {cashoutSettingsState?.cex ?? "CEX"}
              </button>
            ) : (
              <button className="cashoutButton text-transparent bg-light4 animate-pulse">0000</button>
            )}
          </div>
        </div>

        {/*---CEX---*/}
        <div className={`${paymentSettingsState?.merchantCountry != "Any country" && cashoutSettingsState?.cex == "Coinbase" ? "" : "hidden"} cashoutContainer`}>
          {/*--- header + unlink ---*/}
          <div className="w-full flex justify-between items-center">
            <div className="cashoutHeader">Coinbase Account</div>
            <div
              className={`${isCexAccessible ? "" : "hidden"} ${
                cexMoreOptions ? "bg-gray-200" : ""
              } cursor-pointer relative w-[36px] h-[36px] rounded-full flex items-center justify-center translate-x-[8px] landscape:xl:desktop:hover:bg-gray-200`}
              onClick={() => {
                setCexMoreOptions(!cexMoreOptions);
                if (!cexMoreOptions) {
                  document.addEventListener("click", hideCexMoreOptions);
                }
              }}
            >
              {/* <FontAwesomeIcon icon={faEllipsisVertical} className="hidden textXl" /> */}
              <div
                className={`${
                  cexMoreOptions ? "absolute" : "hidden"
                } top-[calc(100%+8px)] right-0 px-4 py-1 textLg rounded-md border border-gray-300 desktop:hover:bg-gray-200 active:bg-gray-200`}
                onClick={onClickUnlink}
              >
                Unlink
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
                <div className="cashoutBalance text-transparent w-[150px] bg-light4 animate-pulse rounded-md">0000</div>
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
          {/*--- button ---*/}
          <div className="cashoutButtonContainer">
            {cexBalance ? (
              <button className="cashoutButton" onClick={onClickTransferToBank}>
                Transfer to Bank
              </button>
            ) : (
              <button className={`${isCexAccessible ? "" : "hidden"} cashoutButton text-transparent bg-light4 animate-pulse`}>0000</button>
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
          <div className="mt-2 px-2 flex justify-between">
            <table>
              <th></th>
            </table>
          </div>
        </div>
      </div>

      {/*--- 3 modals---*/}
      {transferToCexModal && (
        <div className="">
          <div className="detailsModal dark:bg-dark2  landscape:xl:desktop:w-[400px]">
            {/*--- HEADER ---*/}
            <div className="detailsModalHeaderContainer">
              {/*--- header ---*/}
              <div className="detailsModalHeader">Transfer To Coinbase</div>
              {/*--- mobile back ---*/}
              <div className="mobileBack">
                <FontAwesomeIcon
                  icon={faAngleLeft}
                  onClick={() => {
                    setTransferToCexModal(false);
                    setUsdcTransferToCex("");
                  }}
                />
              </div>
              {/*--- tablet/desktop close ---*/}
              <div
                className="xButtonContainer"
                onClick={() => {
                  setTransferToCexModal(false);
                  setUsdcTransferToCex("");
                }}
              >
                <div className="xButton">&#10005;</div>
              </div>
            </div>

            {/*--- CONTENT ---*/}
            <div className="w-[92%] portrait:sm:w-[85%] landscape:lg:w-[85%] flex flex-col items-center overflow-y-auto landscape:xl:desktop:h-[500px]">
              {/*--- FROM container ---*/}
              <div className="pt-6 pb-12 landscape:xl:desktop:pb-9 transferCard">
                {/*--- info ---*/}
                <div className="w-full flex items-center">
                  <div className="transferIcon">
                    <Image src="/logoBlackBgNoText.svg" alt="coinbase" fill />
                  </div>
                  <div className="textBase ml-3 flex flex-col">
                    <div className="leading-none font-medium">From: Flash</div>
                    <div className="leading-tight text-slate-500 line-clamp-1">{paymentSettingsState?.merchantName}</div>
                    <div className="leading-tight break-all text-slate-500">
                      {paymentSettingsState?.merchantEvmAddress.slice(0, 10)}...{paymentSettingsState?.merchantEvmAddress.slice(-8)}
                    </div>
                  </div>
                </div>
                {/*--- from amount ---*/}
                <div className="mt-4 w-full flex items-center relative">
                  <input
                    className="transferAmountFromBox inputColor border2Color placeholderColor placeholder:not-italic dark:bg-dark2"
                    type="number"
                    inputMode="decimal"
                    onChange={(e) => setUsdcTransferToCex(e.currentTarget.value)}
                    value={usdcTransferToCex}
                    placeholder="0"
                  />
                  {/*--- max + USDC ---*/}
                  <div className="h-full right-0 absolute flex space-x-4 items-center">
                    <div className="text-base landscape:xl:desktop:text-sm font-bold text-blue-500 cursor-pointer" onClick={() => setUsdcTransferToCex(flashBalance)}>
                      max
                    </div>
                    <div className="pr-4 text-2xl landscape:xl:desktop:text-xl font-semibold leading-none">USDC</div>
                  </div>
                </div>
                {/*--- balance ---*/}
                <div className="pl-1 mt-0.5 w-full textBase text-slate-500">
                  Balance: <span className="">{flashBalance}</span> USDC
                </div>
              </div>

              {/*--- ARROW ---*/}
              <div className="w-full h-[24px] flex justify-center relative z-[1]">
                <div className="w-[200px] h-[70px] landscape:xl:desktop:w-[160px] landscape:xl:desktop:h-[60px] absolute bottom-[-20px] flex items-center justify-center rounded-full bg-light1 dark:bg-dark3 border border-slate-500 dark:border-slate-600 z-[2]">
                  <FontAwesomeIcon icon={faArrowDown} className="text-4xl landscape:xl:desktop:text-3xl text-lightText1 dark:text-darkText1" />
                  <div className="textBase ml-2 leading-tight">
                    {blockchainFee} USDC <br />
                    blockchain fee
                  </div>
                </div>
              </div>

              {/*--- TO container ---*/}
              <div className="pt-12 landscape:xl:desktop:pt-9 pb-6 transferCard">
                {/*--- info ---*/}
                <div className="w-full flex items-center">
                  <div className="transferIcon">
                    <Image src="/coinbase.svg" alt="coinbase" fill />
                  </div>
                  <div className="textBase ml-3 flex flex-col">
                    <div className="leading-none font-medium">From: Coinbase</div>
                    <div className="leading-tight text-slate-500 line-clamp-1">{cashoutSettingsState?.cexAccountName}</div>
                    <div className="leading-tight break-all text-slate-500">
                      {cashoutSettingsState?.cexEvmAddress.slice(0, 10)}...{cashoutSettingsState?.cexEvmAddress.slice(-8)}
                    </div>
                  </div>
                </div>
                {/*--- to amount ---*/}
                <div className="transferAmountToBox">
                  <div className="">{usdcTransferToCex ? Number(usdcTransferToCex) - blockchainFee : "0"}</div>
                  <div className="pr-4 text-2xl landscape:xl:desktop:text-xl font-semibold leading-none">USDC</div>
                </div>
              </div>

              {/*--- buttons ---*/}
              <div className="flex-none mt-8 portrait:sm:mt-12 landscape:lg:mt-12 landscape:xl:desktop:mt-6 w-full pb-4">
                {transferState == "initial" ? (
                  <button onClick={onClickTransferToCexSubmit} className="buttonPrimary">
                    Transfer To Coinbase
                  </button>
                ) : (
                  <div className="w-full flex justify-center items-center h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] text-lg portrait:sm:text-xl landscape:lg:text-xl font-medium text-gray-500">
                    <SpinningCircleGray />
                    &nbsp; Transferring...
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
          <div className="detailsModal dark:bg-dark2  landscape:xl:desktop:w-[400px]">
            {/*--- HEADER ---*/}
            <div className="detailsModalHeaderContainer">
              {/*--- header ---*/}
              <div className="detailsModalHeader">Transfer To Bank</div>
              {/*--- mobile back ---*/}
              <div className="mobileBack">
                <FontAwesomeIcon icon={faAngleLeft} onClick={() => setTransferToBankModal(false)} />
              </div>
              {/*--- tablet/desktop close ---*/}
              <div className="xButtonContainer" onClick={() => setTransferToBankModal(false)}>
                <div className="xButton">&#10005;</div>
              </div>
            </div>

            {/*--- CONTENT ---*/}
            <div className="w-[92%] portrait:sm:w-[85%] landscape:lg:w-[85%] flex flex-col items-center overflow-y-auto landscape:xl:desktop:h-[500px]">
              {/*--- FROM container ---*/}
              <div className="pt-6 pb-12 landscape:xl:desktop:pb-9 transferCard">
                {/*--- info ---*/}
                <div className="w-full flex items-center">
                  <div className="relative w-[52px] h-[52px]">
                    <Image src="/coinbase.svg" alt="coinbase" fill />
                  </div>
                  <div className="textBase ml-3 flex flex-col">
                    <div className="leading-none font-medium">From: Coinbase</div>
                    <div className="leading-tight text-slate-500 line-clamp-1">{cashoutSettingsState?.cexAccountName}</div>
                    <div className="leading-tight break-all text-slate-500">
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
                    value={usdcTransferToBank}
                    placeholder="0"
                  />
                  {/*--- max + USDC ---*/}
                  <div className="h-full right-0 absolute flex space-x-4 items-center">
                    <div className="text-base landscape:xl:desktop:text-sm font-bold text-blue-500 cursor-pointer" onClick={() => setUsdcTransferToBank(cexBalance)}>
                      max
                    </div>
                    <div className="pr-4 text-2xl landscape:xl:desktop:text-xl font-semibold leading-none">USDC</div>
                  </div>
                </div>
                {/*--- balance ---*/}
                <div className="pl-1 mt-0.5 w-full textBase text-slate-500">
                  Balance: <span className="">{cexBalance}</span> USDC
                </div>
              </div>

              {/*--- ARROW ---*/}
              <div className="w-full h-[24px] flex justify-center relative z-[1]">
                <div className="w-[200px] h-[70px] landscape:xl:desktop:w-[160px] landscape:xl:desktop:h-[60px] absolute bottom-[-20px] flex items-center justify-center rounded-full bg-light1 dark:bg-dark3 border border-slate-500 dark:border-slate-600 z-[2]">
                  <FontAwesomeIcon icon={faArrowDown} className="text-4xl landscape:xl:desktop:text-3xl text-lightText1 dark:text-darkText1" />
                  <div className="textBase ml-2 leading-tight">
                    1 USDC =<br />
                    {rates.usdcToLocal} {paymentSettingsState?.merchantCurrency}
                  </div>
                </div>
              </div>

              {/*--- TO container ---*/}
              <div className="pt-12 landscape:xl:desktop:pt-9 pb-6 transferCard">
                {/*--- info ---*/}
                <div className="w-full flex items-center">
                  <div className="transferIcon border border-dualGray dark:border-dark6">
                    <Image src={theme == "dark" ? "/bankDark.svg" : "/bankLight.svg"} alt="bank" fill />
                  </div>
                  <div className="textBase ml-3 flex flex-col">
                    <div className="leading-none font-medium">To: Bank</div>
                    <div className="leading-tight text-slate-500 line-clamp-1">{cbBankAccountName.split("\n")[0]}</div>
                    <div className="leading-none text-slate-500 line-clamp-1">{cbBankAccountName.split("\n")[1]}</div>
                  </div>
                </div>
                {/*--- to amount ---*/}
                <div className="transferAmountToBox">
                  <div className="">
                    {currency2symbol[paymentSettingsState?.merchantCurrency!]}{" "}
                    {(Number(usdcTransferToBank) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
                  </div>
                  <div className="pr-4 text-2xl landscape:xl:desktop:text-xl font-semibold leading-none"></div>
                </div>
              </div>

              {/*--- buttons ---*/}
              <div className="flex-none mt-8 portrait:sm:mt-12 landscape:lg:mt-12 landscape:xl:desktop:mt-6 w-full pb-4">
                {transferState == "initial" ? (
                  <button onClick={onClickTransferToBankSubmit} className="buttonPrimary">
                    Transfer To Bank
                  </button>
                ) : (
                  <div className="w-full flex justify-center items-center h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] text-lg portrait:sm:text-xl landscape:lg:text-xl font-medium text-gray-500">
                    <SpinningCircleGray />
                    &nbsp; Transferring...
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}

      {transferToCexSuccessModal && (
        <div className="w-full flex flex-col items-center h-screen absolute inset-0 bg-white z-[110]">
          <div className="flex-1 w-[88%] max-w-[330px] flex flex-col items-center space-y-8">
            {/*--- close button ---*/}
            <div className="w-full h-[10%] min-h-[60px] flex items-center justify-end">
              <div
                className="xButton"
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
            <div className="text3xl font-medium">Transfer successful!</div>
            <div className="text2xl font-bold">{usdcTransferToCex} USDC</div>
            <div className="textLg text-center">was sent to your Coinbase account. Please wait a few minutes for your Coinbase balance to update.</div>
          </div>
          <button
            className="mb-20 buttonSecondary"
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
          <div className="flex-1 w-[88%] max-w-[330px] flex flex-col items-center space-y-8">
            {/*--- close button ---*/}
            <div className="w-full h-[10%] min-h-[60px] flex items-center justify-end">
              <div
                className="xButton"
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
              <div className="text3xl font-medium">Deposit successful!</div>
              <div className="text2xl font-bold">{usdcTransferToBank} USDC</div>
              <div className="textLg text-center">
                was converted to{" "}
                <span className="font-bold">
                  {currency2symbol[paymentSettingsState?.merchantCurrency!]}
                  {fiatDeposited}
                </span>
                , and the money deposited to your bank. You should see the deposit within 1-2 business days.
              </div>
            </div>
          </div>
          <button
            className="mb-20 buttonSecondary"
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
