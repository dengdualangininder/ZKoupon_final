"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Parser } from "@json2csv/plainjs"; // switch to papaparse or manually do it
//wagmi
import { useConfig } from "wagmi";
import { writeContract } from "@wagmi/core";
import { parseUnits } from "viem";
// others
import { QRCodeSVG } from "qrcode.react";
// components
import ErrorModal from "./modals/ErrorModal";
// constants
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
import { merchantType2data } from "@/utils/constants";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown, faArrowsRotate, faXmark, faArrowLeft, faArrowRight, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const Payments = ({
  transactionsState,
  setTransactionsState,
  isMobile,
  paymentSettingsState,
}: {
  transactionsState: any;
  setTransactionsState: any;
  isMobile: boolean;
  paymentSettingsState: any;
}) => {
  console.log("Payments component rendered");

  // states
  const [clickedTxn, setClickedTxn] = useState<null | any>();
  const [clickedTxnIndex, setClickedTxnIndex] = useState<null | number>();
  const [refundStatus, setRefundStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [refundNoteStatus, setRefundNoteStatus] = useState("processing"); // "false" | "processing" | "true"
  const [page, setPage] = useState(1);
  const [selectedStartMonth, setSelectedStartMonth] = useState("select");
  const [selectedEndMonth, setSelectedEndMonth] = useState("select");
  // modal states
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadDates, setDownloadDates] = useState<string[]>([]);
  const [refundAllModal, setRefundAllModal] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const maxPage = Math.ceil(transactionsState.length / 6);

  // hooks
  const config = useConfig();

  // functions
  const getLocalTime = (mongoDate: string) => {
    const time = new Date(mongoDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
    const timeObject = { time: time.split(" ")[0], ampm: time.split(" ")[1] };
    return timeObject;
  };

  // return format: April 2
  const getLocalDateWords = (mongoDate: string) => {
    let date = new Date(mongoDate).toLocaleDateString(undefined, { dateStyle: "long" }).split(",");
    return date[0];
  };

  // return format: 2024-04-02
  const getLocalDate = (mongoDate: string) => {
    let date = new Date(mongoDate).toLocaleString("en-GB").split(", ")[0].split("/");
    return `${date[2]}-${date[1]}-${date[0]}`;
  };

  const onClickTxn = async (e: any) => {
    const txnHash = e.currentTarget.id;
    const clickedTxnIndexTemp = transactionsState.findIndex((i: any) => i.txnHash === txnHash);
    console.log(clickedTxnIndexTemp);
    if (clickedTxnIndexTemp == undefined) {
      return;
    }
    const clickedTxnTemp = transactionsState[clickedTxnIndexTemp];
    setDetailsModal(true);
    setClickedTxnIndex(clickedTxnIndexTemp);
    setClickedTxn(clickedTxnTemp);
    setRefundNoteStatus(clickedTxnTemp.refundNote ? "true" : "false");
  };

  const onClickRefund = async () => {
    console.log("onClickRefund, clickedTxn", clickedTxn);
    setRefundStatus("processing");

    // send tokens on blockchain
    let refundHash = "";
    try {
      refundHash = await writeContract(config, {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on polygon
        abi: ERC20ABI,
        functionName: "transfer",
        args: [clickedTxn.customerAddress, parseUnits(clickedTxn.tokenAmount.toString(), 6)],
      });
      console.log("refundHash", refundHash);
    } catch (err) {
      console.log(err);
      setRefundStatus("initial");
      setDetailsModal(false);
      setErrorMsg("Payment was not refunded");
      setErrorModal(true);
      return;
    }

    //save to db
    try {
      const res = await fetch("/api/refund", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchantEvmAddress: paymentSettingsState.merchantEvmAddress, refundHash: refundHash, txnHash: clickedTxn.txnHash }),
      });
      var data = await res.json();
      console.log("refund api response:", data);
    } catch (e) {
      console.log(e);
    }

    // success or fail
    if (data == "saved") {
      setRefundStatus("processed");
      let transactionsStateTemp = [...transactionsState]; // create shallow copy of transactionsState
      transactionsStateTemp[clickedTxnIndex!].refund = true;
      setTransactionsState(transactionsStateTemp);
    } else if (data != "saved") {
      if (data.status == "error") {
        setErrorMsg(data.message);
      } else {
        setErrorMsg("Refund was successful. But, the status was not saved to the database.");
      }
      setErrorModal(true);
      setRefundStatus("initial");
    }
  };

  const onClickRefundNote = async () => {
    console.log("onClickRefundNote, clickedTxn:", clickedTxn);
    setRefundNoteStatus("processing");
    // save to db
    const res = await fetch("/api/refundNote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ merchantEvmAddress: paymentSettingsState.merchantEvmAddress, txnHash: clickedTxn.txnHash, refundNote: clickedTxn.refundNote }),
    });
    const data = await res.json();
    console.log("refundNote api response:", data);
    // success or error
    if (data == "saved") {
      setRefundNoteStatus(clickedTxn.refundNote ? "false" : "true");
      let transactionsStateTemp = [...transactionsState]; // create shallow copy of transactionsState
      transactionsStateTemp[clickedTxnIndex!].refundNote = !clickedTxn.refundNote;
      setTransactionsState(transactionsStateTemp);
    } else {
      if (data.status == "error") {
        setErrorMsg(data.message);
      } else {
        setErrorMsg("Refund status was not saved to database");
      }
      setRefundNoteStatus(clickedTxn.refundNote ? "true" : "false");
      setErrorModal(true);
    }
  };

  const onClickDownload = () => {
    // FINISH BELOW LOGIC

    const startDate = new Date(Number(selectedStartMonth.split("-")[0]), Number(selectedStartMonth.split("-")[1]) - 1, 1); // takes in year, monthIndex, day
    const endDate = new Date(Number(selectedEndMonth.split("-")[0]), Number(selectedEndMonth.split("-")[1]), 0); // day=0 returns last day of the previous month

    let selectedTxns = [];
    for (const txn of transactionsState) {
      if (txn.date > startDate && txn.date < endDate) {
        selectedTxns.push(txn);
      }
    }

    setDownloadModal(false);
    return;

    const fields = [
      { label: "Date", value: "date" },
      { label: "Payment Amount", value: "currencyAmount" },
      { label: "Merchant Currency", value: "merchantCurrency" },
      { label: "Token Amount", value: "tokenAmount" },
      { label: "Token", value: "token" },
      { label: "Refunded?", value: "refund" },
      { label: "Rate", value: "blockRate" },
      { label: "Network", value: "network" },
      { label: "Customer's Address", value: "customerAddress" },
      { label: "Business's Address", value: "merchantAddress" },
      { label: "Transaction Hash", value: "txnHash" },
    ];

    const myData = selectedTxns.map((i) => {
      return {
        date: i.date,
        currencyAmount: i.currencyAmount,
        merchantCurrency: i.merchantCurrency,
        tokenAmount: i.tokenAmount,
        token: i.token,
        refund: i.refund,
        blockRate: i.blockRate,
        network: i.network,
        customerAddress: i.customerAddress,
        merchantAddress: i.merchantAddress,
        txnHash: i.txnHash,
      };
    });

    console.log(myData);

    try {
      const options = { fields };
      const parser = new Parser(options);
      var csv = parser.parse(myData);
      console.log(csv);

      const blob = new Blob([csv], { type: "text/csv" });
      const element = document.createElement("a");
      element.download = "payments.csv";
      element.href = window.URL.createObjectURL(blob);
      element.click();
    } catch (error) {
      console.error(error);
    }
  };

  const createDownloadDates = () => {
    let firstyear = Number(transactionsState[0].date.split("-")[0]);
    let firstmonth = Number(transactionsState[0].date.split("-")[1]);
    let lastyear = Number(transactionsState[transactionsState.length - 1].date.split("-")[0]);
    let lastmonth = Number(transactionsState[transactionsState.length - 1].date.split("-")[1]);
    let years = Array.from({ length: lastyear - firstyear + 1 }, (value, index) => firstyear + index);
    let yearmonthArray = [];
    for (let year of years) {
      if (year === firstyear && year === lastyear) {
        for (let i = firstmonth; i < lastmonth + 1; i++) {
          yearmonthArray.push(`${year}-${i}`);
        }
      } else if (year === firstyear && firstyear != lastyear) {
        for (let i = firstmonth; i < 13; i++) {
          yearmonthArray.push(`${year}-${i}`);
        }
      } else if (year === lastyear && firstyear != lastyear) {
        for (let i = 1; i < lastmonth + 1; i++) {
          yearmonthArray.push(`${year}-${i}`);
        }
      } else {
        for (let i = 1; i < 13; i++) {
          yearmonthArray.push(`${year}-${i}`);
        }
      }
    }
    setDownloadDates(yearmonthArray);
  };

  const onClickRefundAll = async () => {
    //logic here
    setRefundAllModal(false);
  };

  return (
    <section className="w-full flex justify-center">
      <div className={`flex flex-col items-center ${paymentSettingsState.merchantPaymentType == "inperson" ? "px-6 w-full sm:landscape:max-w-[75%] sm:portrait:max-w-[85%]" : ""}`}>
        {/*--- Table or "no payments" ---*/}
        {transactionsState.length > 1 ? (
          <div className="h-[calc(100vh-84px-74px-2px)] sm:portrait:h-[calc(100vh-140px-120px-2px)] landscape:h-[calc(100vh-74px-2px)] md:landscape:h-[calc(100vh-120px-2px)] flex justify-center select-none overflow-y-auto">
            <table className={`table-fixed text-left w-full select-none`}>
              <thead className="text-base sm:portrait:text-2xl md:landscape:text-2xl border-b">
                {/*---headers, 40px---*/}
                <tr className="h-[50px] sm:portrait:h-[70px] md:landscape:h-[70px]">
                  <th className="">Time</th>
                  <th className="text-center">Customer</th>
                  {paymentSettingsState.merchantFields.includes("daterange") && <th className="px-2">Dates</th>}
                  {paymentSettingsState.merchantFields.includes("date") && <th className="px-2">Date</th>}
                  {paymentSettingsState.merchantFields.includes("time") && <th className="px-2">Time</th>}
                  {paymentSettingsState.merchantFields.includes("item") && <th className="">{merchantType2data[paymentSettingsState.merchantType]["itemlabel"]}</th>}
                  {paymentSettingsState.merchantFields.includes("count") && (
                    <th className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""}`}>Guests</th>
                  )}
                  {paymentSettingsState.merchantFields.includes("sku") && <th className="">SKU#</th>}
                  <th className="text-right pr-2">{paymentSettingsState.merchantCurrency}</th>
                </tr>
              </thead>
              <tbody>
                {/*---transactions---*/}
                {transactionsState
                  .toReversed()
                  .slice((page - 1) * 6, (page - 1) * 6 + 6)
                  .map((txn: any, index: number) => (
                    <tr
                      id={txn.txnHash}
                      key={index}
                      className={`${
                        txn.refund ? "text-gray-400" : ""
                      } h-[calc((100vh-84px-50px-74px-4px)/6)] sm:portrait:h-[calc((100vh-140px-70px-120px-4px)/6)] md:landscape:h-[calc((100vh-70px-120px-4px)/6)] flex-none border-b lg:hover:bg-gray-200 active:bg-gray-200 lg:cursor-pointer overflow-y-auto`}
                      onClick={onClickTxn}
                    >
                      {/*---Time---*/}
                      <td className=" whitespace-nowrap">
                        <div className="relative">
                          <span className="text-3xl sm:portrait:text-5xl md:landscape:text-5xl">{getLocalTime(txn.date).time}</span>
                          <span className="ml-1 font-medium text-sm sm:portrait:text-xl md:landscape:text-xl">{getLocalTime(txn.date).ampm}</span>
                          <div className="absolute top-[calc(100%)] text-sm sm:portrait:text-xl md:landscape:text-xl leading-none font-medium text-gray-400">
                            {getLocalDateWords(txn.date)}
                          </div>
                        </div>
                      </td>
                      {/*---Customer---*/}
                      <td className=" text-center">
                        {paymentSettingsState.merchantPaymentType === "online" && paymentSettingsState.merchantFields.includes("email") && txn.customerEmail && (
                          <div className="text-sm leading-tight">
                            <div>{txn.customerEmail.split("@")[0]}</div>
                            <div>@{txn.customerEmail.split("@")[1]}</div>
                          </div>
                        )}
                        {paymentSettingsState.merchantPaymentType === "inperson" && (
                          <div className="text-lg sm:portrait:text-3xl md:landscape:text-3xl pt-2 pr-1">..{txn.customerAddress.substring(txn.customerAddress.length - 4)}</div>
                        )}
                      </td>
                      {/*---Online Options---*/}
                      {paymentSettingsState.merchantFields.includes("daterange") && (
                        <td className="xs:px-2">
                          <div className="text-sm leading-tight whitespace-nowrap">
                            <div>{txn.startDate}</div>
                            <div>{txn.endDate}</div>
                          </div>
                        </td>
                      )}
                      {paymentSettingsState.merchantFields.includes("date") && <td className="xs:px-2 text-sm leading-tight whitespace-nowrap">{txn.singledate}</td>}
                      {paymentSettingsState.merchantFields.includes("time") && <td className="xs:px-2 text-sm leading-tight whitespace-nowrap">{txn.time}</td>}
                      {paymentSettingsState.merchantFields.includes("item") && <td className="xs:px-2 text-sm leading-tight">{txn.item}</td>}
                      {paymentSettingsState.merchantFields.includes("count") && (
                        <td className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""} xs:px-2`}>
                          {txn.countString && (
                            <div className="text-sm leading-tight">
                              <div>{txn.countString.split(", ")[0]}</div>
                              <div>{txn.countString.split(", ")[1]}</div>
                            </div>
                          )}
                        </td>
                      )}
                      {paymentSettingsState.merchantFields.includes("sku") && <td className="xs:px-2">{txn.sku && <div className="text-lg">{txn.sku}</div>}</td>}
                      {/*---currencyAmount---*/}
                      <td className="pr-2">
                        <div className="flex justify-end relative">
                          <span className={`${paymentSettingsState.merchantPaymentType === "inperson" ? "text-3xl sm:portrait:text-5xl md:landscape:text-5xl" : "text-xl"}`}>
                            {txn.currencyAmount}
                          </span>
                          <div
                            className={`${
                              txn.refundNote && !txn.refund ? "" : "hidden"
                            } absolute top-[calc(100%)] pr-0.5 right-0 text-sm font-medium leading-none text-gray-400 whitespace-nowrap`}
                          >
                            To Be Refunded
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                {page == maxPage &&
                  Array.from(Array(6 - (transactionsState.length % 6)).keys()).map((i) => (
                    <tr
                      className={`h-[calc((100vh-84px-50px-74px-4px)/6)] sm:portrait:h-[calc((100vh-140px-70px-120px-4px)/6)] md:landscape:h-[calc((100vh-70px-120px-4px)/6)]`}
                    ></tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-xl">No payments so far</div>
          </div>
        )}

        {/*--- more & navigation , 74pw-full x height---*/}
        <div className="w-full h-[74px] sm:portrait:h-[120px] md:landscape:h-[120px] flex items-center">
          <div className="w-full h-[44px] flex items-center justify-between">
            {/*--- more ---*/}
            <div
              onClick={() => setShowToolsModal(true)}
              className="pt-0.5 w-[44px] h-full border border-gray-300 rounded-md flex justify-center items-ceneter text-lg font-bold cursor-pointer lg:hover:bg-gray-100 active:opacity-40 select-none"
            >
              ...
            </div>
            {/*--- navigation ---*/}
            <div className="h-full flex items-center justify-center">
              <div
                className="pb-1 text-2xl sm:portrait:text-3xl md:landscape:text-3xl w-[44px] h-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-md lg:hover:opacity-40 active:opacity-40 cursor-pointer select-none"
                onClick={() => (page === 1 ? "" : setPage(page - 1))}
              >
                {"\u2039"}
              </div>
              <div className="text-xl sm:portrait:text-3xl md:landscape:text-3xl w-[20px] text-center select-none mx-2">{page}</div>

              <div
                className="pb-1 text-2xl sm:portrait:text-3xl md:landscape:text-3xl w-[44px] h-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-md lg:hover:opacity-40 active:opacity-40 cursor-pointer select-none"
                onClick={() => (page == maxPage ? "" : setPage(page + 1))}
              >
                {"\u203A"}
              </div>
            </div>
            {/*--- qr code ---*/}
            <div
              onClick={() => {
                if (paymentSettingsState.qrCodeUrl) {
                  setShowQr(true);
                } else {
                  setErrorModal(true);
                  setErrorMsg("Please first fill out your Payment Settings in the Settings menu tab.");
                }
              }}
              className="relative w-[44px] h-full border border-gray-300 rounded-md"
            >
              <Image src="/qr.svg" alt="QR" fill />
            </div>
          </div>
        </div>
      </div>

      {/*--- MODALS ---*/}
      {detailsModal && (
        <div className="">
          <div className="px-8 flex flex-col justify-center space-y-6 w-[348px] h-[440px] bg-white rounded-3xl border border-gray-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-50">
            {/*---content---*/}
            <div className="flex flex-col text-lg lg:text-base space-y-1 font-medium">
              <p>
                <span className="text-gray-400 mr-1">Time</span> {getLocalDate(clickedTxn.date)} {getLocalTime(clickedTxn.date).time} {getLocalTime(clickedTxn.date).ampm}
              </p>
              <p>
                <span className="text-gray-400 mr-1">Payment Value</span> {clickedTxn.currencyAmount} {clickedTxn.merchantCurrency}
              </p>
              <p>
                <span className="text-gray-400 mr-1">Tokens Received</span> {clickedTxn.tokenAmount} USDC
              </p>
              <p>
                <span className="text-gray-400 mr-1">Rate</span> {clickedTxn.blockRate}
              </p>
              <p>
                <span className="text-gray-400 mr-1">Network</span> {clickedTxn.network}
              </p>
              <p>
                <span className="text-gray-400 mr-1">Customer</span> <span className="break-all">{clickedTxn.customerAddress}</span>
              </p>
            </div>
            {/*---actions---*/}
            {clickedTxn.refund || refundStatus === "refunded" ? (
              <div className="text-center text-lg font-bold text-gray-400 pt-8">Payment has been refunded</div>
            ) : (
              <div className="flex justify-center space-x-10 font-medium text-base">
                {/*---refund now---*/}
                <button
                  id="paymentsRefundButton"
                  className={`${
                    clickedTxn.refund || refundStatus === "refunded" ? "hidden" : " bg-white lg:hover:bg-gray-100 active:bg-gray-100 cursor-pointer"
                  } w-[110px] h-[110px] flex justify-center items-center rounded-full border border-gray-200 drop-shadow-lg`}
                  onClick={onClickRefund}
                >
                  {refundStatus === "initial" && clickedTxn.refund == false && (
                    <div>
                      Refund
                      <br />
                      Now
                    </div>
                  )}
                  {refundStatus === "processing" && (
                    <div className="flex items-center justify-center">
                      <SpinningCircleGray />
                    </div>
                  )}
                  {(refundStatus === "processed" || clickedTxn.refund == true) && "Refunded"}
                </button>
                {/*---mark "to be refunded"---*/}
                <button
                  className={`${
                    clickedTxn.refund || refundStatus === "refunded" ? "hidden" : " bg-white lg:hover:bg-gray-100 active:bg-gray-100 cursor-pointer"
                  } w-[110px] h-[110px] flex justify-center items-center rounded-full border border-gray-200 drop-shadow-lg`}
                  onClick={onClickRefundNote}
                >
                  {refundNoteStatus == "processing" && (
                    <div className="flex items-center justify-center">
                      <SpinningCircleGray />
                    </div>
                  )}
                  {refundNoteStatus != "processing" && (
                    <div>
                      {refundNoteStatus == "true" ? "Remove" : "Add"}
                      <br />
                      <span className="text-sm tracking-tighter">TO BE REFUNDED</span>
                      <br />
                      Note
                    </div>
                  )}
                </button>
              </div>
            )}
            {/*---CLOSE BUTTON---*/}
            {/* <button
              onClick={() => setDetailsModal(false)}
              className="absolute top-[calc(100%-28px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] text-3xl rounded-full h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 lg:hover:bg-red-500 active:bg-red-300"
            >
              <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
            </button> */}
          </div>
          <div className="modalBlackout" onClick={() => setDetailsModal(false)}></div>
        </div>
      )}
      {downloadModal && (
        <div>
          <div className="w-[330px] h-[330px] px-8 py-10 flex flex-col items-center rounded-3xl bg-white border border-gray-500 fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-50">
            {/*---content---*/}
            <div className="w-full grow flex flex-col justify-center">
              {/*---start---*/}
              <div className="w-full flex items-center justify-between">
                <div className="text-xl lg:text-lg">Start Month</div>
                <div className="px-4 py-2 border border-slate-300 rounded-lg">
                  <select className="text-xl lg:text-lg outline:none focus:outline-none" value={selectedStartMonth} onChange={(e) => setSelectedStartMonth(e.target.value)}>
                    {downloadDates.map((i) => (
                      <option>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/*---end---*/}
              <div className="mt-2 w-full flex items-center justify-between">
                <div className="text-xl lg:text-lg">End Month</div>
                <div className="px-4 py-2 border border-slate-300 rounded-lg">
                  <select className="text-xl lg:text-lg outline:none focus:outline-none" value={selectedEndMonth} onChange={(e) => setSelectedEndMonth(e.target.value)}>
                    {downloadDates.map((i) => (
                      <option>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              className="w-[70%] h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-full text-white text-lg font-bold tracking-wide"
              onClick={onClickDownload}
            >
              Download
            </button>
            {/*---close button---*/}
            {/* <button
              onClick={() => setDownloadModal(false)}
              className="absolute top-[calc(100%-28px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] text-3xl rounded-full h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 lg:hover:bg-red-500 active:bg-red-300"
            >
              <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
            </button> */}
          </div>
          <div className="modalBlackout" onClick={() => setDownloadModal(false)}></div>
        </div>
      )}
      {refundAllModal && (
        <div>
          <div className="w-[330px] h-[330px] px-8 py-10 flex flex-col items-center rounded-3xl bg-white border border-gray-500 fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-50">
            {/*---content---*/}
            <div className="w-full grow text-xl text-center flex items-center">Refund all payments marked as "To Be Refunded"?</div>
            <button
              className="mt-10 w-[70%] h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-full text-white text-lg font-bold tracking-wide"
              onClick={onClickRefundAll}
            >
              Confirm
            </button>
          </div>
          <div className="modalBlackout" onClick={() => setRefundAllModal(false)}></div>
        </div>
      )}
      {showToolsModal && (
        <div>
          <div className="w-[330px] h-[330px] px-8 py-10 flex flex-col items-center justify-evenly rounded-3xl bg-white border border-gray-500 fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-50">
            <button
              className="w-[85%] h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-full text-white text-lg font-bold tracking-wide"
              onClick={() => {
                setShowToolsModal(false);
                setRefundAllModal(true);
              }}
            >
              Refund All
            </button>
            <button
              className="w-[85%] h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-full text-white text-lg font-bold tracking-wide"
              onClick={() => {
                createDownloadDates();
                setShowToolsModal(false);
                setDownloadModal(true);
              }}
            >
              Download History
            </button>
          </div>
          <div className="modalBlackout" onClick={() => setShowToolsModal(false)}></div>
        </div>
      )}
      {showQr && (
        <div onClick={() => setShowQr(false)}>
          <div className="fixed inset-0 z-10 bg-black"></div>
          <div className="portrait:w-full portrait:h-[calc(100vw*1.4142)] landscape:w-[calc(100vh/1.4142)] landscape:h-screen fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-[20]">
            <div className="w-full h-full relative">
              <Image src="/placard.svg" alt="placard" fill />
            </div>
          </div>
          <div className="fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[30]">
            <QRCodeSVG
              xmlns="http://www.w3.org/2000/svg"
              size={window.innerWidth > window.innerHeight ? Math.round((window.innerHeight / 1.4142) * (220 / 424.26)) : Math.round(window.innerWidth * (220 / 424.26))}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"L"}
              value={paymentSettingsState.qrCodeUrl}
            />
          </div>
        </div>
      )}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </section>
  );
};

export default Payments;
