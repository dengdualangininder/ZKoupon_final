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
import { tokenAddresses } from "@/utils/web3Constants";
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
// components
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faClockRotateLeft, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

const CashOut = ({
  paymentSettingsState,
  setPaymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  isMobile,
}: {
  paymentSettingsState: any;
  setPaymentSettingsState: any;
  cashoutSettingsState: any;
  setCashoutSettingsState: any;
  isMobile: boolean;
}) => {
  console.log("CashOut component rendered");
  const [flashAccountBalance, setFlashAccountBalance] = useState(""); // use string
  const [cexBalance, setCexBalance] = useState<string | undefined>("");
  // modal states
  const [cashOutModal, setCashOutModal] = useState(false);
  const [cashOutModalText, setCashOutModalText] = useState("initial"); // "initial" | "sending" | "sent"
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCexAccessible, setIsCexAccessible] = useState(true);
  const [txHash, setTxHash] = useState("");

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

  // get CEX balance
  useEffect(() => {
    // if (!getCexBalanceRef.current) {
    //   return;
    // }
    console.log("getting CEX balances");
    // getCexBalanceRef.current = true;
    (async () => {
      // if coinbase
      if (cashoutSettingsState.cex == "Coinbase Exchange") {
        console.log("getting Coinbase balance");
        const cbAccessToken = window?.sessionStorage.getItem("cbAccessToken") ?? "";
        const cbRefreshToken = window?.localStorage.getItem("cbRefreshToken") ?? "";
        console.log("found cbRefreshToken or cbAccessToken in local storage", cbRefreshToken, cbAccessToken);
        if (cbAccessToken || cbRefreshToken) {
          console.log("calling cbGetBalance API...");
          const res = await fetch("/api/cbGetBalance", {
            method: "POST",
            body: JSON.stringify({ cbAccessToken, cbRefreshToken }),
            headers: { "content-type": "application/json" },
          });
          const data = await res.json();
          console.log(data);
          if (data.status === "success") {
            setCexBalance(data.balance);
            if (data.cbAccessToken && data.cbRefreshToken) {
              console.log("storing new tokens");
              window.sessionStorage.setItem("cbAccessToken", data.cbAccessToken);
              window.localStorage.setItem("cbRefreshToken", data.cbRefreshToken);
            }
          } else if (data.status === "error") {
            setIsCexAccessible(false);
          }
        } else {
          console.log("/app, CashOut, useEffect, no cbAccessToken or cbRefreshToken");
          setIsCexAccessible(false);
        }
      } else {
        console.log("getting non-Coinbase balance");
        // if other cex, set cexBalance to undefined only if no API keys
        if (cashoutSettingsState.cexApiKey && cashoutSettingsState.cexSecretKey) {
          const res = await fetch("/api/getCexBalance", {
            method: "POST",
            body: JSON.stringify({ cexApiKey: cashoutSettingsState.cexApiKey, cexApiSecret: cashoutSettingsState.cexSecretKey }),
            headers: { "content-type": "application/json" },
          });
          const data = await res.json();
          setCexBalance(data.balance);
        } else {
          setIsCexAccessible(false);
        }
      }
    })();
  }, []);

  // get flashAccountBalance, runs only once
  useEffect(() => {
    // if (!getFlashBalanceRef.current) {
    //   return;
    // }
    // getFlashBalanceRef.current = true;
    // get flash account balance
    const getFlashAccountBalance = async () => {
      const flashAccountBalanceBigInt: bigint = (await readContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [account.address],
      })) as bigint;
      const flashAccountBalanceTemp = formatUnits(flashAccountBalanceBigInt, 6);
      setFlashAccountBalance(flashAccountBalanceTemp);
      console.log("flashAccountBalanceTemp", flashAccountBalanceTemp);
    };
    getFlashAccountBalance();
  }, []);

  const onClickCashOutConfirm = async () => {
    setCashOutModalText("sending");

    // account id
    const resAccounts = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${window.sessionStorage.getItem("cbAccessToken")}` } });
    const accounts = resAccounts.data.data; // accounts = array of accounts
    const usdcAccount = accounts.find((i: any) => i.name === "USDC Wallet");
    const usdcAccountId = usdcAccount.id; // returns string with 6 decimals

    // get cexEvmAddress
    const resCexAddresses = await axios.get(`https://api.coinbase.com/v2/accounts/${usdcAccountId}/addresses`, {
      headers: { Authorization: `Bearer ${window.sessionStorage.getItem("cbAccessToken")}` },
    });
    const cexAddressObjects = resCexAddresses.data.data; // array of USDC accounts on different networks
    const usdcAddressObject = cexAddressObjects.find((i: any) => i.network === "ethereum");
    const cexEvmAddress = usdcAddressObject.address;
    console.log("cexEvmAddress", cexEvmAddress);

    // send USDC
    const txHashTemp = await writeContract(config, {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on polygon
      abi: ERC20ABI,
      functionName: "transfer",
      args: [cexEvmAddress, parseUnits("0.1", 6)],
    });
    console.log(txHashTemp);
    setCashOutModalText("sent");
    setTxHash(txHashTemp);

    //
  };

  const onClickSIWC = async () => {
    const cbRandomSecure = uuidv4();
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:sells:create,wallet:withdrawals:create`
    );
  };

  const onClickTransferToCex = async () => {
    //logic
  };

  const onClickTransferToBank = async () => {
    //logic
  };

  console.log("last render");
  console.log("cexBalance", cexBalance);
  console.log("flashAccountBalance", flashAccountBalance);
  console.log("isCexAccessible", isCexAccessible);
  return (
    // 96px is height of mobile top menu bar + 14px mt
    <section className="mt-[14px] min-h-[calc(100vh-110px)] w-full flex flex-col items-center">
      {/*---Flash Account + CEX + History---*/}
      <div className="w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] flex flex-col text-gray-700">
        {/*---Flash Account---*/}
        <div className="cashoutContainer relative">
          {/*---title---*/}
          <div className="flex items-center space-x-2">
            <div className="text-xl leading-none text-center font-bold">Your Flash Pay Balance</div>
          </div>
          {/*---body---*/}
          <div>
            {flashAccountBalance ? (
              <div className="flex items-center">
                <div className="relative w-[24px] h-[24px] lg:w-[20px] lg:h-[20px]">
                  <Image src="/usdc.svg" alt="USDC" fill />
                </div>
                <div className="ml-1 w-[60px] text-xl lg:text-lg">USDC</div>
                <div className="ml-2 font-bold text-xl lg:text-lg">{Number(flashAccountBalance).toFixed(2)}</div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center text-center">
                <SpinningCircleGray />
              </div>
            )}
          </div>
          {/*---transfer from Flash to CEX ---*/}
          <div className="flex justify-end">
            <button className="text-sm xs:text-xs px-3 py-2 text-blue-600 hover:bg-gray-100 rounded-md" onClick={onClickTransferToCex}>
              Transfer to {cashoutSettingsState.cex?.replace(" Exchange", "")}
            </button>
          </div>
        </div>

        {/*---CEX---*/}
        <div className="mt-4 cashoutContainer">
          {" "}
          {/*---title---*/}
          <div className="flex items-center space-x-2">
            <div className="text-xl leading-none text-center font-bold">Your {cashoutSettingsState.cex?.replace(" Exchange", "")} Balance</div>
          </div>
          {/*---body---*/}
          <div>
            {isCexAccessible ? (
              <div className="flex items-center">
                <div className="relative w-[24px] h-[24px] lg:w-[20px] lg:h-[20px]">
                  <Image src="/usdc.svg" alt="USDC" fill />
                </div>
                <div className="ml-1 w-[60px] text-xl lg:text-lg">USDC</div>
                <div className="ml-2 font-bold text-xl lg:text-lg">{cexBalance ? Number(cexBalance).toFixed(2) : <SpinningCircleGray />}</div>
                <div className="ml-4 text-[10px] w-[40px] text-center text-gray-400 leading-[13px]">{cashoutSettingsState.cex == "Coinbase Exchange" ? "Earning 5% APR!" : ""}</div>
              </div>
            ) : (
              <div>
                {cashoutSettingsState.cex == "Coinbase Exchange" && (
                  <div className="link" onClick={onClickSIWC}>
                    Link Your Coinbase Account
                  </div>
                )}
                {cashoutSettingsState.cex != "Coinbase Exchange" && <div>Please enter your CEX API Key in Settings &gt; Cash Out Settings</div>}
              </div>
            )}
          </div>
          {/*---transfer from Flash to CEX ---*/}
          <div className="flex justify-end">
            <button className="text-sm xs:text-xs px-3 py-2 text-blue-600 hover:bg-gray-100 rounded-md" onClick={onClickTransferToBank}>
              Transfer to Bank
            </button>
          </div>
        </div>

        {/*---Cash Out Button---*/}
        <div className="mt-8 flex-none flex flex-col items-center justify-center relative">
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
          {/*--- info ---*/}
          <div className="absolute bottom-[44px] md:bottom-[40px] left-[calc(100%+24px)] group">
            <FontAwesomeIcon icon={faCircleQuestion} className=" text-gray-400 text-xl" />
            <div className="invisible group-hover:visible absolute w-[138px] xs:w-[124px] right-[28px] bottom-[4px] text-base leading-tight xs:text-sm xs:leading-tight px-2 py-1.5 pointer-events-none bg-white text-slate-700 border-blue-500 border rounded-lg z-10">
              Cash out to your bank with 1 click
            </div>
          </div>
        </div>

        {/*---HISTORY---*/}
        <div className="my-8 flex items-center justify-center space-x-2 text-blue-800">
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
        </div>
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
                    {cashoutSettingsState.cex?.replace(" Exchange", "")} account.
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
                    <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank">
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
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
      {errorModal && (
        <div>
          <div className="flex justify-center bg-white w-[300px] h-[250px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            {/*---content---*/}
            <div className="h-full flex flex-col justify-between items-center text-lg leading-tight md:text-base md:leading-snug px-6 py-8">
              {/*---msg---*/}
              <div className="mt-6 text-center">{errorMsg}</div>
              {/*---close button---*/}
              <button
                onClick={() => setErrorModal(false)}
                className="w-full h-[56px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-lg tracking-wide font-bold"
              >
                DISMISS
              </button>
            </div>
          </div>
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
    </section>
  );
};

export default CashOut;
