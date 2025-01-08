"use client";
// next
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
// other
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import Lottie from "lottie-react";
// components
import ErrorModal from "@/utils/components/ErrorModal";
// images
import circleCheck from "@/utils/lotties/circleCheck.json";
import { IoWallet } from "react-icons/io5";
// components
import Inperson from "./Inperson";
import NoUsdc from "./NoUsdc";
// constants
import { currency2decimal, currency2rateDecimal, currency2symbol, currency2correction } from "@/utils/constants";
import { tokenAddresses, chainIds, addChainParams } from "@/utils/web3Constants";
import erc20ABI from "@/utils/abis/erc20Abi";
import { getLocalDateWords, getLocalTime, getLocalDate } from "@/utils/functions";
// types
import { Rates } from "@/utils/types";

export default function Pay({ rates, fxSavings }: { rates: Rates; fxSavings: string | undefined }) {
  console.log("Pay.tsx");

  // URL data
  const searchParams = useSearchParams();
  const urlParams = {
    paymentType: searchParams.get("paymentType"),
    merchantName: searchParams.get("merchantName"),
    merchantCurrency: searchParams.get("merchantCurrency"),
    merchantEvmAddress: searchParams.get("merchantEvmAddress"),
  };

  // inperson states
  const [date, setDate] = useState<Date | null>(null);
  const [currencyAmount, setCurrencyAmount] = useState("");
  const [currencyAmountAfterCashback, setCurrencyAmountAfterCashback] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("Polygon");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [USDCBalance, setUSDCBalance] = useState("");
  const [tokenAmount, setTokenAmount] = useState("0");
  // modals and other states
  const [isSending, setIsSending] = useState("initial"); // initial | sending | complete
  const [errorModal, setErrorModal] = useState<React.ReactNode>(null);

  useEffect(() => {
    (async () => {
      console.log("pay.tsx, useEffect");
      const ethereum = await detectEthereumProvider();

      // switch to Polygon chain
      try {
        // @ts-ignore
        await ethereum?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIds[selectedNetwork] }],
        });
      } catch (e: any) {
        if (e.message === "User rejected the request") {
          console.log("Please switch to the Polygon chain. Start over by scanning the QR code again.");
          return;
        } else {
          try {
            // @ts-ignore
            await ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [addChainParams[selectedNetwork]],
            });
          } catch (e) {
            console.log("Please accepting adding Polygon chain. Start over by scanning the QR code again.");
            return;
          }
        }
      }

      // get balance
      try {
        await getBalance(selectedNetwork);
      } catch (e) {
        console.log(e);
        setErrorModal("Error in getting your USDC balance. Try scanning the QR code again.");
      }

      // create listener if user selects another account
      ethereum?.on("accountsChanged", () => {
        getBalance(selectedNetwork);
      });
    })();
  }, []);

  useEffect(() => {
    const lockOrientation = async () => {
      if ("screen" in window && window.screen.orientation) {
        const isDeviceEligible = window.matchMedia("(min-width: 600px) and (min-height: 940px)").matches;

        if (isDeviceEligible) {
          try {
            await window.screen.orientation.lock("portrait");
            console.log("Orientation locked to portrait mode");
          } catch (err) {
            console.error("Failed to lock screen orientation:", err);
          }
        } else {
          console.log("Device does not meet the size requirements for orientation lock.");
        }
      } else {
        console.warn("Screen Orientation API is not supported in this browser.");
      }
    };

    lockOrientation();

    return () => {
      // Optional: Unlock the orientation on component unmount
      if ("screen" in window && window.screen.orientation) {
        window.screen.orientation.unlock();
      }
    };
  }, []);

  const getBalance = async (network: string) => {
    // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum); // detectEthereumProvider already used, so window.ethereum should be accessible on mobile
    // @ts-ignore
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const usdcContract = new ethers.Contract(tokenAddresses[network][selectedToken]["address"], erc20ABI, provider);
    let usdcBalanceUnformatted = await usdcContract.balanceOf(accounts[0]);
    setUSDCBalance(ethers.formatUnits(usdcBalanceUnformatted, tokenAddresses[network][selectedToken]["decimals"]));
  };

  const send = async () => {
    setIsSending("sending");

    // validation
    if (Number(currencyAmount) <= 0) {
      setIsSending("initial");
      setErrorModal("Please enter a valid payment amount");
      return;
    }

    // send tx
    // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(tokenAddresses[selectedNetwork][selectedToken]["address"], erc20ABI, signer);
    try {
      const txResponse = await contract.transfer(urlParams.merchantEvmAddress, ethers.parseUnits(tokenAmount, tokenAddresses[selectedNetwork][selectedToken]["decimals"]));
      var txReceipt = await txResponse.wait();
    } catch (err: any) {
      setIsSending("initial");
      if (err.reason == "ERC20: transfer amount exceeds balance") {
        setErrorModal("Payment amount exceeds your wallet balance");
      } else if (err.info.error.code == 4001) {
        console.log("Transaction cancelled by user");
      } else {
        setErrorModal("Error");
      }
      console.log("Error:", err);
      return;
    }

    // save tx to db & push notification
    if (txReceipt) {
      // create txn object
      const dateTemp = new Date();
      setDate(dateTemp);
      const txn = {
        date: dateTemp,
        merchantEvmAddress: urlParams.merchantEvmAddress,
        currencyAmount: Number(currencyAmount),
        currencyAmountAfterCashBack: Number(currencyAmountAfterCashback),
        merchantCurrency: urlParams.merchantCurrency,
        customerAddress: await signer.getAddress(),
        tokenAmount: Number(tokenAmount),
        token: selectedToken,
        network: selectedNetwork,
        blockRate: rates.usdcToLocal,
        cashRate: rates.usdToLocal,
        fxSavings: `${Number(fxSavings)}%`,
        cashback: "2%",
        totalSavings: `${Number(fxSavings) + 2}%`,
        refund: "",
        toRefund: false,
        note: "",
        txnHash: txReceipt.hash,
      };

      try {
        const res = await fetch("/api/payInperson", {
          method: "POST",
          body: JSON.stringify({ txn: txn }),
          headers: { "content-type": "application/json" },
        });
        const resJson = await res.json();
        if (resJson === "success") {
          console.log("saved and pushed");
          setIsSending("complete"); // show "Payment Complete" page on customer side
        } else if (resJson == "not verified") {
          setIsSending("initial");
          setErrorModal("A transaction was sent. But, the payment could not be verified.");
        } else if (resJson == "not saved") {
          setIsSending("complete");
          setErrorModal("Payment was successful. But, the payment was not saved to the database.");
        } else if (resJson == "not pushed") {
          setIsSending("complete");
          setErrorModal("Payment was successful. But, the payment did not trigger a notification to the merchant.");
          setIsSending("complete"); // show "Payment Complete" page on customer side ONLY if txn saved to db
        }
      } catch (err) {
        setIsSending("initial");
        setErrorModal("A payment was made. But, the payment data could not be verified.");
      }
    }
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center bg-white text-black textLgApp">
      {/*--- dynamic content ---*/}
      {isSending == "initial" && (
        <>
          {/*--- WALLET ---*/}
          <div className="px-[16px] w-full h-[72px] flex items-center border-b border-slate-400 bg-slate-300">
            {USDCBalance ? (
              <div className="w-full flex flex-col">
                {/*--- 1st row ---*/}
                <div className="w-full flex items-center justify-between text-[24px] font-medium">
                  {/*--- wallet icon ---*/}
                  <div className="flex items-center">
                    <IoWallet className="text-slate-500 text-[28px] mr-[8px]" />
                    Wallet
                  </div>
                  {/*--- usdc balance ---*/}
                  <div className="flex items-center">
                    <div className="mr-[2px] relative w-[22px] h-[22px]">
                      <Image src="/usdc.svg" alt="USDC" fill />
                    </div>
                    <div className="mr-[16px]">USDC</div>
                    <div>{Number(USDCBalance).toFixed(2)}</div>
                  </div>
                </div>
                {/*--- 2nd row, fiat balance ---*/}
                <div className="text-end text-[18px] leading-none">
                  &#40;{currency2symbol[urlParams.merchantCurrency!]}
                  {(Number(USDCBalance) * rates.usdcToLocal).toFixed(currency2decimal[urlParams.merchantCurrency!])}&#41;
                </div>
              </div>
            ) : (
              <p className="w-full text-center text-[20px]">Connecting...</p>
            )}
          </div>
          {USDCBalance && Number(USDCBalance) >= 0.01 && (
            <Inperson
              urlParams={urlParams}
              currencyAmount={currencyAmount}
              setCurrencyAmount={setCurrencyAmount}
              currencyAmountAfterCashback={currencyAmountAfterCashback}
              setCurrencyAmountAfterCashback={setCurrencyAmountAfterCashback}
              selectedToken={selectedToken}
              rates={rates}
              send={send}
              fxSavings={fxSavings}
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
            />
          )}
          {USDCBalance && Number(USDCBalance) < 0.01 && <NoUsdc />}
        </>
      )}

      {isSending == "sending" && (
        <div className="h-full flex flex-col justify-center items-center">
          <div className="w-full h-[50px] animate-spin">
            <Image src="/loadingCircleBlack.svg" alt="loading" fill />
          </div>
          <div className="mt-[24px] text-xl font-medium">Sending transaction...</div>
          <div className="mt-[8px] mb-20 text-xl font-medium">Please don't close this window</div>
        </div>
      )}

      {isSending == "complete" && (
        <div className="w-full h-full max-h-[600px] flex flex-col items-center justify-between">
          {/*---payment completed! ---*/}
          <div className="mt-12 w-full flex flex-col items-center relative">
            <Lottie animationData={circleCheck} loop={true} className="w-[70px] h-[70px]" />
            <div className="mt-3 text-3xl font-medium">Payment Completed!</div>
          </div>
          {/*---details---*/}
          <div className="w-[340px] flex flex-col items-center text-xl space-y-4">
            <div className="w-full">
              <span className="font-semibold">Time</span>: {getLocalDateWords(date?.toString())}, {getLocalTime(date?.toString())?.time} {getLocalTime(date?.toString())?.ampm}
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

          <div className="mt-16 mb-8 text-xl">You may close this window</div>
        </div>
      )}
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </div>
  );
}
