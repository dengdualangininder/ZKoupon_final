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
import Online from "./_components/Online";
// constants
import { currency2decimal, currency2rateDecimal, currency2symbol } from "@/utils/constants";
import { tokenAddresses, chainIds, addChainParams } from "@/utils/web3Constants";
import erc20ABI from "@/utils/abis/ERC20ABI.json";
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
  const [currencyAmount, setCurrencyAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("Polygon");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [rates, setRates] = useState<Rates>({ usdcToLocal: 0, usdToLocal: 0 });
  const [tokenAmount, setTokenAmount] = useState("0");
  const [fxSavings, setFxSavings] = useState("0.0"); // string with 1 decimal
  // modals and other states
  const [payModal, setPayModal] = useState(false);
  const [payModalMsg, setPayModalMsg] = useState("Please confirm transaction on MetaMask...");
  const [isSendingComplete, setIsSendingComplete] = useState(false);
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
    setPayModal(true);
    setPayModalMsg("Please confirm transaction on MetaMask...");

    if (isNaN(Number(currencyAmount)) || Number(currencyAmount) <= 0) {
      setPayModal(false);
      setErrorModal(true);
      setErrorMsg("Please enter a valid payment amount");
      return;
    }

    // define txn object, except "customerAddress" and "txnHash"
    let txn = {
      date: new Date(),
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
      archive: false,
      txnHash: "", // will get later
    };

    // @ts-ignore
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    txn.customerAddress = await signer.getAddress();
    let contract = new ethers.Contract(tokenAddresses[selectedNetwork][selectedToken]["address"], erc20ABI, signer);
    try {
      const txResponse = await contract.transfer(merchantEvmAddress, ethers.parseUnits(tokenAmount, tokenAddresses[selectedNetwork][selectedToken]["decimals"]));
      setPayModalMsg("Sending transaction...");
      const txReceipt = await txResponse.wait();
      setPayModalMsg("Notifying the business...");
      txn.txnHash = txReceipt.hash;
    } catch (err: any) {
      console.log(err);
      setPayModal(false);
      setErrorModal(true);
      if (err.reason === "execution reverted: ERC20: transfer amount exceeds balance") {
        setErrorMsg("Payment amount exceeds your wallet balance");
      } else if (err.info.error.code == 4001) {
        setErrorMsg("Transaction rejected");
      } else {
        setErrorMsg("unknown error");
      }
      return;
    }

    // call payInperson API, which saves db and pushes notification
    try {
      const res = await fetch("/api/payInperson", {
        method: "POST",
        body: JSON.stringify({ txn: txn }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      if (data == "success") {
        console.log("saved and pushed");
        setIsSendingComplete(true); // show "Payment Complete" page on customer side
      } else if (data == "not verified") {
        setPayModal(false);
        setErrorModal(true);
        setErrorMsg("A transaction was sent. But, the payment could not be verified.");
      } else if (data == "not saved") {
        setPayModal(false);
        setErrorModal(true);
        setErrorMsg("Payment was successful. But, the payment data was not saved to the database.");
      } else if (data == "not pushed") {
        setPayModal(false);
        setErrorModal(true);
        setErrorMsg("Payment was successful. But, the payment did not trigger a notification to the merchant.");
        setIsSendingComplete(true); // show "Payment Complete" page on customer side ONLY if txn saved to db
      }
    } catch (err) {
      setPayModal(false);
      setErrorModal(true);
      setErrorMsg("Payment was successful. But, the payment data could not be sent to the server.");
    }
  };

  const clickDown = () => {
    document.getElementById("modalbg")?.classList.remove("bg-white");
    document.getElementById("modalbg")?.classList.add("bg-green-400");
  };
  const clickUp = () => {
    document.getElementById("modalbg")?.classList.remove("bg-green-400");
    document.getElementById("modalbg")?.classList.add("bg-white");
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center">
      {/*--- banner ---*/}
      {/* <div className="w-full h-[6%] flex items-center justify-center border-b-2 border-gray-300">
        <a href={`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}`} target="_blank" className="flex items-center">
          <div className="relative h-[36px] w-[80px] mr-2">
            <Image src="/logo.svg" alt="logo" fill />
          </div>
        </a>
        <div className="text-sm leading-tight font-medium">giving you better FX rates than any bank</div>
      </div> */}
      {/*--- content below banner ---*/}
      <div className="w-[340px] h-full flex flex-col">
        {/*--- your balance ---*/}
        <div className={`${USDCBalance ? "" : "animate-pulse"} mt-6 h-[80px] w-full flex items-center justify-center text-lg bg-gray-200 rounded-xl`}>
          {USDCBalance ? (
            <div className="px-4 w-full flex justify-between">
              <div className="">
                <FontAwesomeIcon icon={faWallet} className="text-gray-500" /> Wallet
              </div>
              <div className="flex flex-col">
                {/*--- usdc balance ---*/}
                <div className="flex items-center relative">
                  <div className="relative mr-[2px] w-[22px] h-[22px]">
                    <Image src="/usdc.svg" alt="usdc" fill />
                  </div>
                  <div>USDC {USDCBalance}</div>
                </div>
                {/*--- local currency balance ---*/}
                <div className="text-end">
                  &#40;{currency2symbol[urlParams.merchantCurrency!]}
                  {(Number(USDCBalance) * rates.usdcToLocal).toFixed(currency2decimal[urlParams.merchantCurrency!])}&#41;
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">Connecting...</div>
          )}
        </div>
        {USDCBalance && (
          <div className="h-[calc(100%-90px)]">
            {Number(USDCBalance) > 0.01 ? (
              <div className="h-full">
                {paymentType == "inperson" && (
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
                {paymentType == "online" && (
                  <Online
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
              </div>
            ) : (
              <div className="mt-6 w-full h-full flex flex-col items-center text-2xl leading-relaxed space-y-4">
                <p>You need USDC (on the Polygon network) in your MetaMask for payment.</p>
                <p>A common way to get USDC into your MetaMask is to send USDC from a cryptocurrency exchange (e.g., Coinbase) to your Metamask via the Polygon network.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/*---error modal---*/}
      {errorModal && (
        <div className="">
          <div className="modal">
            {/*---content---*/}
            <div className="grow flex flex-col justify-center space-y-8">
              <div className="text-3xl text-center text-gray-400 font-bold">Error</div>
              <div className="text-center">{errorMsg}</div>
            </div>
            {/*---close button---*/}
            <button onClick={() => setErrorModal(false)} className="modalButtonWhite">
              DISMISS
            </button>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}

      {/*---pay modal---*/}
      {payModal && (
        <div className="">
          <div
            id="modalbg"
            className="py-10 w-[330px] h-[450px] bg-white rounded-3xl border-2 border-gray-500 fixed inset-1/2 -translate-y-1/2 -translate-x-1/2 z-[10]"
            onPointerDown={clickDown}
            onPointerUp={clickUp}
          >
            {isSendingComplete ? (
              <div className="w-full h-full flex flex-col items-center justify-between text-gray-700">
                {/*---store name---*/}
                <div className="w-full flex flex-col items-center relative">
                  <div className="text-xl text-gray-400 font-medium">PAYMENT COMPLETED</div>
                  <Lottie animationData={circleCheck} loop={true} className="absolute left-[calc(50%-60px)] top-[6px] w-[120px] h-[120px]" />
                </div>
                {/*---amount and time---*/}
                <div className="mt-10 flex flex-col items-center">
                  <div className="text-6xl flex items-center">
                    {merchantCurrency === "USD" ? "$" : ""}
                    {currencyAmount}
                    <span className="ml-2 pt-2 text-2xl">{merchantCurrency === "USD" ? "" : merchantCurrency}</span>
                  </div>
                  <div className="mt-4 text-4xl">{new Date().toLocaleString([], { timeStyle: "short" })}</div>
                </div>
                {/*---close---*/}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    setPayModal(false);
                    setIsSendingComplete(false);
                    location.reload(); // TODO: leaving a txn receipt on page isntead of resetting
                  }}
                  className="flex justify-center items-center py-3 mb-6 text-xl rounded-full w-[200px] bg-white text-gray-500 border border-gray-200 active:bg-gray-200 font-medium tracking-wide drop-shadow-lg"
                >
                  CLOSE
                </div>
              </div>
            ) : (
              <div className="w-full h-full px-6 flex flex-col justify-center items-center">
                <SpinningCircleGray />
                <div className="mt-4 text-center text-xl leading-relaxed">{payModalMsg}</div>
              </div>
            )}
          </div>
          <div className="opacity-70 fixed inset-0 bg-black"></div>
        </div>
      )}
    </div>
  );
};

export default Pay;
