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
import { currency2symbol } from "@/utils/constants";
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
// components
import ErrorModal from "./modals/ErrorModal";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faClockRotateLeft, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, CashoutSettings, Transaction } from "@/db/models/UserModel";

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

  const currencyDecimal = 2;

  const defaultRates: any = {
    USD: { usdcToLocal: 1, usdToLocal: 1 },
    EUR: { usdcToLocal: 0.9315, usdToLocal: 0.9321 },
    GBP: { usdcToLocal: 0.7965, usdToLocal: 0.797 },
    TWD: { usdcToLocal: 31.7, usdToLocal: 31.5 },
  };

  const [flashBalance, setFlashBalance] = useState(""); // use string
  const [cexBalance, setCexBalance] = useState<string | undefined>("");
  const [isCexAccessible, setIsCexAccessible] = useState(true);
  const [txnHash, setTxnHash] = useState("");
  const [usdcTransferToCex, setUsdcTransferToCex] = useState("");
  const [usdcTransferToBank, setUsdcTransferToBank] = useState("");
  const [cbBankAccountName, setCbBankAccountName] = useState<any>("");
  const [rates, setRates] = useState<any>(defaultRates[paymentSettingsState?.merchantCurrency ?? 0]);
  // accordion states
  const [flashDetails, setFlashDetails] = useState(false);
  const [cexDetails, setCexDetails] = useState(false);

  // modal states
  const [transferToCexModal, setTransferToCexModal] = useState(false);
  const [transferToBankModal, setTransferToBankModal] = useState(false);
  const [cashOutModal, setCashOutModal] = useState(false);
  const [cashOutModalText, setCashOutModalText] = useState("initial"); // "initial" | "sending" | "sent"
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>();

  const [stats, setStats] = useState<any>({ totalCurrencyAmount: 0, totalTokenAmount: 0, paymentRate: 0 });

  // hooks
  const router = useRouter();
  const account = useAccount();
  const config = useConfig();
  const getFlashBalanceRef = useRef(false); //makes it so API runs once
  const getCexBalanceRef = useRef(false); //makes it so API runs once

  // other
  const merchantNetworks: string[] = ["Polygon"];
  const merchantTokens: string[] = ["USDC"];
  const CEXData = {
    Coinbase: { img: "coinbase", shortName: "Coinbase" },
    "Coinbase Exchange": { img: "coinbase", shortName: "Coinbase" },
    "MAX Exchange": { img: "max", shortName: "MAX Exchange" },
  };

  useEffect(() => {
    console.log("/app, Cashout, get balances useEffect run once");
    // if (!getCexBalanceRef.current) {
    //   return;
    // }
    // getCexBalanceRef.current = true;
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
      const flashBalanceBigInt: bigint = (await readContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [account.address],
      })) as bigint;
      const flashBalanceTemp = formatUnits(flashBalanceBigInt, 6);
      setFlashBalance(flashBalanceTemp);
      console.log("flashBalanceTemp", flashBalanceTemp);

      // get cexBalance (Coinbase)
      if (cashoutSettingsState?.cex == "Coinbase Exchange") {
        // get access or refresh tokens
        const cbAccessToken = window?.sessionStorage.getItem("cbAccessToken") ?? "";
        const cbRefreshToken = window?.localStorage.getItem("cbRefreshToken") ?? "";
        console.log("cbRefreshToken & cbAccessToken", cbRefreshToken, cbAccessToken);
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
            setCexBalance(data.balance);
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

      // get cexBalance (not Coinbase)
      if (cashoutSettingsState?.cex != "Coinbase Exchange") {
        console.log("getting non-Coinbase balance");
        // if other cex, set cexBalance to undefined only if no API keys
        if (cashoutSettingsState?.cexApiKey && cashoutSettingsState?.cexSecretKey) {
          const res = await fetch("/api/getCexBalance", {
            method: "POST",
            body: JSON.stringify({ cexApiKey: cashoutSettingsState?.cexApiKey, cexApiSecret: cashoutSettingsState?.cexSecretKey }),
            headers: { "content-type": "application/json" },
          });
          const data = await res.json();
          setCexBalance(data.balance);
        } else {
          setIsCexAccessible(false);
        }
      }
    };
    getBalances();
    // setCexBalance("1231.32"); // for testing purposes
    // setIsCexAccessible(true); // for testing purposes
    console.log("/app, Cashout, getCexBalance useEffect ended");
  }, []);

  useEffect(() => {
    let totalCurrencyAmount = 0;
    let totalTokenAmount = 0;
    if (transactionsState) {
      for (const txn of transactionsState) {
        totalCurrencyAmount = totalCurrencyAmount + Number(txn.currencyAmount);
        totalTokenAmount = totalTokenAmount + Number(txn.tokenAmount);
      }
      console.log(totalCurrencyAmount, totalCurrencyAmount);
      setStats({
        totalTxns: transactionsState?.length,
        totalCurrencyAmount: totalCurrencyAmount,
        totalTokenAmount: totalTokenAmount,
        paymentRate: (totalCurrencyAmount * 0.98) / totalTokenAmount,
        currentRate: 0.912,
        cashoutRate: 0,
      });
    }
  }, []);

  const onClickCashOutConfirm = async () => {
    setCashOutModalText("sending");

    // get USDC account ID
    const resAccounts = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${window.sessionStorage.getItem("cbAccessToken")}` } });
    const accounts = resAccounts.data.data; // accounts = array of accounts
    const usdcAccount = accounts.find((i: any) => i.name === "USDC Wallet");
    const usdcAccountId = usdcAccount.id; // returns string with 6 decimals
    console.log(usdcAccountId);

    // get cexEvmAddress
    const resCexAddresses = await axios.get(`https://api.coinbase.com/v2/accounts/${usdcAccountId}/addresses`, {
      headers: { Authorization: `Bearer ${window.sessionStorage.getItem("cbAccessToken")}` },
    });
    const cexAddressObjects = resCexAddresses.data.data; // returns Solana and Ethereum address objects
    const usdcAddressObject = cexAddressObjects.find((i: any) => i.network === "ethereum"); // find the Ethereum account
    const cexEvmAddress = usdcAddressObject.address; // get address
    console.log(cexEvmAddress);

    // send USDC
    const txnHashTemp = await writeContract(config, {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on polygon
      abi: ERC20ABI,
      functionName: "transfer",
      args: [cexEvmAddress, parseUnits(usdcTransferToCex, 6)],
    });
    console.log(txnHashTemp);
    setTxnHash(txnHashTemp);
    setCashOutModalText("sent");

    //
  };

  const onClickSIWC = async () => {
    const cbRandomSecure = uuidv4();
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:buys:create,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read`
    );
  };

  const onClickSOWC = async () => {
    window.sessionStorage.removeItem("cbAccessToken");
    window.localStorage.removeItem("cbRefreshToken");
  };

  const onClickTransferToCex = async () => {
    if (cashoutSettingsState?.cexEvmAddress && cashoutSettingsState?.cexAccountName) {
      setTransferToCexModal(true);
    } else {
      if (cashoutSettingsState?.cex == "Coinbase Exchange") {
        setErrorMsg("Please first link your Coinbase account");
      } else {
        setErrorMsg("Please first add your CEX's USDC deposit address on the Polygon network in Settings > Cash Out Settings");
      }
      setErrorModal(true);
    }
  };

  const onClickTransferToCexSubmit = async () => {
    setCashOutModalText("sending");
    try {
      const txnHashTemp = await writeContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on polygon
        abi: ERC20ABI,
        functionName: "transfer",
        args: [cashoutSettingsState?.cexEvmAddress, parseUnits(usdcTransferToCex, 6)],
      });
      console.log(txnHashTemp);
      setTxnHash(txnHashTemp);
      setCashOutModalText("sent");
    } catch (err) {
      console.log(err);
      console.log("transfer not sent");
      setCashOutModalText("inital");
    }
  };

  const onClickTransferToBank = async () => {
    // coinbase
    if (cashoutSettingsState?.cex == "Coinbase Exchange") {
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
    // not coinbase
    if (cashoutSettingsState?.cex != "Coinbase Exchange") {
      if (cashoutSettingsState?.cexApiKey && cashoutSettingsState?.cexSecretKey) {
        // connect to exchange and make withdrawal
      } else {
        setTransferToBankModal(false);
        setErrorMsg("Please first add your CEX's USDC deposit address on the Polygon network in Settings > Cash Out Settings");
        setErrorModal(true);
      }
    }
  };

  const onClickTransferToBankSubmit = async () => {
    // setCashOutModalText("sending");

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
    <section className="py-4 min-h-[calc(100vh-84px)] w-full flex flex-col items-center overflow-y-auto">
      {/*---Flash Account + CEX + Statistics ---*/}
      <div className="w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] flex flex-col space-y-4 text-gray-700">
        {/*---Flash Account---*/}
        <div className="cashoutContainer">
          {/*---title---*/}
          <div className="text-xl font-bold">Flash Account</div>
          {/*---body---*/}
          <div className="">
            {/*---balance + transfer to CEX---*/}
            <div className="mt-4 flex items-center justify-between">
              {/*---balance---*/}
              <div className="flex items-center">
                <div className="text-3xl font-bold">
                  {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]} {(Number(flashBalance) * rates.usdcToLocal).toFixed(2)}
                </div>
                <div className="ml-3 group relative">
                  <FontAwesomeIcon icon={faCircleInfo} className="px-1 text-gray-400 text-sm" />
                  <div className="invisible group-hover:visible leading-snug absolute top-8 left-[calc(-180px/2)] w-[180px] px-2 py-1 bg-gray-100 rounded-lg border border-gray-500 z-[2]">
                    This value is based on the current USDC to {paymentSettingsState?.merchantCurrency} rate of {rates.usdcToLocal}
                  </div>
                </div>
              </div>
              {/*---transfer to CEX ---*/}
              <div className="text-sm xs:text-xs link" onClick={onClickTransferToCex}>
                Transfer to {cashoutSettingsState?.cex.replace(" Exchange", "")}
              </div>
            </div>
            {/*---details---*/}

            <div className="mt-4 link" onClick={() => setFlashDetails(!flashDetails)}>
              {flashDetails ? "hide" : "show"} details
            </div>
            <div className={`${flashDetails ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-500`}>
              <div className="px-3 py-2 border border-gray-300 rounded-xl">
                <div className="font-bold">Account Holdings</div>
                <div className="mt-1 flex items-center">
                  <div className="relative w-[20px] h-[20px] lg:w-[20px] lg:h-[20px]">
                    <Image src="/usdc.svg" alt="USDC" fill />
                  </div>
                  <div className="ml-0.5 text-base lg:text-lg font-bold">USDC</div>
                  <div className="ml-2 text-base lg:text-lg">{Number(flashBalance).toFixed(2)}</div>
                </div>
                {/* <div className="mt-4 text-sm text-gray-400 font-bold">USDC ON NETWORKS</div>
                <div className="mt-1">
                  <span className="font-bold">Polygon</span> {Number(flashBalance).toFixed(2)}
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/*---CEX---*/}
        <div className="cashoutContainer">
          {/*---title---*/}
          <div className="text-xl font-bold">{cashoutSettingsState?.cex.replace(" Exchange", "")} Account</div>
          {/*---body---*/}
          <div>
            {isCexAccessible ? (
              <div>
                {/*---balance + transfer to CEX---*/}
                <div className="mt-4 flex items-center justify-between">
                  {/*---balance---*/}
                  <div className="flex items-center">
                    <div className="text-3xl font-bold">&euro; {(Number(cexBalance) * rates.usdcToLocal).toFixed(2)}</div>
                    <div className="ml-3 group relative">
                      <FontAwesomeIcon icon={faCircleInfo} className="px-1 text-gray-400 text-sm" />
                      <div className="invisible group-hover:visible leading-snug absolute top-8 left-[calc(-180px/2)] w-[180px] px-2 py-1 bg-gray-100 rounded-lg border border-gray-500 z-[2]">
                        This value is based on the current USDC to {paymentSettingsState?.merchantCurrency} rate of {rates.usdcToLocal}
                      </div>
                    </div>
                  </div>
                  {/*---transfer to CEX ---*/}
                  <div className="text-sm xs:text-xs link" onClick={onClickTransferToBank}>
                    Transfer to Bank
                  </div>
                </div>

                {/*---details---*/}
                <div className="mt-4 link" onClick={() => setCexDetails(!cexDetails)}>
                  {cexDetails ? "hide" : "show"} details
                </div>
                <div className={`${cexDetails ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-500`}>
                  <div className="px-3 py-2 border border-gray-300 rounded-xl">
                    <div className="font-bold">Account Holdings</div>
                    <div className="mt-1">
                      <div className="flex items-center">
                        <div className="relative w-[20px] h-[20px] lg:w-[20px] lg:h-[20px]">
                          <Image src="/usdc.svg" alt="USDC" fill />
                        </div>
                        <div className="ml-0.5 text-base lg:text-lg font-bold">USDC</div>
                        <div className="ml-2 text-base lg:text-lg">{Number(cexBalance).toFixed(2)}</div>
                        <div className="ml-4 text-sm text-gray-400">Earning 5.1%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {cashoutSettingsState?.cex == "Coinbase Exchange" && (
                  <div className="mt-6 link" onClick={onClickSIWC}>
                    Link Your Coinbase Account
                  </div>
                )}
                {cashoutSettingsState?.cex != "Coinbase Exchange" && <div>Please enter your CEX API Key in Settings &gt; Cash Out Settings</div>}
              </div>
            )}
          </div>
        </div>

        {/*--- Statistics ---*/}
        <div className="cashoutContainer">
          {/*---title---*/}
          <div className="flex items-center space-x-2">
            <div className="text-xl leading-none text-center font-bold">Statistics</div>
          </div>
          {/*---body---*/}

          {/*---above bordered stats---*/}
          <div className="mt-2 px-1">
            {/* <div className="flex justify-between">
              <div>Total Transactions</div>
              <div>{stats.totalTxns}</div>
            </div> */}

            <div className="flex justify-between">
              <div>Total Revenue</div>
              <div>
                {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                {stats.totalCurrencyAmount}
              </div>
            </div>
          </div>

          {/*---perceived costs from Flash---*/}
          <div className="px-1 border border-gray-500 rounded-md">
            {/*---cashback---*/}
            <div className="flex justify-between">
              <div>Total Cashback Given</div>
              <div>
                - {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                {(stats.totalCurrencyAmount * 0.02).toFixed(currencyDecimal)}
              </div>
            </div>
            {/*---gain/loss from rates---*/}
            <div className="flex justify-between">
              <div>Est. Gain/Loss from Rates</div>
              {/*---# times cashout * 0.015 USDC * USDC To currency rate + future ---*/}
              <div></div>
            </div>
            {/*---gain/loss from rates, details---*/}
            <div className="hidden">
              <div className="flex justify-between">
                <div>Total USDC Received</div>
                <div>{stats.totalTokenAmount.toFixed(2)} USDC</div>
              </div>
              <div className="flex justify-between">
                <div>Avg. USDC to EUR Rate</div>
                <div>{stats.paymentRate.toFixed(4)}</div>
              </div>
            </div>
            {/*---total transaction fees---*/}
            <div className="flex justify-between">
              <div>Total Transaction Fees</div>
              <div>
                - {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                {(1 * 0.015 * stats.currentRate).toFixed(2)}
              </div>
            </div>
          </div>

          {/*---below bordered stats---*/}
          <div className="px-1">
            {/*---total net revenue---*/}
            <div className="flex justify-between">
              <div>Total Net Revenue</div>
              <div>
                {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                {(stats.totalCurrencyAmount * 0.98).toFixed(2)}
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <div>Est. Credit Card Costs</div>
              <div>
                - {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                {(stats.totalCurrencyAmount * 0.029 + transactionsState?.length! * 0.3).toFixed(2)}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Savings Over Credit Card</div>
              <div>
                {currency2symbol[paymentSettingsState?.merchantCurrency ?? "USD"]}
                {(stats.totalCurrencyAmount * 0.029 + transactionsState?.length! * 0.3 - stats.totalCurrencyAmount * 0.02).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/*---Cash Out Button---*/}
        {/* <div className="mt-8 flex-none flex flex-col items-center justify-center relative">
          <button
            className="w-[176px] h-[64px] text-2xl bg-blue-500 text-white font-bold rounded-full lg:hover:bg-blue-600 active:bg-blue-300 relative"
            onClick={() => {
              // setCashOutModalText("initial");
              if (cashoutSettingsState.cex === "Coinbase Exchange") {
                if (cexBalance) {
                  setCashOutModal(true);
                } else {
                  setErrorMsg("Please go to the Settings tab > Automation Package Settings > Deposit Addresses ");
                  setErrorModal(true);
                }
              } else {
                if (cashoutSettingsState.cexEvmAddress) {
                  setCashOutModal(true);
                } else {
                  setErrorMsg(`Please go to Settings > Cash Out Settings and enter your ${cashoutSettingsState.cex?.replace(" Exchange", "")} account's USDC deposit address`);
                  setErrorModal(true);
                }
              }
            }}
          >
            Cash Out
          </button>
          <div className="absolute bottom-[44px] md:bottom-[40px] left-[calc(100%+24px)] group">
            <FontAwesomeIcon icon={faCircleQuestion} className=" text-gray-400 text-xl" />
            <div className="invisible group-hover:visible absolute w-[138px] xs:w-[124px] right-[28px] bottom-[4px] text-base leading-tight xs:text-sm xs:leading-tight px-2 py-1.5 pointer-events-none bg-white text-slate-700 border-blue-500 border rounded-lg z-10">
              Cash out to your bank with 1 click
            </div>
          </div>
        </div> */}

        {/*---HISTORY---*/}
        {/* <div className="my-8 flex items-center justify-center space-x-2 text-blue-800">
          <FontAwesomeIcon icon={faClockRotateLeft} className="h-[20px]" />
          <div
            className="text-lg leading-none font-bold lg:hover:underline active:underline cursor-pointer"
            onClick={() => {
              setErrorModal(true);
              setErrorMsg("This feature is coming soon.");
            }}
          >
            Cashout History
          </div>
        </div> */}
      </div>

      {/*---cashOut Modal---*/}

      {cashOutModal && (
        <div>
          <div className="w-[348px] h-[430px] lg:h-[400px] bg-white px-6 py-6 rounded-xl fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-20">
            {/*--- content---*/}
            {cashOutModalText == "initial" && (
              <div>
                <div className="text-xl lg:text-xl leading-snug">
                  <p>
                    <span className="font-bold">{Number(cexBalance).toFixed(2)} USDC</span> will be transferred from your Flash account to your{" "}
                    {cashoutSettingsState?.cex.replace(" Exchange", "")} account.
                  </p>
                  <p className="mt-4">After ~5 minutes, it will be converted to USD and deposited to your bank.</p>
                </div>
                <button
                  onClick={onClickCashOutConfirm}
                  className="mt-8 w-full h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-full text-white text-lg font-bold"
                >
                  CONFIRM
                </button>
                <button
                  className={`${
                    cashOutModalText == "initial" ? "" : "hidden"
                  } mt-4 lg:mt-2 w-full h-[56px] lg:h-[44px] text-lg font-bold rounded-full border border-red-400 text-red-400 lg:hover:text-red-500 lg:hover:border-red-500 active:text-red-300`}
                  onClick={() => setCashOutModal(false)}
                >
                  CANCEL
                </button>
              </div>
            )}
            {cashOutModalText == "sending" && (
              <div className="h-full flex flex-col justify-center items-center">
                <SpinningCircleGray />
                <div className="mt-2 text-xl lg:text-xl leading-snug">Transferring...</div>
              </div>
            )}
            {cashOutModalText == "sent" && (
              <div className="h-full flex flex-col justify-evenly">
                <div className="">
                  <div className="text-2xl font-bold text-center">Transfer complete!</div>
                  <div className="mt-8 text-lg text-center link">
                    <a href={`https://polygonscan.com/tx/${txnHash}`} target="_blank">
                      View transaction
                    </a>
                  </div>
                </div>
                <button
                  className="mt-8 w-full h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-full text-white text-lg font-bold"
                  onClick={() => setCashOutModal(false)}
                >
                  CLOSE
                </button>
              </div>
            )}
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
      {transferToCexModal && (
        <div>
          <div className="w-[340px] min-h-[300px] px-6 py-10 flex flex-col items-center text-gray-700 bg-white rounded-3xl border border-gray-500 fixed left-[50%] translate-x-[-50%] top-[50%] translate-y-[-55%] z-[90]">
            {/*---content, 3 conditions---*/}
            {cashOutModalText == "initial" && (
              <div className="w-full flex flex-col items-center">
                <div className="w-[250px] text-2xl font-bold text-center">Transfer USDC from Flash to {cashoutSettingsState?.cex.replace(" Exchange", "")}</div>
                {cashoutSettingsState?.cex == "Coinbase Exchange" && (
                  <div className="mt-6 w-full">
                    <div className="font-bold underline underline-offset-2">{cashoutSettingsState?.cex.replace(" Exchange", "")} Account Details</div>
                    {/*---cex account info---*/}
                    <div className="font-bold text-gray-400">
                      <div className="mt-3 w-full">
                        Name <span className="ml-1 text-gray-700">{cashoutSettingsState?.cexAccountName}</span>
                      </div>
                      <div className="mt-2 w-full">
                        Address <span className="ml-1 text-gray-700 break-all">{cashoutSettingsState?.cexEvmAddress}</span>
                      </div>
                    </div>
                  </div>
                )}
                {cashoutSettingsState?.cex != "Coinbase Exchange" && (
                  <div className="mt-2 w-full ont-bold text-gray-400">
                    Your {cashoutSettingsState?.cex.replace(" Exchange", "")} USDC Deposit Address
                    <div className="ml-1 text-gray-700 break-all">{cashoutSettingsState?.cexEvmAddress}</div>
                  </div>
                )}

                {/*---balance---*/}
                <div className="mt-5 w-full text-base font-medium text-gray-400 text-end">
                  balance <span className={`${flashBalance ? "" : "invisible"} text-blue-600`}>{flashBalance}</span>
                </div>
                {/*---input---*/}
                <div className="w-full flex items-center justify-between border border-gray-400 rounded-2xl">
                  <div className="ml-3 relative w-[32px] h-[32px]">
                    <Image src="/usdc.svg" alt="USDC" fill />
                  </div>
                  <input
                    className="py-3 w-[50%] text-center font-bold text-3xl outline-none focus:border-blue-500 duration-300 focus:placeholder:invisible"
                    type="number"
                    inputMode="decimal"
                    onChange={(e) => setUsdcTransferToCex(e.currentTarget.value)}
                    value={usdcTransferToCex}
                    placeholder="0 USDC"
                  ></input>
                  <div className="mr-3 px-2 py-1 bg-gray-100 font-bold text-blue-500" onClick={() => setUsdcTransferToCex(flashBalance)}>
                    max
                  </div>
                </div>
                {/*---buttons---*/}
                <button
                  onClick={onClickTransferToCexSubmit}
                  className="mt-10 w-[200px] py-3 text-gray-400 text-lg font-bold tracking-wide bg-white lg:hover:bg-gray-100 active:bg-gray-100 rounded-full border border-gray-200 drop-shadow-md"
                >
                  Transfer
                </button>
                <button
                  onClick={() => setTransferToCexModal(false)}
                  className="w-[200px] mt-12 px-5 text-gray-400 text-lg font-bold tracking-wide bg-white lg:hover:text-gray-800 active:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            )}
            {cashOutModalText == "sending" && (
              <div className="w-full grow flex flex-col justify-center items-center">
                <SpinningCircleGray />
                <p className="mt-1">Sending...</p>
                <p className="mt-4">Please do not close window</p>
              </div>
            )}
            {cashOutModalText == "sent" && (
              <div className="w-full grow flex flex-col justify-center items-center">
                <div>
                  {usdcTransferToCex} USDC successfully sent to your {cashoutSettingsState?.cex}!
                </div>
                <button
                  onClick={() => {
                    setTransferToCexModal(false);
                    setCashOutModalText("initial");
                  }}
                  className="mt-10 w-[200px] py-3 text-gray-400 text-lg font-bold tracking-wide bg-white lg:hover:bg-gray-100 active:bg-gray-100 rounded-full border border-gray-200 drop-shadow-md"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
      {transferToBankModal && (
        <div>
          <div className="w-[340px] h-[500px] px-6 py-6 flex flex-col items-center text-gray-700 bg-white rounded-3xl border border-gray-500 fixed left-[50%] translate-x-[-50%] top-[50%] translate-y-[-55%] z-[90]">
            {/*---content, 3 conditions---*/}
            {cashOutModalText == "initial" && (
              <div className="flex flex-col items-center">
                <div className="text-xl font-bold text-center">Convert USDC to {paymentSettingsState?.merchantCurrency} & Deposit to Bank</div>
                {cashoutSettingsState?.cex == "Coinbase Exchange" && (
                  <div className="w-full">
                    <div className="mt-8 font-bold text-gray-400">BANK DETAILS</div>
                    <div className="mt-0 font-bold">{cbBankAccountName}</div>
                  </div>
                )}
                {cashoutSettingsState?.cex != "Coinbase Exchange" && <div className="mt-2 w-full font-bold text-gray-400">Under Construction</div>}

                {/*---balance---*/}
                <div className="mt-8 w-full text-base font-medium text-gray-400 text-end">
                  balance <span className={`${cexBalance ? "" : "invisible"} text-blue-600`}>{cexBalance}</span>
                </div>
                {/*---input---*/}
                <div className="relative">
                  <input
                    className="px-2 w-full py-3 font-medium text-center text-3xl border rounded-xl bg-white border-gray-300 outline-none focus:border-blue-500 duration-300 focus:placeholder:invisible"
                    type="number"
                    inputMode="decimal"
                    onChange={(e) => setUsdcTransferToBank(e.currentTarget.value)}
                    value={usdcTransferToBank}
                    placeholder="0 USDC"
                  ></input>
                  <div className="absolute top-[15px] right-[12px] px-2 py-1 bg-gray-100 font-bold text-blue-500" onClick={() => setUsdcTransferToBank(cexBalance!)}>
                    max
                  </div>
                </div>
                {/*---buttons---*/}
                <button
                  onClick={onClickTransferToBankSubmit}
                  className="mt-10 w-[200px] py-3 text-gray-400 text-lg font-bold tracking-wide bg-white lg:hover:bg-gray-100 active:bg-gray-100 rounded-full border border-gray-200 drop-shadow-md"
                >
                  Transfer
                </button>
                <button
                  onClick={() => setTransferToBankModal(false)}
                  className="w-[200px] mt-8 px-5 text-gray-400 text-lg font-bold tracking-wide bg-white lg:hover:text-gray-800 active:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            )}
            {cashOutModalText == "sending" && (
              <div className="w-full grow flex flex-col justify-center items-center">
                <SpinningCircleGray />
                <p className="mt-1">Sending...</p>
                <p className="mt-4">Please do not close window</p>
              </div>
            )}
            {cashOutModalText == "sent" && (
              <div className="w-full grow flex flex-col justify-center items-center">
                <div>
                  {usdcTransferToCex} USDC successfully sent to your {cashoutSettingsState?.cex}!
                </div>
                <button
                  onClick={() => {
                    setTransferToBankModal(false);
                    setCashOutModalText("initial");
                  }}
                  className="mt-10 w-[200px] py-3 text-gray-400 text-lg font-bold tracking-wide bg-white lg:hover:bg-gray-100 active:bg-gray-100 rounded-full border border-gray-200 drop-shadow-md"
                >
                  Dismiss
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
