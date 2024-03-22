"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// qr code
import { QRCodeSVG } from "qrcode.react";
import { pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Buffer } from "buffer";
// wagmi
import { useDisconnect } from "wagmi";
// components
import MockUI from "@/app/_components/MockUI";
// components - modals
import FigmaModal from "./modals/FigmaModal";
import ScanModal from "./modals/ScanModal";
import ExchangeModal from "./modals/ExchangeModal";
import APIModal from "./modals/ApiKeyModal";
import RefundModal from "./modals/RefundModal";
import DepositAddressModal from "./modals/DepositAddressModal";
// constants
import { countryData, CEXdata, activeCountries, merchantType2data, list2string, fees } from "@/utils/constants";
// images
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faArrowRightLong,
  faArrowDownLong,
  faCircleCheck,
  faCircleInfo,
  faCopy,
  faFileInvoiceDollar,
  faList,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";

const Settings = ({
  paymentSettingsState,
  setPaymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  isMobile,
  introModal,
  setIntroModal,
}: {
  paymentSettingsState: any;
  setPaymentSettingsState: any;
  cashoutSettingsState: any;
  setCashoutSettingsState: any;
  isMobile: boolean;
  introModal: boolean;
  setIntroModal: any;
}) => {
  console.log("Settings, rendered once");
  const [url, setUrl] = useState("");
  // modal states
  const [figmaModal, setFigmaModal] = useState(false);
  const [scanModal, setScanModal] = useState(false);
  const [exchangeModal, setExchangeModal] = useState(false);
  const [apiModal, setApiModal] = useState(false);
  const [merchantBusinessTypeModal, setMerchantBusinessTypeModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  const [depositAddressModal, setDepositAddressModal] = useState(false);
  const [popup, setPopup] = useState("");
  // Boolean states
  const [savingState, setSavingState] = useState("saved"); // saved | savechanges | saving
  const [expandOne, setExpandOne] = useState(false);
  const [expandTwo, setExpandTwo] = useState(false);
  const [expandThree, setExpandThree] = useState(false);

  const router = useRouter();
  const { disconnectAsync } = useDisconnect();

  // listens to changes in paymentSettingsState and sets the url
  useEffect(() => {
    console.log("url useEffect run once");
    let tempUrl =
      paymentSettingsState.merchantPaymentType +
      "&&" +
      encodeURIComponent(paymentSettingsState.merchantName) +
      "&&" +
      paymentSettingsState.merchantCurrency +
      "&&" +
      paymentSettingsState.merchantEvmAddress;
    if (paymentSettingsState.merchantPaymentType === "online") {
      tempUrl =
        tempUrl +
        "&&" +
        Buffer.from(paymentSettingsState.merchantEmail, "utf8").toString("base64") +
        "&&" +
        Buffer.from(paymentSettingsState.merchantWebsite, "utf8").toString("base64") +
        "&&" +
        paymentSettingsState.merchantBusinessType +
        "&&" +
        paymentSettingsState.merchantFields.join(",");
    }
    setUrl(tempUrl);
    console.log(tempUrl);
  }, [paymentSettingsState]);

  const onChangeMerchantFields = (e: any) => {
    let merchantFieldsTemp: string[] = [];
    document.querySelectorAll<HTMLInputElement>("input[data-category='settingsMerchantFields']").forEach((i) => {
      if (i.checked) {
        merchantFieldsTemp.push(i.name);
      }
    });
    setPaymentSettingsState({ ...paymentSettingsState, merchantFields: merchantFieldsTemp });
    setSavingState("savechanges");
  };

  const missingInfo = () => {
    let missingInfo = [];
    // merchant name
    if (paymentSettingsState.merchantName === "") {
      missingInfo.push("Name of Your Business");
    }
    // website
    if (paymentSettingsState.merchantPaymentType === "online") {
      if (paymentSettingsState.merchantWebsite === "") {
        missingInfo.push("Your Website");
      } else if (paymentSettingsState.merchantWebsite.slice(0, 4) != "http") {
        missingInfo.push(`Website must start with "http(s)"`);
      }
    }

    if (missingInfo.length > 0) {
      setErrorModal(true);
      setErrorMsg(
        <div className="text-center">
          <div className="mb-2">Please fill out the fields:</div>
          {missingInfo.map((i) => (
            <div className="font-bold text-base">{i}</div>
          ))}
        </div>
      );
      return true;
    } else {
      return false;
    }
  };

  const downloadQrPng = () => {
    if (savingState === "saved") {
      if (missingInfo() === false) {
        let el = document.getElementById("qrpng") as HTMLCanvasElement;
        let qrPngUrl = el?.toDataURL(); // returns raw bytes in base64 format
        let downloadLink = document.createElement("a");
        downloadLink.href = qrPngUrl;
        downloadLink.download = "QRCode.png";
        downloadLink.click();
      }
    } else {
      setErrorModal(true);
      setErrorMsg("Please first save changes");
    }
  };

  const downloadQrSvg = () => {
    if (savingState === "saved") {
      if (missingInfo() === false) {
        let el = document.getElementById("qrsvg") as HTMLCanvasElement;
        let svgXML = new XMLSerializer().serializeToString(el);
        let qrSvgUrl = "data:image/svg," + encodeURIComponent(svgXML);
        let downloadLink = document.createElement("a");
        downloadLink.href = qrSvgUrl;
        downloadLink.download = "QRCode.svg";
        downloadLink.click();
      }
    } else {
      setErrorModal(true);
      setErrorMsg("Please first save changes");
    }
  };

  const downloadPlacardPdf = async () => {
    if (savingState === "saved") {
      if (missingInfo() === false) {
        const PlacardComponent = CEXdata[cashoutSettingsState.CEX].placard.component;
        let el = document.getElementById("qrsvg");
        const blob = await pdf(
          <Document>
            <Page size="A5" style={{ position: "relative" }}>
              <View>
                <PlacardComponent />
              </View>
              <View style={{ position: "absolute", transform: "translate(105, 186)" }}>
                <Svg width="215" height="215" viewBox={el?.attributes.viewBox.value} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <Path fill="#ffffff" d={el?.children[0].attributes.d.value} shape-rendering="crispEdges"></Path>
                  <Path fill="#000000" d={el?.children[1].attributes.d.value} shape-rendering="crispEdges"></Path>
                </Svg>
              </View>
            </Page>
          </Document>
        ).toBlob();
        saveAs(blob, "MyPlacard");
      }
    } else {
      setErrorModal(true);
      setErrorMsg("Please first save changes");
    }
  };

  const downloadPlacardFigma = () => {
    if (savingState === "saved") {
      if (missingInfo() === false) {
        let downloadLink = document.createElement("a");
        downloadLink.href = CEXdata[cashoutSettingsState.CEX].placard.fig;
        downloadLink.download = "template.fig";
        downloadLink.click();
      }
    } else {
      setErrorModal(true);
      setErrorMsg("Please first save changes");
    }
  };

  const onClickPaymentLink = () => {
    if (savingState === "saved") {
      if (missingInfo() === false) {
        setPopup("copyLinkButton");
        setTimeout(() => setPopup(""), 2000);
        navigator.clipboard.writeText(paymentSettingsState.url.replace("metamask.app.link/dapp/", ""));
      }
    } else {
      setErrorModal(true);
      setErrorMsg("Please first save changes");
    }
  };

  const saveSettings = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setSavingState("saving");
    try {
      const res = await fetch("/api/saveSettings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentSettings: paymentSettingsState, cashoutSettings: cashoutSettingsState }),
      });
      const data = await res.json();

      if (data === "saved") {
        setSavingState("saved");
        setPopup("saved");
        setTimeout(() => setPopup(""), 1000);
      } else {
        setErrorMsg("Internal server error. Data was not saved.");
        setErrorModal(true);
        setSavingState("savechanges");
      }
    } catch (e) {
      setErrorMsg("Server request error. Data was not saved.");
      setErrorModal(true);
      setSavingState("savechanges");
    }
  };

  const onClickIntroModal = async () => {
    setIntroModal(false);
    try {
      const res = await fetch("/api/intro", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchantEvmAddress: paymentSettingsState.merchantEvmAddress }),
      });
      const data = await res.json();

      if (data === "saved") {
        console.log("intro set to false");
      } else {
        setErrorMsg("Internal server error. Data was not saved.");
        setErrorModal(true);
      }
    } catch (e) {
      setErrorMsg("Server request error. Data was not saved.");
      setErrorModal(true);
    }
  };

  console.log("last render, paymentSettingsState:", paymentSettingsState);
  console.log("last render, cashoutSettings:", cashoutSettingsState);
  return (
    <section id="accountEl" className="w-full mt-6 flex flex-col">
      {/*---10 MODALS---*/}
      {errorModal && (
        <div>
          <div className="flex flex-col items-center bg-white w-[300px] h-[300px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[20]">
            {/*---content---*/}
            <div className="w-full h-full px-6 flex flex-col justify-center text-lg leading-tight md:text-base md:leading-snug">
              <div className="text-center">{errorMsg}</div>
            </div>
            {/*---close button---*/}
            <button
              onClick={() => setErrorModal(false)}
              className="mb-8 w-[230px] h-[56px] xs:h-[44px] flex-none bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-lg tracking-wide font-bold"
            >
              DISMISS
            </button>
          </div>
          <div className="opacity-60 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
      {introModal && (
        <div>
          <div className="flex flex-col justify-evenly items-center w-[348px] h-[450px] bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            <div className="w-[242px] text-xl leading-relaxed">
              To get started, read the <span className="font-bold">Instructions</span> section that appears in front of you after you close this popup.
            </div>
            <div>
              <div className="text-center text-xl font-bold">Real humans helping you</div>
              <div className="mt-0.5 w-[290px] border border-slate-500 px-2 py-1.5 rounded-[4px] text-base leading-tight xs:leading-tight">
                If you are having any difficulty setting up, email contact@lingpay.io and one of our advisors will contact you within 24 hours to help you get started.
              </div>
            </div>

            {/*---close button---*/}
            <button
              onClick={onClickIntroModal}
              className="w-[290px] h-[56px] xs:h-[48px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-xl xs:text-lg font-bold tracking-wide"
            >
              CLOSE
            </button>
          </div>
          <div className="opacity-60 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
      {merchantBusinessTypeModal && (
        <div>
          <div className="flex flex-col items-center justify-between bg-white w-[350px] xs:w-[400px] h-[420px] py-[28px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-20">
            <div className="font-bold text-2xl">Select a business type</div>
            <div className="grid grid-cols-3 gap-y-2 gap-x-0.5 xs:gap-y-3 xs:gap-x-2">
              {Object.keys(merchantType2data).map((i, index) => (
                <div
                  id={`settings${i}`}
                  key={index}
                  className={`${
                    paymentSettingsState.merchantBusinessType == i ? "bg-blue-100" : ""
                  } flex flex-col items-center cursor-pointer rounded-md py-2 border-gray-200 hover:bg-blue-100 transition-transform duration-300 backface-hidden relative`}
                  onClick={(e) => {
                    const merchantBusinessTypeTemp = e.currentTarget.id.replace("settings", "");
                    const merchantFieldsTemp = merchantType2data[merchantBusinessTypeTemp].merchantFields;
                    setPaymentSettingsState({ ...paymentSettingsState, merchantBusinessType: merchantBusinessTypeTemp, merchantFields: merchantFieldsTemp });
                    setMerchantBusinessTypeModal(false);
                    setSavingState("savechanges");
                  }}
                >
                  <div>
                    <FontAwesomeIcon icon={merchantType2data[i].fa} className="text-lg text-blue-500 pointer-events-none" />
                  </div>
                  <div className="text-base leading-none text-center font-bold pointer-events-none">{merchantType2data[i].text}</div>
                  <div className="text-base leading-none text-gray-600 pointer-events-none text-center tracking-tight">{merchantType2data[i].subtext ?? ""}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setMerchantBusinessTypeModal(false)}
              className="w-[220px] h-[52px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-lg font-bold tracking-wide"
            >
              CLOSE
            </button>
          </div>
          <div className=" opacity-60 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
      {figmaModal && <FigmaModal setFigmaModal={setFigmaModal} />}
      {scanModal && <ScanModal setScanModal={setScanModal} merchantCountry={paymentSettingsState.merchantCountry} />}
      {exchangeModal && <ExchangeModal setExchangeModal={setExchangeModal} CEX={cashoutSettingsState.CEX} />}
      {apiModal && <APIModal setApiModal={setApiModal} />}
      {refundModal && <RefundModal setRefundModal={setRefundModal} />}
      {depositAddressModal && <DepositAddressModal setDepositAddressModal={setDepositAddressModal} />}

      {/*---Page Title---*/}
      <div className="hidden md:block w-full font-extrabold text-2xl sm:text-3xl text-blue-700 text-center">Settings</div>
      {/*---Page Body---*/}
      <div className="md:mt-2 mx-2 sm:mx-6">
        {/*---Instructions---*/}
        <div className="xs:ml-[28px] sm:ml-[41px] lg:w-[688px] text-gray-700">
          <div className="w-full text-center xs:text-start text-3xl xs:text-2xl font-extrabold">Instructions</div>
          {/*---Instructions, Step 1: Set up---*/}
          <div className="mt-3 mb-1 text-xl xs:text-lg font-bold">
            1. Set up{" "}
            <span
              className="link font-normal whitespace-nowrap"
              onClick={() => {
                setExpandOne(!expandOne);
                setExpandTwo(false);
                setExpandThree(false);
              }}
            >
              {expandOne ? "hide" : "instructions"} <FontAwesomeIcon icon={expandOne ? faAngleUp : faAngleDown} className="align-middle" />
            </span>
          </div>
          <div className={`${expandOne ? "max-h-[700px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
            <div className="appInstructionsBody">
              {paymentSettingsState.merchantPaymentType === "inperson" ? (
                <div className="flex flex-col relative">
                  <div className="flex">
                    <div className="mr-1">1.</div>
                    <div>
                      Fill out the <span className="font-bold">Payment Settings</span> below
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <div className="mr-1">2.</div>
                    <div>
                      <span className="link" onClick={downloadPlacardPdf}>
                        Download your QR code
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <div className="mr-1">3.</div>
                    <div>
                      Print out and display your QR code
                      <div className="ml-2">&bull; we recommend using a print shop</div>
                      <div className="ml-2">
                        &bull; a print size of A6 (4x6") will fit{" "}
                        <a href="https://www.amazon.com/s?k=4x6+sign+holders" target="_blank" className="link">
                          these sign holders
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    (optional) Design your own placard (
                    <span className="link" onClick={() => setFigmaModal(true)}>
                      instructions
                    </span>
                    )
                    {/* . Then, download{" "}
                    <span className="link" onClick={downloadPlacardFigma}>
                      this Figma file
                    </span>{" "}
                    and the naked QR code either in{" "}
                    <span className="link" onClick={downloadQrSvg}>
                      SVG
                    </span>{" "}
                    (recommended) or{" "}
                    <span className="link" onClick={downloadQrPng}>
                      PNG
                    </span>{" "}
                    format. */}
                  </div>
                  <div className="relative">
                    (optional) Create an Employee Password below (
                    <span className="group">
                      <span className="link">why use an Employee Password?</span>
                      <div className="invisible group-hover:visible absolute w-[300px] top-[-171px] xs:top-[-140px] sm:top-[-90px] sm:w-[500px] p-4 border rounded-md bg-gray-100">
                        When an employee signs into the Flash Pay App with <span className="font-bold">Your Email</span> and the{" "}
                        <span className="font-bold">Employee Password</span>, they can view the{" "}
                        <span className="text-blue-700 font-bold">
                          <FontAwesomeIcon icon={faList} className="pr-0.5" />
                          Payments
                        </span>{" "}
                        menu tab to confirm customer payments. They can also mark payments as "To Be Refunded".
                      </div>
                    </span>
                    )
                  </div>
                </div>
              ) : (
                <div>
                  <div>
                    Fill out the <span className="font-bold">Payment Settings</span> below. Then, copy your Payment Link (located below the QR Code placard) and use it in an
                    &lt;a&gt; tag in your HTML code to create a "Flash Pay" payment button. Or, put the link on your social media profile (use URL shorteners to shorten it).
                  </div>
                  <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                    (Optional){" "}
                    <span onClick={downloadPlacardPdf} className="link">
                      Download the QR Code placard
                    </span>{" "}
                    (or naked QR code in{" "}
                    <span className="link" onClick={downloadQrSvg}>
                      SVG
                    </span>{" "}
                    or{" "}
                    <span className="link" onClick={downloadQrPng}>
                      PNG
                    </span>{" "}
                    format) and put it on any appropriate online medium
                  </div>
                  <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                    (Optional) To edit your placard's size or design, read{" "}
                    <span className="link" onClick={() => setFigmaModal(true)}>
                      these instructions
                    </span>{" "}
                    and download{" "}
                    <span className="link" onClick={downloadPlacardFigma}>
                      this Figma file
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/*---Instructions, Step 2: Download your QR code---*/}
          <div className="mt-3 mb-1 text-xl xs:text-lg font-bold">
            2. Confirm payment{" "}
            <span
              className="link font-normal whitespace-nowrap"
              onClick={() => {
                setExpandTwo(!expandTwo);
                setExpandOne(false);
                setExpandThree(false);
              }}
            >
              {expandTwo ? "hide" : "instructions"} <FontAwesomeIcon icon={expandTwo ? faAngleUp : faAngleDown} className="align-middle" />
            </span>
          </div>
          <div className={`${expandTwo ? "max-h-[820px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
            <div className="appInstructionsBody">
              {paymentSettingsState.merchantPaymentType === "inperson" ? (
                <div className="">
                  <div className="font-bold">How does the customer pay?</div>
                  <div>
                    The customer pays by opening their Flash App, scanning your QR Code, and entering the amount of {paymentSettingsState.merchantCurrency} for payment.
                    {paymentSettingsState.merchantCurrency == "USD" ? "" : ` USDC tokens with the same value will be sent from the customer to your Flash Pay account.`}
                  </div>
                  <div className="mt-4 font-bold">How do I confirm payment?</div>
                  <div className="mt-1 relative">
                    If the customer's payment is successful, your Flash App will receive a push notification. In addition, the payment will show in{" "}
                    <span className="text-blue-700 whitespace-nowrap font-bold">
                      <FontAwesomeIcon icon={faList} className="pr-0.5" />
                      Payments
                    </span>{" "}
                    within several seconds.{" "}
                    <span className="group">
                      <span className="link">What if the cashier does not have access to an electronic device?</span>
                      <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%-17px)] w-full px-3 py-2 font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                        If you check the customer's phone, it should show an animated "Payment Completed" page. For a preview, click "Send" in the phone interface below.
                      </div>
                    </span>
                  </div>
                  <div className="mt-4 font-bold">How should I log the payment?</div>
                  <div>
                    Payment history can be downloaded in{" "}
                    <span className="text-blue-700 font-bold whitespace-nowrap">
                      <FontAwesomeIcon icon={faList} className="px-0.5" />
                      Payments
                    </span>
                    . But, we recommend you log the payment as a cash payment in your PoS device to maintain a single system for all payments.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold">How does the customer pay?</div>
                  <div>
                    The customer pays by opening their Flash App, scanning your QR Code, and entering the amount of {paymentSettingsState.merchantCurrency} for payment.
                    {paymentSettingsState.merchantCurrency == "USD" ? "" : ` USDC tokens with the same value will be sent to your Flash Pay account.`}
                  </div>
                  <div className="mt-1">You can confirm the payment in two ways:</div>
                  <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                    <span className="font-bold">Check your email.</span> If payment has been successfully sent to you, you will receive an email. The email will contain all
                    information about the purchase.
                  </div>
                  <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                    <span className="font-bold">Check the Flash Pay App.</span> Payment should appear in the{" "}
                    <span className="text-blue-700 font-bold whitespace-nowrap">
                      <FontAwesomeIcon icon={faList} className="pr-0.5" />
                      Payments
                    </span>{" "}
                    menu tab after ~5s (a page refresh may be needed)
                  </div>
                </div>
              )}
              <div className="mt-4 font-bold text-gray-600">How do I refund a customer's payment?</div>
              <div className="relative">
                You (or an employee) can mark a payment in{" "}
                <span className="text-blue-700 font-bold whitespace-nowrap">
                  <FontAwesomeIcon icon={faList} className="px-0.5" />
                  Payments
                </span>{" "}
                as "To Be Refunded". At the end of the day, open your Flash Pay App &gt; go to{" "}
                <span className="text-blue-700 font-bold whitespace-nowrap">
                  <FontAwesomeIcon icon={faList} className="px-0.5" />
                  Payments
                </span>{" "}
                &gt; click "Refund all payments marked as To Be Refunded". Or, you can click the individual payments and refund each payment one-by-one.{" "}
                <span className="link" onClick={() => setRefundModal(true)}>
                  More about refunds
                </span>
              </div>
            </div>
          </div>
          {/*--- Instructions, 3. Cash Out ---*/}
          <div className="mt-3 mb-1 text-xl xs:text-lg font-bold">
            3. Cash out{" "}
            <span
              className="link font-normal whitespace-nowrap"
              onClick={() => {
                setExpandThree(!expandThree);
                setExpandTwo(false);
                setExpandOne(false);
              }}
            >
              {expandThree ? "hide" : "instructions"} <FontAwesomeIcon icon={expandThree ? faAngleUp : faAngleDown} className="align-middle" />
            </span>
          </div>
          <div className={`${expandThree ? "max-h-[500px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
            <div className="appInstructionsBody space-y-4">
              {/*--- cash out step 1 ---*/}
              <div className="flex">
                <div className="mr-1">1.</div>
                <div>
                  Sign up for an account on {cashoutSettingsState.cex} (
                  <span className="link" onClick={() => setExchangeModal(true)}>
                    instructions
                  </span>
                  )
                </div>
              </div>
              {/*--- cash out step 2 ---*/}
              <div className="flex">
                <div className="mr-1">2.</div>
                <div>
                  {/*--- not Coinbase Exchange ---*/}
                  {cashoutSettingsState.cex != "Coinbase Exchange" && (
                    <div>In your {cashoutSettingsState.cex}, copy your USDC deposit address on the Polygon network (instructions) and paste it in the Cash Out Settings below</div>
                  )}
                  {/*--- Coinbase Exchange ---*/}
                  {cashoutSettingsState.cex == "Coinbase Exchange" && (
                    <div>
                      In Cash Out, click "Withdraw" and a window should prompt you to sign into Coinbase. After signing in, enter the amount to withdraw and click "Submit
                      Withdrawal". The USDC tokens in your Flash Pay account will be converted to {paymentSettingsState.merchantCurrency} at{" "}
                      {paymentSettingsState.merchantCurrency == "USD" ? "a 1:1 rate (no fees)" : "the best possible exchange rate on Coinbase (including 0.01% fees)"}, and then
                      deposited into your bank within 24-48 hours ({fees[cashoutSettingsState.cex][paymentSettingsState.merchantCountry]} fee).
                    </div>
                  )}
                </div>
              </div>
              {/*--- cash out step 3 ---*/}
              {cashoutSettingsState.cex != "Coinbase Exchange" && (
                <div className="flex">
                  <div className="mr-1">3.</div>
                  <div>
                    {cashoutSettingsState.cex != "Coinbase Exchange" && (
                      <div className="">
                        To cash out, go to the{" "}
                        <span className="text-blue-700 font-bold whitespace-nowrap">
                          <FontAwesomeIcon icon={faFileInvoiceDollar} className="pr-0.5" />
                          Cash Out
                        </span>{" "}
                        menu tab and click the <span className="bg-blue-700 text-white font-bold text-xs px-1.5 py-0.5 xs:py-0 rounded-full whitespace-nowrap">Cash Out</span>{" "}
                        button. This will send all USDC from your Flash App to your {cashoutSettingsState.cex}. Then, in your exchange, convert USDC to{" "}
                        {paymentSettingsState.merchantCurrency}, and withdraw the money to your bank.
                      </div>
                    )}
                    {cashoutSettingsState.cex == "Coinbase Exchange" && (
                      <div className="">
                        Fill in the "Cash Out Settings" below. When you are ready to cash out, go to the{" "}
                        <span className="text-blue-700 font-bold whitespace-nowrap">
                          <FontAwesomeIcon icon={faFileInvoiceDollar} className="pr-0.5" />
                          Cash Out
                        </span>{" "}
                        menu tab and click the <span className="bg-blue-700 text-white font-bold text-xs px-1.5 py-0.5 xs:py-0 rounded-full whitespace-nowrap">Cash Out</span>{" "}
                        button. Deposits should arrive in your bank after 1-2 days.
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="relative">
                <span className="group">
                  <span className="link">Will I lose money from fluctuating exchange rates?</span>
                  {/*---tooltip---*/}
                  <div className="invisible group-hover:visible absolute bottom-[calc(100%+6px)] px-3 py-2 pointer-events-none text-gray-700 bg-gray-100 border-gray-500 border rounded-lg z-10">
                    During payment, our interface adds 0.3~0.5% to the stablecoin-to-fiat exchange rate in favor of the business. Therefore, on average, you should not lose money
                    from fluctuating rates if you convert frequently (e.g., once a week).
                  </div>
                </span>
              </div>
            </div>
          </div>
          {/* <div className="mt-3 text-center xs:text-start text-lg font-bold link">Help Me Get Started</div> */}
        </div>

        {/*---Payment Settings---*/}
        <div>
          {/*---title---*/}
          <div className="mt-10 flex items-center relative">
            <div className="hidden xs:block w-[20px] h-[20px] rounded-full bg-orange-500 flex-none"></div>
            <div className="hidden xs:block absolute w-[2px] h-[1000px] bg-orange-500 top-[12px] left-[9px]"></div>
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-6 text-3xl xs:text-2xl font-extrabold text-blue-700">Payment Settings</div>
          </div>
          {/*---form + placard/UI container---*/}
          <div className="xs:ml-[28px] sm:ml-[41px] flex flex-col lg:flex-row">
            {/*---form---*/}
            <form className="appSettingsForm">
              {/*---merchantName---*/}
              <div className="flex flex-col">
                <label className="labelfont">Name of Your Business</label>
                <input
                  className="inputfont"
                  onChange={(e: any) => {
                    setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value });
                    // createURL({ ...paymentSettingsState, merchantName: e.target.value }); // this is the new value
                    setSavingState("savechanges");
                  }}
                  value={paymentSettingsState.merchantName}
                ></input>
              </div>

              {/*---merchantCountry & merchantCurrency---*/}
              <div className="flex flex-col">
                <label className="labelfont">Your Local Currency</label>
                <select
                  onChange={(e) => {
                    const merchantCountryTemp = e.target.value.split(" (")[0];
                    const merchantCurrencyTemp = e.target.value.split(" (")[1].replace(")", "");
                    const cexTemp = countryData[merchantCountryTemp].CEXes[0];
                    setPaymentSettingsState({
                      ...paymentSettingsState,
                      merchantCountry: merchantCountryTemp,
                      merchantCurrency: merchantCurrencyTemp,
                    });
                    setCashoutSettingsState({ cex: cexTemp, cexEvmAddress: "", cexApiKey: "", cexSecretKey: "" });
                    setSavingState("savechanges");
                  }}
                  id="accountCountryCurrency"
                  className="md:w-[200px] inputfont bg-white"
                >
                  {activeCountries.map((i, index) => (
                    <option key={index} selected={paymentSettingsState.merchantCountry === i.split(" (")[0]}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              {/*---merchantPaymentType---*/}
              <div className="flex flex-col relative">
                <div className="labelfont">
                  <span className="group cursor-pointer">
                    <span>
                      Payment Type <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:text-sm text-gray-300" />
                    </span>
                    <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%+8px)] w-full px-3 py-2 text-lg xs:text-sm leading-tight font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                      In-person payments are suitable for physical stores. Online payments are suitable for online stores.
                    </div>
                  </span>
                </div>
                <select
                  id="accountMerchantPaymentType"
                  className="w-full md:w-[200px] inputfont bg-white"
                  onChange={(e) => {
                    let merchantPaymentTypeTemp = e.target.value === "In-person payments" ? "inperson" : "online";
                    if (merchantPaymentTypeTemp === "inperson") {
                      setPaymentSettingsState({
                        ...paymentSettingsState,
                        merchantPaymentType: merchantPaymentTypeTemp,
                        merchantBusinessType: "",
                        merchantWebsite: "",
                        merchantFields: [],
                      });
                    } else if (merchantPaymentTypeTemp === "online") {
                      setPaymentSettingsState({
                        ...paymentSettingsState,
                        merchantPaymentType: merchantPaymentTypeTemp,
                        merchantBusinessType: "onlinephysical",
                        merchantWebsite: "",
                        merchantFields: ["email", "item", "shipping"],
                      });
                    }
                    setSavingState("savechanges");
                  }}
                >
                  <option selected={paymentSettingsState.merchantPaymentType === "inperson"}>In-person payments</option>
                  <option selected={paymentSettingsState.merchantPaymentType === "online"}>Online payments</option>
                </select>
              </div>

              {/*---merchantGoogleId---*/}
              <div className="flex flex-col">
                <div className="labelfont relative">
                  <span className="group cursor-pointer">
                    <span>
                      (optional) Your Google Place ID <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:text-sm text-gray-300" />
                    </span>
                    <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%+8px)] px-3 py-2 text-lg xs:text-sm leading-tight font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                      If you would like to advertise your business on www.stablecoinmap.com, please enter your business's Google Place ID. If you don't have one, enter your "lat,
                      lng" coordinates (must include 6 digits after decimal). Find the coordinates by dropping a pin on Google Map. Stablecoin Map is a community-driven database of
                      businesses that accept stablecoin payments.
                    </div>
                  </span>
                </div>
                <input
                  onChange={(e: any) => {
                    setPaymentSettingsState({ ...paymentSettingsState, merchantGoogleId: e.target.value });
                    setSavingState("savechanges");
                  }}
                  id="accountStablecoinmap"
                  defaultValue={paymentSettingsState.merchantGoogleId}
                  className="inputfont"
                ></input>
              </div>

              {/*---2% off---*/}
              {paymentSettingsState.merchantPaymentType === "inperson" && (
                <div className="mt-6 mb-4 xs:mt-4 xs:mb-2 flex items-center xs:justify-start relative">
                  <div className="w-[218px] xs:w-auto md:w-[172px] text-lg xs:text-sm font-bold leading-tight">
                    <span className="group cursor-pointer">
                      <span>
                        Give Customers 2% Instant Cashback? <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:text-sm text-gray-300" />
                      </span>
                      <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%+8px)] px-3 py-2 text-lg xs:text-sm leading-tight font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                        Our journey towards revolutionizing payments is a difficult one. For one, credit cards charge merchants 3% and give 1% to the customer, so customers have
                        few incentives to use other payment methods. Therefore, we are asking merchants (who use "In-person Payments") to give customers an instant 2% cashback.
                        Businesses will still save ~1% compared to most payment platforms. Furthermore, the cashback program should bring new customers to your business. Finally,
                        we believe most businesses would rather give 2% to their customers than give 3% to big corporations. When blockchain payments become more popular, we will
                        make this cashback optional. Flash Pay takes zero fees and all savings are given to the customer.
                      </div>
                    </span>
                  </div>
                  <div className="grow flex justify-center">
                    <div className="relative flex items-center cursor-pointer">
                      <input id="autoCheckbox" type="checkbox" className="pointer-events-none sr-only peer" checked readOnly></input>
                      <div className="hidden xs:block pointer-events-none w-[44px] h-[24px] bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                      <div className="xs:hidden pointer-events-none w-[68px] h-[36px] bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[32px] after:w-[32px] after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                      <span className="ml-1 xs:ml-2 w-[22px] text-lg xs:text-sm">On</span>
                    </div>
                  </div>
                </div>
              )}

              {/*---merchantWebsite---*/}
              <div className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"} flex flex-col relative`}>
                <div className="labelfont">
                  <span className="group">
                    <label className="">
                      Your Website <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:align-baseline xs:text-sm text-slate-300" />
                    </label>
                    <div className="invisible group-hover:visible pointer-events-none absolute bottom-[calc(100%-6px)] w-[330px] px-3 py-1 text-base font-normal xs:text-sm leading-tight bg-slate-100 border border-slate-300 rounded-lg z-[1]">
                      <p>- start with "http(s)"</p>
                      <p>- this website is where customers look up item names & prices</p>
                    </div>
                  </span>
                </div>
                <input
                  className="inputfont"
                  onChange={(e: any) => {
                    setPaymentSettingsState({ ...paymentSettingsState, merchantWebsite: e.target.value });
                    setSavingState("savechanges");
                  }}
                  value={paymentSettingsState.merchantWebsite}
                ></input>
              </div>

              {/*---merchantBusinessType---*/}
              <div className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"}`}>
                <div className="flex">
                  <label className="labelfont">Your Business Type</label>
                </div>
                <div onClick={() => setMerchantBusinessTypeModal(true)} className="w-full flex items-center inputfont cursor-pointer hover:bg-blue-100">
                  {paymentSettingsState.merchantBusinessType && (
                    <div>
                      <FontAwesomeIcon icon={merchantType2data[paymentSettingsState.merchantBusinessType].fa} className="text-blue-500 mr-1.5" />{" "}
                      {merchantType2data[paymentSettingsState.merchantBusinessType].text}
                    </div>
                  )}
                </div>
              </div>

              {/*---merchantFields---*/}
              <div className={`${paymentSettingsState.merchantPaymentType === "inperson" ? "hidden" : ""}`}>
                {/*---label---*/}
                <div className="flex">
                  {/*---container with width matching text width---*/}
                  <div className="flex group relative">
                    <div className="labelfont">
                      Fields <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:align-baseline xs:text-sm text-slate-300" />
                    </div>
                    {/*---tooltip---*/}
                    <div className="invisible group-hover:visible pointer-events-none absolute bottom-6 w-[306px] px-3 py-1 text-base xs:text-sm leading-tight bg-slate-100 border border-blue-500 rounded-lg z-[1]">
                      Fields are fields the customer will have to fill out during payment. When you select a <span className="font-bold">Business Type</span>, we will pre-select
                      recommended fields for you. You can check/uncheck fields for customization.
                    </div>
                  </div>
                </div>
                {/*---fields checkboxes---*/}
                <div className="mt-2 xs:mt-1 grid grid-cols-3 gap-y-4 xs:gap-y-1">
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="email"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("email") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none">email</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="item"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("item") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none">
                      {paymentSettingsState.merchantType ? merchantType2data[paymentSettingsState.merchantType].itemlabel.toLowerCase() : "item name"}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="count"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("count") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none"># of guests</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="daterange"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("daterange") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none">date range</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="date"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("date") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none">single date</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="time"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("time") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none">time</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="shipping"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("shipping") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile flex-none"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none xs:leading-none">shipping address</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      data-category="settingsMerchantFields"
                      name="sku"
                      type="checkbox"
                      checked={paymentSettingsState.merchantFields.includes("sku") ? true : false}
                      onChange={onChangeMerchantFields}
                      className="checkboxMobile"
                    ></input>
                    <label className="ml-1 text-base xs:text-sm leading-none">SKU#</label>
                  </div>

                  {/* <div className="md:ml-6">
                            <div>
                              <input
                                category="field"
                                name="custom"
                                type="checkbox"
                                onChange={() => setIsCustomLabelSelected(document.querySelector("input[name='custom']").checked)}
                              ></input>
                              <label className="ml-2">custom label</label>
                              {isCustomLabelSelected ? (
                                <input
                                  id="customInput"
                                  onChange={handleOnChange}
                                  className="ml-[8px] w-full md:w-[160px] px-2 h-[23px] border border-slate-300 rounded-sm"
                                  placeholder="label name"
                                ></input>
                              ) : null}
                            </div>
                          </div> */}
                </div>
              </div>
              {/*--- save button ---*/}
              <div className="min-h-[96px] mt-4 mb-7 lg:mt-0 lg:mb-0 lg:h-full flex justify-center items-center">
                <button
                  className={`${
                    savingState === "saved" ? "pointer-events-none bg-gray-300" : "bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300"
                  } text-lg xs:text-base font-bold w-[200px] xs:w-[160px] text-center h-[56px] xs:h-[44px] rounded-full text-white cursor-pointer relative`}
                  onClick={saveSettings}
                >
                  {savingState === "saved" && <div>Saved</div>}
                  {savingState === "savechanges" && <div>Save Changes</div>}
                  {savingState === "saving" && (
                    <div className="w-full flex justify-center items-center">
                      <SpinningCircleWhite />
                    </div>
                  )}
                  {popup === "saved" && (
                    <div className="flex items-center absolute top-[-20px] left-[calc(50%-36px)] text-slate-700 font-normal z-10">
                      <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 mr-1.5" />
                      <div className="leading-none">saved</div>
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/*---placard/UI---*/}
            <div className="mt-4 sm:mt-0 lg:ml-2 w-full flex flex-col sm:flex-row lg:justify-center items-center">
              {/*---PLACARD---*/}
              <div className="flex flex-col items-center">
                {/*---header---*/}
                <div className="text-lg text-gray-700 font-bold">Your QR code placard</div>
                {/*---placard svg---*/}
                <div className="mt-2 relative">
                  <div className="w-[210px] h-[308px]">
                    <Image src="/placardCoinbaseUSDCCashback.svg" alt="placard" fill />
                  </div>
                  <QRCodeSVG
                    id="qrsvg"
                    xmlns="http://www.w3.org/2000/svg"
                    size={104}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"L"}
                    value={url}
                    className="absolute top-[100px] left-[53px]"
                  />
                </div>
                {/*---download button or payment link---*/}
                {paymentSettingsState.merchantPaymentType == "inperson" && (
                  <button className="mt-1 w-[200px] h-[56px] xs:h-[44px] text-base font-bold text-white bg-blue-500 lg:hover:bg-blue-600 rounded-full" onClick={downloadPlacardPdf}>
                    Download Placard
                  </button>
                )}
                {paymentSettingsState.merchantPaymentType == "online" && (
                  <button
                    id="accountcopylink"
                    className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"} mt-1 w-full relative`}
                    onClick={onClickPaymentLink}
                  >
                    <div className="w-full bg-blue-500 py-2 rounded-md text-white font-bold text-center hover:bg-blue-600 cursor-pointer">
                      <FontAwesomeIcon icon={faCopy} className="mr-1" /> Copy Payment Link
                    </div>
                    {popup === "copyLinkButton" && (
                      <div className="absolute bottom-[48px] left-[calc(50%-60px)] w-[120px] bg-white px-2 py-1 rounded-lg">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> link copied
                      </div>
                    )}
                  </button>
                )}
              </div>
              {/*---arrows---*/}
              <div className="my-4 md:my-0 sm:h-[280px] flex items-center text-slate-700">
                <div className="px-1 flex flex-row-reverse sm:flex-col items-center">
                  {paymentSettingsState.merchantPaymentType === "inperson" && <div className="w-[72px] text-sm text-center font-bold">customer scans QR code</div>}
                  {paymentSettingsState.merchantPaymentType === "online" && (
                    <div className="w-[150px] sm:w-[72px] text-sm text-center font-bold leading-tight sm:leading-normal">
                      <p>customer clicks link</p>
                      <p>or scans QR code</p>
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <FontAwesomeIcon icon={faArrowRightLong} className="text-3xl" />
                  </div>
                  <div className="sm:hidden">
                    <FontAwesomeIcon icon={faArrowDownLong} className="text-3xl" />
                  </div>
                </div>
              </div>
              {/*---UI---*/}
              <div className="sm:mt-4 lg:mt-0 flex flex-col items-center">
                <MockUI
                  merchantName={paymentSettingsState.merchantName}
                  merchantCurrency={paymentSettingsState.merchantCurrency}
                  merchantPaymentType={paymentSettingsState.merchantPaymentType}
                  merchantBusinessType={paymentSettingsState.merchantBusinessType}
                  merchantWebsite={paymentSettingsState.merchantWebsite}
                  merchantFields={paymentSettingsState.merchantFields}
                />
              </div>
            </div>
          </div>
        </div>

        {/*---Cash Out Settings---*/}
        <div>
          {/*---title---*/}
          <div className="mt-10 flex items-center relative">
            <div className="hidden xs:block w-[20px] h-[20px] rounded-full py-2 bg-orange-500 flex-none"></div>
            <div className="hidden xs:block absolute w-[2px] h-[400px] bg-orange-500 bottom-[10px] left-[9px]"></div>
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-5 text-3xl xs:text-2xl font-extrabold text-blue-700">Cash Out Settings</div>
          </div>
          {/*---form---*/}
          <form className="xs:ml-[28px] sm:ml-[41px] appSettingsForm">
            {/*---cex---*/}
            <div className="labelfont">Your Cryptocurrency Exchange</div>
            <select
              onChange={(e) => {
                const cexTemp = e.currentTarget.value;
                setCashoutSettingsState({ ...cashoutSettingsState, cex: cexTemp, cexEvmAddress: "" });
                setSavingState("savechanges");
              }}
              className="inputfont bg-white"
            >
              {countryData[paymentSettingsState.merchantCountry]["CEXes"].map((i, index) => (
                <option key={index} selected={cashoutSettingsState.cex === i}>
                  {i}
                </option>
              ))}
            </select>
            {/*---cexEvmAddress---*/}
            <div className="labelfont">
              Your Exchange's USDC deposit address on the Polygon network (
              <span className="link" onClick={() => setDepositAddressModal(true)}>
                instructions
              </span>
              )
            </div>
            <input
              className="w-full inputfontsmall"
              onChange={(e: any) => {
                setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value });
                setSavingState("savechanges");
              }}
              value={cashoutSettingsState.cexEvmAddress}
              autoComplete="none"
            ></input>
            {/*---cexApiKey---*/}
            {/* <div className="mt-3 text-lg xs:text-sm font-bold leading-tight xs:leading-tight">
                    Your Exchange's API Key{" "}
                    <span className="link" onClick={() => setApiModal(true)}>
                      instructions
                    </span>
                  </div>
                  <input
                    id="accountCexApiKey"
                    onChange={(e: any) => {
                      setCashoutSettingsState({ ...cashoutSettingsState, CEXKey: e.target.value });
                      setSavingState("savechanges");
                    }}
                    name="cexApiKey"
                    autoComplete="none"
                    defaultValue={cashoutSettingsState.cexSecretKey}
                    className="w-full mt-1 xs:mt-0 px-1 h-[40px] xs:h-[28px] text-lg xs:text-base text-gray-700 border border-slate-300 rounded-md outline-slate-300 lg:hover:bg-slate-100 focus:outline-blue-500 focus:bg-white transition-[outline-color] duration-[400ms]"
                  ></input> */}
            {/*---cexSecretKey---*/}
            {/* <div className="mt-3 text-lg xs:text-sm font-bold leading-tight xs:leading-tight">
                    Your Exchange's Key{" "}
                    <span className="link" onClick={() => setApiModal(true)}>
                      instructions
                    </span>
                  </div>
                  <input
                    id="accountCexSecretKey"
                    name="cexSecret"
                    onChange={(e: any) => {
                      setCashoutSettingsState({ ...cashoutSettingsState, CEXSecret: e.target.value });
                      setSavingState("savechanges");
                    }}
                    defaultValue={cashoutSettingsState.CEXSecret}
                    autoComplete="none"
                    className="w-full mt-1 xs:mt-0 px-1 h-[40px] xs:h-[28px] text-lg xs:text-base text-gray-700 border border-slate-300 rounded-md outline-slate-300 lg:hover:bg-slate-100 focus:outline-blue-500 focus:bg-white transition-[outline-color] duration-[400ms]"
                  ></input> */}
            {/*---save button---*/}
            <div className="my-6 flex justify-center">
              <button
                className={`${
                  savingState === "saved" ? "pointer-events-none bg-gray-300" : "bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300"
                } text-lg xs:text-base font-bold w-[200px] xs:w-[160px] h-[56px] xs:h-[44px] rounded-full text-white`}
                onClick={saveSettings}
              >
                {savingState === "saved" && <div>Saved</div>}
                {savingState === "savechanges" && <div>Save Changes</div>}
                {savingState === "saving" && (
                  <div className="w-full flex justify-center items-center">
                    <SpinningCircleWhite />
                  </div>
                )}
                {popup === "saved" && (
                  <div className="flex items-center absolute top-[-24px] left-[calc(50%-36px)] text-slate-700 font-normal z-10">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> saved
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/*---Account Settings---*/}
        <div>
          {/*---title---*/}
          <div className="mt-10 flex items-center relative">
            <div className="hidden xs:block w-[20px] h-[20px] rounded-full text-center py-2 bg-orange-500 flex-none z-1"></div>
            <div className="hidden xs:block absolute w-[2px] h-[600px] bg-orange-500 bottom-[10px] left-[9px]"></div>
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-5 text-3xl xs:text-2xl font-extrabold text-blue-700">Account Settings</div>
          </div>
          {/*---form---*/}
          <form className="xs:ml-[28px] sm:ml-[41px] appSettingsForm">
            <label className="labelfont">My EVM Address</label>
            <div className="flex items-center h-[40px] xs:h-[36px] border border-transparent active:bg-gray-200 lg:hover:border-gray-300 lg:active:bg-gray-200 cursor-pointer px-1 rounded-md">
              <div className="mr-2 text-xs xs:text-sm md:text-xs text-gray-700">{paymentSettingsState.merchantEvmAddress}</div>
              <div className="relative w-[16px] h-[16px]">
                <Image src="/copySvg.svg" alt="copy icon" fill />
              </div>
            </div>
            {/*---email---*/}
            <label className="labelfont">Email</label>
            <input
              className="inputfont"
              onChange={(e: any) => {
                setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value });
                setSavingState("savechanges");
              }}
              value={paymentSettingsState.merchantEmail}
            ></input>
            {/*---employee password---*/}
            <label className="labelfont">Employee Password</label>
            <input
              className="inputfont"
              onChange={(e: any) => {
                setPaymentSettingsState({ ...paymentSettingsState, employeePass: e.currentTarget.value });
                setSavingState("savechanges");
              }}
              value={paymentSettingsState.employeePass}
            ></input>
            {/*---save button---*/}
            <div className="my-6 flex justify-center items-center">
              <button
                className={`${
                  savingState === "saved" ? "pointer-events-none bg-gray-300" : "bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300"
                } text-lg xs:text-base font-bold w-[200px] xs:w-[160px] h-[56px] xs:h-[44px] rounded-full text-white`}
                onClick={saveSettings}
              >
                {savingState === "saved" && <div>Saved</div>}
                {savingState === "savechanges" && <div>Save Changes</div>}
                {savingState === "saving" && (
                  <div className="w-full flex justify-center items-center">
                    <SpinningCircleWhite />
                  </div>
                )}
                {popup === "saved" && (
                  <div className="flex items-center absolute top-[-24px] left-[calc(50%-36px)] text-slate-700 font-normal z-10">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> saved
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/*---Sign Out---*/}
        <div>
          {/*---title---*/}
          <div className="mt-10 flex items-center relative">
            <div className="hidden xs:block w-[20px] h-[20px] rounded-full text-center py-2 bg-orange-500 text-white font-extrabold z-1"></div>
            <div className="hidden xs:block absolute w-[2px] h-[500px] bg-orange-500 bottom-[10px] left-[9px]"></div>
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-5 text-3xl xs:text-2xl font-extrabold text-blue-700">Sign Out</div>
          </div>
          {/*---button---*/}
          <button
            onClick={async () => {
              await disconnectAsync();
              router.push("/login");
            }}
            className="mt-6 xs:mt-3 mb-20 xs:ml-[28px] sm:ml-[41px] w-[120px] appButton"
          >
            Sign Out
          </button>
        </div>
      </div>
    </section>
  );
};

export default Settings;
