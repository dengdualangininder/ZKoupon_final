"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteCookie } from "cookies-next";
// qr code
import { QRCodeSVG } from "qrcode.react";
import { pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Buffer } from "buffer";
// wagmi
import { useDisconnect } from "wagmi";
// components
import Placard from "./placard/Placard";
import FaqModal from "./modals/FaqModal";
import ErrorModal from "./modals/ErrorModal";
import EmployeePassModal from "./modals/EmployeePassModal";
// import APIModal from "./modals/ApiKeyModal";
// import QrModal from "./modals/QrModal";
// constants
import { countryData, activeCountries, merchantType2data } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const Settings = ({
  paymentSettingsState,
  setPaymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  isMobile,
  idToken,
  publicKey,
}: {
  paymentSettingsState: PaymentSettings;
  setPaymentSettingsState: any;
  cashoutSettingsState: CashoutSettings;
  setCashoutSettingsState: any;
  isMobile: boolean;
  idToken: string;
  publicKey: string;
}) => {
  console.log("Settings, rendered once");
  // states
  const [popup, setPopup] = useState("");
  const [save, setSave] = useState(false);
  // modal states
  const [figmaModal, setFigmaModal] = useState(false);
  const [merchantBusinessTypeModal, setMerchantBusinessTypeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [employeePassModal, setEmployeePassModal] = useState(false);
  // consider removing
  const [qrModal, setQrModal] = useState(false);
  const [apiModal, setApiModal] = useState(false);
  const [depositAddressModal, setDepositAddressModal] = useState(false);

  const router = useRouter();
  const { disconnectAsync } = useDisconnect();

  // listens to changes in save and saves the states to db
  useEffect(() => {
    console.log("saveSettings useEffect run once");
    const merchantNameEncoded = encodeURI(paymentSettingsState.merchantName);
    let tempUrl = `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=${paymentSettingsState.merchantPaymentType}&merchantName=${merchantNameEncoded}&merchantCurrency=${paymentSettingsState.merchantCurrency}&merchantEvmAddress=${paymentSettingsState.merchantEvmAddress}`;
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
    setPaymentSettingsState({ ...paymentSettingsState, qrCodeUrl: tempUrl });

    const saveSettings = async () => {
      try {
        console.log("entering saveSettings API");
        const res = await fetch("/api/saveSettings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paymentSettings: { ...paymentSettingsState, qrCodeUrl: tempUrl }, cashoutSettings: cashoutSettingsState, idToken, publicKey }),
        });
        const data = await res.json();
        if (data === "saved") {
          console.log("settings saved");
        } else {
          setErrorMsg("Internal server error. Data was not saved.");
          setErrorModal(true);
        }
      } catch (e) {
        setErrorMsg("Server request error. Data was not saved.");
        setErrorModal(true);
      }
    };
    saveSettings();
  }, [save]);

  const onChangeMerchantFields = (e: any) => {
    let merchantFieldsTemp: string[] = [];
    document.querySelectorAll<HTMLInputElement>("input[data-category='settingsMerchantFields']").forEach((i) => {
      if (i.checked) {
        merchantFieldsTemp.push(i.name);
      }
    });
    setPaymentSettingsState({ ...paymentSettingsState, merchantFields: merchantFieldsTemp });
    setSave(!save);
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

  const downloadQrCode = async () => {
    const el = document.getElementById("qrPlacard");
    const blob = await pdf(
      <Document>
        <Page size="A5" style={{ position: "relative" }}>
          <View>
            <Placard />
          </View>
          <View style={{ position: "absolute", transform: "translate(108, 190)" }}>
            {/* @ts-ignore */}
            <Svg width="210" height="210" viewBox={el?.attributes.viewBox.value} fill="none" xmlns="http://www.w3.org/2000/svg">
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
  };

  const onClickPaymentLink = () => {
    if (missingInfo() === false) {
      setPopup("copyLinkButton");
      setTimeout(() => setPopup(""), 2000);
      navigator.clipboard.writeText(paymentSettingsState.qrCodeUrl.replace("metamask.app.link/dapp/", ""));
    }
  };

  const saveEmployeePass = async (e: React.FocusEvent<HTMLInputElement, Element>) => {
    try {
      const res = await fetch("/api/saveEmployeePass", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ employeePass: e.target.value, idToken, publicKey }),
      });
      const data = await res.json();

      if (data === "saved") {
        console.log("settings saved");
      } else {
        setErrorMsg("Internal server error. Data was not saved.");
        setErrorModal(true);
      }
    } catch (e) {
      setErrorMsg("Server request error. Data was not saved.");
      setErrorModal(true);
    }
  };

  const onClickSignOut = async () => {
    window.sessionStorage.removeItem("cbAccessToken");
    window.localStorage.removeItem("cbRefreshToken");
    deleteCookie("jwt");
    await disconnectAsync();
    router.push("/app");
  };

  const emailQrCode = async () => {
    //logic
  };

  console.log("last render, paymentSettingsState:", paymentSettingsState);
  console.log("last render, cashoutSettings:", cashoutSettingsState);
  return (
    <section id="accountEl" className="w-full px-3 portrait:h-[calc(100vh-84px)] portrait:sm:h-[calc(100vh-140px)] flex flex-col items-center overflow-y-auto">
      <div className="w-full portrait:sm:max-w-[640px] landscape:lg:max-w-[640px]">
        {/*--- TOP BUTTONS ---*/}
        <div className="h-[140px] portrait:sm:h-[180px] landscape:lg:h-[180px] landscape:xl:h-[180px] text-sm portrait:sm:text-xl landscape:lg:text-xl flex items-center justify-evenly">
          <div
            className="flex items-center justify-center w-[74px] h-[74px] portrait:sm:w-[110px] portrait:sm:h-[100px] landscape:lg:w-[110px] landscape:lg:h-[100px] rounded-lg text-center font-medium text-gray-500 border border-gray-500 bg-white"
            onClick={emailQrCode}
          >
            Email
            <br />
            QR Code
          </div>
          <div
            className="flex items-center justify-center w-[74px] h-[74px] portrait:sm:w-[110px] portrait:sm:h-[100px] landscape:lg:w-[110px] landscape:lg:h-[100px] rounded-lg text-center font-medium text-gray-500 border border-gray-500 bg-white"
            onClick={downloadQrCode}
          >
            Download QR Code
          </div>
          <div
            className="flex items-center justify-center w-[74px] h-[74px] portrait:sm:w-[110px] portrait:sm:h-[100px] landscape:lg:w-[110px] landscape:lg:h-[100px] rounded-lg text-center font-medium text-gray-500 border border-gray-500 bg-white"
            onClick={() => setFaqModal(true)}
          >
            FAQs
          </div>
        </div>

        <div className="hidden">
          <QRCodeSVG id="qrPlacard" xmlns="http://www.w3.org/2000/svg" size={210} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
        </div>

        {/*---form, mt=10 ---*/}
        <form className="space-y-6 portrait:sm:space-y-10 landscape:lg:space-y-10 landscape:xl:space-y-10">
          {/*--- PAYMENT SETTINGS ---*/}
          <div>
            <div className="settingsHeader">PAYMENT SETTINGS</div>
            {/*---merchantName---*/}
            <div className="fieldContainer">
              <label className="settingsLabelFont">Business Name</label>
              <input
                className="settingsInputFont"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantName}
              ></input>
            </div>

            {/*---merchantCountry & merchantCurrency---*/}
            <div className="fieldContainer">
              <div>
                <label className="settingsLabelFont">Currency</label>
              </div>
              <div>
                <select
                  className="settingsSelectFont"
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const merchantCountryTemp = e.target.value.split(" (")[0];
                    const merchantCurrencyTemp = e.target.value.split(" (")[1].replace(")", "");
                    const cexTemp = countryData[merchantCountryTemp].CEXes[0];
                    setPaymentSettingsState({
                      ...paymentSettingsState,
                      merchantCountry: merchantCountryTemp,
                      merchantCurrency: merchantCurrencyTemp,
                    });
                    setCashoutSettingsState({ cex: cexTemp, cexEvmAddress: "", cexApiKey: "", cexSecretKey: "" }); // need to set blank as cex will change
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                    setSave(!save);
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
            <div className="fieldContainer relative">
              <div className="flex">
                <div className="group cursor-pointer">
                  <label className="settingsLabelFont">Payment Type</label>
                  <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" />
                  <div className="top-[100%] w-full tooltip">Select "In-person" for physical stores and "online" for online stores</div>
                </div>
              </div>
              <div>
                <select
                  className="settingsSelectFont"
                  onChange={async (e) => {
                    let merchantPaymentTypeTemp = e.target.value === "In-person" ? "inperson" : "online";
                    console.log(merchantPaymentTypeTemp);
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
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                    setSave(!save);
                  }}
                >
                  <option selected={paymentSettingsState.merchantPaymentType === "inperson"}>In-person</option>
                  <option selected={paymentSettingsState.merchantPaymentType === "online"}>Online</option>
                </select>
              </div>
            </div>

            {/*---2% off---*/}
            {paymentSettingsState.merchantPaymentType === "inperson" && (
              <div className="fieldContainer border-b relative">
                <div className="group cursor-pointer">
                  <label className="settingsLabelFont">Give 2% Instant Cashback?</label>
                  <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" />
                  <div className="w-full top-[100%] tooltip">
                    Because credit cards charge businesses ~3% and give ~1% to customers, customers have few incentives to use other payment methods. Therefore, we are temporarily
                    requiring businesses give a 2% discount to customers. Because Flash charges 0% fees, businesses will still save ~1% compared to credit cards. Furthermore, the
                    discount can may motivate new customers to go to your business. When blockchain payments become more popular, we will make this cashback optional.
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked readOnly></input>
                    <div className="relative w-[44px] h-[24px] bg-gray-200 rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <div className="text-lg portrait:sm:text-2xl landscape:lg:text-2xl py-1 portrait:sm:py-3 landscape:lg:py-3 pl-2 pr-3 font-medium">On</div>
                </div>
              </div>
            )}

            {/*---merchantWebsite---*/}
            <div className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"} flex flex-col relative`}>
              <div className="settingsLabelFont">
                <span className="group">
                  <label className="">
                    Your Website <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:align-baseline  text-slate-300" />
                  </label>
                  <div className="invisible group-hover:visible pointer-events-none absolute bottom-[calc(100%-6px)] w-[330px] px-3 py-1 text-base font-normal  leading-tight bg-slate-100 border border-slate-300 rounded-lg z-[1]">
                    <p>- start with "http(s)"</p>
                    <p>- this website is where customers look up item names & prices</p>
                  </div>
                </span>
              </div>
              <input
                className="settingsInputFont"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPaymentSettingsState({ ...paymentSettingsState, merchantWebsite: e.target.value });
                  setSave(!save);
                }}
                value={paymentSettingsState.merchantWebsite}
              ></input>
            </div>

            {/*---merchantBusinessType---*/}
            <div className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"}`}>
              <div className="flex">
                <label className="settingsLabelFont">Your Business Type</label>
              </div>
              <div onClick={() => setMerchantBusinessTypeModal(true)} className="w-full flex items-center settingsInputFont cursor-pointer hover:bg-blue-100">
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
                  <div className="settingsLabelFont">
                    Fields <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:align-baseline  text-slate-300" />
                  </div>
                  {/*---tooltip---*/}
                  <div className="bottom-6 w-[306px] tooltip">
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
                  <label className="ml-1 text-base  leading-none">email</label>
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
                  <label className="ml-1 text-base  leading-none">{merchantType2data[paymentSettingsState.merchantPaymentType]?.itemlabel.toLowerCase() ?? "item name"}</label>
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
                  <label className="ml-1 text-base  leading-none"># of guests</label>
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
                  <label className="ml-1 text-base  leading-none">date range</label>
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
                  <label className="ml-1 text-base  leading-none">single date</label>
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
                  <label className="ml-1 text-base  leading-none">time</label>
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
                  <label className="ml-1 text-base  leading-none xs:leading-none">shipping address</label>
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
                  <label className="ml-1 text-base  leading-none">SKU#</label>
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
          </div>

          {/*--- CASHOUT SETTINGS ---*/}
          <div>
            <div className="settingsHeader">CASH OUT SETTINGS</div>
            {/*---cex---*/}
            <div className="fieldContainer border-b">
              <div>
                <label className="settingsLabelFont">Cash Out Platform</label>
              </div>
              <div>
                <select
                  className="settingsSelectFont"
                  onChange={(e) => {
                    const cexTemp = e.currentTarget.value;
                    setCashoutSettingsState({ ...cashoutSettingsState, cex: cexTemp, cexEvmAddress: "" });
                    setSave(!save);
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
              <div className="settingsLabelFont">
                Your Exchange's USDC deposit address on the Polygon network (
                <span className="link" onClick={() => setDepositAddressModal(true)}>
                  instructions
                </span>
                )
              </div>
              <textarea
                className="w-full settingsInputFont break-all text-wrap"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={cashoutSettingsState.cexEvmAddress}
                autoComplete="none"
              ></textarea>
            </div>

            {/*---cexApiKey---*/}
            {/* <div className="mt-3 text-lg  font-bold leading-tight xs:leading-tight">
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
                    className="w-full mt-1 xs:mt-0 px-1 h-[40px] xs:h-[28px] text-lg  text-gray-700 border border-slate-300 rounded-md outline-slate-300 lg:hover:bg-slate-100 focus:outline-blue-500 focus:bg-white transition-[outline-color] duration-[400ms]"
                  ></input> */}

            {/*---cexSecretKey---*/}
            {/* <div className="mt-3 text-lg  font-bold leading-tight xs:leading-tight">
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
                    className="w-full mt-1 xs:mt-0 px-1 h-[40px] xs:h-[28px] text-lg  text-gray-700 border border-slate-300 rounded-md outline-slate-300 lg:hover:bg-slate-100 focus:outline-blue-500 focus:bg-white transition-[outline-color] duration-[400ms]"
                  ></input> */}
          </div>

          {/*--- ACCOUNT SETTINGS ---*/}
          <div>
            <div className="settingsHeader">ACCOUNT SETTINGS</div>
            {/*---EVM Address---*/}
            <div className="fieldContainer">
              <label className="settingsLabelFont">EVM Address</label>
              <div className="settingsInputFont flex items-center justify-end">
                {paymentSettingsState.merchantEvmAddress.slice(0, 6)}...{paymentSettingsState.merchantEvmAddress.slice(-4)}{" "}
                <div className="inline-block ml-2 font-medium text-sm text-gray-400 leading-none">copy</div>
              </div>
            </div>

            {/*---email---*/}
            <div className="fieldContainer">
              <label className="settingsLabelFont">Email</label>
              <input
                className="settingsInputFont"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantEmail}
              ></input>
            </div>

            {/*---employee password---*/}
            <div className="fieldContainer">
              <label className="settingsLabelFont">Employee Password</label>
              <div className="ml-2 relative">
                <div id="employeePassMask" onClick={() => setEmployeePassModal(true)} className="absolute top-0 right-0 h-full w-full"></div>
                <input
                  id="employeePass"
                  className="w-full text-lg  py-1.5 pl-2 pr-3 text-end font-medium rounded-md outline-gray-300 focus:outline-blue-500 transition-[outline-color] duration-[400ms] placeholder:font-normal placeholder:italic"
                  onBlur={async (e: React.FocusEvent<HTMLInputElement, Element>) => {
                    document.getElementById("employeePassMask")?.classList.remove("hidden");
                    await saveEmployeePass(e);
                    if (e.target.value) {
                      (document.getElementById("employeePass") as HTMLInputElement).value = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
                    } else {
                      (document.getElementById("employeePass") as HTMLInputElement).value = "";
                    }
                  }}
                  defaultValue={cashoutSettingsState.employeePass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""}
                  placeholder="empty"
                  autoComplete="off"
                ></input>
              </div>
            </div>

            {/*---merchantGoogleId---*/}
            <div className="fieldContainer border-b-transparent relative">
              <div className="flex shrink-0">
                <div className="group cursor-pointer">
                  <label className="settingsLabelFont">Google Place ID</label>
                  <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" />
                  <div className="bottom-[100%] w-full tooltip">
                    If you add your Google Place ID, we'll add your business to stablecoinmap.com, which is convenient website for blockchain users to find places that accept
                    stablecoin payments.
                  </div>
                </div>
              </div>
              <input
                className="settingsInputFont placeholder:font-normal placeholder:italic"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantGoogleId: e.target.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantGoogleId}
                placeholder="empty"
              ></input>
            </div>
          </div>
        </form>

        {/*---Sign Out---*/}
        <div className="pb-4 h-[110px] portrait:sm:h-[140px] landscape:lg:h-[140px] landscape:xl:h-[140px] text-base portrait:sm:text-2xl landscape:lg:text-2xl flex items-center justify-evenly">
          <button
            onClick={onClickSignOut}
            className="font-medium px-6 portrait:sm:px-10 landscape:lg:px-10 py-3 rounded-full text-white bg-blue-500 active:bg-blue-300 hover:bg-blue-600"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/*---6 MODALS---*/}
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
                    setSave(!save);
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
      {faqModal && <FaqModal paymentSettingsState={paymentSettingsState} cashoutSettingsState={cashoutSettingsState} setFaqModal={setFaqModal} />}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
      {employeePassModal && <EmployeePassModal setEmployeePassModal={setEmployeePassModal} />}
    </section>
  );
};

export default Settings;
