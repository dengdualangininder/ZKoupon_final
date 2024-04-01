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
import Instructions from "./Instructions";
// components - modals
import ErrorModal from "./modals/ErrorModal";
import FigmaModal from "./modals/FigmaModal";
import ExchangeModal from "./modals/ExchangeModal";
// import APIModal from "./modals/ApiKeyModal";
import RefundModal from "./modals/RefundModal";
import DepositAddressModal from "./modals/DepositAddressModal";
// constants
import { countryData, CEXdata, activeCountries, merchantType2data, list2string, fees } from "@/utils/constants";
// images
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong, faArrowDownLong, faCircleCheck, faCircleInfo, faCopy } from "@fortawesome/free-solid-svg-icons";

const Settings = ({
  paymentSettingsState,
  setPaymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  isMobile,
  introModal,
  setIntroModal,
  idToken,
  publicKey,
}: {
  paymentSettingsState: any;
  setPaymentSettingsState: any;
  cashoutSettingsState: any;
  setCashoutSettingsState: any;
  isMobile: boolean;
  introModal: boolean;
  setIntroModal: any;
  idToken: string;
  publicKey: string;
}) => {
  console.log("Settings, rendered once");
  const [url, setUrl] = useState("");
  // modal states
  const [figmaModal, setFigmaModal] = useState(false);
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

  const router = useRouter();
  const { disconnectAsync } = useDisconnect();

  // listens to changes in paymentSettingsState and sets the url
  useEffect(() => {
    console.log("url useEffect run once");
    const merchantNameEncoded = encodeURI(paymentSettingsState.merchantName);
    let tempUrl = `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=${paymentSettingsState.merchantPaymentType}&merchantName=${merchantNameEncoded}&merchantCurrency=${paymentSettingsState.merchantCurrency}&merchantEvmAddress=${paymentSettingsState.merchantEvmAddress}`;
    console.log(tempUrl);
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

  // when user clicks "download QR code" or "copy payment link", this function executes to find missing required fields
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
        var blob = await pdf(
          <Document>
            <Page size="A5" style={{ position: "relative" }}>
              <View>
                <PlacardComponent />
              </View>
              <View style={{ position: "absolute", transform: "translate(105, 186)" }}>
                {/* @ts-ignore */}
                <Svg width="215" height="215" viewBox={el?.attributes.viewBox.value} fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* @ts-ignore */}
                  <Path fill="#ffffff" d={el?.children[0].attributes.d.value} shape-rendering="crispEdges"></Path>
                  {/* @ts-ignore */}
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
        body: JSON.stringify({ paymentSettings: paymentSettingsState, cashoutSettings: cashoutSettingsState, idToken, publicKey }),
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
    <section id="accountEl" className="h-[calc(100vh-84px)] sm:h-[calc(100vh-110px)] md:h-auto w-full pt-6 flex flex-col overflow-y-scroll">
      {/*---8 MODALS---*/}

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
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
      {figmaModal && <FigmaModal setFigmaModal={setFigmaModal} />}
      {exchangeModal && <ExchangeModal setExchangeModal={setExchangeModal} CEX={cashoutSettingsState.CEX} />}
      {/* {apiModal && <APIModal setApiModal={setApiModal} />} */}
      {refundModal && <RefundModal setRefundModal={setRefundModal} />}
      {depositAddressModal && <DepositAddressModal setDepositAddressModal={setDepositAddressModal} />}

      {/*---Page Title---*/}
      <div className="hidden md:block w-full font-extrabold text-2xl sm:text-3xl text-blue-700 text-center">Settings</div>
      {/*---Page Body---*/}
      <div className="md:mt-2 mx-2 sm:mx-6">
        {/*---Instructions---*/}
        <Instructions
          paymentSettingsState={paymentSettingsState}
          cashoutSettingsState={cashoutSettingsState}
          setFigmaModal={setFigmaModal}
          downloadPlacardPdf={downloadPlacardPdf}
          downloadQrSvg={downloadQrSvg}
          downloadQrPng={downloadQrPng}
          downloadPlacardFigma={downloadPlacardFigma}
          setRefundModal={setRefundModal}
          setExchangeModal={setExchangeModal}
        />

        {/*---Payment Settings---*/}
        <div>
          {/*---title---*/}
          <div className="mt-10 flex items-center relative">
            <div className="hidden xs:block w-[20px] h-[20px] rounded-full bg-orange-500 flex-none"></div>
            <div className="hidden xs:block absolute w-[2px] h-[1000px] bg-orange-500 top-[12px] left-[9px]"></div>
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-6 text-3xl xs:text-2xl font-bold text-blue-700">Payment Settings</div>
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
                      <span className="labelfont">
                        Give Customers 2% Instant Cashback? <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:text-sm text-gray-300" />
                      </span>
                      <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%+8px)] px-3 py-2 text-lg xs:text-sm leading-tight font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                        Because credit cards charge businesses ~3% and give 1% to the customer, customers have few incentives to use other payment methods. Therefore, we are
                        temporarily requiring businesses give a 2% discount to customers. Because Flash charges 0% fees to the business, businesses will still save ~1% when
                        compared to a credit card payment. Furthermore, the cashback program can potentially bring new sales to your business. When blockchain payments become more
                        popular, we will make this 2% cashback optional.
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
                <div className="mt-1 relative">
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
                  <div className="flex flex-col items-center">
                    <button
                      className="mt-0 w-[200px] h-[56px] xs:h-[44px] text-lg xs:text-base font-bold text-white bg-blue-500 lg:hover:bg-blue-600 rounded-full"
                      onClick={downloadPlacardPdf}
                    >
                      Download
                    </button>
                    <div className="mt-2 link" onClick={() => setFigmaModal(true)}>
                      Customize your placard
                    </div>
                  </div>
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
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-5 text-3xl xs:text-2xl font-bold text-blue-700">Cash Out Settings</div>
          </div>
          {/*---form---*/}
          <form className="xs:ml-[28px] sm:ml-[41px] appSettingsForm">
            {/*---cex---*/}
            <div>
              <div className="labelfont">Your Cryptocurrency Exchange</div>
              <select
                className="inputfont bg-white w-full"
                onChange={(e) => {
                  const cexTemp = e.currentTarget.value;
                  setCashoutSettingsState({ ...cashoutSettingsState, cex: cexTemp, cexEvmAddress: "" });
                  setSavingState("savechanges");
                }}
              >
                {countryData[paymentSettingsState.merchantCountry]["CEXes"].map((i, index) => (
                  <option key={index} selected={cashoutSettingsState.cex === i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            {/*---cexEvmAddress---*/}
            <div className={`${cashoutSettingsState.cex == "Coinbase Exchange" ? "hidden" : ""}`}>
              <div className="labelfont">
                Your Exchange's USDC deposit address on the Polygon network (
                <span className="link" onClick={() => setDepositAddressModal(true)}>
                  instructions
                </span>
                )
              </div>
              <textarea
                className="w-full inputfont break-all text-wrap"
                onChange={(e: any) => {
                  setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value });
                  setSavingState("savechanges");
                }}
                value={cashoutSettingsState.cexEvmAddress}
                autoComplete="none"
              ></textarea>
            </div>
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
            <div className="my-8 flex justify-center">
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
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-5 text-3xl xs:text-2xl font-bold text-blue-700">Account Settings</div>
          </div>
          {/*---form---*/}
          <form className="xs:ml-[28px] sm:ml-[41px] appSettingsForm">
            <label className="labelfont">My EVM Address</label>
            <div className="text-lg font-bold xs:text-base py-0.5 px-1 border-transparent active:bg-gray-200 lg:hover:border-gray-300 lg:active:bg-gray-200 cursor-pointer rounded-md">
              <div className="break-all">
                {paymentSettingsState.merchantEvmAddress}
                <div className="ml-2 inline-block align-middle pb-0.5">
                  <Image src="/copySvg.svg" alt="copy icon" height={24} width={24} />
                </div>
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
            <div className="my-8 flex justify-center items-center">
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
            <div className="hidden xs:block w-[20px] h-[20px] rounded-full text-center py-2 bg-orange-500 text-white font-bold z-1"></div>
            <div className="hidden xs:block absolute w-[2px] h-[500px] bg-orange-500 bottom-[10px] left-[9px]"></div>
            <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-5 text-3xl xs:text-2xl font-extrabold text-blue-700">Sign Out</div>
          </div>
          {/*---button---*/}
          <div className="w-full flex justify-center">
            <button
              onClick={async () => {
                await disconnectAsync();
                router.push("/app");
              }}
              className="mt-6 xs:mt-3 text-lg xs:text-base mb-20 xs:ml-[28px] sm:ml-[41px] w-[140px] appButton"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
