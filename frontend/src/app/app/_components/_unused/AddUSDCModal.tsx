"use client";
// import modules
import { useState, useRef } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { Buffer } from "buffer";
import axios from "axios";
// import files
import PayForm from "../PayForm.jsx";
import { tokenAddresses, chainIds, addChainParams } from "../../constants/web3Constants.js";
import erc20ABI from "../../constants/erc20-abi.json";
import { polygonSvg, bscSvg, arbSvg, opSvg, avaxSvg, usdcSvg, usdtSvg, eurtPng } from "../../assets/index.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleWhite from "../svgs/SpinningCircleWhite.jsx";
import SpinningCircleGray from "../svgs/SpinningCircleGray.jsx";

const AddUSDCModal = ({ _id, balance, setAddUSDCModal, payFor, params }) => {
  const payFormRef = useRef();
  // these states are passed to PayForm.jsx
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [currencyAmount, setCurrencyAmount] = useState(0);
  // Booleans
  const [isMMWaiting, setIsMMWaiting] = useState(false);
  const [isMMSending, setIsMMSending] = useState(false);
  const [isSendingComplete, setIsSendingComplete] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // preset variables
  let merchantAddress = "0x0aAEfAa4447885a52716342a4BDE0176601C3311"; // Merchant 4 on B-MM
  let rate = 1;
  let merchantName = "Ling Pay";
  let merchantCurrency = "USDC";

  const send = async (e) => {
    e.preventDefault();
    setIsMMWaiting(true);
    let newBalance = Number((Number(balance) + Number(currencyAmount)).toFixed(2)); // unique to this PayForm wrapper
    // web3 txn
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let signer = await provider.getSigner();
    let customerAddress = await signer.getAddress();
    let tokenAddress = tokenAddresses[selectedNetwork][selectedToken]["address"];
    let contract = new ethers.Contract(tokenAddress, erc20ABI, signer);
    contract
      .transfer(merchantAddress, ethers.utils.parseUnits((currencyAmount / rate).toFixed(2), 6))
      .then((tx) => {
        setIsMMWaiting(false);
        setIsMMSending(true);
        provider.waitForTransaction(tx.hash).then(() => {
          //action after txn is mined
          setIsMMSending(false);
          setIsSendingComplete(true);

          const sendToDb = async (customerAddress, newBalance) => {
            const newEntry = {
              date: new Date(),
              tokenAmount: Number((currencyAmount / rate).toFixed(2)),
              customerAddress: customerAddress,
              merchantAddress: merchantAddress,
              token: selectedToken,
              network: selectedNetwork,
            };
            await axios
              .post("http://localhost:8000/addusdc", { _id: _id, newBalance: newBalance, newEntry: newEntry })
              .then((res) => {
                console.log(res);
                if (res.data === "saved") {
                  console.log("txn sent to db");
                } else {
                  // error warning not sent to db?
                }
              })
              .catch((e) => {
                alert("axios post error");
                console.log(e);
              });
          };
          sendToDb(customerAddress, newBalance);
        });
      })
      .catch((e) => {
        setIsMMSending(false); //action to perform when user clicks "reject"
        setIsMMWaiting(false);
        setErrorModal(true);
        if (e.reason.includes("exceeds balance")) {
          setErrorMsg("Insufficient USDC in MetaMask wallet.");
        } else {
          setErrorMsg(e.reason);
        }
      });
  };

  return (
    <div>
      <div className="flex flex-col pb-4 bg-white w-[358px] xs:w-[80%] sm:w-[590px] md:w-[650px] h-[80%] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[53%] -translate-x-1/2 z-[50]">
        {/*---close button---*/}
        <button
          onClick={() => setAddUSDCModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Top Message + Form---*/}
        <div className="">
          {/*---Top Message---*/}
          <div className="px-2 xs:px-4 mt-4 md:mt-8 flex justify-center text-sm leading-tight">
            {payFor === "payForPlacard" && (
              <div className="text-center">For just 20 USD. we can send you a cutomized placard. To send payment, you need to have MetaMask installed.</div>
            )}
            {payFor === "payForAuto" && (
              <div>
                {/*---header---*/}
                <div className="text-center text-xl font-bold leading-none">Pay with MetaMask</div>
                <div className="text-center text-sm">Accepted token: USDC</div>
                {/*---bullet points---*/}
                <div className="mt-2 text-start">
                  Don't have USDC? Email contact@lingpay.io and we'll activate the Automation Package for you within 5 minutes. Deposit any amount of USDC &ndash; the Automation
                  Package can be activated as long as your balance is &ge; 5 USDC.
                </div>
              </div>
            )}
          </div>
          {/*---payment form---*/}
          <div className="flex items-center">
            <PayForm
              payFormRef={payFormRef}
              params={params}
              send={send}
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
              selectedToken={selectedToken}
              setSelectedToken={setSelectedToken}
              currencyAmount={currencyAmount}
              setCurrencyAmount={setCurrencyAmount}
            />
          </div>
        </div>
        {/*---error modal---*/}
        {errorModal && (
          <div className="flex justify-center bg-white w-[270px] h-[270px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            {/*---container---*/}
            <div className="h-full w-full flex flex-col justify-between items-center text-lg leading-tight md:text-base md:leading-snug px-6">
              {/*---Error---*/}
              <div className="mt-8 text-2xl font-bold text-slate-700 text-center">Error</div>
              {/*---msg---*/}
              <div className="mb-4 text-center">{errorMsg}</div>
              {/*---close button---*/}
              <button onClick={() => setErrorModal(false)} className="mb-6 w-full py-2 bg-blue-500 hover:bg-blue-700 rounded-lg text-white text-lg tracking-widest">
                DISMISS
              </button>
            </div>
          </div>
        )}
        {/*---paid modal---*/}
        {(isSendingComplete || isMMSending || isMMWaiting) && (
          <div>
            <div className="w-[90%] h-[80%] bg-white rounded-xl border-2 border-gray-500 fixed inset-1/2 -translate-y-1/2 -translate-x-1/2 z-[10] overflow-hidden px-6">
              {isMMWaiting && (
                <div className="h-full flex flex-col justify-center items-center">
                  <SpinningCircleGray />
                  <div className="mt-4 text-xl">Waiting on MetaMask...</div>
                </div>
              )}
              {isMMSending && (
                <div className="h-full flex flex-col justify-center items-center">
                  <SpinningCircleGray />
                  <div className="mt-4 text-xl">Sending transaction...</div>
                </div>
              )}
              {isSendingComplete && (
                <div className="h-full flex flex-col items-center justify-around text-gray-600">
                  {/*---store name---*/}
                  <div className="text-center text-xl relative">
                    <div className="leading-none font-bold text-xl">PAYMENT COMPLETED</div>
                    <FontAwesomeIcon className="absolute bottom-[-76px] left-[calc(50%-25px)] animate-blob2 text-[50px] text-green-500" icon={faCircleCheck} />
                  </div>
                  {/*---amount and time---*/}
                  <div className="flex flex-col items-center bg-clip-text text-transparent bg-gradient-to-l from-gray-600 from-50% to-blue-400 animate-textTwo">
                    <div className="mt-4 text-6xl flex items-center font-bold">
                      {currencyAmount}
                      <span className="ml-3 font-bold pt-0.5 text-2xl">{merchantCurrency}</span>
                    </div>
                    <div className="mt-4 font-bold text-4xl">{new Date().toLocaleString([], { timeStyle: "short" })}</div>
                  </div>
                  {/*---close---*/}
                  <button
                    onClick={() => {
                      setIsSendingComplete(false);
                      payFormRef.current.reset();
                      setCurrencyAmount(0);
                      setSelectedNetwork("");
                      setSelectedToken("");
                      setAddUSDCModal(false);
                    }}
                    className=" text-white bg-green-500 hover:bg-green-600 font-bold px-10 py-4 text-xl rounded-md w-full"
                  >
                    CLOSE
                  </button>
                </div>
              )}
            </div>
            <div className="opacity-50 fixed inset-0 bg-black"></div>
          </div>
        )}
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default AddUSDCModal;
