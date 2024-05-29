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
import DetailsModal from "./modals/DetailsModal";
// constants
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
import { currency2decimal, merchantType2data } from "@/utils/constants";
// other
import { addDays } from "date-fns";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { QRCodeSVG } from "qrcode.react";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, Transaction } from "@/db/models/UserModel";

// functions
export const getLocalTime = (mongoDate: string) => {
  const time = new Date(mongoDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  const timeObject = { time: time.split(" ")[0], ampm: time.split(" ")[1] };
  return timeObject;
};

// return format: April 2
export const getLocalDateWords = (mongoDate: string) => {
  let date = new Date(mongoDate).toLocaleDateString(undefined, { dateStyle: "long" }).split(",");
  return date[0];
};

// return format: 2024-04-02
export const getLocalDate = (mongoDate: string) => {
  let date = new Date(mongoDate).toLocaleString("en-GB").split(", ")[0].split("/");
  return `${date[2]}-${date[1]}-${date[0]}`;
};

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
  const [clickedTxn, setClickedTxn] = useState<Transaction | null>(null);
  const [clickedTxnIndex, setClickedTxnIndex] = useState<number | null>(null);
  const [refundStatus, setRefundStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [refundAllStatus, setRefundAllStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [toRefundStatus, setToRefundStatus] = useState("processing"); // "false" | "processing" | "true"
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedStartMonth, setSelectedStartMonth] = useState("select");
  const [selectedEndMonth, setSelectedEndMonth] = useState("select");
  const [exportStartMonth, setExportStartMonth] = useState("select");
  const [exportEndMonth, setExportEndMonth] = useState("select");
  // modal states
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
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

  // hooks
  const config = useConfig();
  const router = useRouter();

  const onClickTxn = async (e: any) => {
    const txnHash = e.currentTarget.id;
    const clickedTxnIndexTemp = transactionsState.findIndex((i: any) => i.txnHash === txnHash);
    if (clickedTxnIndexTemp == undefined) {
      return;
    }
    const clickedTxnTemp = transactionsState[clickedTxnIndexTemp];
    setClickedTxnIndex(clickedTxnIndexTemp);
    setClickedTxn(clickedTxnTemp);
    setDetailsModal(true);
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
        args: [clickedTxn?.customerAddress, parseUnits(clickedTxn?.tokenAmount.toString() ?? "0", 6)],
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
        body: JSON.stringify({ merchantEvmAddress: paymentSettingsState.merchantEvmAddress, refundHash: refundHash, txnHash: clickedTxn?.txnHash }),
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
    // immediately update the state
    setClickedTxn({ ...clickedTxn!, toRefund: clickedTxn?.toRefund ? false : true });
    // save to db
    const res = await fetch("/api/toRefund", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ merchantEvmAddress: paymentSettingsState.merchantEvmAddress, txnHash: clickedTxn?.txnHash, toRefund: clickedTxn?.toRefund }),
    });
    const data = await res.json();
    if (data == "saved") {
      console.log('"To Refund" status saved');
      let transactionsStateTemp = [...transactionsState]; // create shallow copy of transactionsState
      transactionsStateTemp[clickedTxnIndex!].toRefund = transactionsStateTemp[clickedTxnIndex!].toRefund ? false : true;
      setTransactionsState(transactionsStateTemp);
    } else {
      console.log('Error: "To Refund" status not saved');
      if (data.status == "error") {
        setErrorMsg(data.message);
      } else {
        setErrorMsg("Refund status was not saved to database");
      }
      setErrorModal(true);
      // revert clickedTxn state to match original
      setClickedTxn({ ...clickedTxn!, toRefund: transactionsState[clickedTxnIndex!].toRefund });
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
          yearmonthArray.push(`${i}/${year}`);
        }
      } else if (year === firstyear && firstyear != lastyear) {
        for (let i = firstmonth; i < 13; i++) {
          yearmonthArray.push(`${i}/${year}`);
        }
      } else if (year === lastyear && firstyear != lastyear) {
        for (let i = 1; i < lastmonth + 1; i++) {
          yearmonthArray.push(`${i}/${year}`);
        }
      } else {
        for (let i = 1; i < 13; i++) {
          yearmonthArray.push(`${i}/${year}`);
        }
      }
    }
    setDownloadDates(yearmonthArray);
    console.log(yearmonthArray);
    setExportStartMonth(yearmonthArray.slice(-1)[0]);
    setExportEndMonth(yearmonthArray.slice(-1)[0]);
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
    <section className="w-full flex-1 flex flex-col items-center">
      {/*--- TOP BAR h-120px/140px ---*/}
      <div className="flex-none paymentsWidth h-[120px] portrait:sm:h-[140px] landscape:lg:h-[140px] landscape:xl:desktotp:h-[120px] flex items-center justify-between relative">
        {/*--- search button + download button ---*/}
        <div className="h-full flex items-center space-x-8 portrait:sm:space-x-12 landscape:lg:space-x-12">
          {/*--- search ---*/}
          <div className="flex flex-col items-center desktop:hover:opacity-50 active:opacity-50 cursor-pointer" onClick={() => setSearchModal(true)}>
            <div className="w-[44px] h-[44px] portrait:sm:w-[60px] portrait:sm:h-[60px] landscape:lg:w-[60px] landscape:lg:h-[60px] landscape:xl:desktop:w-[40px] landscape:xl:desktop:h-[40px] bg-gray-200 rounded-full flex items-center justify-center">
              <div className="relative w-[20px] portrait:sm:w-[28px] landscape:lg:w-[28px] landscape:xl:desktop:w-[20px] h-full">
                <Image src="/search.svg" alt="search" fill />
              </div>
            </div>
            <div className="menuText">SEARCH</div>
          </div>
          {/*--- download ---*/}
          <div
            className="flex flex-col items-center desktop:hover:opacity-50 active:opacity-50 cursor-pointer"
            onClick={() => {
              createDownloadDates();
              setExportModal(true);
            }}
          >
            <div className="w-[44px] h-[44px] portrait:sm:w-[64px] portrait:sm:h-[64px] landscape:lg:w-[64px] landscape:lg:h-[64px] landscape:xl:desktop:w-[40px] landscape:xl:desktop:h-[40px] bg-gray-200 rounded-full flex justify-center items-center">
              <div className="relative w-[20px] portrait:sm:w-[28px] landscape:lg:w-[28px] landscape:xl:desktop:w-[20px] h-full">
                <Image src="/export.svg" alt="download" fill />
              </div>
            </div>
            <div className="menuText ">EXPORT</div>
          </div>
        </div>
        {/*--- qr code ---*/}
        <div
          className="flex flex-col items-center desktop:hover:opacity-50 active:opacity-50 cursor-pointer"
          onClick={() => {
            console.log(paymentSettingsState.qrCodeUrl);
            setQrModal(true);
          }}
        >
          <div className="w-[44px] h-[44px] portrait:sm:w-[60px] landscape:lg:w-[60px] landscape:xl:desktop:w-[40px] landscape:xl:desktop:h-[40px] flex justify-center items-center">
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
      <div className="w-full portrait:h-[calc(100vh-84px-120px)] landscape:h-[calc(100vh-120px)] portrait:sm:h-[calc(100vh-140px-140px)] landscape:lg:h-[calc(100vh-120px)] flex justify-center overflow-y-auto select-none relative">
        <table className="paymentsWidth h-full table-fixed text-left">
          {/*---table header, absolute, 28px/32px ---*/}
          <thead className="sticky top-[-1px] w-full h-[28px] portrait:sm:h-[32px] landscape:lg:h-[32px] paymentsHeaderFont z-[1] bg-white">
            <tr className="">
              <th className="border-[0px]">Time</th>
              <th className="text-center">Customer</th>
              {paymentSettingsState.merchantFields.includes("daterange") && <th className="px-2">Dates</th>}
              {paymentSettingsState.merchantFields.includes("date") && <th className="px-2">Date</th>}
              {paymentSettingsState.merchantFields.includes("time") && <th className="px-2">Time</th>}
              {paymentSettingsState.merchantFields.includes("item") && <th>{merchantType2data[paymentSettingsState.merchantBusinessType]["itemlabel"]}</th>}
              {paymentSettingsState.merchantFields.includes("count") && (
                <th className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""}`}>Guests</th>
              )}
              {paymentSettingsState.merchantFields.includes("sku") && <th className="">SKU#</th>}
              <th className="text-right pr-2 border-[0px]">{paymentSettingsState.merchantCurrency}</th>
            </tr>
          </thead>
          {/*--- table body ---*/}
          <tbody>
            {(searchedTxns.length != 0 ? searchedTxns : transactionsState).toReversed().map((txn: any, index: number) => (
              <tr
                className={`${
                  txn.refund ? "text-gray-400" : ""
                } w-full portrait:h-[calc((100vh-84px-120px-28px-0px)/6)] landscape:h-[80px] portrait:sm:h-[calc((100vh-140px-140px-32px)/6)] landscape:lg:h-[calc((100vh-140px-32px)/6)] flex-none border-t lg:hover:bg-gray-200 active:bg-gray-200 lg:cursor-pointer relative`}
                id={txn.txnHash}
                key={index}
                onClick={onClickTxn}
              >
                {/*---Time---*/}
                <td className="whitespace-nowrap">
                  {txn.toRefund && (
                    <div
                      // @ts-ignore
                      style={{ "writing-mode": "tb-rl" }}
                      className="absolute left-[-32px] portrait:pr-1 portrait:sm:pr-0 bottom-0 text-center textSm portrait:lg:text-xl landscape:xl:text-xl landscape:xl:desktop:text-base font-medium rotate-[180deg] bg-gray-200 h-full overflow-hidden"
                    >
                      To Refund
                    </div>
                  )}

                  <div className="relative">
                    <span className="text-3xl portrait:sm:text-4xl landscape:lg:text-4xl portrait:lg:text-5xl landscape:xl:text-5xl landscape:xl:desktop:text-3xl">
                      {getLocalTime(txn.date).time}
                    </span>
                    <span className="portrait:text-sm landscape:text-xl portrait:sm:text-xl landscape:lg:text-xl ml-1 font-medium">{getLocalTime(txn.date).ampm}</span>
                    <div className="portrait:text-sm landscape:text-sm portrait:sm:text-xl landscape:lg:text-lg landscape:xl:desktop:text-base portrait:leading-none landscape:leading-none portrait:sm:leading-tight landscape:lg:leading-tight landscape:xl:desktop:leading-tight absolute top-[calc(100%-1px)] font-medium text-gray-400">
                      {getLocalDateWords(txn.date)}
                    </div>
                  </div>
                </td>
                {/*---Customer---*/}
                <td className="text-center">
                  {paymentSettingsState.merchantPaymentType === "inperson" && (
                    <div className="text-xl portrait:sm:text-3xl landscape:lg:text-3xl portrait:lg:text-4xl landscape:xl:text-4xl landscape:xl:desktop:text-2xl pt-2 pr-1">
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
                <td className="text-3xl landscape:lg:text-4xl landscape:xl:text-5xl sm:portrait:sm:text-4xl portrait:lg:text-5xl landscape:xl:desktop:text-3xl text-end pr-2">
                  {txn.currencyAmount.toFixed(currency2decimal[paymentSettingsState.merchantCurrency])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactionsState.length == 0 && <div className="w-full h-full flex items-center justify-center textLg">No payments</div>}
      </div>

      {/*--- SEARCH MODAL ---*/}
      <div className={`${searchModal ? "" : "hidden"} fixed inset-0 z-10`} onClick={() => setSearchModal(false)}></div>
      <div id="searchModal" className={`${searchModal ? "translate-x-[0%]" : "translate-x-[-100%]"} sidebar`}>
        {/*--- header + close ---*/}
        <div className="flex-none w-full h-[52px] portrait:sm:h-[60px] landscape:lg:h-[60px] flex items-end">
          <div className={`w-full flex justify-center items-center`}>
            {" "}
            <div className="textXl font-medium">{showCalendar ? "" : "Search Payments By"}</div>
            <div
              className="absolute right-5 text-2xl font-bold px-2 cursor-pointer portrait:sm:hidden landscape:lg:hidden"
              onClick={() => {
                setSearchModal(false);
                clearFilter();
              }}
            >
              &#10005;
            </div>
          </div>
        </div>
        {/*--- filters ---*/}
        {!showCalendar ? (
          <div className="flex-none mt-4 h-[360px] textLg w-[88%] flex flex-col">
            {/*--- customer's address ---*/}
            <div className="h-[25%] flex items-center justify-between border-b border-gray-500">
              <div className="font-medium">Customer's Address</div>
              <input
                className="w-[158px] h-[48px] px-3 text-end rounded-[4px] placeholder:italic placeholder:text-base border border-gray-700 outline-none focus:placeholder:text-transparent"
                onChange={(e) => {
                  setLast4Chars(e.currentTarget.value);
                }}
                value={last4Chars}
                placeholder="Enter last 4 chars"
              />
            </div>
            {/*--- "to refund" payments ---*/}
            <div className="h-[25%] flex items-center justify-between border-b border-gray-500">
              <div className="textLg font-medium">"To Refund" Payments</div>
              <input type="checkbox" className="w-[30px] h-[30px] rounded-md border border-gray-400" />
            </div>
            {/*--- refunded payments ---*/}
            <div className="h-[25%] flex items-center justify-between border-b border-gray-500">
              <div className="textLg font-medium">Refunded Payments</div>
              <input type="checkbox" className="w-[30px] h-[30px] rounded-md border border-gray-400" />
            </div>
            {/*--- date ---*/}
            <div className="h-[25%] flex items-center justify-between">
              <div className="textLg font-medium">Date</div>
              <div
                className={`${
                  searchDate && searchDate.to ? "space-x-6 pl-3" : "textBase px-3 text-gray-400 italic justify-end cursor-pointer"
                } min-w-[158px] h-[48px] flex items-center bg-white rounded-[4px] border border-gray-700`}
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
        <div className="mt-6 mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-full flex flex-col items-center space-y-12">
          <button className={`${showCalendar ? "hidden" : ""} modalButtonBlue`} onClick={search}>
            Apply
          </button>
          <button
            className={`${showCalendar ? "hidden" : ""} hidden portrait:sm:block landscape:lg:block modalButtonWhite`}
            onClick={() => {
              setSearchModal(false);
              clearFilter();
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/*--- EXPORT MODAL ---*/}
      <div className={`${exportModal ? "" : "hidden"} fixed inset-0 z-10`} onClick={() => setExportModal(false)}></div>
      <div id="exportModal" className={`${exportModal ? "translate-x-[0%]" : "translate-x-[-100%]"} sidebar`}>
        {/*--- header + close ---*/}
        <div className="w-full h-[52px] portrait:sm:h-[60px] landscape:lg:h-[60px] flex items-end">
          <div className={`w-full flex justify-center items-center`}>
            <div className="textXl font-medium">Export Payments History</div>
            <div
              className="absolute right-5 text-2xl font-bold px-2 cursor-pointer portrait:sm:hidden landscape:lg:hidden"
              onClick={() => {
                setExportModal(false);
                setExportStartMonth("select");
                setExportEndMonth("select");
              }}
            >
              &#10005;
            </div>
          </div>
        </div>
        {/*--- content ---*/}
        <div className="mt-12 textLg w-[83%] flex flex-col space-y-10">
          {/*---start month---*/}
          <div className="w-full flex items-center justify-between">
            <div className="font-medium">Starting Month/Year</div>
            <select className="bg-white px-3 py-2 rounded-[4px]" value={exportStartMonth} onChange={(e) => setExportStartMonth(e.target.value)}>
              {downloadDates.map((i) => (
                <option>{i}</option>
              ))}
            </select>
          </div>
          {/*---end month---*/}
          <div className="w-full flex items-center justify-between">
            <div className="font-medium">Ending Month/Year</div>
            <select className="bg-white px-3 py-2 rounded-[4px]" value={exportEndMonth} onChange={(e) => setExportEndMonth(e.target.value)}>
              {downloadDates.map((i) => (
                <option>{i}</option>
              ))}
            </select>
          </div>
        </div>
        {/*--- button ---*/}
        <div className="mt-12 mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-[83%] flex flex-col items-center space-y-12">
          <button className={`${showCalendar ? "hidden" : ""} modalButtonBlue`} onClick={search}>
            Export
          </button>
          <button
            className={`${showCalendar ? "hidden" : ""} hidden portrait:sm:block landscape:lg:block modalButtonWhite`}
            onClick={() => {
              setExportModal(false);
              clearFilter();
            }}
          >
            Close
          </button>
        </div>
      </div>

      {qrModal && (
        <div>
          <div className="fixed inset-0 z-[10] bg-black">
            {/*--- close button ---*/}
            <div className="absolute top-[0px] w-full px-3 portrait:sm:px-8 landscape:lg:px-8 pt-3 portrait:sm:pt-8 landscape:lg:pt-8 text-white z-[30] flex justify-end">
              <div className="w-[60px] h-[60px] rounded-full portrait:sm:border-2 landscape:lg:border-2 border-white flex items-center justify-center cursor-pointer desktop:hover:opacity-80 active:opacity-80">
                <div className="text-4xl" onClick={() => setQrModal(false)}>
                  &#10005;
                </div>
              </div>
            </div>
            {/*--- export button ---*/}
            <div className="absolute bottom-0 w-full px-6 pb-5 portrait:sm:px-10 landscape:lg:px-10 portrait:sm:pb-10 landscape:lg:pb-10 text-white z-[30] flex">
              <div className="flex flex-col items-center justify-center cursor-pointer desktop:hover:opacity-80 active:opacity-80">
                <div className="relative w-[24px] h-[24px] sm:w-[28px] sm:h-[28px]">
                  <Image src="/exportWhite.svg" alt="export" fill />
                </div>
                <div className="mt-0.5 font-medium text-sm sm:text-base">EXPORT</div>
              </div>
            </div>
          </div>
          <div className="portrait:w-full portrait:h-[calc(100vw*1.4142)] landscape:w-[calc(100vh/1.4142)] portrait:max-w-[560px] portrait:max-h-[calc(560px*1.4142)] landscape:h-screen fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-[20]">
            <div className="w-full h-full relative">
              <Image src="/placard.svg" alt="placard" fill />
            </div>
          </div>
          <div className="fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[20]">
            <QRCodeSVG
              xmlns="http://www.w3.org/2000/svg"
              size={
                window.innerWidth > window.innerHeight
                  ? Math.round((window.innerHeight / 1.4142) * (210 / 424.26))
                  : window.innerWidth > 560
                  ? Math.round(560 * 1.4142 * (210 / 424.26))
                  : Math.round(window.innerWidth * (210 / 424.26))
              }
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"L"}
              value={paymentSettingsState?.qrCodeUrl ?? ""}
            />
          </div>
        </div>
      )}

      {/*--- DETAILS MODAL ---*/}
      {detailsModal && (
        <DetailsModal
          clickedTxn={clickedTxn}
          setClickedTxn={setClickedTxn}
          refundStatus={refundStatus}
          toRefundStatus={toRefundStatus}
          setDetailsModal={setDetailsModal}
          isAdmin={isAdmin}
          onClickRefund={onClickRefund}
          onClickToRefund={onClickToRefund}
        />
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
