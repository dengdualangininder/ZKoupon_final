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
// types
import { PaymentSettings, Transaction } from "@/db/models/UserModel";

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
  const [scrollWidth, setScrollWidth] = useState("16");
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
    <section className="appSectionSize">
      {/*--- TOP BAR h-140px/180px/160px ---*/}
      <div className="flex-none w-full h-[140px] portrait:sm:h-[180px] landscape:lg:h-[180px] landscape:xl:desktop:h-[160px] flex flex-col">
        {/*--- shaded region ---*/}
        <div
          className={`flex-1 flex flex-col items-center bg-gradient-to-br from-[15%] to-[85%] from-light2 to-light4 dark:from-dark2 dark:to-dark4 landscape:dark:to-dark1 landscape:dark:from-dark1 pr-[${scrollWidth}px]`}
        >
          {/*--- buttons ---*/}
          <div className="px-[8px] paymentsWidth h-[65%] flex items-center justify-between">
            {/*--- left buttons ---*/}
            <div className="h-full flex items-center space-x-[32px] portrait:sm:space-x-[56px] landscape:lg:space-x-[56px]">
              <div className="paymentsIconContainer" onClick={() => setSearchModal(true)}>
                <div className="paymentsIcon">
                  <Image src={theme == "dark" ? "/searchWhite.svg" : "/searchBlack.svg"} alt="search icon" fill />
                </div>
              </div>
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
                  <div className="paymentsIcon">
                    <Image src={theme == "dark" ? "/exportWhite.svg" : "/exportBlack.svg"} alt="export icon" fill />
                  </div>
                </div>
              )}
              {!isAdmin && (
                <div className="paymentsIconContainer" onClick={() => setSignOutModal(true)}>
                  <div className="paymentsIcon">
                    <Image src={theme == "dark" ? "/signOutWhite.svg" : "/signOutBlack.svg"} alt="sign out icon" fill />
                  </div>
                </div>
              )}
            </div>
            {/*--- qrCode button ---*/}
            <div className="paymentsIconContainer" onClick={() => setQrCodeModal(true)}>
              <div className="paymentsIcon">
                <Image src={theme == "dark" ? "/qrWhite.svg" : "/qrBlack.svg"} alt="qr code icon" fill />
              </div>
            </div>
          </div>

          {/*--- Table Headers ---*/}
          <div className="flex-1 w-full flex justify-center items-end portrait:sm:pb-[4px] landscape:lg:pb-[4px]">
            <div className="paymentsWidth paymentsHeaderFont grid grid-cols-[28%_35%_37%] pb-[8px] landscape:dark:border-b-2 landscape:dark:border-dark5">
              <div className="portrait:pl-[8px] portrait:sm:pl-0 text-start">{t("time")}</div>
              <div className="text-end">{paymentSettingsState.merchantCurrency}</div>
              <div className="text-end">{t("customer")}</div>
            </div>
          </div>
        </div>
        {/*--- spacer ---*/}
        <div className="flex-none only:w-full h-[8px]"></div>
      </div>

      {/*--- Table or "no payments" ---*/}
      <div
        id="table"
        className={`${
          isAdmin ? "portrait:h-[calc(100vh-84px-140px)] portrait:sm:h-[calc(100vh-140px-180px)]" : "portrait:h-[calc(100vh-0px-140px)] portrait:sm:h-[calc(100vh-0px-180px)]"
        } w-full landscape:h-[calc(100vh-140px)] landscape:lg:h-[calc(100vh-180px)] landscape:xl:desktop:h-[calc(100vh-160px)] flex justify-center overflow-y-auto overscroll-none overflow-x-hidden select-none relative`}
      >
        {transactionsState.length != 0 && (
          <table className="paymentsWidth table-fixed text-left relative">
            <tbody>
              {(searchedTxns ? searchedTxns : transactionsState).toReversed().map((txn: any, index: number) => (
                <tr
                  className={`${txn.refund ? "opacity-50" : ""} ${
                    isAdmin
                      ? "portrait:h-[calc((100vh-84px-140px)/6)] portrait:sm:h-[calc((100vh-140px-180px)/6)]"
                      : "portrait:h-[calc((100vh-0px-140px)/6)] portrait:sm:h-[calc((100vh-0px-180px)/6)]"
                  } w-full landscape:h-[80px] landscape:lg:h-[calc((100vh-180px)/6)] landscape:xl:desktop:h-[calc((100vh-160px)/6)] flex-none border-b border-light5 dark:border-transparent desktop:hover:bg-light2 dark:desktop:hover:bg-dark2 active:bg-light2 dark:active:bg-dark2 cursor-pointer`}
                  id={txn.txnHash}
                  key={index}
                  onClick={onClickTxn}
                >
                  {/*---Time---*/}
                  <td className="portrait:pl-[8px] portrait:sm:pl-0 w-[28%] relative">
                    {/*--- "to refund" ---*/}
                    {txn.toRefund && (
                      <div
                        // @ts-ignore
                        style={{ writingMode: "vertical-rl" }}
                        className="absolute left-[-22px] portrait:sm:left-[-36px] landscape:lg:left-[-36px] landscape:xl:desktop:left-[-24px] portrait:pr-[4px] portrait:sm:pr-0 bottom-0 text-center text-[14px] portrait:sm:text-[18px] landscape:lg:text-[18px] landscape:xl:desktop:text-[14px] font-medium text-white rotate-[180deg] bg-gradient-to-b from-[#E36161] to-[#FE9494] dark:from-darkButton dark:to-darkButton h-full"
                      >
                        To Refund
                      </div>
                    )}
                    {/*--- time/date ---*/}
                    <div className="relative">
                      <span className="text-[24px] portrait:sm:text-[36px] landscape:lg:text-[36px] landscape:xl:desktop:text-[24px]">{getLocalTime(txn.date)?.time}</span>
                      <span className="text-[14px] portrait:sm:text-[20px] landscape:lg:text-[20px] ml-[4px] font-medium">{getLocalTime(txn.date)?.ampm}</span>
                      <div className="text-[14px] portrait:sm:text-[20px] landscape:lg:text-[20px] landscape:xl:desktop:text-[14px] leading-[14px] portrait:sm:leading-[8px] landscape:lg:leading-[8px] landscape:xl:desktop:leading-[14px] absolute bottom-[calc(100%+1px)] font-medium text-dualGray">
                        {getLocalDateWords(txn.date)?.toUpperCase()}
                      </div>
                    </div>
                  </td>
                  {/*---currencyAmount---*/}
                  <td className="w-[35%] text-[24px] portrait:sm:text-[36px] landscape:lg:text-[36px] landscape:xl:desktop:text-[24px] text-end">
                    {txn.currencyAmount.toFixed(currency2decimal[paymentSettingsState.merchantCurrency])}
                  </td>
                  {/*---Customer---*/}
                  <td className="w-[37%] text-[24px] portrait:sm:text-[36px] landscape:lg:text-[36px] landscape:xl:desktop:text-[24px] text-end">
                    ..{txn.customerAddress.substring(txn.customerAddress.length - 4)}
                  </td>

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
                <tr
                  className={`${
                    isAdmin
                      ? "portrait:h-[calc((100vh-84px-120px-28px-0px)/6)] portrait:sm:h-[calc((100vh-140px-140px-32px)/6)]"
                      : "portrait:h-[calc((100vh-0px-120px-28px-0px)/6)] portrait:sm:h-[calc((100vh-0px-140px-32px)/6)]"
                  } flex-none w-full landscape:h-[80px] landscape:lg:h-[calc((100vh-140px-32px)/6)]`}
                  key={index}
                ></tr>
              ))}
            </tbody>
          </table>
        )}

        {/*--- CLEAR SEARCH MODAL ---*/}
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
