"use client";
import { useState } from "react";
import { Parser } from "@json2csv/plainjs"; // switch to papaparse or manually do it
//wagmi
import { useConfig } from "wagmi";
import { writeContract } from "@wagmi/core";
import { parseUnits } from "viem";
// components
import ErrorModal from "./modals/ErrorModal";
// constants
import ERC20ABI from "@/utils/abis/ERC20ABI.json";
import { merchantType2data } from "@/utils/constants";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown, faArrowsRotate, faXmark, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

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

  // constants
  if (transactionsState) {
    var maxPage = Math.ceil(transactionsState.length / 8);
  }

  // states
  const [clickedTxn, setClickedTxn] = useState<null | any>();
  const [clickedTxnIndex, setClickedTxnIndex] = useState<null | number>();
  const [refundStatus, setRefundStatus] = useState("initial"); // "initial" | "refunding" | "refunded"
  const [refundNoteStatus, setRefundNoteStatus] = useState("processing"); // "false" | "processing" | "true"
  const [page, setPage] = useState(1);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadDates, setDownloadDates] = useState<string[]>([]);

  // hooks
  const config = useConfig();

  // functions
  const getLocalTime = (mongoDate: string) => {
    let time = new Date(mongoDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
    return time;
  };

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
    const yearMonth = (document.getElementById("paymentsYearMonth") as HTMLInputElement).value;
    let selectedTxns = [];
    for (let i = 0; i < transactionsState.length; i++) {
      if (yearMonth === transactionsState[i].date.split("-").slice(0, 2).join("-")) {
        selectedTxns.push(transactionsState[i]);
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

  return (
    <section className="w-full flex flex-col items-center relative">
      {/*---Header---*/}
      <div className="hidden md:h-[60px] md:flex justify-center items-center font-extrabold text-3xl text-blue-700">Payment History</div>
      {/*---Table + Navigation Arrows ---*/}
      {transactionsState && paymentSettingsState ? (
        <div className="w-full">
          {/*---Table---*/}
          <div className="px-6 h-[calc(100vh-84px-72px-2px)] md:h-[calc(100vh-60px-72px-2px)] overflow-y-auto">
            {transactionsState.length > 1 ? (
              <table className="table-auto text-left w-full">
                <thead className="text-lg md:text-lg leading-none md:leading-none top-0 sticky">
                  {/*---headers, 40px---*/}
                  <tr className="h-[40px]">
                    <th className="align-bottom w-[90px]">Time</th>
                    <th className="align-bottom w-[90px]">Customer</th>
                    {paymentSettingsState.merchantFields.includes("daterange") && <th className="xs:px-2 align-bottom">Dates</th>}
                    {paymentSettingsState.merchantFields.includes("date") && <th className="xs:px-2 align-bottom">Date</th>}
                    {paymentSettingsState.merchantFields.includes("time") && <th className="xs:px-2 align-bottom">Time</th>}
                    {paymentSettingsState.merchantFields.includes("item") && <th className="align-bottom">{merchantType2data[paymentSettingsState.merchantType]["itemlabel"]}</th>}
                    {paymentSettingsState.merchantFields.includes("count") && (
                      <th className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""} align-bottom`}>Guests</th>
                    )}
                    {paymentSettingsState.merchantFields.includes("sku") && <th className="align-bottom">SKU#</th>}
                    <th className="align-bottom w-[90px]">{paymentSettingsState.merchantCurrency}</th>
                  </tr>
                </thead>
                <tbody className="">
                  {/*---transactions---*/}
                  {transactionsState
                    .toReversed()
                    .slice((page - 1) * 8, (page - 1) * 8 + 8)
                    .map((txn: any, index: number) => (
                      <tr
                        id={txn.txnHash}
                        key={index}
                        className={`${
                          txn.refund ? "text-gray-400" : ""
                        } h-[calc((100vh-84px-40px-72px-4px)/8)] md:h-[calc((100vh-60px-40px-72px-4px)/8)] border-b lg:hover:bg-gray-200 active:bg-gray-200 lg:cursor-pointer bg-white`}
                        onClick={onClickTxn}
                      >
                        {/*---Time---*/}
                        <td className="whitespace-nowrap">
                          <div className={`${paymentSettingsState.merchantPaymentType === "inperson" ? "text-xl leading-none" : "text-sm leading-tight"}`}>
                            {getLocalTime(txn.date)}
                          </div>
                          <div className="text-sm leading-none">{getLocalDate(txn.date)}</div>
                        </td>
                        {/*---Customer---*/}
                        <td className="">
                          {paymentSettingsState.merchantPaymentType === "online" && paymentSettingsState.merchantFields.includes("email") && txn.customerEmail && (
                            <div className="text-sm leading-tight">
                              <div>{txn.customerEmail.split("@")[0]}</div>
                              <div>@{txn.customerEmail.split("@")[1]}</div>
                            </div>
                          )}
                          {paymentSettingsState.merchantPaymentType === "inperson" && (
                            <div className="text-xl">..{txn.customerAddress.substring(txn.customerAddress.length - 4)}</div>
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
                        <td className={`${paymentSettingsState.merchantPaymentType === "inperson" ? "text-xl" : "text-xl"} relative`}>
                          {txn.currencyAmount}
                          <div className={`${txn.refundNote && !txn.refund ? "" : "hidden"} absolute bottom-[6px] left-0 text-xs text-gray-400`}>To Be Refunded</div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-xl">No payments so far</div>
              </div>
            )}
          </div>

          {/*---navigation arrows, 72px height---*/}
          <div className="h-[72px] flex items-center justify-center">
            <div className="flex items-center justify-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="text-xl bg-white border-2 border-gray-400 text-gray-400 rounded-lg p-2.5 lg:hover:opacity-40 active:opacity-40 cursor-pointer"
                onClick={() => (page === 1 ? "" : setPage(page - 1))}
              />
              <div className="text-2xl font-medium w-[20px] text-center select-none mx-4">{page}</div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xl bg-white border-2 border-gray-400 text-gray-400 rounded-lg p-2.5 lg:hover:opacity-40 active:opacity-40 cursor-pointer"
                onClick={() => (page === maxPage ? "" : setPage(page + 1))}
              />
            </div>
            {/*---download---*/}
            {/* <button
              onClick={() => {
                setDownloadModal(true);
                createDownloadDates();
              }}
              className="w-[90px] py-1 lg:hover:bg-white rounded-xl leading-none bg-blue-300"
            >
              Download History
            </button> */}
            {/*---refresh---*/}
            {/* <div className="flex justify-center w-1/3">
              <button onClick={() => location.reload()} className="h-[58px] w-[70px] xs:w-[100px] lg:hover:bg-white rounded-xl">
                <FontAwesomeIcon icon={faArrowsRotate} className="text-3xl active:text-blue-300" />
              </button>
            </div> */}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <SpinningCircleGray />
        </div>
      )}

      {/*--- MODALS ---*/}
      {detailsModal && (
        <div className="">
          <div className="px-8 flex flex-col justify-center space-y-6 w-[348px] h-[440px] bg-white rounded-3xl border border-gray-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-50">
            {/*---CLOSE BUTTON---*/}
            {/* <button
              onClick={() => setDetailsModal(false)}
              className="absolute top-[calc(100%-28px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] text-3xl rounded-full h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 lg:hover:bg-red-500 active:bg-red-300"
            >
              <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
            </button> */}
            {/*---content---*/}
            <div className="flex flex-col text-lg lg:text-base space-y-1 font-medium">
              <p>
                <span className="text-gray-400 mr-1">Time</span> {getLocalDate(clickedTxn.date)} {getLocalTime(clickedTxn.date)}
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
          </div>
          <div className="modalBlackout" onClick={() => setDetailsModal(false)}></div>
        </div>
      )}
      {downloadModal && (
        <div>
          <div className="w-[330px] h-[280px] px-6 rounded-xl bg-white border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-50">
            {/*---close button---*/}
            <button
              onClick={() => setDownloadModal(false)}
              className="absolute top-[calc(100%-28px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] text-3xl rounded-full h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 lg:hover:bg-red-500 active:bg-red-300"
            >
              <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
            </button>
            {/*---content---*/}
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="text-center text-xl lg:text-lg">Select Year - Month</div>
              <div className="mt-2 px-4 py-2 border border-slate-300 rounded-lg">
                <select id="paymentsYearMonth" className="text-xl lg:text-lg outline:none focus:outline-none">
                  {downloadDates.map((i) => (
                    <option>{i}</option>
                  ))}
                </select>
              </div>
              <button
                className="mt-10 mb-6 w-full h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-lg font-bold tracking-wide"
                onClick={onClickDownload}
              >
                Download
              </button>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </section>
  );
};

export default Payments;
