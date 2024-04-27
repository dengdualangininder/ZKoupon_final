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
import { currency2decimal, currency2symbol } from "@/utils/constants";
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
// components
import ErrorModal from "./modals/ErrorModal";
// images
import SpinningCircleGray, { SpinningCircleGrayLarge } from "@/utils/components/SpinningCircleGray";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faClockRotateLeft, faCircleQuestion, faInfinity } from "@fortawesome/free-solid-svg-icons";
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

  const [flashBalance, setFlashBalance] = useState("");
  const [cexBalance, setCexBalance] = useState("");
  const [isCexAccessible, setIsCexAccessible] = useState(true);
  const [txnHash, setTxnHash] = useState("");
  const [usdcTransferToCex, setUsdcTransferToCex] = useState("");
  const [usdcTransferToBank, setUsdcTransferToBank] = useState("");
  const [cbBankAccountName, setCbBankAccountName] = useState<any>("");
  const [rates, setRates] = useState<Rates>({ usdcToLocal: 0, usdToLocal: 0 });
  // accordion states
  const [flashDetails, setFlashDetails] = useState(false);
  const [cexDetails, setCexDetails] = useState(false);
  const [statDetails, setStatDetails] = useState(false);
  // modal states
  const [transferToCexModal, setTransferToCexModal] = useState(false);
  const [transferToBankModal, setTransferToBankModal] = useState(false);
  const [modalText, setModalText] = useState("initial"); // "initial" | "sending" | "sent"
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>();
  const [stats, setStats] = useState<any>({ totalCurrencyAmount: 0, totalTokenAmount: 0, paymentRate: 0 });
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
    };
    getBalances();
    console.log("/app, Cashout, get balances useEffect end");
  }, []);

  useEffect(() => {
    let totalCurrencyAmount = 0;
    let totalTokenAmount = 0;
    if (transactionsState) {
      for (const txn of transactionsState) {
        totalCurrencyAmount = totalCurrencyAmount + Number(txn.currencyAmount);
        totalTokenAmount = totalTokenAmount + Number(txn.tokenAmount);
      }
      console.log("totalCurrencyAmount", totalCurrencyAmount);
      setStats({
        totalTxns: transactionsState?.length,
        totalCurrencyAmount: totalCurrencyAmount.toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]),
        totalTokenAmount: totalTokenAmount,
        paymentRate: (totalCurrencyAmount * 0.98) / totalTokenAmount,
        currentRate: 0.912,
        cashoutRate: 0,
      });
    }
  }, []);

  const onClickSIWC = async () => {
    const cbRandomSecure = uuidv4();
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:buys:create,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read`
    );
  };

  const onClickTransferToCex = async () => {
    setModalText("sending");
    if (cashoutSettingsState?.cexEvmAddress && cashoutSettingsState?.cexAccountName) {
      setTransferToCexModal(true);
    } else {
      if (cashoutSettingsState?.cex == "Coinbase") {
        setErrorMsg("Please first link your Coinbase account");
      } else {
        setErrorMsg("Please first add your CEX's USDC deposit address on the Polygon network in Settings > Cash Out Settings");
      }
      setErrorModal(true);
    }
  };

  const onClickTransferToCexSubmit = async () => {
    console.log(cashoutSettingsState?.cexEvmAddress);
    console.log(usdcTransferToCex);
    setModalText("sending");
    try {
      const txnHashTemp = await writeContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on polygon
        abi: ERC20ABI,
        functionName: "transfer",
        args: [cashoutSettingsState?.cexEvmAddress, parseUnits(usdcTransferToCex, 6)],
      });
      console.log(txnHashTemp);
      setTxnHash(txnHashTemp);
      setModalText("sent");
    } catch (err) {
      console.log(err);
      console.log("transfer not sent");
      setModalText("inital");
    }
  };

  const onClickTransferToBank = async () => {
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

  console.log("before render", "\ncexBalance:", cexBalance, "\nflashBalance:", flashBalance, "\nisCexAccessible", isCexAccessible);
  return (
    // 96px is height of mobile top menu bar + 14px mt
    <section className="py-4 portrait:sm:py-8 landscape:lg:py-8 portrait:min-h-[calc(100vh-84px)] portrait:sm:min-h-[calc(100vh-140px)] w-full flex flex-col items-center overflow-y-auto">
      {/*---Flash Account + Coinbase Account + Statistics ---*/}
      <div className="w-[95%] max-w-[620px] portrait:sm:w-[70%] landscape:lg:w-[70%] flex flex-col space-y-4 portrait:sm:space-y-8 landscape:lg:space-y-8">
        {/*---Flash Account---*/}
        <div className="cashoutContainer">
          <div className="flex flex-col">
            {/*---header---*/}
            <div className="w-full flex items-center justify-between">
              <div className="cashoutHeader">Flash Account</div>
              <div className="cashoutShow" onClick={() => setFlashDetails(!flashDetails)}>
                {flashDetails ? "hide" : "show"} details
              </div>
            </div>
            {/*--- balance ---*/}
            <div className={`${flashBalance ? "" : "bg-gray-200 rounded-md text-transparent animate-pulse w-[50%]"} cashoutBalance`}>
              {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
              <span>{flashBalance ? (Number(flashBalance) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]) : "00000"}</span>
            </div>
            {/*---details---*/}
            <div className={`${flashDetails ? "max-h-[120px]" : "max-h-[0px]"} cashoutDetails`}>
              <div className="pt-4">
                {/*--- usdc balance ---*/}
                <div className="flex items-center justify-between">
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
                  <div className="flex items center">
                    Rate
                    <div className="group flex items-center">
                      <FontAwesomeIcon icon={faCircleInfo} className="px-2 text-gray-400 textXs" />
                      <div className="w-full top-0 left-0 cashoutTooltip">The USDC to EUR rate if you cash out now</div>
                    </div>
                  </div>
                  <div className="">{rates.usdcToLocal}</div>
                </div>
                {/*--- transfer to any EVM address ---*/}
                {/* <div className="mt-4 link text-sm">Transfer to any EVM address</div> */}
              </div>
            </div>
          </div>
          {/*---transfer to CEX ---*/}
          <div className="w-full flex justify-center portrait:sm:justify-end landscape:lg:justify-end">
            <button className="cashoutButton" onClick={onClickTransferToCex}>
              Transfer to {cashoutSettingsState?.cex ?? "CEX"}
            </button>
          </div>
        </div>

        {/*---CEX---*/}
        <div className={`${paymentSettingsState?.merchantCountry != "Any country" && cashoutSettingsState?.cex == "Coinbase" ? "" : "hidden"} cashoutContainer relative`}>
          <div className="flex flex-col">
            {/*--- header ---*/}
            <div className="w-full flex items-center justify-between">
              <div className="cashoutHeader">Coinbase Account</div>
              <div className={`${isCexAccessible ? "" : "hidden"} cashoutShow`} onClick={() => setCexDetails(!cexDetails)}>
                {cexDetails ? "hide" : "show"} details
              </div>
            </div>
            {/*---balance ---*/}
            <div
              className={`${isCexAccessible ? "" : "hidden"} ${cexBalance ? "" : "bg-gray-200 rounded-md text-transparent animate-pulse w-[50%]"} cashoutBalance flex items-center`}
            >
              <div className="flex items-center">
                {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
                {cexBalance ? (Number(cexBalance) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!]) : "0"}
              </div>
              <div className={`ml-6 font-medium ${cexBalance ? "text-gray-400" : "text-transparent"} text-sm portrait:sm:text-lg landscape:lg:text-lg`}>Earning 5.1%</div>
            </div>
            {/*---details---*/}
            <div className={`${cexDetails ? "max-h-[100px]" : "max-h-[0px]"} ${isCexAccessible ? "" : "hidden"} cashoutDetails`}>
              <div className="pt-4">
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
                  <div className="flex items center">
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

          {/*---transfer to bank ---*/}
          <div className={`${isCexAccessible ? "" : "hidden"} w-full flex justify-center portrait:sm:justify-end landscape:lg:justify-end`}>
            <button className="cashoutButton" onClick={onClickTransferToBank}>
              Transfer to Bank
            </button>
          </div>

          {/*--- link CEX account ---*/}
          <div className={`${isCexAccessible ? "hidden" : ""} w-full h-full flex items-center justify-center`}>
            {cashoutSettingsState?.cex == "Coinbase" && (
              <div className="link textBase" onClick={onClickSIWC}>
                Link Your Coinbase Account
              </div>
            )}
          </div>
        </div>

        {/*--- Your Savings ---*/}
        <div className="cashoutContainerStats cashoutStats">
          {/*--- header ---*/}
          <div className="w-full flex items-center justify-between">
            <div className="cashoutHeader">Your Savings</div>
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
              {/*---Cash Back Given = totalCurrencyAmount - totalCurrencyAmountAfterCashBack ---*/}
              <div className="flex justify-between">
                <div>Cash Back Given</div>
                <div>
                  - {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                  {(stats.totalCurrencyAmount * 0.02).toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])}
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
                  <div>{stats.totalTokenAmount.toFixed(2)} USDC</div>
                </div>
                <div className="flex justify-between">
                  <div>Avg. USDC to EUR Rate</div>
                  <div>{stats.paymentRate.toFixed(4)}</div>
                </div>
              </div>
              {/*---total transaction fees---*/}
              <div className="flex justify-between">
                <div>Transaction Fees</div>
                <div>
                  - {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                  {(1 * 0.015 * stats.currentRate).toFixed(2)}
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
                  - {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                  {(stats.totalCurrencyAmount * 0.029 + transactionsState?.length! * 0.3).toFixed(2)}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Fee per Txn ($0.10)</div>
                <div>
                  - {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                  {(stats.totalCurrencyAmount * 0.029 + transactionsState?.length! * 0.3).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/*--- savings over credit card ---*/}
          <div className="px-2 flex justify-between">
            <div>Savings Over Credit Card</div>
            <div>
              {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
              {(stats.totalCurrencyAmount * 0.029 + transactionsState?.length! * 0.3 - stats.totalCurrencyAmount * 0.02).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/*--- 3 modals---*/}
      {transferToCexModal && (
        <div>
          <div className="modal">
            {/*---content, 3 conditions---*/}
            {modalText == "initial" && (
              <div className="w-full flex flex-col items-center space-y-8">
                {/*--- title ---*/}
                <div className="text-2xl font-medium leading-relaxed text-center">Transfer USDC from Flash to {cashoutSettingsState?.cex}</div>
                {/*--- cex account details ---*/}
                {cashoutSettingsState?.cex == "Coinbase" && (
                  <div className="w-full text-lg">
                    <div className="font-bold underline underline-offset-4">{cashoutSettingsState?.cex} Account Details</div>
                    <div className="text-start text-base">
                      <div className="mt-3 w-full">
                        Name: <span className="ml-1">{cashoutSettingsState?.cexAccountName}</span>
                      </div>
                      <div className="mt-2 w-full">
                        Address: <span className="ml-1 break-all">{cashoutSettingsState?.cexEvmAddress}</span>
                      </div>
                    </div>
                  </div>
                )}
                {cashoutSettingsState?.cex != "Coinbase" && (
                  <div className="mt-2 w-full text-gray-400">
                    Your {cashoutSettingsState?.cex} USDC Deposit Address
                    <div className="ml-1 break-all">{cashoutSettingsState?.cexEvmAddress}</div>
                  </div>
                )}
                {/*--- amount ---*/}
                <div>
                  <div className="w-full text-base font-medium text-gray-400 text-end">
                    Your balance <span className={` text-blue-600`}>{flashBalance}</span>
                  </div>
                  <div className="w-full h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] flex items-center justify-between border border-gray-400 rounded-[4px]">
                    <div onClick={() => setUsdcTransferToCex("")} className="ml-3 relative w-[32px] h-[32px] rounded-full bg-gray-200">
                      &#10005;
                    </div>
                    <input
                      className="w-[50%] text-center font-bold text-2xl outline-none focus:border-blue-500 duration-300 focus:placeholder:invisible"
                      type="number"
                      inputMode="decimal"
                      onChange={(e) => setUsdcTransferToCex(e.currentTarget.value)}
                      value={usdcTransferToCex}
                      placeholder="0 USDC"
                    ></input>
                    <div className="mr-3 px-2 py-1 text-base font-bold text-blue-500" onClick={() => setUsdcTransferToCex(flashBalance)}>
                      max
                    </div>
                  </div>
                </div>
                {/*--- transfer button ---*/}
                <button onClick={onClickTransferToCexSubmit} className="modalButtonBlue">
                  Transfer To {cashoutSettingsState?.cex}
                </button>
                {/*--- cancel button ---*/}
                <button
                  onClick={() => {
                    setTransferToCexModal(false);
                    setUsdcTransferToCex("");
                  }}
                  className="modalButtonWhite"
                >
                  Cancel
                </button>
              </div>
            )}
            {modalText == "sending" && (
              <div onClick={() => setModalText("sent")} className="w-full h-[300px] flex flex-col justify-center items-center">
                <SpinningCircleGrayLarge />
                <p className="mt-4">Sending...</p>
              </div>
            )}
            {modalText == "sent" && (
              <div className="w-full h-[300px] flex flex-col justify-between">
                <Lottie animationData={checkSimple} loop={false} className="top-[4px] h-[100px]" />
                <div className="mb-4">
                  {usdcTransferToCex} USDC successfully sent to your {cashoutSettingsState?.cex ?? "CEX"} account!
                </div>
                <button
                  onClick={() => {
                    setTransferToCexModal(false);
                    setModalText("initial");
                  }}
                  className="modalButtonWhite"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
      {transferToBankModal && (
        <div>
          <div className="modal">
            {/*---content, 3 conditions---*/}
            {modalText == "initial" && (
              <div className="w-full flex flex-col items-center space-y-8">
                {/*--- title ---*/}
                <div className="text-2xl font-medium leading-relaxed text-center">Convert USDC to {paymentSettingsState?.merchantCurrency} & Deposit to Bank</div>
                {/*--- bank account details ---*/}
                {cashoutSettingsState?.cex == "Coinbase" && (
                  <div className="w-full text-lg">
                    <div className="font-bold underline underline-offset-4">Bank Account Details</div>
                    <div className="mt-3 text-base">{cbBankAccountName}</div>
                  </div>
                )}
                {cashoutSettingsState?.cex != "Coinbase" && <div className="mt-2 w-full font-bold text-gray-400">Under Construction</div>}
                {/*--- amount ---*/}
                <div>
                  <div className="w-full text-base font-medium text-gray-400 text-end">
                    Your balance <span className={` text-blue-600`}>{cexBalance}</span>
                  </div>
                  <div className="w-full h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] flex items-center justify-between border border-gray-400 rounded-[4px]">
                    <div onClick={() => setUsdcTransferToBank("")} className="ml-3 relative w-[32px] h-[32px] rounded-full bg-gray-200">
                      &#10005;
                    </div>
                    <input
                      className="w-[50%] text-center font-bold text-2xl outline-none focus:border-blue-500 duration-300 focus:placeholder:invisible"
                      type="number"
                      inputMode="decimal"
                      onChange={(e) => setUsdcTransferToBank(e.currentTarget.value)}
                      value={usdcTransferToCex}
                      placeholder="0 USDC"
                    ></input>
                    <div className="mr-3 px-2 py-1 text-base font-bold text-blue-500" onClick={() => setUsdcTransferToBank(cexBalance)}>
                      max
                    </div>
                  </div>
                </div>
                {/*---buttons---*/}
                <button onClick={onClickTransferToBankSubmit} className="modalButtonBlue">
                  Transfer To Bank
                </button>
                <button onClick={() => setTransferToBankModal(false)} className="modalButtonWhite">
                  Cancel
                </button>
              </div>
            )}
            {modalText == "sending" && (
              <div className="w-full h-[300px] flex flex-col justify-center items-center">
                <SpinningCircleGrayLarge />
                <p className="mt-4">Sending...</p>
              </div>
            )}
            {modalText == "sent" && (
              <div className="w-full h-[300px] flex flex-col justify-between">
                <Lottie animationData={checkSimple} loop={false} className="top-[4px] h-[100px]" />
                <div className="mb-4">{usdcTransferToCex} USDC successfully sent to your bank!</div>
                <button
                  onClick={() => {
                    setTransferToBankModal(false);
                    setModalText("initial");
                  }}
                  className="modalButtonWhite"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </section>
  );
};

export default CashOut;
