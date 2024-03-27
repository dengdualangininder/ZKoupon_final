"use client";
import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { Buffer } from "buffer";
import { Parser } from "@json2csv/plainjs"; // switch to papaparse or manually do it
// constants
import { tokenAddresses, chainIds, addChainParams, blockExplorer } from "@/utils/web3Constants.js";
import erc20ABI from "@/utils/abis/ERC20ABI.json";
import { merchantType2data } from "@/utils/constants";
// images
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown, faArrowsRotate, faXmark, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Payments = ({ transactionsState, isMobile, paymentSettingsState }: { transactionsState: any; isMobile: boolean; paymentSettingsState: any }) => {
  console.log("Payments component rendered");
  if (transactionsState) {
    var maxPage = Math.ceil(transactionsState.length / 10);
  }
  const isMetaMaskBrowser = navigator.userAgent.match(/MetaMaskMobile/i);

  const [clickedTxn, setClickedTxn] = useState<null | any>();
  const [refundStatus, setRefundStatus] = useState("initial"); // other states are "refunding" and "refunded"
  const [page, setPage] = useState(1);
  const [token, setToken] = useState();
  // modals
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [msg, setMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadDates, setDownloadDates] = useState<string[]>([]);

  const getLocalTime = (mongoDate: string) => {
    let time = new Date(mongoDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
    return time;
  };

  const getLocalDate = (mongoDate: string) => {
    let date = new Date(mongoDate).toLocaleString("en-GB").split(", ")[0].split("/");
    return `${date[2]}-${date[1]}-${date[0]}`;
  };

  // const refunding = async () => {
  //   //@ts-ignore
  //   let provider = new ethers.providers.Web3Provider(window.ethereum);
  //   let signer = await provider.getSigner();

  //   // clickedTxn should exist but need this if statement for typescript
  //   if (clickedTxn) {
  //     const contract = new ethers.Contract(tokenAddresses[clickedTxn.network][clickedTxn.token]["address"], erc20ABI, signer);
  //     setRefundStatus("refunding");
  //     setMsg("Waiting on MetaMask...");
  //     contract
  //       .transfer(clickedTxn.customerAddress, ethers.parseUnits(clickedTxn.tokenAmount.toString(), tokenAddresses[clickedTxn.network][clickedTxn.token]["decimals"]))
  //       .then((tx) => {
  //         //action before txn is mined
  //         setMsg("Sending transaction...");
  //         provider.waitForTransaction(tx.hash).then(() => {
  //           //actions after txn is mined
  //           setMsg("Verifying transaction...");
  //           axios
  //             .post(
  //               import.meta.env.VITE_ISDEV == "true" ? "http://localhost:8080/refund" : "https://server.lingpay.io/refund",
  //               { txnHash: clickedTxn.txnHash },
  //               { withCredentials: true }
  //             )
  //             .then((res) => {
  //               if (res.data === "saved") {
  //                 setRefundStatus("refunded");
  //               } else {
  //                 setErrorModal(true);
  //                 setErrorMsg(
  //                   "Refund successful! But, the refund status was not saved due to an internal server error. Please email contact@lingpay.io. We apologize for the inconvenience."
  //                 );
  //                 setRefundStatus("refunded");
  //                 setDetailsModal(false);
  //               }
  //             })
  //             .catch(() => {
  //               setErrorModal(true);
  //               setErrorMsg(
  //                 "Refund successful! But, the refund status was not saved due to a server request error. Please email contact@lingpay.io. We apologize for the inconvenience."
  //               );
  //               setRefundStatus("refunded");
  //               setDetailsModal(false);
  //             });
  //         });
  //       })
  //       .catch((e) => {
  //         setErrorModal(true);
  //         setErrorMsg(e.reason);
  //         setRefundStatus("initial");
  //         setDetailsModal(false);
  //       });
  //   }
  // };

  // const onClickRefund = () => {
  //   if (isMobile && !isMetaMaskBrowser) {
  //     console.log(clickedTxn);
  //     console.log(token);
  //     let url =
  //       `${import.meta.env.VITE_ISDEV == "true" ? "http://localhost:5173/refund/" : "https://metamask.app.link/dapp/www.lingpay.io/refund/"}` +
  //       Buffer.from(clickedTxn.currencyAmount.toString(), "utf8").toString("base64") +
  //       "&&" +
  //       clickedTxn.merchantCurrency +
  //       "&&" +
  //       Buffer.from(clickedTxn.tokenAmount.toString(), "utf8").toString("base64") +
  //       "&&" +
  //       clickedTxn.token +
  //       "&&" +
  //       clickedTxn.network +
  //       "&&" +
  //       clickedTxn.customerAddress +
  //       "&&" +
  //       clickedTxn.txnHash +
  //       "&&" +
  //       Buffer.from(token, "utf8").toString("base64");
  //     let element = document.createElement("a");
  //     element.href = url;
  //     element.target = "_self";
  //     element.click();
  //     setDetailsModal(false);
  //   } else {
  //     const desktopRefund = async () => {
  //       let ethereum = await detectEthereumProvider();
  //       try {
  //         await ethereum.request({
  //           method: "wallet_switchEthereumChain",
  //           params: [{ chainId: chainIds[clickedTxn.network] }],
  //         });
  //         refunding();
  //       } catch (error) {
  //         if (error.message === "User rejected the request.") {
  //           console.log("user rejected chain switch request", error);
  //         } else {
  //           try {
  //             await ethereum.request({
  //               method: "wallet_addEthereumChain",
  //               params: [addChainParams[clickedTxn.network]],
  //             });
  //             refunding();
  //           } catch (error) {
  //             console.log("User rejected add chain or MetaMask not installed", error);
  //           }
  //         }
  //       }
  //     };
  //     desktopRefund();
  //   }
  // };

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
    <section id="appPaymentsEl" className="w-full flex flex-col items-center relative">
      {/*---Header---*/}
      <div className="hidden md:h-[60px] md:flex justify-center items-center font-extrabold text-3xl text-blue-700">Payment History</div>
      {/*---Table + Buttons---*/}
      {transactionsState && paymentSettingsState ? (
        <div className="w-full">
          {/*---Table---*/}
          <div className="px-6 h-[calc(100vh-84px-72px-2px)] md:h-[calc(100vh-60px-72px-2px)] overflow-y-auto">
            {transactionsState.length > 1 ? (
              <table className="table-auto text-left w-full">
                <thead className="text-lg md:text-lg leading-none md:leading-none top-0 sticky">
                  {/*---first row, headers---*/}
                  <tr className="h-[40px]">
                    <th className="align-bottom">Time</th>
                    <th className="px-0.5 xs:px-2 align-bottom">Customer</th>
                    {paymentSettingsState.merchantFields.includes("daterange") && <th className="xs:px-2 align-bottom">Dates</th>}
                    {paymentSettingsState.merchantFields.includes("date") && <th className="xs:px-2 align-bottom">Date</th>}
                    {paymentSettingsState.merchantFields.includes("time") && <th className="xs:px-2 align-bottom">Time</th>}
                    {paymentSettingsState.merchantFields.includes("item") && (
                      <th className="xs:px-2 align-bottom">{merchantType2data[paymentSettingsState.merchantType]["itemlabel"]}</th>
                    )}
                    {paymentSettingsState.merchantFields.includes("count") && (
                      <th className={`${paymentSettingsState.merchantPaymentType === "online" ? "hidden md:table-cell" : ""} xs:px-2 align-bottom`}>Guests</th>
                    )}
                    {paymentSettingsState.merchantFields.includes("sku") && <th className="xs:px-2 align-bottom">SKU#</th>}
                    <th className="px-2 align-bottom">{paymentSettingsState.merchantCurrency}</th>
                  </tr>
                </thead>
                <tbody className="">
                  {/*---transactions---*/}
                  {transactionsState
                    .toReversed()
                    .slice((page - 1) * 10, (page - 1) * 10 + 10)
                    .map((txn: any, index: number) => (
                      <tr
                        id={txn.txnHash}
                        className={`${
                          txn.refund ? "text-gray-400" : ""
                        } h-[calc((100vh-84px-40px-72px-4px)/8)] md:h-[calc((100vh-60px-40px-72px-4px)/10)] border-b lg:hover:bg-gray-200 active:bg-gray-200 lg:cursor-pointer bg-white`}
                        // txn={JSON.stringify(txn)}
                        // test="test"
                        onClick={(e) => {
                          setDetailsModal(true);
                          setClickedTxn(e.currentTarget.id);
                          // setClickedTxn(JSON.parse(e.target.closest("tr").getAttribute("txn")));
                          // getToken();
                        }}
                        // id={`paymentsTxn${index}`}
                      >
                        <td className="whitespace-nowrap">
                          <div className={`${paymentSettingsState.merchantPaymentType === "inperson" ? "text-xl leading-none" : "text-sm leading-tight"}`}>
                            {getLocalTime(txn.date)}
                          </div>
                          <div className="text-sm leading-none">{getLocalDate(txn.date)}</div>
                        </td>
                        <td className="px-0.5 xs:px-2">
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
                        <td className={`${paymentSettingsState.merchantPaymentType === "inperson" ? "text-xl" : "text-xl"} px-2`}>{txn.currencyAmount}</td>
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

          {/*---buttons, 72px height---*/}
          <div className="h-[72px] flex items-center justify-evenly text-gray-800">
            {/*---arrows---*/}
            <div className="flex items-center justify-center w-1/3">
              <div
                onClick={() => (page === 1 ? "" : setPage(page - 1))}
                className="w-[58px] h-[58px] xs:hover:bg-white active:text-blue-300 flex justify-center items-center rounded-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-3xl pointer-events-none" />
              </div>
              <div className="text-xl font-bold w-[20px] text-center select-none">{page}</div>
              <div
                onClick={() => (page === maxPage ? "" : setPage(page + 1))}
                className="w-[58px] h-[58px] xs:hover:bg-white active:text-blue-300 flex justify-center items-center rounded-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faArrowRight} className="text-3xl pointer-events-none" />
              </div>
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
      {/*---modals---*/}

      {detailsModal && (
        <div>
          <div className="px-5 py-8 flex flex-col bg-white w-[348px] h-[360px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-50">
            {/*---CLOSE BUTTON---*/}
            <button
              onClick={() => {
                setDetailsModal(false);
                if (refundStatus === "refunded") {
                  location.reload();
                }
              }}
              className="absolute top-[calc(100%-28px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] text-3xl rounded-full h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 lg:hover:bg-red-500 active:bg-red-300"
            >
              <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
            </button>
            {/*---content---*/}
            <div className="h-full flex flex-col justify-center text-lg lg:text-base">
              <div>
                <span className="font-bold">Time:</span> {getLocalDate(clickedTxn.date)} {getLocalTime(clickedTxn.date)}
              </div>
              <div className="mt-2">
                <span className="font-bold">Payment:</span> {clickedTxn.currencyAmount} {clickedTxn.merchantCurrency}
              </div>
              <div className="mt-2">
                <span className="font-bold">Tokens sent:</span> {clickedTxn.tokenAmount} {clickedTxn.token} ({clickedTxn.network})
              </div>
              <div className="mt-2">
                <span className="font-bold">Customer:</span> <span className="break-all">{clickedTxn.customerAddress}</span>
              </div>
            </div>
            <div className="mt-6 mb-6 sm:mb-0 flex justify-center">
              <button
                id="paymentsRefundButton"
                className={`${
                  clickedTxn.refund || refundStatus === "refunded" ? "bg-gray-300 pointer-events-none" : " bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 cursor-pointer"
                } w-full h-[56px] flex justify-center items-center text-white font-bold text-lg rounded-[4px]`}
                // onClick={onClickRefund}
              >
                {refundStatus === "initial" && clickedTxn.refund == false && "Refund"}
                {refundStatus === "refunding" && (
                  <div className="flex items-center">
                    <SpinningCircleWhite />
                    <div className="ml-2">{msg}</div>
                  </div>
                )}
                {(refundStatus === "refunded" || clickedTxn.refund == true) && "Refunded"}
              </button>
            </div>
          </div>
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
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
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
      {errorModal && (
        <div>
          <div className="flex justify-center bg-white w-[270px] h-[270px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            {/*---content---*/}
            <div className="h-full flex flex-col justify-between items-center text-lg leading-tight md:text-base md:leading-snug px-6 py-6">
              {/*---msg---*/}
              <div className="mt-8 text-center">{errorMsg}</div>
              {/*---close button---*/}
              <button
                onClick={() => setErrorModal(false)}
                className="w-[160px] h-[56px] lg:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-lg tracking-wide font-bold"
              >
                DISMISS
              </button>
            </div>
          </div>
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
    </section>
  );
};

export default Payments;
