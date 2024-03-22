"use client";
// import modules
import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { Buffer } from "buffer";
import emailjs from "@emailjs/browser";
// import files
import PayForm from "../PayForm.jsx";
import { tokenAddresses, chainIds, addChainParams } from "../../constants/web3Constants.js";
import erc20ABI from "../../constants/erc20-abi.json";
import { polygonSvg, bscSvg, arbSvg, opSvg, avaxSvg, usdcSvg, usdtSvg, eurtPng } from "../../assets/index.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleWhite from "../svgs/SpinningCircleWhite.jsx";
import SpinningCircleGray from "../svgs/SpinningCircleGray.jsx";

const PayUsModal = ({ setPayUsModal, payFor, params }) => {
  const payFormRef = useRef();
  const [topMessage, setTopMessage] = useState("");
  const [tokenAmount, setTokenAmount] = useState("0");
  const [isSending, setIsSending] = useState(false);
  const [isSendingComplete, setIsSendingComplete] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);

  // let { params } = useParams();

  const send = async (e) => {
    e.preventDefault();
    // get params from ref
    let merchantName = payFormRef.current.merchantName.value;
    let merchantCurrency = payFormRef.current.merchantCurrency.value;
    let merchantAddress = payFormRef.current.merchantAddress.value;
    let paymentType = payFormRef.current.paymentType.value;
    let currencyAmount = payFormRef.current.currencyAmount.value;
    let selectedNetwork = payFormRef.current.selectedNetwork.value;
    let selectedToken = payFormRef.current.selectedToken.value;
    let rate = payFormRef.current.blockRate.value;
    let cashRate = payFormRef.current.cashRate.value;
    let savigns = payFormRef.current.savings.value;
    // online
    let itemName = payFormRef.current.itemName.value;
    let merchantEmail = payFormRef.current.merchantEmail.value;
    let customerEmail = payFormRef.current.customerEmail.value;

    if (!customerEmail.includes("@") || !customerEmail.split("@")[1].includes(".")) {
      setErrorModal(true);
      setErrorMsg("Please enter a valid email.");
    } else if (days <= 0) {
      setErrorModal(true);
      setErrorMsg("Please enter valid dates.");
    } else if (paymentType === "online" && itemName == "") {
      setErrorModal(true);
      setErrorMsg("Please enter an item name.");
    } else {
      setIsSending(true);
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = await provider.getSigner();
      let tempAddress = await signer.getAddress();
      let tokenAddress = tokenAddresses[selectedNetwork][selectedToken]["address"];
      let contract = new ethers.Contract(tokenAddress, erc20ABI, signer);

      let customerAddress = tempAddress;

      contract
        .transfer(merchantAddress, ethers.utils.parseUnits((currencyAmount / rate).toFixed(2), 6))
        .then((tx) => {
          //action before txn is mined
          provider.waitForTransaction(tx.hash).then(() => {
            //action after txn is mined
            setIsSending(false);
            setIsSendingComplete(true);
            const sendEmail = () => {
              // service_id, template_id, public key
              emailjs
                .sendForm(import.meta.env.VITE_EMAILJS_SERVICE_GMAIL, import.meta.env.VITE_EMAILJS_TEMPLATE_PREPAID, payFormRef.current, import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
                .then(
                  (result) => {
                    console.log("email sent");
                  },
                  (error) => {
                    console.log("email failed to send");
                  }
                );
            };
            sendEmail();
            const sendToDb = async (customerAddress) => {
              const txn = {
                date: new Date(),
                customerAddress: customerAddress,
                currencyAmount: currencyAmount,
                merchantCurrency: merchantCurrency,
                tokenAmount: (currencyAmount / rate).toFixed(2),
                token: selectedToken,
                network: selectedChain,
                rate: rate,
                merchantAddress: merchantAddress,
                refund: false,
                archive: false,
              };

              await axios
                .post("http://localhost:8000/posttxn", { txn })
                .then((res) => console.log("txn sent to db"))
                .catch((e) => {
                  alert("axios post error");
                  console.log(e);
                });
            };
            sendToDb(customerAddress);
          });
        })
        .catch((e) => {
          setIsSending(false); //action to perform when user clicks "reject"
          setErrorModal(true);
          setErrorMsg(e.reason);
        });
    }
  };

  return (
    <div>
      {/*---container---*/}
      <div className="flex flex-col pb-8 sm:pb-4 bg-white w-[95%] sm:w-[560px] md:w-[650px] h-[83%] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[52%] sm:-translate-y-[50%] -translate-x-1/2 z-[90]">
        {/*---close button---*/}
        <button
          onClick={() => setPayUsModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer relative">
            {/*---topMessage---*/}
            <div className="mt-4 md:mt-8 flex justify-center text-sm leading-tight">
              <div className="w-full xs:w-[470px]">
                {payFor === "payForPlacard" && (
                  <div className="text-center">For just 20 USD. we can send you a cutomized placard. To send payment, you need to have MetaMask installed.</div>
                )}
                {payFor === "payForAuto" && (
                  <div className="text-start">
                    <div className="flex">
                      <p className="mr-2">&bull;</p>
                      <p>Pay with MetaMask and USDC only</p>
                    </div>
                    <div className="flex">
                      <p className="mr-2">&bull;</p>
                      <p>Don't have USDC? Email contact@lingpay.io &ndash; we can activate the Automation Package for you in a special deal for new blockchain users</p>
                    </div>
                    <div className="flex">
                      <p className="mr-2">&bull;</p>
                      <p>Deposit any amount of USDC &ndash; the Automation Package can be activated as long as your balance is &ge; 5 USDC</p>
                    </div>

                    <div className="flex">
                      <p className="mr-2">&bull;</p>
                      <p>If your monthly transactions are &lt; $500, our services are free! If it is &gt; $500, 5 USDC will be deducted from your balance</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/*---payment form---*/}
            <PayForm payFormRef={payFormRef} params={params} send={send} />
          </div>
        </div>
        {/*---error modal---*/}
        {errorModal ? (
          <div>
            <div className="flex justify-center bg-white w-[270px] h-[270px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[50]">
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
            <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
          </div>
        ) : null}
        {/*---paid modal---*/}
        {(isSendingComplete || isSending) && (
          <div>
            <div className="w-[90%] h-[80%] bg-white rounded-xl border-2 border-gray-500 fixed inset-1/2 -translate-y-1/2 -translate-x-1/2 z-[10] overflow-hidden px-6">
              <div className="h-full flex flex-col items-center justify-around text-gray-600">
                {/*---store name---*/}
                <div className="text-center text-xl relative">
                  <div className="leading-none text-xl">PAYMENT COMPLETED</div>
                  <div className="mt-1 text-2xl font-bold text-blue-500">{merchantName}</div>
                  <div className="text-xl">COMPLETED</div>
                  <FontAwesomeIcon className="absolute bottom-[-64px] left-[calc(50%-25px)] animate-blob2 text-[50px] text-green-500" icon={faCircleCheck} />
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
                <button onClick={() => setIsSendingComplete(false)} className=" text-white bg-green-500 hover:bg-green-600 font-bold px-10 py-4 text-xl rounded-md w-full">
                  CLOSE
                </button>
              </div>
            </div>
            <div className="opacity-50 fixed inset-0 bg-black"></div>
          </div>
        )}
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default PayUsModal;
