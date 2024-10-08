"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
//wagmi
import { useConfig } from "wagmi";
import { writeContract } from "@wagmi/core";
import { parseUnits } from "viem";
// components
import QrCodeModal from "./modals/QrCodeModal";
import ErrorModal from "./modals/ErrorModal";
import DetailsModal from "./modals/DetailsModal";
// constants
import erc20Abi from "@/utils/abis/erc20Abi";
import { currency2decimal } from "@/utils/constants";
// other
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTheme } from "next-themes";
import { deleteCookie } from "cookies-next";
import { useTranslations } from "next-intl";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { HiQrCode, HiArrowDownTray, HiOutlineMagnifyingGlass, HiMiniArrowRightStartOnRectangle } from "react-icons/hi2";
import { HiOutlineDownload, HiOutlineSearch } from "react-icons/hi";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { FiDownload, FiSearch } from "react-icons/fi";
import { TbDownload } from "react-icons/tb";

// types
import { PaymentSettings, Transaction } from "@/db/UserModel";

// functions
export const getLocalTime = (mongoDate: string | undefined) => {
  if (!mongoDate) {
    return;
  }
  const time = new Date(mongoDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  const timeObject = { time: time.split(" ")[0], ampm: time.split(" ")[1] };
  return timeObject;
};

// return format: April 2
export const getLocalDateWords = (mongoDate: string | undefined) => {
  if (!mongoDate) {
    return;
  }
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
  setPage,
}: {
  transactionsState: Transaction[];
  setTransactionsState: any;
  paymentSettingsState: PaymentSettings;
  isAdmin: boolean;
  setPage: any;
}) => {
  console.log("Payments component rendered");
  // states
  const [clickedTxn, setClickedTxn] = useState<Transaction | null>(null);
  const [clickedTxnIndex, setClickedTxnIndex] = useState<number | null>(null);
  const [refundStatus, setRefundStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [refundAllStatus, setRefundAllStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [toRefundStatus, setToRefundStatus] = useState("processing"); // "false" | "processing" | "true"
  const [selectedStartMonth, setSelectedStartMonth] = useState("select");
  const [selectedEndMonth, setSelectedEndMonth] = useState("select");
  const [exportStartMonth, setExportStartMonth] = useState("select");
  const [exportEndMonth, setExportEndMonth] = useState("select");
  const [fillerRows, setFillerRows] = useState<number[] | null>(transactionsState.length < 6 ? Array.from(Array(6 - transactionsState.length).keys()) : null);
  const [scrollWidth, setScrollWidth] = useState(16);
  // modal states
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [downloadDates, setDownloadDates] = useState<string[]>([]);
  const [refundAllModal, setRefundAllModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [clearSearchModal, setClearSearchModal] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);
  // filter states
  const [searchedTxns, setSearchedTxns] = useState<Transaction[] | null>(null);
  const [last4Chars, setLast4Chars] = useState("");
  const [showToRefund, setShowToRefund] = useState(false);
  const [showRefunded, setShowRefunded] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(undefined); // undefined and not null because of how react-day-picker works

  // hooks
  const config = useConfig();
  const router = useRouter();
  const { theme } = useTheme();
  const t = useTranslations("App.Payments");
  const tcommon = useTranslations("Common");

  useEffect(() => {
    const scrollWidthTemp = (document?.querySelector("#table") as HTMLElement).offsetWidth - (document?.querySelector("#table") as HTMLElement).clientWidth;
    setScrollWidth(scrollWidthTemp);
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
        abi: erc20Abi,
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
        body: JSON.stringify({
          merchantEvmAddress: paymentSettingsState.merchantEvmAddress,
          refundHash: refundHash,
          txnHash: clickedTxn?.txnHash,
        }),
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
      body: JSON.stringify({
        merchantEvmAddress: paymentSettingsState.merchantEvmAddress,
        txnHash: clickedTxn?.txnHash,
        toRefund: clickedTxn?.toRefund,
      }),
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

  const exportTxns = () => {
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
    //TODO
    setRefundAllModal(false);
  };

  const clearFilter = () => {
    setShowCalendar(false);
    setShowToRefund(false);
    setClearSearchModal(false);
    setShowRefunded(false);
    setSearchDate(undefined);
    setLast4Chars("");
    setSearchedTxns(null);
    setFillerRows(null);
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
    console.log(searchedTxnsTemp);
    if (last4Chars) {
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => i.customerAddress.toLowerCase().slice(-4) == last4Chars.toLowerCase());
    }
    if (showToRefund) {
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => i.toRefund == true);
    }
    if (showRefunded) {
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => i.refund == true);
    }
    if (searchDate?.from && searchDate?.to) {
      const fromDate = new Date(searchDate.from!);
      const toDate = new Date(new Date(searchDate.to!).getTime() + 24 * 60 * 60 * 1000);
      searchedTxnsTemp = searchedTxnsTemp?.filter((i) => new Date(i.date) >= fromDate && new Date(i.date) < toDate);
    }
    console.log(searchedTxnsTemp);

    setSearchedTxns(searchedTxnsTemp);
    setClearSearchModal(true);
    setSearchModal(false);

    if (searchedTxnsTemp.length < 6) {
      setFillerRows(Array.from(Array(6 - searchedTxnsTemp.length).keys()));
    } else {
      setFillerRows([1]); // so that the last txn is visible
    }
  };

  return (
    <section className="appPageContainer">
      {/*--- top bar container (h-140px/180px/160px) ---*/}
      <div className={`w-full h-[140px] portrait:sm:h-[180px] landscape:lg:h-[180px] desktop:!h-[160px] flex flex-col items-center`} style={{ marginRight: `${scrollWidth}px` }}>
        {/*--- BUTTONS ---*/}
        <div className="paymentsWidth px-[8px] h-[65%] grid grid-cols-[25%_25%_50%] items-center">
          {/*--- search ---*/}
          <div className="paymentsIconContainer" onClick={() => setSearchModal(true)}>
            <FiSearch className={`${theme == "dark" ? "text-darkText1" : "text-lightText1"} paymentsIcon`} />
          </div>
          {/*--- download ---*/}
          {isAdmin && (
            <div
              className="paymentsIconContainer"
              onClick={() => {
                if (transactionsState.length > 0) {
                  createDownloadDates();
                  setExportModal(true);
                } else {
                  setErrorMsg(t("downloadModal.errors.noPayments"));
                  setErrorModal(true);
                }
              }}
            >
              <FiDownload className={`${theme == "dark" ? "text-darkText1" : "text-lightText1"} paymentsIcon`} />
            </div>
          )}
          {/*--- sign out ---*/}
          {!isAdmin && (
            <div className="paymentsIconContainer" onClick={() => setSignOutModal(true)}>
              <HiMiniArrowRightStartOnRectangle className={`${theme == "dark" ? "text-darkText1" : "text-lightText1"} paymentsIcon`} />
            </div>
          )}
          {/*--- qrCode button ---*/}
          <div className="paymentsIconContainer justify-self-end" onClick={() => setQrCodeModal(true)}>
            <HiQrCode className={`${theme == "dark" ? "text-darkText1" : "text-lightText1"} paymentsIcon`} />
          </div>
        </div>
        {/*--- HEADERS ---*/}
        <div className="paymentsWidth pl-[8px] sm:pl-0 sm:!px-[12px] grow paymentsHeaderFont grid grid-cols-[38%_38%_24%] items-center !text-slate-500">
          <div className="">{t("time")}</div>
          <div>{paymentSettingsState.merchantCurrency}</div>
          <div className="justify-self-end">{t("customer")}</div>
        </div>
      </div>

      {/*--- LIST OF PAYMENTS ---*/}
      {/*--- container ---*/}
      {transactionsState.length != 0 && (
        <div
          id="table"
          className={`${
            isAdmin ? "portrait:h-[calc(100vh-80px-140px)] portrait:sm:h-[calc(100vh-140px-180px)]" : "portrait:h-[calc(100vh-0px-140px)] portrait:sm:h-[calc(100vh-0px-180px)]"
          } pl-[8px] sm:pl-0 w-full landscape:h-[calc(100vh-140px)] landscape:lg:h-[calc(100vh-180px)] landscape:desktop:!h-[calc(100vh-160px)] flex flex-col items-center overflow-y-auto overscroll-none overflow-x-hidden select-none relative`}
        >
          {/*--- list ---*/}
          {(searchedTxns ? searchedTxns : transactionsState).toReversed().map((txn: any, index: number) => (
            <div
              className={`${txn.refund ? "opacity-50" : ""} ${
                isAdmin
                  ? "portrait:h-[calc((100vh-80px-140px)/5)] portrait:sm:h-[calc((100vh-140px-180px)/5)]"
                  : "portrait:h-[calc((100vh-0px-140px)/5)] portrait:sm:h-[calc((100vh-0px-180px)/5)]"
              } relative paymentsWidth flex-none sm:px-[12px] landscape:h-[80px] landscape:lg:h-[calc((100vh-180px)/5)] desktop:!h-[calc((100vh-160px)/5)] flex items-center justify-center border-t border-light5 dark:border-slate-800 desktop:hover:bg-light2 dark:desktop:hover:bg-dark2 active:bg-light2 dark:active:bg-dark2 desktop:cursor-pointer`}
              id={txn.txnHash}
              key={index}
              onClick={onClickTxn}
            >
              <div className="w-full grid grid-cols-[38%_38%_24%] items-end text-[24px] portrait:sm:text-[36px] landscape:lg:text-[36px] desktop:!text-[24px]">
                {/*--- "to refund" ---*/}
                {txn.toRefund && (
                  <div
                    // @ts-ignore
                    style={{ writingMode: "vertical-rl" }}
                    className="absolute left-[calc(-5%-12px)] portrait:sm:left-[-36px] landscape:lg:left-[-36px] desktop:!left-[-24px] pr-[2px] bottom-0 h-full text-center text-[14px] portrait:sm:text-[18px] landscape:lg:text-[18px] desktop:!text-[14px] font-medium text-white rotate-[180deg] bg-gradient-to-b from-[#E36161] to-[#FE9494] dark:from-darkButton dark:to-darkButton"
                  >
                    To Refund
                  </div>
                )}
                {/*---Time---*/}
                <div>
                  <div className="text-[14px] leading-none portrait:sm:text-[20px] landscape:lg:text-[20px] desktop:!text-[14px] font-medium text-slate-500">
                    {getLocalDateWords(txn.date)?.toUpperCase()}
                  </div>
                  <span>{getLocalTime(txn.date)?.time}</span>
                  <span className="text-[16px] portrait:sm:text-[20px] landscape:lg:text-[20px] ml-[6px] font-medium">{getLocalTime(txn.date)?.ampm}</span>
                </div>
                {/*--- Amount ---*/}
                <div>{txn.currencyAmount.toFixed(currency2decimal[paymentSettingsState.merchantCurrency])}</div>
                {/*--- Customer ---*/}
                <div className="justify-self-end">..{txn.customerAddress.substring(txn.customerAddress.length - 4)}</div>
              </div>
            </div>
          ))}
          {/*--- clear search modal ---*/}
          {clearSearchModal && (
            <div
              className={`${
                isAdmin ? "portrait:bottom-[calc(84px+12px)] portrait:sm:bottom-[calc(140px+16px)]" : "portrait:bottom-[calc(0px+12px)] portrait:sm:bottom-[calc(0px+16px)]"
              } fixed landscape:bottom-2 landscape:lg:bottom-6 w-full landscape:w-[calc(100%-120px)] landscape:lg:w-[calc(100%-160px)] h-[72px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:desktop:h-[84px] flex justify-center items-center`}
            >
              <div className="pl-[4%] h-full bannerWidth flex items-center justify-between rounded-xl bg-yellow-50 text-black">
                <div className="text2xl">{t("clearSearch")}</div>
                <div className="xButtonBanner" onClick={clearFilter}>
                  &#10005;
                </div>
              </div>
            </div>
          )}
          {transactionsState.length == 0 && <div className="w-full h-full flex items-center justify-center paymentsHeaderFont">{t("noPayments")}</div>}
        </div>
      )}

      {/*--- SEARCH MODAL ---*/}
      <div className={`${searchModal ? "" : "hidden"} fixed inset-0 z-10`}></div>
      <div className={`${searchModal ? "translate-x-[0%]" : "translate-x-[-100%]"} sidebarModal`}>
        {/*--- mobile back ---*/}
        <div className="mobileBack">
          <FontAwesomeIcon icon={faAngleLeft} onClick={() => setSearchModal(false)} />
        </div>
        {/*--- tablet/desktop close ---*/}
        <div className="xButtonContainer rounded-tr-none" onClick={() => setSearchModal(false)}>
          <div className="xButton">&#10005;</div>
        </div>

        {/*--- HEADER ---*/}
        <div className="detailsModalHeader">{t("searchModal.title")}</div>

        {/*--- contents ---*/}
        <div className="sidebarModalContentContainer">
          {/*--- filters ---*/}
          <div className="flex-none w-full h-[360px] textLg flex flex-col">
            {/*--- filter 1 - customer's address ---*/}
            <div className="searchModalCategoryContainer">
              <div className="">
                <div className="font-medium">{t("searchModal.customerAddress")}</div>
                <div className="text-base desktop:text-xs italic leading-none pb-[5px]">{t("searchModal.enterChars")}</div>
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
            {/*--- filter 2 - "to refund" payments ---*/}
            <div className="searchModalCategoryContainer">
              <div className="font-medium">{t("searchModal.toRefund")}</div>
              <input type="checkbox" className="checkbox" onChange={(e) => (e.target.checked ? setShowToRefund(true) : setShowToRefund(false))} checked={showToRefund} />
            </div>
            {/*--- filter 3 - refunded payments ---*/}
            <div className="searchModalCategoryContainer">
              <div className="font-medium">{t("searchModal.refunded")}</div>
              <input type="checkbox" className="checkbox" onChange={(e) => (e.target.checked ? setShowRefunded(true) : setShowRefunded(false))} checked={showRefunded} />
            </div>
            {/*--- filter 4 - date ---*/}
            <div className="searchModalCategoryContainer border-none">
              <div className="font-medium">{t("searchModal.date")}</div>
              <div
                className={`${
                  searchDate && searchDate.to ? "" : "text-slate-400 dark:text-slate-600 italic"
                } inputColor rounded-md px-4 min-w-[110px] h-[48px] flex items-center justify-center cursor-pointer`}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {searchDate && searchDate.to ? `${searchDate.from?.toLocaleDateString()} - ${searchDate.to.toLocaleDateString()}` : t("searchModal.selectDates")}
              </div>
            </div>
          </div>
          {/*--- button ---*/}
          <div className="mt-8 mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-full flex justify-between">
            <button className="buttonSecondary w-[35%]" onClick={clearFilter}>
              {t("searchModal.clear")}
            </button>
            <button className="buttonPrimary w-[60%]" onClick={search}>
              {t("searchModal.search")}
            </button>
          </div>
        </div>
      </div>

      {showCalendar && (
        <div className="sidebarModal z-[21]">
          {/*--- mobile back ---*/}
          <div className="mobileBack">
            <FontAwesomeIcon
              icon={faAngleLeft}
              onClick={() => {
                setShowCalendar(false);
                setSearchDate(undefined);
              }}
            />
          </div>
          {/*--- tablet/desktop close ---*/}
          <div
            className="xButtonContainer rounded-tr-none"
            onClick={() => {
              setShowCalendar(false);
              setSearchDate(undefined);
            }}
          >
            <div className="xButton">&#10005;</div>
          </div>
          {/*--- header ---*/}
          <div className="detailsModalHeader">{t("searchModal.selectDatesCap")}</div>

          {/*--- content ---*/}
          <div className="sidebarModalContentContainer overflow-x-hidden">
            {/*--- calendar ---*/}
            <DayPicker mode="range" selected={searchDate} onSelect={setSearchDate} />
            {/*--- date range ---*/}
            <div className={`text-xl landscape:xl:desktop:text-lg`}>
              {searchDate?.from?.toLocaleDateString() ?? t("searchModal.startDate")}&nbsp; &ndash; &nbsp;
              {searchDate?.to?.toLocaleDateString() ?? t("searchModal.endDate")}
            </div>
            {/*--- buttons ---*/}
            <div className="mt-8 mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-full flex justify-between">
              <button
                className="buttonSecondary w-[35%]"
                onClick={() => {
                  setSearchDate(undefined);
                }}
              >
                {t("searchModal.clear")}
              </button>
              <button
                className="buttonPrimary w-[60%]"
                onClick={() => {
                  if (searchDate && searchDate.from && searchDate.to) {
                    setShowCalendar(false);
                  } else {
                    setErrorModal(true);
                    setErrorMsg("Please select a date range");
                  }
                }}
              >
                {t("searchModal.confirmDates")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*--- EXPORT MODAL ---*/}
      <div className={`${exportModal ? "" : "hidden"} fixed inset-0 z-10`} onClick={() => setExportModal(false)}></div>
      <div id="exportModal" className={`${exportModal ? "translate-x-[0%]" : "translate-x-[-100%]"} sidebarModal`}>
        {/*--- HEADER ---*/}
        <div className="detailsModalHeader">{t("downloadModal.title")}</div>
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
          className="xButtonContainer rounded-tr-none"
          onClick={() => {
            setExportModal(false);
            setExportStartMonth("select");
            setExportEndMonth("select");
          }}
        >
          <div className="xButton">&#10005;</div>
        </div>
        {/*--- content ---*/}
        <div className="sidebarModalContentContainer">
          {/*---start month---*/}
          <div className="w-full flex items-center justify-between">
            <div className="font-medium">{t("downloadModal.start")}</div>
            <select className="textLgPx w-[130px] inputColor px-[12px] py-[8px] rounded-[6px]" value={exportStartMonth} onChange={(e) => setExportStartMonth(e.target.value)}>
              {downloadDates.map((i) => (
                <option>{i}</option>
              ))}
            </select>
          </div>
          {/*---end month---*/}
          <div className="mt-[32px] w-full flex items-center justify-between">
            <div className="font-medium">{t("downloadModal.end")}</div>
            <select className="textLgPx w-[130px] inputColor px-[12px] py-[8px] rounded-[6px]" value={exportEndMonth} onChange={(e) => setExportEndMonth(e.target.value)}>
              {downloadDates.map((i) => (
                <option className="">{i}</option>
              ))}
            </select>
          </div>
          {/*--- button ---*/}
          <div className="my-[48px] w-full">
            <button className={`${showCalendar ? "hidden" : ""} buttonPrimary`} onClick={exportTxns}>
              {t("downloadModal.download")}
            </button>
          </div>
        </div>
      </div>

      {/*--- QR CODE MODAL ---*/}
      {qrCodeModal && <QrCodeModal setQrCodeModal={setQrCodeModal} paymentSettingsState={paymentSettingsState} />}

      {/*--- DETAILS MODAL ---*/}
      {detailsModal && <DetailsModal clickedTxn={clickedTxn} setDetailsModal={setDetailsModal} isAdmin={isAdmin} onClickToRefund={onClickToRefund} />}

      {/*---signOutModal---*/}
      {signOutModal && (
        <div>
          <div className="modal">
            {/*---content---*/}
            <div className="modalContent">{t("signOutModal")}</div>
            {/*--- buttons ---*/}
            <div className="modalButtonContainer">
              <button
                onClick={() => {
                  deleteCookie("employeeJwt");
                  setSignOutModal(false);
                  setPage("loading");
                  window.location.reload();
                }}
                className="mt-10 buttonPrimary"
              >
                {tcommon("confirm")}
              </button>
              <button onClick={() => setSignOutModal(false)} className="buttonSecondary">
                {tcommon("cancel")}
              </button>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
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
