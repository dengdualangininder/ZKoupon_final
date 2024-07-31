"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
// other
import { useTheme } from "next-themes";
import { Buffer } from "buffer";
import { useLocale, useTranslations } from "next-intl";
// wagmi
import { useDisconnect } from "wagmi";
// components
import FaqModal from "./modals/FaqModal";
import ErrorModal from "./modals/ErrorModal";
// constants
import { countryData, countryCurrencyList, merchantType2data, langObjectArray } from "@/utils/constants";
// images
import { IoInformationCircleOutline } from "react-icons/io5";
import { LuCopy } from "react-icons/lu";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const Settings = ({
  paymentSettingsState,
  setPaymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  setPage,
  isMobile,
  idToken,
  publicKey,
  isUsabilityTest,
}: {
  paymentSettingsState: PaymentSettings;
  setPaymentSettingsState: any;
  cashoutSettingsState: CashoutSettings;
  setCashoutSettingsState: any;
  setPage: any;
  isMobile: boolean;
  idToken: string;
  publicKey: string;
  isUsabilityTest: boolean;
}) => {
  console.log("Settings, rendered once");
  // states
  const [popup, setPopup] = useState("");
  const [save, setSave] = useState(false);
  const [employeePassMask, setEmployeePassMask] = useState(true);
  // modal states
  const [figmaModal, setFigmaModal] = useState(false);
  const [merchantBusinessTypeModal, setMerchantBusinessTypeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [employeePassModal, setEmployeePassModal] = useState(false);
  const [infoModal, setInfoModal] = useState<string | null>(null); // employeePassword | googleId | cashback
  const [contactUsModal, setContactUsModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [hidePlatformAddressLabel, setHidePlatformAddressLabel] = useState(false);
  const [hideGoogleLabel, setHideGoogleLabel] = useState(false);
  // consider removing
  const [qrModal, setQrModal] = useState(false);
  const [apiModal, setApiModal] = useState(false);
  const [depositAddressModal, setDepositAddressModal] = useState(false);

  // hooks
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { disconnectAsync } = useDisconnect();
  const locale = useLocale();
  const t = useTranslations("App.Settings");
  const tcommon = useTranslations("Common");

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

  const copyAddress = () => {
    setPopup("copyAddress");
    setTimeout(() => setPopup(""), 1500);
    navigator.clipboard.writeText(paymentSettingsState.merchantEvmAddress);
  };

  const saveEmployeePass = async (e: React.FocusEvent<HTMLInputElement, Element>) => {
    try {
      const employeePass = e.target.value;
      (document.getElementById("employeePass") as HTMLInputElement).value = "";
      employeePass ? setCashoutSettingsState({ ...cashoutSettingsState, isEmployeePass: true }) : setCashoutSettingsState({ ...cashoutSettingsState, isEmployeePass: false });
      const res = await fetch("/api/saveEmployeePass", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ employeePass: employeePass, idToken, publicKey }),
      });
      const data = await res.json();
      if (data === "saved") {
        console.log("employeePass saved");
      } else {
        setErrorMsg("Internal server error. Data was not saved.");
        setErrorModal(true);
      }
    } catch (e) {
      setErrorMsg("Server request error. Data was not saved.");
      setErrorModal(true);
    }
  };

  const onClickChangeEmployeePass = async () => {
    setEmployeePassMask(false);
    setEmployeePassModal(false);
    (document.getElementById("employeePass") as HTMLInputElement).value = "";
    document.getElementById("employeePass")?.focus();
  };

  const onClickSignOut = async () => {
    window.sessionStorage.removeItem("cbAccessToken");
    window.localStorage.removeItem("cbRefreshToken");
    await disconnectAsync();
    setPage("loading");
    window.location.reload();
  };

  // console.log("last render, paymentSettingsState:", paymentSettingsState);
  // console.log("last render, cashoutSettings:", cashoutSettingsState);
  return (
    <section className="w-full h-full flex flex-col items-center overflow-y-auto">
      <div className="settingsFont settingsWidth">
        <div className="settingsTitle">{t("settings")}</div>
        {/*---form ---*/}
        <form className="w-full max-w-[640px]">
          {/*---EVM Address---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">{t("account")}</label>
            <div className="relative h-full" onClick={copyAddress}>
              <div className="settingsInputFont h-full flex items-center cursor-pointer active:text-slate-500 desktop:hover:text-slate-500 desktop:transition-all desktop:duration-[300ms]">
                {paymentSettingsState.merchantEvmAddress.slice(0, 7)}...{paymentSettingsState.merchantEvmAddress.slice(-5)} <LuCopy className="ml-2 w-[20px] h-[20px]" />
              </div>
              {/*--- "copied" popup ---*/}
              {popup == "copyAddress" && (
                <div className="copiedText absolute whitespace-nowrap left-[50%] bottom-[calc(100%-4px)] translate-x-[-50%] px-3 py-1 bg-slate-700 text-white font-normal rounded-full">
                  {t("copied")}
                </div>
              )}
            </div>
          </div>

          {/*---email---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">{t("email")}</label>
            <div
              className="w-full max-w-[300px] portrait:sm:max-w-[470px] landscape:lg:max-w-[400px] landscape:xl:desktop:max-w-[360px] h-full flex items-center cursor-pointer"
              onClick={() => document.getElementById("settingsEmail")?.focus()}
            >
              <input
                id="settingsEmail"
                className="settingsInput settingsInputFont peer"
                onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantEmail}
                placeholder={t("empty")}
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---merchantName---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">{t("name")}</label>
            <div
              className="w-full h-full max-w-[280px] portrait:sm:max-w-[380px] landscape:lg:max-w-[380px] landscape:xl:desktop:max-w-[320px] flex items-center cursor-pointer"
              onClick={() => document.getElementById("settingsName")?.focus()}
            >
              <input
                id="settingsName"
                className="settingsInput settingsInputFont peer"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantName}
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---merchantCountry & merchantCurrency---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">{t("country")}</label>
            <div className="h-full flex items-center cursor-pointer">
              <select
                className="settingsSelect settingsInputFont peer"
                onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                  const merchantCountryTemp = e.target.value.split(" / ")[0];
                  const merchantCurrencyTemp = e.target.value.split(" / ")[1];
                  const cexTemp = merchantCountryTemp == "Other" ? "" : countryData[merchantCountryTemp].CEXes[0];
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
                  <option key={index} className="px-4">
                    {i}
                  </option>
                ))}
              </select>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---merchantPaymentType---*/}
          {/* <div className="settingsField relative">
              <div className="flex items-center group cursor-pointer">
                <label className="settingsLabelFont">Payment Type</label>
                <IoInformationCircleOutline size={20} className="settingsInfo" />
                <div className="top-[100%] w-full tooltip">Currently, we are only enabling "In-person" payments. In the future, "Online" payments will be available.</div>
              </div>
              <select
                className="settingsSelect settingsInputFont pointer-events-none"
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
          {/* <div className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"} flex flex-col relative`}>
            <div className="settingsLabelFont">
              <span className="group">
                <label className="">
                  Your Website
                  <IoInformationCircleOutline size={20} className="ml-0.5 xs:align-baseline text-light4" />
                </label>
                <div className="invisible group-hover:visible pointer-events-none absolute bottom-[calc(100%-6px)] w-[330px] px-3 py-1 text-base font-normal  leading-tight bg-light2 border border-light4 rounded-lg z-[1]">
                  <p>- start with "http(s)"</p>
                  <p>- this website is where customers look up item names & prices</p>
                </div>
              </span>
            </div>
            <input
              className="settingsInput settingsInputFont peer"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPaymentSettingsState({ ...paymentSettingsState, merchantWebsite: e.target.value });
                setSave(!save);
              }}
              value={paymentSettingsState.merchantWebsite}
            ></input>
          </div> */}

          {/*---merchantBusinessType---*/}
          {/* <div className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"}`}>
            <div className="flex">
              <label className="settingsLabelFont">Your Business Type</label>
            </div>
            <div onClick={() => setMerchantBusinessTypeModal(true)} className="settingsInput settingsInputFont w-full flex items-center cursor-pointer hover:bg-blue-100">
              {paymentSettingsState.merchantBusinessType && (
                <div>
                  <FontAwesomeIcon icon={merchantType2data[paymentSettingsState.merchantBusinessType].fa} className="text-blue-500 mr-1.5" />{" "}
                  {merchantType2data[paymentSettingsState.merchantBusinessType].text}
                </div>
              )}
            </div>
          </div> */}

          {/*---merchantFields---*/}
          <div className={`${paymentSettingsState.merchantPaymentType === "inperson" ? "hidden" : ""}`}>
            {/*---label---*/}
            <div className="flex">
              {/*---container with width matching text width---*/}
              <div className="flex group relative">
                <div className="settingsLabelFont">
                  Fields <IoInformationCircleOutline size={20} className="ml-0.5 xs:align-baseline text-light4" />
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
                  className="checkbox"
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
                  className="checkbox"
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
                  className="checkbox"
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
                  className="checkbox"
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
                  className="checkbox"
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
                  className="checkbox"
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
                  className="checkbox flex-none"
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
                  className="checkbox"
                ></input>
                <label className="ml-1 text-base  leading-none">SKU#</label>
              </div>
            </div>
          </div>

          {/*---cex---*/}
          {paymentSettingsState.merchantCountry != "Other" && (
            <div className={`${cashoutSettingsState.cex == "Coinbase" ? "border-bnot" : ""} settingsField`}>
              <label className="settingsLabelFont">{t("platform")}</label>
              <div className="h-full flex items-center cursor-pointer">
                <select
                  className="settingsSelect settingsInputFont peer"
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
                <div className="settingsRightAngle">&#10095;</div>
              </div>
            </div>
          )}

          {/*---cexEvmAddress---*/}
          <div className={`${paymentSettingsState.merchantCountry != "Other" && cashoutSettingsState.cex == "Coinbase" ? "hidden" : ""} settingsField`}>
            <label className={`${hidePlatformAddressLabel ? "hidden" : ""} settingsLabelFont w-[160px] sm:w-auto leading-tight`}>
              {t("platformAddress")}
              <IoInformationCircleOutline size={20} className="settingsInfo" onClick={() => setInfoModal("cexDepositAddress")} />
            </label>
            <div className="w-full h-full flex items-center cursor-pointer">
              <input
                className={`${
                  hidePlatformAddressLabel ? "settingsInputFontSmall" : "settingsInputFont"
                } settingsInput placeholder:settingsInputFontRem focus:placeholder:text-transparent peer`}
                onFocus={() => setHidePlatformAddressLabel(true)}
                onChange={(e) => {
                  setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value });
                }}
                onBlur={() => {
                  setSave(!save);
                  setHidePlatformAddressLabel(false);
                }}
                value={
                  cashoutSettingsState.cexEvmAddress
                    ? hidePlatformAddressLabel
                      ? cashoutSettingsState.cexEvmAddress
                      : `${cashoutSettingsState.cexEvmAddress.slice(0, 7)}...${cashoutSettingsState.cexEvmAddress.slice(-5)}`
                    : ""
                }
                autoComplete="none"
                placeholder={t("empty")}
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---employee password---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">
              {t("employeePass")}
              <IoInformationCircleOutline size={20} className="settingsInfo" onClick={() => setInfoModal("employeePassword")} />
            </label>
            <div className="relative w-full max-w-[280px] landscape:xl:desktop:max-w-[240px] h-full">
              {/*--- mask ---*/}
              <div
                className={`${employeePassMask ? "" : "hidden"} absolute w-full h-full flex items-center cursor-pointer z-[1]`}
                onClick={() => {
                  cashoutSettingsState.isEmployeePass ? setEmployeePassModal(true) : onClickChangeEmployeePass();
                }}
              >
                <div
                  id="employeePassMask"
                  className="peer w-full h-full px-[12px] text-end rounded-md flex items-center justify-end desktop:hover:text-slate-500 transition-all duration-[300ms]"
                >
                  {cashoutSettingsState.isEmployeePass ? (
                    "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  ) : (
                    <div className="italic pr-[3px] font-normal text-slate-400 dark:text-slate-500">{t("empty")}</div>
                  )}
                </div>
                <div className="pt-[2px] text-[18px] desktop:peer-hover:text-slate-500 transition-all duration-[300ms]">&#10095;</div>
              </div>
              <div className={`w-full h-full flex items-center cursor-pointer`}>
                <input
                  id="employeePass"
                  className="settingsInput settingsInputFont"
                  onBlur={(e) => {
                    saveEmployeePass(e);
                    setEmployeePassMask(true);
                  }}
                  autoComplete="off"
                ></input>
              </div>
            </div>
          </div>

          {/*---merchantGoogleId---*/}
          <div className="settingsField">
            <label
              className={`${hideGoogleLabel ? "hidden" : ""} settingsLabelFont font-medium text-[16px] portrait:sm:text-2xl landscape:lg:text-2xl landscape:xl:desktop:text-[16px]`}
            >
              {t("google")}
              <IoInformationCircleOutline size={20} className="settingsInfo" onClick={() => setInfoModal("googleId")} />
            </label>
            <div className="w-full h-full flex items-center cursor-pointer">
              <input
                id="settingsGoogleId"
                className={`${
                  hideGoogleLabel ? "text-[16px] portrait:sm:text-[20px] landscape:lg:text-[20px] landscape:xl:desktop:text-[16px] px-[8px] sm:px-[12px];" : "settingsInputFont"
                } settingsInput peer placeholder:settingsInputFontRem focus:placeholder:text-transparent`}
                onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantGoogleId: e.target.value })}
                onFocus={() => setHideGoogleLabel(true)}
                onBlur={() => {
                  setHideGoogleLabel(false);
                  setSave(!save);
                }}
                value={
                  paymentSettingsState.merchantGoogleId
                    ? hideGoogleLabel
                      ? paymentSettingsState.merchantGoogleId
                      : `${paymentSettingsState.merchantGoogleId.slice(0, 7)}...${paymentSettingsState.merchantGoogleId.slice(-5)}`
                    : ""
                }
                placeholder={t("empty")}
              ></input>
              <div className="settingsRightAngle" onClick={() => document.getElementById("settingsGoogleId")?.focus()}>
                &#10095;
              </div>
            </div>
          </div>

          {/*---2% off---*/}
          {paymentSettingsState.merchantPaymentType === "inperson" && (
            <div className="settingsField border-b relative">
              <label className="settingsLabelFont">
                {t("cashback")}
                <IoInformationCircleOutline size={20} className="settingsInfo" onClick={() => setInfoModal("cashback")} />
              </label>
              {/*--- toggle ---*/}
              <div className="w-[56px] h-[30px] desktop:w-[48px] desktop:h-[25px] flex items-center relative cursor-pointer" onClick={() => setInfoModal("cashback")}>
                <input type="checkbox" checked={true} readOnly className="sr-only peer" />
                <div className="w-full h-full bg-gray-200 peer-checked:bg-blue-600 dark:peer-checked:bg-darkButton rounded-full"></div>
                <div className="w-[26px] h-[26px] desktop:w-[21px] desktop:h-[21px] peer-checked:translate-x-full rtl:peer-checked:-translate-x-full content-[''] absolute left-[2px] desktop:left-[3px] border-gray-300 border rounded-full bg-white transition-all pointer-events-none"></div>
              </div>
            </div>
          )}

          {/*--- APPEARANCE  ---*/}
          <div className="settingsTitle">{t("display")}</div>
          {/*---DARK MODE ---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">{t("dark")}</label>
            {/*--- toggle ---*/}
            <div
              className="w-[56px] h-[30px] desktop:w-[48px] desktop:h-[25px] flex items-center relative cursor-pointer"
              onClick={() => {
                if (theme == "dark") {
                  setTheme("light");
                  window.localStorage.setItem("theme", "light");
                } else {
                  setTheme("dark");
                  window.localStorage.setItem("theme", "dark");
                }
              }}
            >
              <input type="checkbox" checked={theme == "dark" ? true : false} readOnly className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 peer-checked:bg-blue-600 dark:peer-checked:bg-darkButton rounded-full"></div>
              <div className="w-[26px] h-[26px] desktop:w-[21px] desktop:h-[21px] peer-checked:translate-x-full rtl:peer-checked:-translate-x-full content-[''] absolute left-[2px] desktop:left-[3px] border-gray-300 border rounded-full bg-white transition-all pointer-events-none"></div>
            </div>
          </div>
          {/*---LANGUAGE ---*/}
          <div className="settingsField border-b">
            <label className="settingsLabelFont">{t("language")}</label>
            <div className="h-full flex items-center cursor-pointer">
              <select
                className="settingsSelect settingsInputFontRem peer"
                onChange={(e) => {
                  window.location.assign(`/${e.currentTarget.value}/app`); // for some reason, router.push/replace will cause web3Auth and walletClient to disconnect and show null. Thus, page.tsx useEffect will run. BUT, for some reason, it will not run like a reload and will get stuck, as after web3Auth connects, there is no more re-render.
                  // router.replace("/app", { locale: e.currentTarget.value as "en" | "fr" | "it" | "zh-TW" });
                }}
                value={`${locale}`}
              >
                {langObjectArray.map((langObject) => (
                  <option key={langObject.id} value={langObject.id}>
                    {langObject.text}
                  </option>
                ))}
              </select>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*--- SUPPORT ---*/}
          <div className="settingsTitle">{t("support")}</div>
          {/*--- FAQs ---*/}
          <div
            className="settingsField text-lightText1 dark:text-darkText1 desktop:hover:text-slate-500 active:text-slate-500 dark:desktop:hover:text-slate-500 dark:active:text-slate-500 cursor-pointer transition-all duration-[300ms]"
            onClick={() => setFaqModal(true)}
          >
            <div className="settingsLabelFontSupport cursor-pointer">{t("instructions")}</div>
            <div className="pt-[2px] text-[18px]">&#10095;</div>
          </div>
          {/*--- Contact Us ---*/}
          <div
            className="settingsField text-lightText1 dark:text-darkText1 desktop:hover:text-slate-500 active:text-slate-500 dark:desktop:hover:text-slate-500 dark:active:text-slate-500 cursor-pointer transition-all duration-[300ms]"
            onClick={() => setContactUsModal(true)}
          >
            <div className="settingsLabelFontSupport cursor-pointer">{t("contact")}</div>
            <div className="pt-[2px] text-[18px]">&#10095;</div>
          </div>
          {/*--- Feedback ---*/}
          {/* <div
            className="hidden settingsField text-lightText1 dark:text-darkText1 desktop:hover:text-slate-500 active:text-slate-500 dark:desktop:hover:text-slate-500 dark:active:text-slate-500 cursor-pointer transition-all duration-[300ms]"
            onClick={() => setFeedbackModal(true)}
          >
            <div className="settingsLabelFontSupport cursor-pointer">Feedback</div>
            <div className="pt-0.5 text-lg">&#10095;</div>
          </div> */}
        </form>

        <div className="mb-[20px] portrait:sm:mb-[40px] landscape:lg:mb-[40px] h-[120px] portrait:sm:h-[130px] landscape:lg:h-[130px] landscape:xl:desktop:h-[120px] flex flex-col justify-center">
          {/*---Sign Out---*/}
          <div className="flex items-center justify-center relative">
            <button
              onClick={onClickSignOut}
              className="px-[24px] py-[12px] portrait:sm:px-[32px] landscape:lg:px-[32px] portrait:sm:py-[16px] landscape:lg:py-[16px] landscape:xl:desktop:py-[12px] rounded-full font-medium buttonPrimaryColor"
            >
              {t("signOut")}
            </button>
          </div>
        </div>
      </div>

      {/*---5 MODALS---*/}
      {infoModal && (
        <div>
          <div className="settingsInfoModal">
            <div className="px-[12px] portrait:sm:px-[40px] landscape:lg:px-[40px] landscape:xl:desktop:px-[32px] overflow-y-auto">
              {/*--- title ---*/}
              <div className="modalHeaderXl pb-[24px] w-full flex justify-center items-center">
                {infoModal == "employeePassword" && <div>{t("info.employeePass.title")}</div>}
                {infoModal == "cashback" && <div>{t("info.cashback.title")}</div>}
                {infoModal == "googleId" && <div>{t("info.google.title")}</div>}
                {infoModal == "cexDepositAddress" && <div>{t("info.platformAddress.title")}</div>}
              </div>
              {/*--- text ---*/}
              <div className="textLg leading-normal flex flex-col">
                {infoModal == "employeePassword" && (
                  <div className="space-y-3">
                    <p>
                      {t.rich("info.employeePass.text-1", {
                        span1: (chunks) => <span className="font-bold">{chunks}</span>,
                        span2: (chunks) => <span className="font-bold">{chunks}</span>,
                        email: paymentSettingsState.merchantEmail,
                      })}
                    </p>
                    <p className="pt-2 font-bold">{t("info.employeePass.text-2")}</p>
                    <p className="">{t("info.employeePass.text-3")}</p>
                  </div>
                )}
                {infoModal == "cashback" && (
                  <div className="space-y-3">
                    <p>{t("info.cashback.text-1")}</p>
                    <p>{t("info.cashback.text-2")}</p>
                    <p>{t("info.cashback.text-3")}</p>
                  </div>
                )}
                {infoModal == "googleId" && <div>{t("info.google.text-1")}</div>}
                {infoModal == "cexDepositAddress" && <div>{t("info.platformAddress.text-1")}</div>}
              </div>
              {/*---button---*/}
              <div className="py-[24px]">
                <button onClick={() => setInfoModal(null)} className="buttonPrimary">
                  {tcommon("close")}
                </button>
              </div>
            </div>
          </div>
          <div className="modalBlackout" onClick={() => setInfoModal(null)}></div>
        </div>
      )}
      {employeePassModal && (
        <div>
          <div className="modal">
            {/*---content---*/}
            <div className="modalContent">{t("employeePassModal.text")}</div>
            {/*---buttons---*/}
            <div className="modalButtonContainer">
              <button onClick={onClickChangeEmployeePass} className="buttonPrimary">
                {t("employeePassModal.change")}
              </button>
              <button onClick={() => setEmployeePassModal(false)} className="buttonSecondary">
                {t("employeePassModal.cancel")}
              </button>
            </div>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
      {faqModal && <FaqModal paymentSettingsState={paymentSettingsState} cashoutSettingsState={cashoutSettingsState} setFaqModal={setFaqModal} />}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
      {/* {merchantBusinessTypeModal && (
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
          <div className="opacity-60 fixed inset-0 z-10 bg-black"></div>
        </div>
      )} */}
    </section>
  );
};

export default Settings;
