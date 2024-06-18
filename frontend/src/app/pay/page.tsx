"use client";
// next
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
// other
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import axios from "axios";
import Lottie from "lottie-react";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import circleCheck from "@/utils/lotties/circleCheck.json";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
// components
import Inperson from "./_components/Inperson";
import ErrorModal from "../app/_components/modals/ErrorModal";
// constants
import { currency2decimal, currency2rateDecimal, currency2symbol } from "@/utils/constants";
import { tokenAddresses, chainIds, addChainParams } from "@/utils/web3Constants";
import erc20ABI from "@/utils/abis/ERC20ABI.json";
import { getLocalDateWords, getLocalTime, getLocalDate } from "../app/_components/Payments";
// types
import { Rates } from "@/utils/types";

const Pay = () => {
  console.log("/pay rendered once");
  // extract data from URL
  const searchParams = useSearchParams();
  const paymentType = searchParams.get("paymentType");
  const merchantName = searchParams.get("merchantName"); // decodeURIComponent(merchantIdArray[0]);
  const merchantCurrency = searchParams.get("merchantCurrency"); // decodeURIComponent(merchantIdArray[0]);
  const merchantEvmAddress = searchParams.get("merchantEvmAddress"); // decodeURIComponent(merchantIdArray[0]);
  const urlParams = { paymentType: paymentType, merchantName: merchantName, merchantCurrency: merchantCurrency, merchantEvmAddress: merchantEvmAddress };

  //inperson states
  const [date, setDate] = useState<any>(new Date());
  const [currencyAmount, setCurrencyAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("Polygon");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [rates, setRates] = useState<Rates>({ usdcToLocal: 0, usdToLocal: 0 });
  const [tokenAmount, setTokenAmount] = useState("0");
  const [fxSavings, setFxSavings] = useState("0.0"); // string with 1 decimal
  // modals and other states
  const [isSending, setIsSending] = useState("initial"); // initial | sending | complete
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // pay form states
  const [USDCBalance, setUSDCBalance] = useState("");
  const [isGettingBalance, setIsGettingBalance] = useState(true);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [gasFees, setGasFees] = useState([]);

  useEffect(() => {
    (async () => {
      const ethereum = await detectEthereumProvider();
      // new code for single newtork
      const selectedNetworkTemp = "Polygon";
      try {
        // @ts-ignore
        await ethereum?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIds[selectedNetworkTemp] }],
        });

        // get balance
        try {
          await getBalance(selectedNetworkTemp);
        } catch (error) {
          console.log("error getting balance", error);
        }
      } catch (error: any) {
        if (error.message === "User rejected the request.") {
          console.log("user rejected chain switch request", error);
        } else {
          try {
            // @ts-ignore
            await ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [addChainParams[selectedNetworkTemp]],
            });
            // user's MetaMask already set to selected network
            setSelectedNetwork(selectedNetworkTemp);
            setShowToken(true);
            // get balance
            try {
              await getBalance(selectedNetworkTemp);
            } catch (error) {
              console.log("error getting balance", error);
            }
          } catch (error) {
            console.log("User rejected add chain or MetaMask not installed", error);
          }
        }
      }
      // code for multiple networks
      // const ethereum = await detectEthereumProvider();
      // if (selectedNetwork) {
      //   ethereum?.on("accountsChanged", () => {
      //     getBalance(selectedNetwork);
      //   });
      // }
    })();

    // get rates
    const getRates = async () => {
      const ratesRes = await fetch("/api/getRates", {
        method: "POST",
        body: JSON.stringify({ merchantCurrency: urlParams.merchantCurrency }),
        headers: { "content-type": "application/json" },
      });
      const ratesData = await ratesRes.json();
      console.log("ratesData", ratesData);
      if (ratesData.status == "success") {
        setRates({
          usdcToLocal: Number((ratesData.usdcToLocal * 0.997).toFixed(currency2rateDecimal[urlParams?.merchantCurrency!])),
          usdToLocal: Number((ratesData.usdToLocal * 0.997).toFixed(currency2rateDecimal[urlParams?.merchantCurrency!])),
        });
        setFxSavings((((ratesData.usdcToLocal * 0.997) / ratesData.usdToLocal - 1) * 100).toFixed(1));
      }
    };
    getRates();
  }, []);

  const merchantNetworks = [
    { img: "/polygon.svg", name: "Polygon", gas: 0.01 },
    { img: "/op.svg", name: "Optimism", gas: 0.01 },
    { img: "/arb.svg", name: "Arbitrum", gas: 0.01 },
    { img: "/bsc.svg", name: "BNB", gas: 0.05 },
    { img: "/avax.svg", name: "Avalanche", gas: 0.03 },
  ];
  // const merchantTokens = [{ img: "/usdc.svg", name: "USDC", balance: USDCBalance }];

  //makes it so getPrices runs once
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
  }

  const getBalance = async (network: string) => {
    setIsGettingBalance(true);
    // @ts-ignore
    const provider = new ethers.BrowserProvider(ethereum);
    // @ts-ignore
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    // get token balances
    const usdcContract = new ethers.Contract(tokenAddresses[network]["USDC"]["address"], erc20ABI, provider);
    let usdcTemp = await usdcContract.balanceOf(accounts[0]);
    usdcTemp = Number(ethers.formatUnits(usdcTemp, tokenAddresses[network]["USDC"]["decimals"]));
    setUSDCBalance(usdcTemp.toFixed(2));
    setIsGettingBalance(false);
  };

  const onClickNetwork = async (e: any) => {
    // const ethereum = await detectEthereumProvider();
    console.log(e.currentTarget.id);
    const selectedNetworkTemp = e.currentTarget.id;

    try {
      // @ts-ignore
      await ethereum?.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIds[selectedNetworkTemp] }],
      });
      // user's MetaMask already set to selected network
      setSelectedNetwork(selectedNetworkTemp);
      setShowToken(true);
      // get balance
      try {
        await getBalance(selectedNetworkTemp);
      } catch (error) {
        console.log("error getting balance", error);
      }
    } catch (error: any) {
      if (error.message === "User rejected the request.") {
        console.log("user rejected chain switch request", error);
      } else {
        try {
          // @ts-ignore
          await ethereum?.request({
            method: "wallet_addEthereumChain",
            params: [addChainParams[selectedNetworkTemp]],
          });
          // user's MetaMask already set to selected network
          setSelectedNetwork(selectedNetworkTemp);
          setShowToken(true);
          // get balance
          try {
            await getBalance(selectedNetworkTemp);
          } catch (error) {
            console.log("error getting balance", error);
          }
        } catch (error) {
          console.log("User rejected add chain or MetaMask not installed", error);
        }
      }
    }
  };

  const send = async () => {
    setIsSending("sending");

    if (isNaN(Number(currencyAmount)) || Number(currencyAmount) <= 0) {
      setIsSending("initial");
      setErrorModal(true);
      setErrorMsg("Please enter a valid payment amount");
      return;
    }

    const dateTemp = new Date();
    setDate(dateTemp);

    // define txn object, except "customerAddress" and "txnHash"
    let txn = {
      date: dateTemp,
      merchantEvmAddress: urlParams.merchantEvmAddress,
      currencyAmount: Number(currencyAmount),
      currencyAmountAfterCashBack: Number((Number(currencyAmount) * 0.98).toFixed(currency2decimal[urlParams.merchantCurrency!])),
      merchantCurrency: urlParams.merchantCurrency,
      customerAddress: "", // will get later
      tokenAmount: Number(tokenAmount),
      token: selectedToken,
      network: selectedNetwork,
      blockRate: rates.usdcToLocal,
      cashRate: rates.usdToLocal,
      savings: fxSavings,
      refund: false,
      toRefund: false,
      refundNote: "",
      txnHash: "", // will get later
    };

    // @ts-ignore
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    txn.customerAddress = await signer.getAddress();
    let contract = new ethers.Contract(tokenAddresses[selectedNetwork][selectedToken]["address"], erc20ABI, signer);
    try {
      const txResponse = await contract.transfer(merchantEvmAddress, ethers.parseUnits(tokenAmount, tokenAddresses[selectedNetwork][selectedToken]["decimals"]));
      const txReceipt = await txResponse.wait();
      txn.txnHash = txReceipt.hash;
    } catch (err: any) {
      setIsSending("initial");
      setErrorModal(true);
      if (err.reason == "ERC20: transfer amount exceeds balance") {
        setErrorMsg("Payment amount exceeds your wallet balance");
      } else if (err.info.error.code == 4001) {
        setErrorMsg("Transaction rejected");
      } else {
        setErrorMsg("unknown error");
      }
      console.log("Error:", err);

      return;
    }

    // call payInperson API, which saves txn to db and pushes notification
    try {
      const res = await fetch("/api/payInperson", {
        method: "POST",
        body: JSON.stringify({ txn: txn }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      console.log("payInperson API response:", data);
      if (data == "success") {
        console.log("saved and pushed");
        setIsSending("complete"); // show "Payment Complete" page on customer side
      } else if (data == "not verified") {
        setIsSending("initial");
        setErrorModal(true);
        setErrorMsg("A transaction was sent. But, the payment could not be verified.");
      } else if (data == "not saved") {
        setIsSending("complete");
        setErrorModal(true);
        setErrorMsg("Payment was successful. But, the payment was not saved to the database.");
      } else if (data == "not pushed") {
        setIsSending("complete");
        setErrorModal(true);
        setErrorMsg("Payment was successful. But, the payment did not trigger a notification to the merchant.");
        setIsSending("complete"); // show "Payment Complete" page on customer side ONLY if txn saved to db
      }
    } catch (err) {
      setIsSending("initial");
      setErrorModal(true);
      setErrorMsg("A payment was made. But, the payment data could not be verified.");
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-white dark:bg-white text-black dark:text-black">
      {/*--- dynamic content ---*/}
      {isSending == "initial" && (
        <div className="w-full h-full flex flex-col items-center">
          {/*--- WALLET ---*/}
          <div className="px-4 h-[90px] w-full flex items-center justify-center border-b border-slate-400 bg-slate-300">
            {USDCBalance ? (
              <div className="w-full flex flex-col">
                {/*--- 1st row ---*/}
                <div className="w-full flex items-center justify-between">
                  {/*--- icon + wallet ---*/}
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faWallet} className="text-slate-500 text-2xl mr-2" />
                    <div className="text-2xl font-medium">Wallet</div>
                  </div>
                  {/*--- usdc balance ---*/}
                  <div className="flex items-center text-2xl font-medium">
                    <div className="relative w-[22px] h-[22px] mr-0.5">
                      <Image src="/usdc.svg" alt="usdc" fill />
                    </div>
                    <div className="mr-2">USDC</div>
                    <div>{USDCBalance}</div>
                  </div>
                </div>
                {/*--- 2nd row, fiat balance ---*/}
                <div className="flex flex-col">
                  <div className="text-end text-xl leading-none">
                    &#40;{currency2symbol[urlParams.merchantCurrency!]}
                    {(Number(USDCBalance) * rates.usdcToLocal).toFixed(currency2decimal[urlParams.merchantCurrency!])}&#41;
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xl">Connecting...</div>
            )}
          </div>
          {USDCBalance && Number(USDCBalance) >= 0.01 && (
            <Inperson
              urlParams={urlParams}
              currencyAmount={currencyAmount}
              setCurrencyAmount={setCurrencyAmount}
              showNetwork={showNetwork}
              setShowNetwork={setShowNetwork}
              merchantNetworks={merchantNetworks}
              selectedNetwork={selectedNetwork}
              selectedToken={selectedToken}
              onClickNetwork={onClickNetwork}
              rates={rates}
              isGettingBalance={isGettingBalance}
              USDCBalance={USDCBalance}
              send={send}
              fxSavings={fxSavings}
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
            />
          )}
          {USDCBalance && Number(USDCBalance) < 0.01 && (
            <div className="mt-6 w-full h-full flex flex-col items-center text-2xl leading-relaxed space-y-4">
              <p>You need native USDC on the Polygon network for payment.</p>
              <p>A common way to achieve this is to get USDC from a cryptocurrency exchange (e.g., Coinbase), and then send it to your Metamask (using the Polygon network).</p>
            </div>
          )}
        </div>
      )}

      {isSending == "sending" && (
        <div className="h-full flex flex-col justify-center items-center">
          <div className="w-full h-[50px] animate-spin">
            <Image src="/loadingCircleBlack.svg" alt="loading" fill />
          </div>
          <div className="mt-4 text-xl font-medium">Sending transaction...</div>
          <div className="mt-2 mb-20 text-xl font-medium">Please don't close this window</div>
        </div>
      )}

      {isSending == "complete" && (
        <div className="w-full h-full max-h-[500px] flex flex-col items-center justify-between">
          <div></div>
          {/*---payment completed! ---*/}
          <div className="w-full flex flex-col items-center relative">
            <Lottie animationData={circleCheck} loop={true} className="w-[70px] h-[70px]" />
            <div className="mt-3 text-3xl font-medium">Payment Completed!</div>
          </div>
          {/*---details---*/}
          <div className="w-[340px] flex flex-col items-center text-xl space-y-4">
            <div className="w-full">
              <span className="font-semibold">Time</span>: {getLocalDateWords(date.toString())} | {getLocalTime(date.toString()).time} {getLocalTime(date.toString()).ampm}
            </div>
            <div className="w-full">
              <span className="font-semibold">To</span>: {urlParams.merchantName}
            </div>
            <div className="w-full">
              <span className="font-semibold">Payment Amount:</span>: {currency2symbol[urlParams.merchantCurrency!]}
              {currencyAmount}
            </div>
            <div className="w-full">
              <span className="font-semibold">USDC Sent</span>: {tokenAmount}
            </div>
            <div className="w-full">
              <span className="font-semibold">Total Savings</span>: {2 + Number(fxSavings)}%
            </div>
          </div>

          {/*---close---*/}
          <div
            onClick={() => {
              location.reload();
            }}
            className="w-full text-xl font-semibold link text-end"
          >
            Make another payment &#129122;
          </div>
        </div>
      )}

      {/*---error modal---*/}
      {errorModal && (
        <div>
          <div className="modal dark:bg-white dark:text-black">
            {/*---content---*/}
            <div className="modalContent">{errorMsg}</div>
            {/*---button---*/}
            <div className="modalButtonContainer">
              <button onClick={() => setErrorModal(false)} className="buttonSecondary">
                Dismiss
              </button>
            </div>
          </div>
          <div className="modalBlackout" onClick={() => setErrorModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Pay;
