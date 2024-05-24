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
import { countryData, countryCurrencyList, merchantType2data } from "@/utils/constants";
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
  isUsabilityTest,
}: {
  paymentSettingsState: PaymentSettings;
  setPaymentSettingsState: any;
  cashoutSettingsState: CashoutSettings;
  setCashoutSettingsState: any;
  isMobile: boolean;
  idToken: string;
  publicKey: string;
  isUsabilityTest: boolean;
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
    // tempUrl is dependent on the UPDATED settingsState, so must use useEffect. Initially, had all this logic within a function,
    // but could not generate tempUrl with updated settingsState. Using "save" in dependency array instead of settingsState allows
    // control when to specifically trigger this useEffect
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
        console.log("employeePass saved");
        setCashoutSettingsState({ ...cashoutSettingsState, isEmployeePass: true });
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
    <section className="w-full portrait:min-h-[calc(100vh-84px)] portrait:sm:min-h-[calc(100vh-140px)] flex flex-col items-center overflow-y-auto">
      <div className="h-[64px] portrait:sm:h-[68px] landscape:lg:h-[68px] portrait:lg:h-[90px] landscape:xl:h-[90px] text2xl font-bold flex items-center justify-center flex-none text-blue-700">
        Settings
      </div>

      <div className="hidden">
        <QRCodeSVG id="qrPlacard" xmlns="http://www.w3.org/2000/svg" size={210} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
      </div>

      {/*---form ---*/}
      <form className="w-full max-w-[640px] px-3">
        {/*---EVM Address---*/}
        <div className="fieldContainer">
          <label className="settingsLabelFont">Your EVM Address</label>
          <div className="w-full max-w-[400px] landscape:lg:max-w-[400px] pr-1 h-full text-end tracking-tight flex items-center justify-end">
            {paymentSettingsState.merchantEvmAddress.slice(0, 6)}...{paymentSettingsState.merchantEvmAddress.slice(-4)}{" "}
            <div className="ml-1 relative w-[20px] h-[20px]">
              <Image src="/copySvg.svg" alt="copy" fill />
            </div>
          </div>
        </div>

        {/*---email---*/}
        <div className="fieldContainer">
          <label className="settingsLabelFont">Email</label>
          <div className="h-full flex items-center">
            <input
              className="settingsInputFont peer"
              onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value })}
              onBlur={() => setSave(!save)}
              value={paymentSettingsState.merchantEmail}
              placeholder="empty"
            ></input>
            <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
              <Image src="/rightAngle.svg" alt="rightAngle" fill />
            </div>
          </div>
        </div>

        {/*---merchantName---*/}
        <div className="fieldContainer">
          <label className="settingsLabelFont">Business Name</label>
          <div className="h-full flex items-center">
            <input
              className="settingsInputFont peer"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value })}
              onBlur={() => setSave(!save)}
              value={paymentSettingsState.merchantName}
            ></input>
            <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
              <Image src="/rightAngle.svg" alt="rightAngle" fill />
            </div>
          </div>
        </div>

        {/*---merchantCountry & merchantCurrency---*/}
        <div className="fieldContainer">
          <label className="settingsLabelFont">Country / Currency</label>
          <div className="h-full flex items-center">
            <select
              className="settingsSelectFont peer"
              onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                const merchantCountryTemp = e.target.value.split(" / ")[0];
                const merchantCurrencyTemp = e.target.value.split(" / ")[1];
                const cexTemp = merchantCountryTemp == "Any country" ? "" : countryData[merchantCountryTemp].CEXes[0];
                setPaymentSettingsState({
                  ...paymentSettingsState,
                  merchantCountry: merchantCountryTemp,
                  merchantCurrency: merchantCurrencyTemp,
                });
                setCashoutSettingsState({ cex: cexTemp, cexEvmAddress: "" }); // need to set blank as cex will change
                e.target.closest("select")?.blur();
                setSave(!save);
              }}
              value={`${paymentSettingsState.merchantCountry} / ${paymentSettingsState.merchantCurrency}`}
            >
              {countryCurrencyList.map((i, index) => (
                <option key={index}>{i}</option>
              ))}
            </select>
            <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
              <Image src="/rightAngle.svg" alt="rightAngle" fill />
            </div>
          </div>
        </div>

        {/*---merchantPaymentType---*/}
        {/* <div className="fieldContainer relative">
              <div className="flex items-center group cursor-pointer">
                <label className="settingsLabelFont">Payment Type</label>
                <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" />
                <div className="top-[100%] w-full tooltip">Currently, we are only enabling "In-person" payments. In the future, "Online" payments will be available.</div>
              </div>
              <select
                className="settingsSelectFont pointer-events-none"
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
                  setSave(!save);
                }}
                value={paymentSettingsState.merchantPaymentType}
              >
                <option value="inperson">In-person</option>
                <option value="online">Online</option>
              </select>
            </div> */}

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
            className="settingsInputFont peer"
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
          </div>
        </div>

        {/*---cex---*/}
        {paymentSettingsState.merchantCountry != "Any country" && (
          <div className={`${cashoutSettingsState.cex == "Coinbase" ? "border-bnot" : ""} fieldContainer`}>
            <label className="settingsLabelFont">Cash Out Platform</label>
            <div className="h-full flex items-center">
              <select
                className="settingsSelectFont peer"
                onChange={(e) => {
                  const cexTemp = e.currentTarget.value;
                  setCashoutSettingsState({ ...cashoutSettingsState, cex: cexTemp, cexEvmAddress: "" });
                  e.target.closest("select")?.blur();
                  setSave(!save);
                }}
                value={cashoutSettingsState.cex}
              >
                {countryData[paymentSettingsState.merchantCountry].CEXes.map((i, index) => (
                  <option key={index}>{i}</option>
                ))}
              </select>
              <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
                <Image src="/rightAngle.svg" alt="rightAngle" fill />
              </div>
            </div>
          </div>
        )}

        {/*---cexEvmAddress---*/}
        <div className={`${paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" ? "hidden" : ""} fieldContainer border-bnone`}>
          <label className="settingsLabelFont">CEX EVM Address</label>
          <div className="h-full flex items-center">
            <input
              className="settingsInputFont peer"
              onChange={(e) => {
                setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value });
              }}
              onBlur={() => setSave(!save)}
              value={cashoutSettingsState.cexEvmAddress}
              autoComplete="none"
              placeholder="empty"
            ></input>
            <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
              <Image src="/rightAngle.svg" alt="rightAngle" fill />
            </div>
          </div>
        </div>

        {/*---employee password---*/}
        <div className="fieldContainer">
          <label className="settingsLabelFont">Employee Password</label>
          <div className="h-full flex items-center">
            <div className="relative w-full max-w-[400px] landscape:lg:max-w-[400px] h-full">
              <div id="employeePassMask" onClick={() => setEmployeePassModal(true)} className="absolute top-0 right-0 h-full w-full"></div>
              <input
                id="employeePass"
                className="settingsInputFont peer"
                onBlur={async (e) => {
                  document.getElementById("employeePassMask")?.classList.remove("hidden");
                  await saveEmployeePass(e);
                  if (e.target.value) {
                    (document.getElementById("employeePass") as HTMLInputElement).value = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
                  } else {
                    (document.getElementById("employeePass") as HTMLInputElement).value = "";
                  }
                }}
                defaultValue={cashoutSettingsState.isEmployeePass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""}
                placeholder="empty"
                autoComplete="off"
              ></input>
            </div>
            <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
              <Image src="/rightAngle.svg" alt="rightAngle" fill />
            </div>
          </div>
        </div>

        {/*---2% off---*/}
        {paymentSettingsState.merchantPaymentType === "inperson" && (
          <div className="fieldContainer relative">
            <label className="settingsLabelFont">
              Give 2% Cashback?
              <span className="group">
                <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" />
                <div className="w-full left-0 bottom-[100%] tooltip text-black">
                  Because credit cards charge businesses ~3% and give ~1% to customers, customers have few incentives to use other payment methods. Therefore, we are temporarily
                  requiring businesses give a 2% discount to customers. Because Flash charges 0% fees, businesses will still save ~1% compared to credit cards. Furthermore, the
                  discount can may motivate new customers to go to your business. When blockchain payments become more popular, we will make this cashback optional.
                </div>
              </span>
            </label>
            <div className="h-full flex items-center">
              <select className="settingsSelectFont peer pointer-events-none" onChange={(e) => {}}>
                <option key="yes">Yes</option>
                <option key="no">No</option>
              </select>
              <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
                <Image src="/rightAngle.svg" alt="rightAngle" fill />
              </div>
            </div>
          </div>
        )}

        {/*---merchantGoogleId---*/}
        <div className="fieldContainer border-b relative">
          <label className="settingsLabelFont">
            Google Place ID
            <span className="group">
              <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" />
              <div className="w-full left-0 bottom-[100%] tooltip text-black">
                Search for the "Google Place ID Finder" website. Find your Google Place ID and paste it here. When filled, your business will be added to stablecoinmap.com, which
                is a map of places that accept crypto payments and allows crypto users to more easily find your business.
              </div>
            </span>
          </label>
          <div className="h-full flex items-center">
            <input
              className="settingsInputFont peer"
              onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantGoogleId: e.target.value })}
              onBlur={() => setSave(!save)}
              value={paymentSettingsState.merchantGoogleId}
              placeholder="empty"
            ></input>
            <div className="flex-none relative w-[16px] h-[24px] peer-focus:hidden">
              <Image src="/rightAngle.svg" alt="rightAngle" fill />
            </div>
          </div>
        </div>
      </form>

      <div className="grow min-h-[160px] py-2 flex flex-col justify-evenly">
        {/*---Sign Out---*/}
        <div className="textBase2 flex items-center justify-center relative">
          <button
            onClick={onClickSignOut}
            className="textLg font-medium px-6 py-3 portrait:sm:px-8 landscape:lg:px-8 portrait:sm:py-3 landscape:lg:py-4 rounded-full text-white bg-blue-500 active:bg-blue-300 hover:bg-blue-600"
          >
            Sign Out
          </button>
        </div>

        {/*---Help---*/}
        <div className="text-center textSm2 text-gray-500">
          Need help? Read our{" "}
          <span onClick={() => setFaqModal(true)} className="link">
            FAQs
          </span>{" "}
          or email support@flashpayments.xyz
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
