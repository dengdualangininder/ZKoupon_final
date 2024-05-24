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
// other
import { addDays } from "date-fns";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
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
  const [toRefundStatus, setToRefundStatus] = useState("processing"); // "false" | "processing" | "true"
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedStartMonth, setSelectedStartMonth] = useState("select");
  const [selectedEndMonth, setSelectedEndMonth] = useState("select");
  // modal states
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadDates, setDownloadDates] = useState<string[]>([]);
  const [refundAllModal, setRefundAllModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  // filter states
  const [searchedTxns, setSearchedTxns] = useState<Transaction[]>([]);
  const [last4Chars, setLast4Chars] = useState("");
  const [showToRefund, setShowToRefund] = useState(false);
  const [showRefunded, setShowRefunded] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(undefined);

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
    setToRefundStatus(clickedTxnTemp.toRefund ? "true" : "false");
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

  const onClickToRefund = async () => {
    console.log("onClickToRefund, clickedTxn:", clickedTxn);
    setToRefundStatus("processing");
    // save to db
    const res = await fetch("/api/toRefund", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ merchantEvmAddress: paymentSettingsState.merchantEvmAddress, txnHash: clickedTxn.txnHash, toRefund: clickedTxn.toRefund }),
    });
    const data = await res.json();
    console.log("toRefund api response:", data);
    // success or error
    if (data == "saved") {
      setToRefundStatus(clickedTxn.toRefund ? "false" : "true");
      let transactionsStateTemp = [...transactionsState]; // create shallow copy of transactionsState
      transactionsStateTemp[clickedTxnIndex!].toRefund = !clickedTxn.toRefund;
      setTransactionsState(transactionsStateTemp);
    } else {
      if (data.status == "error") {
        setErrorMsg(data.message);
      } else {
        setErrorMsg("Refund status was not saved to database");
      }
      setToRefundStatus(clickedTxn.toRefund ? "true" : "false");
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

  const clearFilter = () => {
    setShowCalendar(false);
    setSearchDate(undefined);
    setLast4Chars("");
  };

  const search = async () => {
    // if no search criteria selected and user clicks "Apply" button
    if (!last4Chars && !showRefunded && !showToRefund && !searchDate?.to) {
      setErrorModal(true);
      setErrorMsg("Please select a search criteria");
      return;
    }

    // filter search
    let searchedTxnsTemp: Transaction[] = transactionsState;
    if (last4Chars) {
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => i.customerAddress.toLowerCase().slice(-4) == last4Chars.toLowerCase());
    }
    if (showToRefund) {
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => i.toRefund == true);
    }
    if (showRefunded) {
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => i.refund == true);
    }
    if (searchDate?.to) {
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => i.customerAddress.toLowerCase().slice(-4) == last4Chars.toLowerCase());
    }
    setSearchedTxns(searchedTxnsTemp);
  };

  return (
    <section className="w-full flex flex-col items-center">
      {/*--- TOP BAR h-120px ---*/}
      <div className="w-[90%] portrait:sm:max-w-[80%] landscape:max-w-[720px] h-[120px] portrait:sm:h-[140px] landscape:lg:h-[140px] landscape:xl:desktotp:h-[120px] flex items-center justify-between relative">
        {/*--- search button + download button ---*/}
        <div className="h-full flex items-center space-x-8 portrait:sm:space-x-12 landscape:lg:space-x-12">
          {/*--- search ---*/}
          <div className="flex flex-col items-center desktop:hover:opacity-50 active:opacity-50 cursor-pointer" onClick={() => setSearchModal(!searchModal)}>
            <div className="w-[44px] h-[44px] portrait:sm:w-[60px] portrait:sm:h-[60px] landscape:lg:w-[60px] landscape:lg:h-[60px] landscape:xl:desktop:w-[40px] landscape:xl:desktop:h-[40px] bg-gray-200 rounded-full flex items-center justify-center select-none">
              <div className="relative w-[20px] portrait:sm:w-[28px] landscape:lg:w-[28px] landscape:xl:desktop:w-[20px] h-full">
                <Image src="/search.svg" alt="search" fill />
              </div>
            </div>
            <div className="menuText">SEARCH</div>
          </div>
          {/*--- download ---*/}
          <div className="flex flex-col items-center">
            <div
              className="w-[44px] h-[44px] portrait:sm:w-[64px] portrait:sm:h-[64px] landscape:lg:w-[64px] landscape:lg:h-[64px] landscape:xl:desktop:w-[40px] landscape:xl:desktop:h-[40px] bg-gray-200 rounded-full flex justify-center items-center cursor-pointer lg:hover:opacity-50 active:opacity-50 select-none"
              onClick={() => {
                createDownloadDates();
                setDownloadModal(true);
              }}
            >
              <div className="relative w-[20px] portrait:sm:w-[28px] landscape:lg:w-[28px] landscape:xl:desktop:w-[20px] h-full">
                <Image src="/download.svg" alt="download" fill />
              </div>
            </div>
            <div className="menuText">DOWNLOAD</div>
          </div>
        </div>
        {/*--- qr code ---*/}
        <div className="flex flex-col items-center">
          <div className="w-[44px] h-[44px] portrait:sm:w-[60px] landscape:lg:w-[60px] landscape:xl:desktop:w-[40px] landscape:xl:desktop:h-[40px] flex justify-center items-center cursor-pointer lg:hover:opacity-50 active:opacity-50 select-none">
            <div className="relative w-[28px] h-[28px] portrait:sm:w-[40px] portrait:sm:h-[40px] landscape:lg:w-[40px] landscape:lg:h-[40px] landscape:xl:desktop:w-[24px] landscape:xl:desktop:h-[28px]">
              <Image src="/qr.svg" alt="QR code" fill />
            </div>
          </div>
          <div className="menuText">QR CODE</div>
        </div>
        {/*--- SEARCH BAR ---*/}
        {/* <div className={`${isSearch ? "translate-x-[0px]" : "translate-x-[100vw]"} w-full h-full flex justify-center items-center absolute transition-transform duration-500`}>
          <div className="w-[300px] portrait:sm:w-[420px] landscape:lg:w-[420px] pb-2 h-[68px] portrait:sm:h-[90px] landscape:lg:h-[90px] flex flex-col justify-between">
            <div className="w-full text-center textSm">Enter last 4 chars of the customer's address</div>
            <div className="w-full h-[40px] portrait:sm:h-[48px] landscape:lg:h-[48px] flex space-x-2 portrait:sm:space-x-4 landscape:lg:space-x-4">
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
                  setSearchedTxns(searchedTxnsTemp);
                }}
                className="w-[25%] textSm h-full text-white border border-blue-500 rounded-[4px] bg-blue-500"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setSearchedTxns([]);
                  setSearchedChars("");
                  setIsSearch(false);
                }}
                className="w-[25%] textSm h-full border border-gray-500 rounded-[4px]"
              >
                Exit
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/*--- Table or "no payments" ---*/}
      <div className="w-full select-none">
        <table className="w-full table-fixed text-left">
          {/*---headers, 28px/32px ---*/}
          <thead className="w-full h-[28px] portrait:sm:h-[32px] landscape:lg:h-[32px] table text-base portrait:sm:text-2xl landscape:lg:text-2xl landscape:xl:desktop:text-lg sticky z-[2]">
            <tr className="w-[90%] portrait:sm:max-w-[80%] landscape:max-w-[720px] bg-red-300">
              <th className="sticky">Time</th>
              <th className="text-center sticky">Customer</th>
              {paymentSettingsState.merchantFields.includes("daterange") && <th className="px-2">Dates</th>}
              {paymentSettingsState.merchantFields.includes("date") && <th className="px-2">Date</th>}
              {paymentSettingsState.merchantFields.includes("time") && <th className="px-2">Time</th>}
              {paymentSettingsState.merchantFields.includes("item") && <th className="">{merchantType2data[paymentSettingsState.merchantBusinessType]["itemlabel"]}</th>}
              {paymentSettingsState.merchantFields.includes("count") && (
                <th className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""}`}>Guests</th>
              )}
              {paymentSettingsState.merchantFields.includes("sku") && <th className="">SKU#</th>}
              <th className="text-right pr-2 sticky">{paymentSettingsState.merchantCurrency}</th>
            </tr>
          </thead>
          {/*--- table body ---*/}
          <tbody className="w-full portrait:h-[calc(100vh-84px-120px-28px-2px)] flex flex-col items-center overflow-y-auto">
            {(searchedTxns.length != 0 ? searchedTxns : transactionsState).toReversed().map((txn: any, index: number) => (
              <tr
                className={`${
                  txn.refund ? "text-gray-400" : ""
                } w-[90%] portrait:sm:max-w-[80%] landscape:max-w-[720px] portrait:h-[calc((100vh-84px-120px-28px-4px)/6)] portrait:sm:h-[calc((100vh-140px-140px-32px-4px)/6)] landscape:h-[90px] landscape:lg:h-[calc((100vh-140px-32px-4px)/6)] flex-none border-t lg:hover:bg-gray-200 active:bg-gray-200 lg:cursor-pointer`}
                id={txn.txnHash}
                key={index}
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
                        txn.toRefund && !txn.refund ? "" : "hidden"
                      } absolute top-[calc(100%)] pr-0.5 right-0 text-sm landscape:lg:text-lg portrait:sm:text-lg font-medium leading-none text-gray-400 whitespace-nowrap`}
                    >
                      To Be Refunded
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactionsState.length == 0 && <div className="w-full h-full flex items-center justify-center textLg">No payments</div>}
      </div>

      {/*--- SEARCH MODAL ---*/}
      <div
        className={`${
          searchModal ? "translate-y-[0%]" : "translate-y-[calc(100%+84px+4px)]"
        } absolute bottom-0 w-full h-[560px] flex flex-col items-center rounded-tl-[32px] rounded-tr-[32px] bg-gray-200 z-[10] transition-transform duration-500`}
      >
        {/*--- header + close ---*/}
        <div className={` w-full h-[80px] flex items-center justify-center flex-none`}>
          <div className="textXl font-medium">{showCalendar ? "" : "SEARCH"}</div>
          <div
            className="absolute right-5 text-2xl font-bold px-2 cursor-pointer"
            onClick={() => {
              setSearchModal(!searchModal);
              clearFilter();
            }}
          >
            &#10005;
          </div>
        </div>
        {/*--- filters ---*/}
        {!showCalendar ? (
          <div className="textLg flex-1 pl-3 pr-6 w-full flex flex-col justify-between">
            {/*--- customer's address ---*/}
            <div className="h-[25%] flex items-center justify-between border-b border-gray-300">
              <div className="font-medium">Customer's Address</div>
              <input
                className="w-[160px] h-[48px] px-3 text-end rounded-[4px] placeholder:italic placeholder:text-base border border-gray-700 outline-none focus:placeholder:text-transparent"
                onChange={(e) => {
                  setLast4Chars(e.currentTarget.value);
                }}
                value={last4Chars}
                placeholder="Enter last 4 chars"
              />
            </div>
            {/*--- "to refund" payments ---*/}
            <div className="h-[25%] flex items-center justify-between border-b border-gray-300">
              <div className="textLg font-medium">"To Refund" Payments</div>
              <input type="checkbox" className="w-[30px] h-[30px] rounded-md border border-gray-400" />
            </div>
            {/*--- refunded payments ---*/}
            <div className="h-[25%] flex items-center justify-between border-b border-gray-300">
              <div className="textLg font-medium">Refunded Payments</div>
              <input type="checkbox" className="w-[30px] h-[30px] rounded-md border border-gray-400" />
            </div>
            {/*--- date ---*/}
            <div className="h-[25%] flex items-center justify-between">
              <div className="textLg font-medium">Date</div>
              <div
                className={`${
                  searchDate && searchDate.to ? "space-x-6 pl-3" : "textBase px-3 text-gray-400 italic justify-end cursor-pointer"
                } min-w-[160px] h-[48px] flex items-center bg-white rounded-[4px] border border-gray-700`}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <div>{searchDate && searchDate.to ? `${searchDate.from?.toLocaleDateString()} - ${searchDate.to.toLocaleDateString()}` : "Select dates"}</div>
                <div
                  className={`${searchDate && searchDate.to ? "" : "hidden"} pl-1 pr-3 cursor-pointer`}
                  onClick={(e) => {
                    setSearchDate(undefined);
                    e.stopPropagation();
                  }}
                >
                  &#10005;
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center mt-6 scale-[115%]">
            <DayPicker mode="range" selected={searchDate} onSelect={setSearchDate} />
            <div className="mt-2 text-sm font-semibold w-full h flex items-start justify-center space-x-4">
              <button
                className="px-6 py-3 border border-gray-500 text-gray-500 rounded-full"
                onClick={() => {
                  setShowCalendar(false);
                  setSearchDate(undefined);
                }}
              >
                Cancel
              </button>
              <button className=" bg-blue-500 rounded-full text-white py-3 px-6" onClick={() => setShowCalendar(false)}>
                Confirm Dates
              </button>
            </div>
          </div>
        )}
        {/*--- button ---*/}
        <button className={`${showCalendar ? "hidden" : ""} mt-8 mb-12 modalButtonBlue`} onClick={search}>
          Apply
        </button>
      </div>

      {/*--- DETAILS MODAL ---*/}
      {detailsModal && (
        <div className="w-full flex flex-col items-center h-screen absolute inset-0 bg-white overflow-y-auto z-[10]">
          {/*--- title + close button ---*/}
          <div className="w-full h-[10%] min-h-[60px] flex items-center justify-center">
            <div className="textXl font-semibold">Payment Details</div>
            <div className="absolute right-5 text-3xl p-2 cursor-pointer" onClick={() => setDetailsModal(false)}>
              &#10005;
            </div>
          </div>
          {/*--- details + button ---*/}
          <div className="w-[340px] flex flex-col space-y-4 portrait:md:space-y-4 landscape:lg:space-y-4 font-medium textLg">
            {/*--- details ---*/}
            <div className="flex flex-col">
              <div className="text-gray-400">Time</div>
              <div className="font-normal textXl">
                {getLocalDate(clickedTxn.date)} {getLocalTime(clickedTxn.date).time} {getLocalTime(clickedTxn.date).ampm}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-gray-400 mr-1">Payment Value</div>
              <div className="font-normal textXl">
                {clickedTxn.currencyAmount} {clickedTxn.merchantCurrency}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-gray-400 mr-1">Tokens Received</div>
              <div className="font-normal textXl">{clickedTxn.tokenAmount} USDC</div>
            </div>
            <div className="flex flex-col">
              <div className="text-gray-400 mr-1">Rate</div>
              <div className="font-normal textXl">{clickedTxn.blockRate}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-gray-400 mr-1">Customer</div>
              <div className="font-normal textXl break-all">{clickedTxn.customerAddress}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-gray-400 mr-1">Notes</div>
              <div className="min-h-[50px]">{clickedTxn.refundNote}</div>
            </div>
            {/*--- button ---*/}
            {clickedTxn.refund || refundStatus === "refunded" ? (
              <div className="pt-4 text-center textLg font-bold text-gray-400">This payment has been refunded</div>
            ) : (
              <div className="pt-4 w-full">
                {isAdmin ? (
                  <div className="w-full flex flex-col items-center space-y-6">
                    <button className="modalButtonBlue" onClick={onClickRefund}>
                      {refundStatus === "initial" && clickedTxn.refund == false && <div>REFUND NOW</div>}
                      {refundStatus === "processing" && (
                        <div className="flex items-center justify-center">
                          <SpinningCircleGray />
                        </div>
                      )}
                      {(refundStatus === "processed" || clickedTxn.refund == true) && "Refunded"}
                    </button>
                  </div>
                ) : (
                  <button className="modalButtonBlue" onClick={onClickToRefund}>
                    {toRefundStatus == "processing" ? (
                      <div className="flex items-center justify-center">
                        <SpinningCircleWhite />
                      </div>
                    ) : (
                      <div>
                        {toRefundStatus == "true" ? "Remove " : "Add "}
                        "To Be Refunded" Note
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/*--- DOWNLOAD MODAL ---*/}
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
