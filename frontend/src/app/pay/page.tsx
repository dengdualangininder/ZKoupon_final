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
// constants
import { tokenAddresses, chainIds, addChainParams } from "@/utils/web3Constants";
import erc20ABI from "@/utils/abis/ERC20ABI.json";

type U2local = {
  [key: string]: number;
};

const InpersonPay = () => {
  console.log("/pay rendered once");
  // extract data from URL
  const searchParams = useSearchParams();
  const merchantName = searchParams.get("merchantName"); // decodeURIComponent(merchantIdArray[0]);
  const merchantCurrency = searchParams.get("merchantCurrency"); // decodeURIComponent(merchantIdArray[0]);
  const merchantEvmAddress = searchParams.get("merchantEvmAddress"); // decodeURIComponent(merchantIdArray[0]);

  //onsite states
  const [currencyAmount, setCurrencyAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [u2local, setu2local] = useState<U2local>({
    USD: 31.96,
    USDC: 32.13,
    USDT: 32.09,
  });
  // modals and other states
  const [payModal, setPayModal] = useState(false);
  const [msg, setMsg] = useState("Please confirm transaction on MetaMask...");
  const [isSendingComplete, setIsSendingComplete] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // pay form states
  const [USDCBalance, setUSDCBalance] = useState("0");
  const [USDTBalance, setUSDTBalance] = useState("0");
  const [isGettingBalance, setIsGettingBalance] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [gasFees, setGasFees] = useState([]);

  useEffect(() => {
    (async () => {
      let ethereum = await detectEthereumProvider();
      ethereum?.on("accountsChanged", () => {
        getBalance(selectedNetwork);
      });
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
  // const initialized = useRef(false);
  // if (!initialized.current) {
  //   initialized.current = true;
  //   const getPrices = async () => {
  //     let USDres = await axios.get(
  //       `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usd!B4:AE4?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
  //     );
  //     let USDTres = await axios.get(
  //       `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usdt!B4:AE4?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
  //     );
  //     let USDCres = await axios.get(
  //       `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usdc!B4:AE4?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
  //     );
  //     let sheetCountryOrder = "twd, jpy, krw, hkd, sgd, php, thb, idr, myr, vnd, eur, gbp, cad, aud, usd".split(", ").map((i) => i.toUpperCase());
  //     let sheetIndex = sheetCountryOrder.findIndex((i) => i == merchantCurrency);
  //     setu2local({
  //       USD: Number(USDres.data.values[0][sheetIndex * 2]).toPrecision(4),
  //       USDC: Number(USDCres.data.values[0][sheetIndex * 2]).toPrecision(4),
  //       USDT: Number(USDTres.data.values[0][sheetIndex * 2]).toPrecision(4),
  //       EURC: 1,
  //       EURT: 1,
  //     });
  //   };
  //   getPrices();
  // }

  const getBalance = async (network: string) => {
    setIsGettingBalance(true);
    // @ts-ignore
    let provider = new ethers.BrowserProvider(ethereum);
    // @ts-ignore
    let accounts = await ethereum.request({ method: "eth_requestAccounts" });
    // get token balances
    let usdcContract = new ethers.Contract(tokenAddresses[network]["USDC"]["address"], erc20ABI, provider);
    let usdtContract = new ethers.Contract(tokenAddresses[network]["USDT"]["address"], erc20ABI, provider);
    let usdcTemp = await usdcContract.balanceOf(accounts[0]);
    let usdtTemp = await usdtContract.balanceOf(accounts[0]);
    usdcTemp = Number(ethers.formatUnits(usdcTemp, tokenAddresses[network]["USDC"]["decimals"]));
    usdtTemp = Number(ethers.formatUnits(usdtTemp, tokenAddresses[network]["USDT"]["decimals"]));
    setUSDCBalance(usdcTemp.toFixed(2));
    setUSDTBalance(usdtTemp.toFixed(2));

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

    // define txn object
    let txn = {
      date: new Date(),
      merchantEvmAddress: merchantEvmAddress,
      currencyAmount: Number(currencyAmount),
      merchantCurrency: merchantCurrency,
      customerAddress: "",
      tokenAmount: Number(((Number(currencyAmount) * 0.98) / u2local[selectedToken]).toFixed(2)),
      token: selectedToken,
      network: selectedNetwork,
      blockRate: Number(u2local[selectedToken]),
      cashRate: Number(u2local["USD"]),
      savings: `${((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%`,
      refund: false,
      archive: false,
      txnHash: "",
    };

    // initiate Web3 APIs and send txn
    // @ts-ignore
    let provider = new ethers.BrowserProvider(ethereum); // is ethereum = await detectEthereumProvider() better?
    let signer = await provider.getSigner();
    let customerAddress = await signer.getAddress();
    console.log("customerAddress", customerAddress);
    txn.customerAddress = customerAddress;
    let tokenAddress = tokenAddresses[selectedNetwork][selectedToken]["address"];
    console.log("tokenAddress", tokenAddress);
    let contract = new ethers.Contract(tokenAddress, erc20ABI, signer);

    setMsg("Sending transaction...");

    try {
      const txResponse = await contract.transfer(
        merchantEvmAddress,
        ethers.parseUnits(((Number(currencyAmount) * 0.98) / u2local[selectedToken]).toFixed(2), tokenAddresses[selectedNetwork][selectedToken]["decimals"])
      );
      console.log("tx sent");
      const txReceipt = await txResponse.wait();
      txn.txnHash = txReceipt.transactionHash;
    } catch (err: any) {
      console.log(err);
      setPayModal(false);
      setErrorModal(true);
      if (err.reason === "execution reverted: ERC20: transfer amount exceeds balance") {
        setErrorMsg("Payment amount exceeds your wallet balance");
      } else if (err.message === "User rejected the transaction") {
        setErrorMsg("User rejected the transaction");
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
          setErrorMsg("Payment was completed. But, the API responded with an error.");
        }
      };
      await sendToDb();
    } catch (err) {
      setPayModal(false);
      setErrorModal(true);
      setErrorMsg("Payment was completed. But, the POST request to the server failed.");
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
    // <div className="absolute inset-0 overflow-y-auto">
    <div className="h-screen">
      <div className="h-full">
        {/*---banner, h-[24px]---*/}
        <div className="w-full h-[24px] flex justify-center border-b border-slate-400">
          <div className="mx-1 xs:mx-0 flex items-center w-[358px] sm:w-[500px]">
            {/*---logo---*/}
            <a href={`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}`} target="_blank">
              <div className="relative h-[24px] w-[64px]">
                <Image src="/logo.svg" alt="logo" fill />
              </div>
            </a>
            {/*---text---*/}
            <div className="ml-3 text-[10px] font-bold leading-none text-slate-500">true P2P payments, so you get the best token-to-fiat rates</div>
            {/*---about us---*/}
            <div className="hidden xs:block text-xs font-bold leading-none text-blue-500 link cursor-pointer">
              <a href={`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}`} target="_blank">
                About Us
              </a>
            </div>
          </div>
        </div>
        {/*---payment container---*/}
        <div className="pt-4 pb-8 flex flex-col items-center h-[calc(100%-24px)] justify-evenly">
          {/*---Pay To---*/}
          <div className="flex flex-col items-center">
            <div className="text-sm font-bold">Pay To</div>
            <div className="mt-2 text-xl font-bold line-clamp-1">{merchantName}</div>
          </div>

          {/*---payment amount + networks + tokens---*/}
          <div className="w-[300px]">
            {/*---payment amount---*/}
            <div className="flex justify-center">
              <div
                id="onsiteCurrencyAmountBox"
                className="h-[58px] w-full flex items-center border-[2px] rounded-md relative border-blue-500 transition-[border-color] duration-[400ms]"
              >
                <label className="w-[70px] text-xl text-center font-bold">{merchantCurrency}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  onChange={(e) => {
                    setCurrencyAmount(e.currentTarget.value);
                    setShowNetwork(true);
                  }}
                  onBlur={() => {
                    document.getElementById("onsiteCurrencyAmountBox")?.classList.add("bg-blue-100");
                  }}
                  onFocus={() => {
                    document.getElementById("onsiteCurrencyAmountBox")?.classList.remove("bg-blue-100");
                  }}
                  className="h-full w-[160px] text-center font-bold text-2xl outline-none placeholder:text-xl bg-transparent focus:placeholder:invisible placeholder:font-medium"
                  placeholder="Enter Amount"
                ></input>
              </div>
            </div>

            {/*---select network---*/}
            <div className={`${showNetwork ? "" : "invisible"} mt-1 flex w-full justify-center items-center`}>
              <div className="flex justify-center space-x-[2px]">
                {merchantNetworks.map((i: any) => (
                  <div key={i.name} className={` flex flex-col items-center`}>
                    <div
                      id={i.name}
                      data-category="network"
                      onClick={onClickNetwork}
                      className={`${
                        selectedNetwork == i.name ? "opacity-100 bg-blue-100 border-blue-500" : "border-gray-300 opacity-100"
                      } h-[58px] w-[58px] flex flex-col justify-center items-center pt-1 pb-0.5 text-[10px] text-center border-2 rounded-lg cursor-pointer`}
                    >
                      <div className="relative w-[22px] h-[22px]">
                        <Image src={i.img} alt={i.name} fill />
                      </div>
                      <div className="leading-tight pointer-events-none">{i.name}</div>
                      <div className="leading-tight pointer-events-none">{i.gas}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/*---select token---*/}
            <div className={`${showToken ? "" : "invisible"} mt-1 flex justify-center`}>
              <div className="flex flex-col w-[300px] space-y-1 sm:space-y-1">
                {merchantTokens.map((i) => (
                  <div
                    id={i.name}
                    key={i.name}
                    data-category="token"
                    onClick={(e) => setSelectedToken(e.currentTarget.id)}
                    className={`${
                      selectedToken == i.name ? "opacity-100 bg-blue-100 border-blue-500" : "opacity-100 border-gray-300"
                    } w-full flex justify-between items-center px-2 text-base font-bold border-2 rounded-lg cursor-pointer`}
                  >
                    <div className="h-[58px] flex items-center pointer-events-none">
                      <div className="relative w-[28px] h-[28px]">
                        <Image src={i.img} alt={i.name} fill />
                      </div>
                      <span className="ml-2 text-xl">{i.name}</span>
                    </div>
                    <div className="pointer-events-none text-xl">{isGettingBalance ? <SpinningCircleGray /> : i.balance}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*---AMOUNT SENT + FXRATES---*/}
          <div className={`${selectedToken ? "" : "invisible"} flex flex-col items-center w-[352px]`}>
            {/*---amount sent---*/}
            <div className="flex text-2xl leading-none font-bold text-center">
              {((Number(currencyAmount) * 0.98) / u2local[selectedToken]).toFixed(2)} {selectedToken} will be sent
            </div>
            {/*---fx rates---*/}
            {merchantCurrency === "USD" || selectedToken === "EURC" || selectedToken === "EURT" ? null : (
              <div className="mt-2 px-1 w-full xs:px-0 flex justify-center text-xs leading-tight tracking-tighter">
                <div className="w-2/5 flex flex-col items-center text-center">
                  <div>CEX Rate</div>
                  <div id="yourRate">
                    1 {selectedToken} &#8652; {u2local[selectedToken]} {merchantCurrency}
                  </div>
                </div>
                <div className="w-2/5 flex flex-col items-center text-center">
                  <div>Bank Rate</div>
                  <div>
                    1 USD &#8652; {u2local.USD} {merchantCurrency}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-2 w-full flex justify-center text-xs leading-tight tracking-tighter">
              <div className="w-1/3 flex flex-col items-center text-center">
                <div>FX Savings</div>
                {Number(u2local[selectedToken]) >= Number(u2local.USD) ? (
                  <div className="font-bold text-green-500">+{((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%</div>
                ) : (
                  <div className="font-bold text-red-500">{((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%</div>
                )}
              </div>
              <div className="w-1/3 flex flex-col items-center text-center">
                <div>Instant Cashback</div>
                <div className="font-bold text-green-500">+2%</div>
              </div>
              <div className="w-1/3 flex flex-col items-center text-center">
                <div>You Save</div>
                <div>
                  {Number(u2local[selectedToken]) >= Number(u2local.USD) ? (
                    <div className="font-bold text-green-500">+{Number(((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)) + 2}%</div>
                  ) : (
                    <div className="font-bold text-red-500">{Number(((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)) + 2}%</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/*---SEND BUTTON---*/}
          <div className={`${selectedToken ? "" : "invisible"} h-[58px] flex justify-center w-full`}>
            <button onClick={send} className="w-[300px] text-white text-xl font-bold bg-blue-500 hover:bg-blue-600 active:bg-blue-300 rounded-full drop-shadow-md">
              SEND
            </button>
          </div>
        </div>
      </div>

      {/*---error modal---*/}
      {errorModal && (
        <div className="">
          <div className="flex py-7 justify-center bg-white w-[270px] h-[270px] rounded-xl border border-slate-500 fixed inset-1/2 translate-y-[-55%] translate-x-[-50%] z-[90]">
            {/*---container---*/}
            <div className="h-full w-full flex flex-col justify-between items-center text-lg leading-tight md:text-base md:leading-snug px-6">
              {/*---Error---*/}
              <div className="text-2xl font-bold text-slate-700 text-center">Error</div>
              {/*---msg---*/}
              <div className="text-center">{errorMsg}</div>
              {/*---close button---*/}
              <button onClick={() => setErrorModal(false)} className="mt-4 w-[160px] h-[56px] bg-blue-500 active:bg-blue-300 rounded-lg text-white text-lg font-bold tracking-wide">
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
            className="py-10 w-[330px] h-[450px] bg-white rounded-xl border-2 border-gray-500 fixed inset-1/2 -translate-y-1/2 -translate-x-1/2 z-[10]"
            onPointerDown={clickDown}
            onPointerUp={clickUp}
          >
            {isSendingComplete ? (
              <div className="w-full h-full flex flex-col items-center justify-between text-gray-700">
                {/*---store name---*/}
                <div className="w-full flex flex-col items-center relative">
                  <div className="text-2xl font-bold text-green-500">PAYMENT COMPLETED</div>
                  <Lottie animationData={circleCheck} loop={true} className="absolute left-[calc(50%-60px)] top-[10px] w-[120px] h-[120px]" />
                </div>
                {/*---amount and time---*/}
                <div className="mt-[50px] flex flex-col items-center">
                  <div className="text-6xl flex items-center">
                    {merchantCurrency === "USD" ? "$" : ""}
                    {currencyAmount}
                    <span className="ml-2 pt-1 text-2xl">{merchantCurrency === "USD" ? "" : merchantCurrency}</span>
                  </div>
                  <div className="mt-7 text-4xl">{new Date().toLocaleString([], { timeStyle: "short" })}</div>
                </div>
                {/*---close---*/}
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    setPayModal(false);
                    setIsSendingComplete(false);
                    location.reload();
                  }}
                  className=" h-[56px] text-xl rounded-[4px] w-[260px] text-white bg-blue-500 active:bg-blue-300 font-bold tracking-wide"
                >
                  CLOSE
                </button>
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

export default InpersonPay;
