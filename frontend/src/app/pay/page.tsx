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
// components
import Inperson from "./_components/Inperson";
import Online from "./_components/Online";
// constants
import { tokenAddresses, chainIds, addChainParams } from "@/utils/web3Constants";
import erc20ABI from "@/utils/abis/ERC20ABI.json";

export type U2local = { [key: string]: number };

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
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [u2local, setu2local] = useState<U2local>({ USD: 31.96, USDC: 32.13 });
  // modals and other states
  const [payModal, setPayModal] = useState(false);
  const [msg, setMsg] = useState("Please confirm transaction on MetaMask...");
  const [isSendingComplete, setIsSendingComplete] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // pay form states
  const [USDCBalance, setUSDCBalance] = useState("0");
  const [isGettingBalance, setIsGettingBalance] = useState(true);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [gasFees, setGasFees] = useState([]);

  useEffect(() => {
    (async () => {
      const ethereum = await detectEthereumProvider();
      if (selectedNetwork) {
        ethereum?.on("accountsChanged", () => {
          getBalance(selectedNetwork);
        });
      }
    })();
  }, [selectedNetwork]);

  const merchantNetworks = [
    { img: "/polygon.svg", name: "Polygon", gas: 0.01 },
    { img: "/op.svg", name: "Optimism", gas: 0.01 },
    { img: "/arb.svg", name: "Arbitrum", gas: 0.01 },
    { img: "/bsc.svg", name: "BNB", gas: 0.05 },
    { img: "/avax.svg", name: "Avalanche", gas: 0.03 },
  ];
  const merchantTokens = [{ img: "/usdc.svg", name: "USDC", balance: USDCBalance }];

  //makes it so getPrices runs once
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    const getPrices = async () => {
      // let USDres = await axios.get(
      //   `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usd!B4:AE4?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
      // );
      // let USDTres = await axios.get(
      //   `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usdt!B4:AE4?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
      // );
      // let USDCres = await axios.get(
      //   `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usdc!B4:AE4?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
      // );
      // let sheetCountryOrder = "twd, jpy, krw, hkd, sgd, php, thb, idr, myr, vnd, eur, gbp, cad, aud, usd".split(", ").map((i) => i.toUpperCase());
      // let sheetIndex = sheetCountryOrder.findIndex((i) => i == merchantCurrency);
      // setu2local({
      //   USD: Number(USDres.data.values[0][sheetIndex * 2]).toPrecision(4),
      //   USDC: Number(USDCres.data.values[0][sheetIndex * 2]).toPrecision(4),
      // });
      const u2localAll: { [key: string]: U2local } = {
        TWD: { USD: 31.96, USDC: 32.13 },
        USD: { USD: 1, USDC: 1 },
        EUR: { USD: 0.931, USDC: 0.932 },
      };
      setu2local(u2localAll[merchantCurrency!]);
    };
    getPrices();
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
    setMsg("Please confirm transaction on MetaMask...");

    // check if currencyAmount is negative
    if (Number(currencyAmount) <= 0) {
      setPayModal(false);
      setErrorModal(true);
      setErrorMsg("Please enter a valid payment amount");
      return;
    }

    const tokenAmount = ((Number(currencyAmount) * 0.98) / u2local[selectedToken]).toFixed(2); // returns string
    const savings = `${((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%`; // returns string

    // define txn object, except "customerAddress" and "txnHash"
    let txn = {
      date: new Date(),
      merchantEvmAddress: merchantEvmAddress,
      currencyAmount: Number(currencyAmount),
      merchantCurrency: merchantCurrency,
      customerAddress: "",
      tokenAmount: Number(tokenAmount),
      token: selectedToken,
      network: selectedNetwork,
      blockRate: Number(u2local[selectedToken]),
      cashRate: Number(u2local["USD"]),
      savings: savings,
      refund: false,
      archive: false,
      txnHash: "",
    };

    // initiate Web3 APIs and send txn
    // @ts-ignore
    let provider = new ethers.BrowserProvider(ethereum); // is ethereum = await detectEthereumProvider() better?
    let signer = await provider.getSigner();
    txn.customerAddress = await signer.getAddress();
    let contract = new ethers.Contract(tokenAddresses[selectedNetwork][selectedToken]["address"], erc20ABI, signer);

    setMsg("Sending transaction...");

    try {
      const txResponse = await contract.transfer(merchantEvmAddress, ethers.parseUnits(tokenAmount, tokenAddresses[selectedNetwork][selectedToken]["decimals"]));
      const txReceipt = await txResponse.wait();
      txn.txnHash = txReceipt.hash;
      console.log("txnHash:", txReceipt.hash);
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

    setMsg("Verifying transaction...");

    try {
      const sendToDb = async () => {
        const res = await fetch("/api/payInperson", {
          method: "POST",
          body: JSON.stringify({ txn: txn, merchantEvmAddress: merchantEvmAddress }),
          headers: { "content-type": "application/json" },
        });
        const data = await res.json();
        if (data == "saved") {
          console.log("transaction saved to db");
          setIsSendingComplete(true);
        } else if (data == "error") {
          setPayModal(false);
          setErrorModal(true);
          setErrorMsg("Payment was successful. But, the payment data was not saved to the database.");
        }
      };
      await sendToDb();
    } catch (err) {
      setPayModal(false);
      setErrorModal(true);
      setErrorMsg("Payment was successful. But,the payment data could not be sent to the database.");
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
    <div className="h-[100dvh]">
      {/*---banner, h-[24px]---*/}
      <div className="w-full h-[28px] flex justify-center items-center border-b border-gray-300 relative">
        <a href={`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}`} target="_blank" className="absolute top-[2px] left-[4px]">
          <div className="relative h-[24px] w-[64px]">
            <Image src="/logo.svg" alt="logo" fill />
          </div>
        </a>
        <div className="text-xs font-bold text-center leading-none text-gray-800">offering you true P2P payments</div>
      </div>

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
          u2local={u2local}
          isGettingBalance={isGettingBalance}
          USDCBalance={USDCBalance}
          send={send}
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
          u2local={u2local}
          send={send}
        />
      )}

      {/*---error modal---*/}
      {errorModal && (
        <div className="">
          <div className="flex py-10 justify-center bg-white w-[290px] h-[330px] rounded-3xl border border-gray-500 fixed inset-1/2 translate-y-[-55%] translate-x-[-50%] z-[90]">
            {/*---container---*/}
            <div className="h-full w-full flex flex-col justify-between items-center text-lg leading-tight md:text-base md:leading-snug px-6">
              {/*---Error---*/}
              <div className="text-2xl font-medium text-gray-500 text-center">Payment Cancelled</div>
              {/*---msg---*/}
              <div className="text-center">{errorMsg}</div>
              {/*---close button---*/}
              <button onClick={() => setErrorModal(false)} className="buttonWhiteTextLg w-[160px]">
                DISMISS
              </button>
            </div>
          </div>
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
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
                    location.reload();
                  }}
                  className="flex justify-center items-center py-3 mb-6 text-xl rounded-full w-[200px] bg-white text-gray-500 border border-gray-200 active:bg-gray-200 font-medium tracking-wide drop-shadow-lg"
                >
                  CLOSE
                </div>
              </div>
            ) : (
              <div className="w-full h-full px-6 flex flex-col justify-center items-center">
                <SpinningCircleGray />
                <div className="mt-4 text-center text-xl">{msg}</div>
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
