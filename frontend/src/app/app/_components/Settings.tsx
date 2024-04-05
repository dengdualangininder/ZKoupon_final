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
  idToken,
  publicKey,
  exchangeModal,
  setExchangeModal,
}: {
  paymentSettingsState: any;
  setPaymentSettingsState: any;
  cashoutSettingsState: any;
  setCashoutSettingsState: any;
  isMobile: boolean;
  idToken: string;
  publicKey: string;
  exchangeModal: boolean;
  setExchangeModal: any;
}) => {
  console.log("Settings, rendered once");
  // states
  const [url, setUrl] = useState("");
  const [savingState, setSavingState] = useState("saved"); // saved | savechanges | saving
  const [popup, setPopup] = useState("");
  // modal states
  const [figmaModal, setFigmaModal] = useState(false);
  const [merchantBusinessTypeModal, setMerchantBusinessTypeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  // consider removing
  const [apiModal, setApiModal] = useState(false);
  const [depositAddressModal, setDepositAddressModal] = useState(false);

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
        body: JSON.stringify({ paymentSettings: { ...paymentSettingsState, qrCodeUrl: url }, cashoutSettings: cashoutSettingsState, idToken, publicKey }),
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

  const settingsMenu = [
    { name: "My QR Code", page: "myQr" },
    { name: "FAQ", page: "faq" },
  ];

  console.log("last render, paymentSettingsState:", paymentSettingsState);
  console.log("last render, cashoutSettings:", cashoutSettingsState);
  return (
    <section id="accountEl" className="h-[calc(100vh-84px)] sm:h-[calc(100vh-110px)] md:h-auto w-full pt-6 flex flex-col overflow-y-scroll">
      {/*---8 MODALS---*/}
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
      {/* {depositAddressModal && <DepositAddressModal setDepositAddressModal={setDepositAddressModal} />} */}

      {/*---Page Title---*/}
      <div className="hidden md:block w-full font-extrabold text-2xl sm:text-3xl text-blue-700 text-center">Settings</div>
      {/*---Page Body---*/}

      <div className="md:mt-2 mx-2 sm:mx-6">
        {/*---top options---*/}
        <div className="flex justify-evenly">
          {settingsMenu.map((i) => (
            <div className="flex flex-col items-center">
              <div className="w-[60px] h-[60px] border border-gray-800 rounded-md flex justify-center items-center"></div>
              <div className="mt-0.5 leading-snug text-center">{i.name}</div>
            </div>
          ))}
        </div>

        {/*---form---*/}
        <form className="">
          <div className="ml-1 mt-8 text-base text-center font-bold text-blue-600">PAYMENT SETTINGS</div>

          {/*---merchantName---*/}
          <div className="fieldContainer">
            <label className="labelfont">Business Name</label>
            <input
              className="inputfont"
              onChange={(e: any) => {
                setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value });
                setSavingState("savechanges");
              }}
              value={paymentSettingsState.merchantName}
            ></input>
          </div>

          {/*---merchantCountry & merchantCurrency---*/}
          <div className="fieldContainer">
            <div>
              <label className="labelfont">Country / Currency</label>
            </div>
            <div>
              <select
                className="selectfont"
                onChange={(e) => {
                  const merchantCountryTemp = e.target.value.split(" (")[0];
                  const merchantCurrencyTemp = e.target.value.split(" (")[1].replace(")", "");
                  const cexTemp = countryData[merchantCountryTemp].CEXes[0];
                  setPaymentSettingsState({
                    ...paymentSettingsState,
                    merchantCountry: merchantCountryTemp,
                    merchantCurrency: merchantCurrencyTemp,
                  });
                  setCashoutSettingsState({ cex: cexTemp, cexEvmAddress: "", cexApiKey: "", cexSecretKey: "" }); // need to set blank as cex will change
                  setSavingState("savechanges");
                }}
              >
                {activeCountries.map((i, index) => (
                  <option key={index} selected={paymentSettingsState.merchantCountry === i.split(" (")[0]}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/*---merchantPaymentType---*/}
          <div className="fieldContainer">
            <div className="flex">
              <div className="group cursor-pointer relative">
                <label className="labelfont">Payment Type</label>
                <FontAwesomeIcon icon={faCircleInfo} className="ml-1.5 xs:text-sm text-gray-300" />
                <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%+8px)] w-[236px] px-3 py-2 text-lg xs:text-sm leading-tight font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                  Select "In-person" for physical stores and "online" for online stores
                </div>
              </div>
            </div>
            <div>
              <select
                className="selectfont"
                onChange={(e) => {
                  let merchantPaymentTypeTemp = e.target.value === "In-person" ? "inperson" : "online";
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
                <option selected={paymentSettingsState.merchantPaymentType === "inperson"}>In-person</option>
                <option selected={paymentSettingsState.merchantPaymentType === "online"}>Online</option>
              </select>
            </div>
          </div>

          {/*---2% off---*/}
          {paymentSettingsState.merchantPaymentType === "inperson" && (
            <div className="fieldContainer border-b-transparent relative">
              <div className="flex relative">
                <div className="group cursor-pointer">
                  <label className="labelfont">Give 2% Instant Cashback?</label>
                  <FontAwesomeIcon icon={faCircleInfo} className="ml-1.5 xs:text-sm text-gray-300" />
                  <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%+8px)] w-full px-3 py-2 text-lg xs:text-sm leading-tight font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                    Because credit cards charge businesses ~3% and give ~1% to the customer, customers have few incentives to use other payment methods. Therefore, we are
                    temporarily requiring businesses give a 2% discount to customers. Because Flash charges 0% fees to the business, businesses will still save ~1% compared to
                    credit cards. Furthermore, the discount can potentially attract new customers to your business. When blockchain payments become more popular, we will make this
                    cashback optional.
                  </div>
                </div>
              </div>

              <div className="ml-1 mb-0.5 relative flex items-center cursor-pointer">
                <input id="autoCheckbox" type="checkbox" className="sr-only pointer-events-none peer" checked readOnly></input>
                <div className="pointer-events-none w-[44px] h-[24px] bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                <span className="ml-2 xs:ml-2 w-[22px] text-lg xs:text-sm">On</span>
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

          <div className="ml-1 mt-8 font-bold text-center text-blue-600">CASH OUT SETTINGS</div>

          {/*---cex---*/}
          <div className="fieldContainer border-b-transparent">
            <div>
              <label className="labelfont">Cryptocurrency Exchange</label>
            </div>
            <div>
              <select
                className="selectfont"
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

          <div className="ml-1 mt-8 font-bold text-center text-blue-600">ACCOUNT SETTINGS</div>

          {/*---EVM Address---*/}
          <div className="fieldContainer">
            <label className="labelfont">Address</label>
            <div className="inputfont flex items-center">
              {paymentSettingsState.merchantEvmAddress.slice(0, 6)}...{paymentSettingsState.merchantEvmAddress.slice(-4)}{" "}
              <div className="inline-block ml-2 font-medium text-sm text-gray-400 leading-none">copy</div>
            </div>
          </div>

          {/*---email---*/}
          <div className="fieldContainer">
            <label className="labelfont">Email</label>
            <input
              className="inputfont"
              onChange={(e: any) => {
                setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value });
                setSavingState("savechanges");
              }}
              value={paymentSettingsState.merchantEmail}
            ></input>
          </div>

          {/*---employee password---*/}
          <div className="fieldContainer">
            <label className="labelfont">Employee Password</label>
            <input
              className={`inputfont placeholder:font-normal placeholder:italic`}
              onChange={(e: any) => {
                setPaymentSettingsState({ ...paymentSettingsState, employeePass: e.currentTarget.value });
                setSavingState("savechanges");
              }}
              value={paymentSettingsState.employeePass}
              placeholder="empty"
            ></input>
          </div>

          {/*---merchantGoogleId---*/}
          <div className="fieldContainer border-b-transparent">
            <div className="flex relative">
              <div className="group cursor-pointer">
                <label className="labelfont">Google Place ID</label>
                <FontAwesomeIcon icon={faCircleInfo} className="ml-1.5 xs:text-sm text-gray-300" />
                <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%+8px)] w-full px-3 py-2 text-lg xs:text-sm leading-tight font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                  If you add your Google Place ID, we will advertise your business to blockchain users by adding your business to www.stablecoinmap.com, which is a community-driven
                  database of places that accept stablecoin payments.
                </div>
              </div>
            </div>
            <input
              className={`inputfont placeholder:font-normal placeholder:italic`}
              onChange={(e: any) => {
                setPaymentSettingsState({ ...paymentSettingsState, merchantGoogleId: e.target.value });
                setSavingState("savechanges");
              }}
              value={paymentSettingsState.merchantGoogleId}
              placeholder="empty"
            ></input>
          </div>

          {/*---save button---*/}
          <div className="pt-8 pb-4 flex justify-center items-center">
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

        {/*---Sign Out---*/}
        <div>
          {/*---title---*/}
          <div className="w-full text-center xs:text-start xs:ml-2 sm:ml-5 text-3xl xs:text-2xl font-extrabold text-blue-700">Sign Out</div>
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
