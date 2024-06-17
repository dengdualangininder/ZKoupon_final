"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
//wagmi
import { useConfig } from "wagmi";
import { writeContract } from "@wagmi/core";
import { parseUnits } from "viem";
// components
import QrCodeModal from "./modals/QrCodeModal";
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
import { useTheme } from "next-themes";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
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

const Payments = ({ transactionsState, setTransactionsState, paymentSettingsState, isAdmin }: { transactionsState: Transaction[]; setTransactionsState: any; paymentSettingsState: PaymentSettings; isAdmin: boolean }) => {
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
  const [fillerRows, setFillerRows] = useState<number[] | null>(transactionsState.length < 6 ? Array.from(Array(6 - transactionsState.length).keys()) : null);
  const [scrollWidth, setScrollWidth] = useState("16");
  // modal states
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState(false);
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
  const { theme } = useTheme();

  useEffect(() => {
    const scrollWidthTemp = (document?.querySelector("#table") as HTMLElement).offsetWidth - (document?.querySelector("#table") as HTMLElement).clientWidth;
    setScrollWidth(scrollWidthTemp.toString());
  }, []);

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

    if (searchedTxnsTemp.length < 6) {
      setFillerRows(Array.from(Array(6 - searchedTxnsTemp.length).keys()));
    }
  };

  return (
    <section className="w-full flex flex-col items-center">
      {/*--- TOP BAR h-140px/180px/160px ---*/}
      <div className="flex-none w-full h-[140px] portrait:sm:h-[180px] landscape:lg:h-[180px] landscape:xl:desktop:h-[160px] flex flex-col">
        {/*--- shaded region ---*/}
        <div className={`flex-1 flex flex-col items-center bg-gradient-to-br from-[15%] to-[85%] from-light2 to-light4 dark:from-dark2 dark:to-dark4 landscape:dark:to-dark1 landscape:dark:from-dark1 pr-[${scrollWidth}px]`}>
          {/*--- buttons ---*/}
          <div className="px-2 paymentsWidth h-[65%] flex items-center justify-between">
            {/*--- left buttons ---*/}
            <div className="h-full flex items-center space-x-8 portrait:sm:space-x-14 landscape:lg:space-x-14 portrait:lg:space-x-16 landscape:xl:space-x-16">
              <div className="paymentsIconContainer" onClick={() => setSearchModal(true)}>
                <div className="paymentsIcon">
                  <Image src={theme == "dark" ? "/searchWhite.svg" : "/searchBlack.svg"} alt="search" fill />
                </div>
              </div>
              <div
                className="paymentsIconContainer"
                onClick={() => {
                  createDownloadDates();
                  setExportModal(true);
                }}
              >
                <div className="paymentsIcon">
                  <Image src={theme == "dark" ? "/exportWhite.svg" : "/exportBlack.svg"} alt="export" fill />
                </div>
              </div>
            </div>
            {/*--- qrCode button ---*/}
            <div className="paymentsIconContainer" onClick={() => setQrCodeModal(true)}>
              <div className="paymentsIcon">
                <Image src={theme == "dark" ? "/qrWhite.svg" : "/qrBlack.svg"} alt="qrCode" fill />
              </div>
            </div>
          </div>

          {/*--- Table Headers ---*/}
          <div className="w-full flex-1 flex justify-center items-end pb-1 portrait:sm:pb-3 landscape:lg:pb-3">
            <div className="paymentsWidth paymentsHeaderFont grid grid-cols-[28%_35%_37%] pb-2 landscape:dark:border-b-2 landscape:dark:border-dark5">
              <div className="portrait:pl-2 portrait:sm:pl-0 text-start">Time</div>
              <div className="text-end">{paymentSettingsState.merchantCurrency}</div>
              <div className="text-end">Customer</div>
              {/* {paymentSettingsState.merchantFields.includes("daterange") && <th className="px-2">Dates</th>}
              {paymentSettingsState.merchantFields.includes("date") && <th className="px-2">Date</th>}
              {paymentSettingsState.merchantFields.includes("time") && <th className="px-2">Time</th>}
              {paymentSettingsState.merchantFields.includes("item") && <th>{merchantType2data[paymentSettingsState.merchantBusinessType]["itemlabel"]}</th>}
              {paymentSettingsState.merchantFields.includes("count") && (
                <th className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""}`}>Guests</th>
              )}
              {paymentSettingsState.merchantFields.includes("sku") && <th className="">SKU#</th>} */}
            </div>
          </div>
        </div>
        {/*--- spacer ---*/}
        <div className="flex-none only:w-full h-[10px]"></div>
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

      {/*--- Table or "no payments" ---*/}
      <div
        id="table"
        className="w-full portrait:h-[calc(100vh-84px-140px)] landscape:h-[calc(100vh-140px)] portrait:sm:h-[calc(100vh-140px-180px)] landscape:lg:h-[calc(100vh-180px)] landscape:xl:desktop:h-[calc(100vh-160px)] flex justify-center overflow-y-auto select-none relative"
      >
        <table className="paymentsWidth table-fixed text-left relative">
          {(searchedTxns.length != 0 ? searchedTxns : transactionsState).toReversed().map((txn: any, index: number) => (
            <tr
              className={`${
                txn.refund ? "opacity-50" : ""
              } w-full portrait:h-[calc((100vh-84px-140px)/6)] landscape:h-[80px] portrait:sm:h-[calc((100vh-140px-180px)/6)] landscape:lg:h-[calc((100vh-180px)/6)] landscape:xl:desktop:h-[calc((100vh-160px)/6)] flex-none border-b border-light5 dark:border-transparent desktop:hover:bg-light2 dark:desktop:hover:bg-dark2 active:bg-light2 dark:active:bg-dark2 cursor-pointer relative`}
              id={txn.txnHash}
              key={index}
              onClick={onClickTxn}
            >
              {/*---Time---*/}
              <td className="portrait:pl-2 portrait:sm:pl-0 w-[28%]">
                {/*--- "to refund" ---*/}
                {txn.toRefund && (
                  <div
                    // @ts-ignore
                    style={{ "writing-mode": "tb-rl" }}
                    className="absolute left-[-22px] portrait:sm:left-[-36px] landscape:lg:left-[-36px] portrait:pr-1 portrait:sm:pr-0 bottom-0 text-center textSm landscape:xl:desktop:text-base font-medium text-white rotate-[180deg] bg-gradient-to-b from-[#E36161] to-[#FE9494] dark:from-darkButton dark:to-darkButton h-full"
                  >
                    To Refund
                  </div>
                )}
                {/*--- time/date ---*/}
                <div className="relative">
                  <span className="text-2xl portrait:sm:text-4xl landscape:lg:text-4xl landscape:xl:desktop:text-2xl">{getLocalTime(txn.date).time}</span>
                  <span className="portrait:text-sm landscape:text-xl portrait:sm:text-xl landscape:lg:text-xl ml-1 font-medium">{getLocalTime(txn.date).ampm}</span>
                  <div className="portrait:text-sm landscape:text-sm portrait:sm:text-xl landscape:lg:text-xl landscape:xl:desktop:text-base portrait:leading-none landscape:leading-none portrait:sm:leading-none landscape:lg:leading-none landscape:xl:desktop:leading-none absolute bottom-[calc(100%+1px)] font-medium text-dualGray">
                    {getLocalDateWords(txn.date).toUpperCase()}
                  </div>
                </div>
              </td>
              {/*---currencyAmount---*/}
              <td className="w-[35%] text-2xl portrait:sm:text-4xl landscape:lg:text-4xl landscape:xl:desktop:text-2xl text-end">{txn.currencyAmount.toFixed(currency2decimal[paymentSettingsState.merchantCurrency])}</td>
              {/*---Customer---*/}
              <td className="w-[37%] text-2xl portrait:sm:text-4xl landscape:lg:text-4xl landscape:xl:desktop:text-2xl text-end">..{txn.customerAddress.substring(txn.customerAddress.length - 4)}</td>

              {/*---Online Options---*/}
              {/* {paymentSettingsState.merchantPaymentType === "online" && paymentSettingsState.merchantFields.includes("email") && txn.customerEmail && (
                  <div className="text-sm leading-tight">
                    <div>{txn.customerEmail.split("@")[0]}</div>
                    <div>@{txn.customerEmail.split("@")[1]}</div>
                  </div>
                )} */}

              {/* {paymentSettingsState.merchantFields.includes("daterange") && (
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
                {paymentSettingsState.merchantFields.includes("sku") && <td className="xs:px-2">{txn.sku && <div className="text-lg">{txn.sku}</div>}</td>} */}
            </tr>
          ))}
          {fillerRows?.map((txn: any, index: number) => (
            <tr className={`flex-none w-full portrait:h-[calc((100vh-84px-120px-28px-0px)/6)] landscape:h-[80px] portrait:sm:h-[calc((100vh-140px-140px-32px)/6)] landscape:lg:h-[calc((100vh-140px-32px)/6)]`} key={index}></tr>
          ))}
        </table>
        {transactionsState.length == 0 && <div className="w-full h-full flex items-center justify-center textLg">No payments</div>}
      </div>

      {/*--- SEARCH MODAL ---*/}
      <div className={`${searchModal ? "" : "hidden"} fixed inset-0 z-10`}></div>
      <div id="searchModal" className={`${searchModal ? "translate-x-[0%]" : "translate-x-[-100%]"} sidebar`}>
        {/*--- HEADER ---*/}
        <div className="detailsModalHeaderContainer">
          {/*--- header ---*/}
          <div className="detailsModalHeader">SEARCH</div>
          {/*--- mobile back ---*/}
          <div className="mobileBack">
            <FontAwesomeIcon icon={faAngleLeft} onClick={() => setSearchModal(false)} />
          </div>
          {/*--- tablet/desktop close ---*/}
          <div className="xButtonContainer" onClick={() => setSearchModal(false)}>
            <div className="xButton">&#10005;</div>
          </div>
        </div>
        <div className="mt-4 w-[85%]">
          {/*--- header + close ---*/}
          <div className="hidden searchModalHeaderContainer">
            {/*--- header ---*/}
            <div className="searchModalHeader">{showCalendar ? "" : "Search Payments"}</div>
            {/*--- mobile: back ---*/}
            <div className="absolute left-0 portrait:sm:hidden landscape:lg:hidden h-full flex items-center">
              <FontAwesomeIcon icon={faAngleLeft} className="text-2xl font-medium" onClick={() => setSearchModal(false)} />
            </div>
            {/*--- tablet/desktop close ---*/}
            <div className="xButtonContainerSmall absolute right-5">
              <div
                className="xButton"
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
            <div className="flex-none w-full h-[360px] textLg flex flex-col">
              {/*--- customer's address ---*/}
              <div className="searchModalContainer">
                <div className="">
                  <div className="searchModalLabel">Customer's Address</div>
                  <div className="text-base desktop:text-xs italic leading-none pb-[5px]">(Enter last 4 characters)</div>
                </div>
                <input
                  className="text-xl w-[104px] h-[48px] text-center rounded-md placeholderColor inputColor"
                  onChange={(e) => {
                    setLast4Chars(e.currentTarget.value);
                  }}
                  value={last4Chars}
                  maxLength={4}
                  placeholder="ABCD"
                />
              </div>
              {/*--- "to refund" payments ---*/}
              <div className="searchModalContainer">
                <div className="textLg font-medium">"To Refund" Payments</div>
                <input type="checkbox" className="w-[30px] h-[30px] rounded-md checkboxColor" />
              </div>
              {/*--- refunded payments ---*/}
              <div className="searchModalContainer">
                <div className="textLg font-medium">Refunded Payments</div>
                <input type="checkbox" className="w-[30px] h-[30px] rounded-md checkboxColor" />
              </div>
              {/*--- date ---*/}
              <div className="h-[25%] flex items-center justify-between">
                <div className="textLg font-medium">Date</div>
                <div
                  className={`${searchDate && searchDate.to ? "" : " text-dualGray dark:text-[#53565C] font-medium italic"} inputColor rounded-md px-4 min-w-[110px] h-[48px] flex items-center justify-center cursor-pointer`}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  {searchDate && searchDate.to ? `${searchDate.from?.toLocaleDateString()} - ${searchDate.to.toLocaleDateString()}` : "select dates"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center mt-6">
              <DayPicker mode="range" selected={searchDate} onSelect={setSearchDate} />
              <div className="mt-2 w-full flex justify-between">
                <button
                  className="buttonSecondary w-[35%]"
                  onClick={() => {
                    setShowCalendar(false);
                    setSearchDate(undefined);
                  }}
                >
                  Cancel
                </button>
                <button className="buttonPrimary w-[60%]" onClick={() => setShowCalendar(false)}>
                  Confirm Dates
                </button>
              </div>
            </div>
          )}
          {/*--- button ---*/}
          <div className={`${showCalendar ? "hidden" : ""} mt-8 mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-full flex justify-between`}>
            <button className="buttonSecondary w-[46%]" onClick={() => clearFilter()}>
              Clear Filters
            </button>
            <button className="buttonPrimary w-[46%]" onClick={search}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/*--- EXPORT MODAL ---*/}
      <div className={`${exportModal ? "" : "hidden"} fixed inset-0 z-10`} onClick={() => setExportModal(false)}></div>
      <div id="exportModal" className={`${exportModal ? "translate-x-[0%]" : "translate-x-[-100%]"} sidebar`}>
        {/*--- HEADER ---*/}
        <div className="detailsModalHeaderContainer">
          {/*--- header ---*/}
          <div className="detailsModalHeader">EXPORT</div>
          {/*--- mobile back ---*/}
          <div className="mobileBack">
            <FontAwesomeIcon
              icon={faAngleLeft}
              onClick={() => {
                setExportModal(false);
                setExportStartMonth("select");
                setExportEndMonth("select");
              }}
            />
          </div>
          {/*--- tablet/desktop close ---*/}
          <div
            className="xButtonContainer"
            onClick={() => {
              setExportModal(false);
              setExportStartMonth("select");
              setExportEndMonth("select");
            }}
          >
            <div className="xButton">&#10005;</div>
          </div>
        </div>
        {/*--- content ---*/}
        <div className="mt-12 textLg w-[83%] flex flex-col space-y-10">
          {/*---start month---*/}
          <div className="w-full flex items-center justify-between">
            <div className="font-medium">Starting Month/Year</div>
            <select className="w-[120px] inputColor px-3 py-2 rounded-[4px]" value={exportStartMonth} onChange={(e) => setExportStartMonth(e.target.value)}>
              {downloadDates.map((i) => (
                <option>{i}</option>
              ))}
            </select>
          </div>
          {/*---end month---*/}
          <div className="w-full flex items-center justify-between">
            <div className="font-medium">Ending Month/Year</div>
            <select className="w-[120px] inputColor px-3 py-2 rounded-[4px]" value={exportEndMonth} onChange={(e) => setExportEndMonth(e.target.value)}>
              {downloadDates.map((i) => (
                <option className="">{i}</option>
              ))}
            </select>
          </div>
        </div>
        {/*--- button ---*/}
        <div className="mt-12 mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-[83%] flex flex-col items-center space-y-12">
          <button className={`${showCalendar ? "hidden" : ""} buttonPrimary`} onClick={search}>
            Export
          </button>
          <button
            className={`${showCalendar ? "hidden" : ""} hidden portrait:sm:block landscape:lg:block buttonSecondary`}
            onClick={() => {
              setExportModal(false);
              clearFilter();
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/*--- QR CODE MODAL ---*/}
      {qrCodeModal && <QrCodeModal setQrCodeModal={setQrCodeModal} paymentSettingsState={paymentSettingsState} />}

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

      {refundAllModal && (
        <div>
          <div className="modal textXl text-center">
            {/*---content---*/}
            <div className="w-full grow text-xl text-center flex items-center">Refund all payments marked as "To Be Refunded"?</div>
            <button className="mt-10 buttonPrimary" onClick={onClickRefundAll}>
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
