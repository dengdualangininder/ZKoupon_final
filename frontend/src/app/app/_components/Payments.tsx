"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
//wagmi
import { useConfig } from "wagmi";
import { writeContract } from "@wagmi/core";
import { parseUnits } from "viem";
// components
import ErrorModal from "./modals/ErrorModal";
// constants
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
import { currency2decimal, merchantType2data } from "@/utils/constants";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, Transaction } from "@/db/models/UserModel";

const Payments = ({
  transactionsState,
  setTransactionsState,
  paymentSettingsState,
  isAdmin,
}: {
  transactionsState: Transaction[];
  setTransactionsState: any;
  paymentSettingsState: PaymentSettings;
  isAdmin: boolean;
}) => {
  console.log("Payments component rendered");

  // states
  const [clickedTxn, setClickedTxn] = useState<null | any>();
  const [clickedTxnIndex, setClickedTxnIndex] = useState<null | number>();
  const [refundStatus, setRefundStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [refundAllStatus, setRefundAllStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [refundNoteStatus, setRefundNoteStatus] = useState("processing"); // "false" | "processing" | "true"
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedStartMonth, setSelectedStartMonth] = useState("select");
  const [selectedEndMonth, setSelectedEndMonth] = useState("select");
  const [searchedTxns, setSearchedTxns] = useState<Transaction[] | null>(null);
  const [searchedChars, setSearchedChars] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  // modal states
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadDates, setDownloadDates] = useState<string[]>([]);
  const [refundAllModal, setRefundAllModal] = useState(false);

  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const maxPageNumber = Math.ceil(transactionsState.length / 6);

  // hooks
  const config = useConfig();
  const router = useRouter();

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
    const startDate = new Date(Number(selectedStartMonth.split("-")[0]), Number(selectedStartMonth.split("-")[1]) - 1, 1); // returns 1st, 0:00h
    const endDate = new Date(Number(selectedEndMonth.split("-")[0]), Number(selectedEndMonth.split("-")[1]), 1); // returns return 1st, 0:00h of the following month

    let selectedTxns = [];
    for (const txn of transactionsState) {
      const date = new Date(txn.date);
      if (date > startDate && date < endDate) {
        const newDate = date.toLocaleString([], { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });
        selectedTxns.push({ ...txn, date: newDate });
      }
    }

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

    const jsonToCsv = (jsonObject: any) => {
      let csv = "";
      const keys = fields.map((i) => i.value); // get jsonObject keys
      const headers = fields.map((i) => i.label); // get csv headers
      csv += headers.join(",") + "\n";
      jsonObject.forEach((i: any) => {
        let data = keys.map((key) => JSON.stringify(i[key])).join(",");
        csv += data + "\n";
      });
      return csv;
    };

    const csv = jsonToCsv(selectedTxns);
    const blob = new Blob([csv], { type: "text/csv" });
    const element = document.createElement("a");
    element.download = "payments.csv";
    element.href = window.URL.createObjectURL(blob);
    element.click();
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
    setSelectedStartMonth(yearmonthArray.slice(-1)[0]);
    setSelectedEndMonth(yearmonthArray.slice(-1)[0]);
  };

  const onClickRefundAll = async () => {
    //logic here
    setRefundAllModal(false);
  };

  return (
    <section className="w-full flex flex-col items-center">
      {/*--- Table or "no payments" ---*/}
      {transactionsState.length > 1 ? (
        <div className="w-full overflow-y-auto">
          <div className="landscape:min-h-[500px] landscape:lg:min-h-[660px] landscape:lg:h-[calc(100vh-120px-2px)] landscape:xl:h-[calc(100vh-140px-2px)] portrait:h-[calc(100vh-84px-74px-2px)] sm:portrait:h-[calc(100vh-140px-120px-2px)] flex justify-center select-none">
            <table
              className={`${
                paymentSettingsState.merchantPaymentType == "inperson" ? "w-[90%] landscape:max-w-[70%] sm:portrait:max-w-[80%]" : ""
              } table-fixed text-left select-none`}
            >
              <thead className="text-base sm:portrait:text-2xl md:landscape:text-2xl">
                {/*---headers, 40px---*/}
                <tr className="h-[50px] sm:portrait:h-[70px] landscape:lg:h-[70px]">
                  <th className="">Time</th>
                  <th className="text-center">Customer</th>
                  {paymentSettingsState.merchantFields.includes("daterange") && <th className="px-2">Dates</th>}
                  {paymentSettingsState.merchantFields.includes("date") && <th className="px-2">Date</th>}
                  {paymentSettingsState.merchantFields.includes("time") && <th className="px-2">Time</th>}
                  {paymentSettingsState.merchantFields.includes("item") && <th className="">{merchantType2data[paymentSettingsState.merchantBusinessType]["itemlabel"]}</th>}
                  {paymentSettingsState.merchantFields.includes("count") && (
                    <th className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""}`}>Guests</th>
                  )}
                  {paymentSettingsState.merchantFields.includes("sku") && <th className="">SKU#</th>}
                  <th className="text-right pr-2">{paymentSettingsState.merchantCurrency}</th>
                </tr>
              </thead>
              <tbody>
                {/*---transactions---*/}
                {(searchedTxns ?? transactionsState)
                  .toReversed()
                  .slice((pageNumber - 1) * 6, (pageNumber - 1) * 6 + 6)
                  .map((txn: any, index: number) => (
                    <tr
                      id={txn.txnHash}
                      key={index}
                      className={`${
                        txn.refund ? "text-gray-400" : ""
                      } portrait:h-[calc((100vh-84px-50px-74px-4px)/6)] landscape:h-[74px] portrait:sm:h-[calc((100vh-140px-70px-120px-4px)/6)] landscape:lg:h-[calc((100vh-70px-120px-4px)/6)] landscape:xl:h-[calc((100vh-70px-140px-4px)/6)] flex-none border-t lg:hover:bg-gray-200 active:bg-gray-200 lg:cursor-pointer`}
                      onClick={onClickTxn}
                    >
                      {/*---Time---*/}
                      <td className=" whitespace-nowrap">
                        <div className="relative">
                          <span className="text-3xl landscape:lg:text-4xl portrait:sm:text-4xl landscape:xl:text-5xl portrait:lg:text-5xl">{getLocalTime(txn.date).time}</span>
                          <span className="landscape:text-xl landscape:lg:text-xl portrait:text-sm sm:portrait:text-xl ml-1 font-medium">{getLocalTime(txn.date).ampm}</span>
                          <div className="landscape:text-sm landscape:lg:text-lg portrait:text-sm portrait:sm:text-xl landscape:leading-none portrait:leading-none absolute top-[calc(100%-1px)] font-medium text-gray-400">
                            {getLocalDateWords(txn.date)}
                          </div>
                        </div>
                      </td>
                      {/*---Customer---*/}
                      <td className=" text-center">
                        {paymentSettingsState.merchantPaymentType === "inperson" && (
                          <div className="text-xl landscape:lg:text-3xl landscape:xl:text-4xl portrait:sm:text-3xl portrait:lg:text-4xl pt-2 pr-1">
                            ..{txn.customerAddress.substring(txn.customerAddress.length - 4)}
                          </div>
                        )}
                        {paymentSettingsState.merchantPaymentType === "online" && paymentSettingsState.merchantFields.includes("email") && txn.customerEmail && (
                          <div className="text-sm leading-tight">
                            <div>{txn.customerEmail.split("@")[0]}</div>
                            <div>@{txn.customerEmail.split("@")[1]}</div>
                          </div>
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
                          <span
                            className={`${
                              paymentSettingsState.merchantPaymentType === "inperson"
                                ? "text-3xl landscape:lg:text-4xl landscape:xl:text-5xl sm:portrait:sm:text-4xl portrait:lg:text-5xl"
                                : "text-xl"
                            }`}
                          >
                            {txn.currencyAmount.toFixed(currency2decimal[paymentSettingsState.merchantCurrency])}
                          </span>
                          <div
                            className={`${
                              txn.refundNote && !txn.refund ? "" : "hidden"
                            } absolute top-[calc(100%)] pr-0.5 right-0 text-sm landscape:lg:text-lg portrait:sm:text-lg font-medium leading-none text-gray-400 whitespace-nowrap`}
                          >
                            To Be Refunded
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                {pageNumber == maxPageNumber &&
                  Array.from(Array(6 - (transactionsState.length % 6)).keys()).map((i) => (
                    <tr
                      className={`h-[calc((100vh-84px-50px-74px-4px)/6)] sm:portrait:h-[calc((100vh-140px-70px-120px-4px)/6)] md:landscape:h-[calc((100vh-70px-120px-4px)/6)]`}
                    ></tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-xl">No payments so far</div>
        </div>
      )}

      {/*--- payments menu bar , w-full h-74px ---*/}
      <div className="w-full sm:landscape:max-w-[75%] sm:portrait:max-w-[85%] h-[74px] portrait:sm:h-[120px] landscape:lg:h-[120px] landscape:xl:h-[140px] flex items-center flex-none border-t relative">
        {/*--- MENU BAR ---*/}
        <div
          className={`${
            isSearch ? "translate-x-[-100vw]" : ""
          } translate-x-0 absolute px-6 w-full h-[44px] portrait:sm:h-[60px] landscape:lg:h-[60px] flex items-center justify-between transition-transform duration-700`}
        >
          {/*--- download button ---*/}
          <div
            onClick={() => {
              createDownloadDates();
              setDownloadModal(true);
            }}
            className={`w-[44px] portrait:sm:w-[64px] landscape:lg:w-[64px] h-full border border-gray-300 rounded-md flex justify-center items-ceneter text-xl font-bold cursor-pointer lg:hover:bg-gray-100 active:opacity-40 select-none`}
          >
            <div className="relative w-[30px] portrait:sm:w-[36px] landscape:lg:w-[36px] h-full">
              <Image src="/download.svg" alt="download" fill />
            </div>
          </div>
          {/*--- navigation buttons ---*/}
          <div className="h-full flex items-center justify-center">
            <div
              className="pb-1 text-2xl sm:portrait:text-3xl md:landscape:text-3xl w-[44px] portrait:sm:w-[64px] landscape:lg:w-[64px] h-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-md lg:hover:opacity-40 active:opacity-40 cursor-pointer select-none"
              onClick={() => (pageNumber === 1 ? "" : setPageNumber(pageNumber - 1))}
            >
              {"\u2039"}
            </div>
            <div className="text-xl sm:portrait:text-3xl md:landscape:text-3xl w-[28px] portrait:sm:w-[40px] landscape:lg:w-[40px] text-center select-none mx-2">{pageNumber}</div>

            <div
              className="pb-1 text-2xl sm:portrait:text-3xl md:landscape:text-3xl w-[44px] portrait:sm:w-[64px] landscape:lg:w-[64px] h-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-md lg:hover:opacity-40 active:opacity-40 cursor-pointer select-none"
              onClick={() => (pageNumber == maxPageNumber ? "" : setPageNumber(pageNumber + 1))}
            >
              {"\u203A"}
            </div>
          </div>
          {/*--- search button ---*/}
          <div
            onClick={() => setIsSearch(true)}
            className="relative w-[44px] portrait:sm:w-[64px] landscape:lg:w-[64px] h-full border border-gray-300 rounded-md flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSearch} className="text-xl portrait:sm:text-2xl landscape:lg:text-2xl" />
          </div>
        </div>
        {/*--- SEARCH BAR ---*/}
        <div className={`${isSearch ? "translate-x-[0px]" : "translate-x-[100vw]"} w-full h-full flex justify-center items-center absolute transition-transform duration-700`}>
          <div className="w-[300px] portrait:sm:w-[420px] landscape:lg:w-[420px] pb-2 h-[64px] portrait:sm:h-[90px] landscape:lg:h-[90px] flex flex-col justify-between">
            <div className="w-full text-center textSm">Enter last 4 chars of customer's address</div>
            <div className="w-full h-[32px] portrait:sm:h-[48px] landscape:lg:h-[48px] flex space-x-2 portrait:sm:space-x-4 landscape:lg:space-x-4">
              <input
                onChange={(e) => {
                  setSearchedChars(e.currentTarget.value);
                }}
                value={searchedChars}
                className="px-2 w-[50%] h-full inputOutline textXl border-gray-400"
              ></input>
              <button
                onClick={() => {
                  const searchedTxnsTemp = transactionsState?.filter((i) => i.customerAddress.toLowerCase().slice(-4) == searchedChars.toLowerCase());
                  console.log(searchedTxnsTemp);
                  setSearchedTxns(searchedTxnsTemp);
                }}
                className="w-[25%] textSm h-full text-white border border-blue-500 rounded-[4px] bg-blue-500"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setSearchedTxns(null);
                  setSearchedChars("");
                  setIsSearch(false);
                }}
                className="w-[25%] textSm h-full border border-gray-500 rounded-[4px]"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*--- MODALS ---*/}
      {detailsModal && (
        <div>
          <div className="modal text-start portrait:sm:w-[480px] landscape:lg:w-[480px]">
            {/*---content---*/}
            <div className="flex flex-col space-y-2 portrait:sm:space-y-4 landscape:lg:space-y-4 font-medium textLg">
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
                <span className="text-gray-400 mr-1">Customer</span> <span className="break-all">{clickedTxn.customerAddress}</span>
              </p>
            </div>
            {/*--- BUTTONS ---*/}
            {clickedTxn.refund || refundStatus === "refunded" ? (
              <div className="text-center textLg font-bold text-gray-400">This payment has been refunded</div>
            ) : (
              <div className="w-full">
                {isAdmin ? (
                  <div className="w-full flex flex-col items-center space-y-6">
                    <button className="modalButtonBlue" onClick={onClickRefund}>
                      {refundStatus === "initial" && clickedTxn.refund == false && <div>Refund Now</div>}
                      {refundStatus === "processing" && (
                        <div className="flex items-center justify-center">
                          <SpinningCircleGray />
                        </div>
                      )}
                      {(refundStatus === "processed" || clickedTxn.refund == true) && "Refunded"}
                    </button>
                    <button className="modalButtonBlue" onClick={onClickRefundNote}>
                      {refundNoteStatus == "processing" ? (
                        <div className="flex items-center justify-center">
                          <SpinningCircleWhite />
                        </div>
                      ) : (
                        <div>
                          {refundNoteStatus == "true" ? "Remove " : "Add "}
                          "To Be Refunded" Note
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <button className="modalButtonBlue" onClick={onClickRefundNote}>
                    {refundNoteStatus == "processing" ? (
                      <div className="flex items-center justify-center">
                        <SpinningCircleWhite />
                      </div>
                    ) : (
                      <div>
                        {refundNoteStatus == "true" ? "Remove " : "Add "}
                        "To Be Refunded" Note
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="modalBlackout" onClick={() => setDetailsModal(false)}></div>
        </div>
      )}
      {downloadModal && (
        <div>
          <div className="modal">
            {/*---content---*/}
            <div className="w-full flex flex-col text-xl portrait:sm:text-2xl landscape:lg:text-2xl justify-center grow space-y-4">
              {/*---start---*/}
              <div className="w-full flex items-center justify-between">
                <div className="">Start Month</div>
                <div className="px-6 py-2 border border-gray-300 rounded-lg">
                  <select className="bg-white" value={selectedStartMonth} onChange={(e) => setSelectedStartMonth(e.target.value)}>
                    {downloadDates.map((i) => (
                      <option>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/*---end---*/}
              <div className="w-full flex items-center justify-between">
                <div className="">End Month</div>
                <div className="px-6 py-2 border border-gray-300 rounded-lg">
                  <select className="bg-white" value={selectedEndMonth} onChange={(e) => setSelectedEndMonth(e.target.value)}>
                    {downloadDates.map((i) => (
                      <option>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/*---buttons---*/}
            <div className="w-full space-y-6">
              <button className="modalButtonBlue" onClick={onClickDownload}>
                Download
              </button>
              <button
                className="modalButtonWhite"
                onClick={() => {
                  setSelectedEndMonth;
                  setDownloadModal(false);
                }}
              >
                Close
              </button>
            </div>
          </div>

          <div className="modalBlackout" onClick={() => setDownloadModal(false)}></div>
        </div>
      )}
      {refundAllModal && (
        <div>
          <div className="modal h-[330px] px-8 py-10 flex flex-col items-center">
            {/*---content---*/}
            <div className="w-full grow text-xl text-center flex items-center">Refund all payments marked as "To Be Refunded"?</div>
            <button className="mt-10 modalButtonBlue" onClick={onClickRefundAll}>
              Confirm
            </button>
          </div>
          <div className="modalBlackout" onClick={() => setRefundAllModal(false)}></div>
        </div>
      )}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </section>
  );
};

export default Payments;
