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
import { Buffer } from "buffer";
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
  const [MMBalances, setMMBalances] = useState({});
  const [MMTotalBalances, setMMTotalBalances] = useState({});
  const [cexBalance, setCexBalance] = useState<string | undefined>("");
  const [divheight, setDivheight] = useState();
  const [gettingBalance, setGettingBalance] = useState(); // networks. Triggers modal to show different textx.
  const [transactionCount, setTransactionCount] = useState(0);
  const [networkCount, setNetworkCount] = useState(0);
  // modal states
  const [cashOutModal, setCashOutModal] = useState(false);
  const [cashOutModalState, setCashOutModalState] = useState("initial");
  const [cashOutModalTitle, setCashOutModalTitle] = useState("");
  const [cashOutModalMsg, setCashOutModalMsg] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // hooks
  const router = useRouter();
  const account = useAccount();
  const config = useConfig();
  const initialized = useRef(false); //makes it so API runs once
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
    (async () => {
      // if coinbase
      if (cashoutSettingsState.cex == "Coinbase Exchange") {
        const cbAccessToken = window?.sessionStorage.getItem("cbAccessToken") ?? "";
        const res = await fetch("/api/cbGetBalance", { method: "POST", body: JSON.stringify({ cbAccessToken }), headers: { "content-type": "application/json" } });
        const data = await res.json();
        if (data.status === "success") {
          setCexBalance(data.balance);
        } else if (data === "no cbRefreshToken") {
          setCexBalance(undefined);
        } else if (data.status === "error") {
          console.log("error in cbGetBalance api");
          setCexBalance(undefined);
        }
      } else {
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
          setCexBalance(undefined);
        }
      }
    })();
  }, []);

  // get flashAccountBalance, runs only once
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
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
      // getCEXBalance();
    }
  }, []);

  // const getCEXBalance = () => {
  //   console.log("getCEXBalance called");
  //   axios
  //     .post(import.meta.env.VITE_ISDEV == "true" ? "http://localhost:8080/getCEXBalance" : "https://server.lingpay.io/getCEXBalance", {}, { withCredentials: true })
  //     .then((res) => {
  //       if (res.data.status === true) {
  //         setCEXBalances(res.data.CEXBalances);
  //       } else if (res.data.status === false) {
  //         // setErrorModal(true);
  //         // setErrorMsg("not verified");
  //       }
  //     })
  //     .catch((e) => {
  //       console.log("error", e);
  //       setErrorModal(true);
  //       setErrorMsg("/getToken request error");
  //     });
  // };

  const onClickCashOutConfirm = async () => {
    const txReceipt = await writeContract(config, {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      abi: ERC20ABI,
      functionName: "transfer",
      args: [cashoutSettingsState.cexEvmAddress, parseUnits(flashAccountBalance, 6)],
    });
    console.log(txReceipt);
  };

  const onClickSIWC = async () => {
    const cbRandomSecure = uuidv4();
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = process.env.NEXT_PUBLIC_ISDEV == "true" ? encodeURI("http://localhost:3000/app/cbAuth") : encodeURI("https://www.flashpayments.xyz/app/cbAuth");
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:sells:create,wallet:withdrawals:create`
    );
  };

  return (
    <section id="cashOutEl" className="min-h-[calc(100vh-96px)] w-full flex flex-col items-center">
      {/*---Cash Out Button---*/}
      <div className="h-[110px] flex-none flex flex-col items-center justify-center relative">
        {/*--- button ---*/}
        <button
          onClick={() => {
            if (cashoutSettingsState.cexEvmAddress) {
              setCashOutModal(true);
              setCashOutModalState("initial");
            } else {
              setErrorMsg("Please go to the Settings tab > Automation Package Settings > Deposit Addresses ");
              setErrorModal(true);
            }
          }}
          className="md:mt-1 mb-2 md:mb-0 w-[176px] h-[64px] text-2xl bg-blue-500 text-white font-extrabold rounded-full lg:hover:bg-blue-600 active:bg-blue-300 relative"
        >
          Cash Out
        </button>
        {/*--- info ---*/}
        <div className="absolute bottom-[44px] md:bottom-[40px] left-[calc(100%+24px)] group">
          <FontAwesomeIcon icon={faCircleQuestion} className=" text-gray-400 text-xl" />
          <div className="invisible group-hover:visible absolute w-[196px] xs:w-[180px] right-[28px] bottom-[4px] text-base leading-tight xs:text-sm xs:leading-tight px-2 py-1.5 pointer-events-none bg-white text-slate-700 border-blue-500 border rounded-lg z-10">
            Cash out all stablecoins to your bank with 1 click
          </div>
        </div>
      </div>

      {/*---Flash Account + CEX + History---*/}
      <div className="w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] flex flex-col">
        {/*---Flash Account---*/}
        <div className="cashoutContainer relative">
          {/*---title---*/}
          <div className="flex items-center space-x-2">
            {/* <div className="relative w-[60px] h-[28px]">
              <Image src="/logo.svg" alt="FlashLogo" fill />
            </div> */}
            <div className="text-xl leading-none text-center font-bold">Flash Account Balance</div>
          </div>
          {/*---body---*/}
          <div>
            {flashAccountBalance ? (
              <div className="mt-5 flex flex-col mb-[48px] xs:mb-[36px]">
                {/*---total balance---*/}
                <div className="space-y-1 lg:space-y-0">
                  {merchantTokens.map((token) => (
                    <div className="flex items-center">
                      <div className="relative w-[28px] lg:w-[20px]">
                        <Image src="/usdc.svg" alt="USDC logo" fill />
                      </div>
                      <div className="ml-1 w-[60px] text-xl lg:text-lg">USDC</div>
                      <div className="ml-2 font-bold text-xl lg:text-lg">{Number(flashAccountBalance).toFixed(2) == "0.00" ? 0 : Number(flashAccountBalance).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                {/*---transfer from Flash to CEX ---*/}
                <button className="absolute bottom-[8px] right-[8px] w-[140px] h-[40px] text-sm leading-none bg-blue-500 rounded-full text-white" onClick={onClickCashOutConfirm}>
                  <div className="flex items-center justify-center space-x-1">
                    <FontAwesomeIcon icon={faShare} className="text-xl mr-1" />
                    <div className="text-xs font-bold leading-none">
                      Transfer to
                      <br />
                      {cashoutSettingsState.cex}
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center text-center">
                <div className="">
                  <SpinningCircleGray />
                </div>
              </div>
            )}
          </div>
        </div>

        {/*---CEX---*/}
        <div className="mt-2 cashoutContainer relative">
          {/*---title---*/}
          <div className="flex items-center space-x-2">
            {/* <img src={CEXData[cashoutSettingsState.cex].img} className="h-[24px]" /> */}
            <div className="text-xl leading-none text-center font-bold">{cashoutSettingsState.cex} Balance</div>
          </div>
          {/*---body---*/}
          {/* {cashoutSettingsState.cexEvmAddress ? (
            <div className="">
              {cashoutSettingsState.cexApiKey && cashoutSettingsState.cexApiSecret && Object.keys(CEXBalances).length > 0 ? (
                <div>
                  {JSON.stringify(CEXBalances) != "{}" ? (
                    <div className="mt-5 mb-[48px] xs:mb-[36px] flex flex-col space-y-1 lg:space-y-0">
                      {merchantTokens.map((token) => (
                        <div className="flex items-center">
                          <img src={tokenData[token].img} className="w-[28px] lg:w-[20px]" />
                          <div className="ml-1 w-[60px] text-xl lg:text-lg">{token}</div>
                          <div className="ml-2 font-bold text-xl lg:text-lg">{Number(CEXBalances[token]).toFixed(2) == "0.00" ? 0 : Number(CEXBalances[token]).toFixed(2)}</div>
                        </div>
                      ))}
                      {cashoutSettingsState.cex === "Coinbase Exchange" && (
                        <div className="absolute bottom-[10px] xs:bottom-[20px] left-[18px] w-[180px] xs:w-auto mt-[20px] leading-[16px] text-sm text-slate-500">
                          Your USDC is automatically earning 5.05%
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-8 w-full flex justify-center">
                      <SpinningCircleGray />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-slate-500 text-base xs:text-sm leading-tight">
                  {!cashoutSettingsState.cexApiKey || !cashoutSettingsState.cexApiSecret ? (
                    <div>
                      Enter an <span className="font-bold text-slate-600">API Key</span> and <span className="font-bold text-slate-600">Secret Key</span> under Settings &gt;
                      Cashout Settings to see balances
                    </div>
                  ) : (
                    <div>Failed to load balances. Is your API Key or API Secret correct?</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 text-slate-500 text-base xs:text-sm leading-tight">
              Select a <span className="font-bold text-slate-600">cryptocurrency exchange</span> and enter an <span className="font-bold text-slate-600">API Key</span> (under
              Settings &gt; Automation Package Settings) to fetch balances
            </div>
          )} */}
          <button className="absolute bottom-[8px] right-[8px] w-[130px] h-[40px] text-sm leading-none bg-blue-500 rounded-full text-white" onClick={() => {}}>
            <div className="flex items-center justify-center space-x-1">
              <FontAwesomeIcon icon={faShare} className="text-xl mr-1" />
              <div className="text-xs font-bold leading-none">
                Transfer to
                <br />
                Bank
              </div>
            </div>
          </button>
          <button className="mt-4 w-[180px] h-[48px] text-white bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-full" onClick={onClickSIWC}>
            Link Your Coinbase Account
          </button>
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
            {/*---CONFIRM STATE---*/}
            {cashOutModalState === "initial" && (
              <div className="flex flex-col items-center">
                {/*--- top msg---*/}
                <div className="h-full flex flex-col items-center">
                  <div className="text-2xl lg:text-xl font-bold leading-snug text-center">Transfer all stablecoins from MetaMask to {cashoutSettingsState.cex}?</div>
                  <div className="mt-6 text-lg leading-snug ">
                    After you click confirm, MetaMask will attempt to make <span className="font-bold">{transactionCount}</span> transfers on{" "}
                    <span className="font-bold">{networkCount}</span> networks. Please be patient and click through all the steps (~
                    <span className="font-bold">{transactionCount + networkCount}</span> clicks).
                  </div>
                </div>
                {/*---confirm and cancel button---*/}
                <button
                  onClick={onClickCashOutConfirm}
                  className="mt-8 w-full h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-lg font-bold"
                >
                  CONFIRM
                </button>
                <button
                  className="mt-4 lg:mt-2 w-full h-[56px] lg:h-[44px] text-lg font-bold rounded-[4px] border border-red-400 text-red-400 lg:hover:text-red-500 lg:hover:border-red-500 active:text-red-300"
                  onClick={() => setCashOutModal(false)}
                >
                  CANCEL
                </button>
              </div>
            )}
            {/*---SENDING STATE---*/}
            {cashOutModalState === "sending" && (
              <div className="h-full flex flex-col items-center">
                <div className="text-2xl lg:text-xl font-bold text-center mb-12">{cashOutModalTitle}</div>
                <SpinningCircleGray />
                <div className="mt-4 text-xl text-center">{cashOutModalMsg}</div>
              </div>
            )}
            {/*---SENT STATE---*/}
            {cashOutModalState === "sent" && (
              <div className="h-full flex flex-col items-center justify-around">
                {cashoutSettingsState.cexApiKey ? <div className="text-2xl font-bold text-center">Cash Out Completed</div> : null}
                {cashoutSettingsState.cexApiSecret ? (
                  <div className="text-lg">You should receive the money in your bank after 24-48 hours, depending on the cryptocurrency exchange.</div>
                ) : (
                  <div className="text-lg leading-snug">
                    <p>Stablecoins have been transferred to {cashoutSettingsState.cex}.</p>
                    <p className="mt-4">
                      Because you didn't provide an API Key in the <span className="font-bold">Automation Package Settings</span>, you will have to manually finish the cash out
                      process. For instructions, go to Settings &gt; Instructions &gt; 3. Cash out &gt; Manually Cash Out.
                    </p>
                  </div>
                )}
                <button
                  className="w-full h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 text-white rounded-[4px] text-lg font-bold"
                  onClick={() => {
                    setCashOutModal(false);
                    // window.reload();
                  }}
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
