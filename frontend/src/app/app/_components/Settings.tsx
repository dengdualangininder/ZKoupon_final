"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteCookie } from "cookies-next";
// other
import { QRCodeSVG } from "qrcode.react";
import { useTheme } from "next-themes";
import { Buffer } from "buffer";
// wagmi
import { useDisconnect } from "wagmi";
// components
import FaqModal from "./modals/FaqModal";
import ErrorModal from "./modals/ErrorModal";
// import APIModal from "./modals/ApiKeyModal";
// import QrModal from "./modals/QrModal";
// constants
import { countryData, countryCurrencyList, merchantType2data } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
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
  const [employeePassMask, setEmployeePassMask] = useState(true);
  // modal states
  const [figmaModal, setFigmaModal] = useState(false);
  const [merchantBusinessTypeModal, setMerchantBusinessTypeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [employeePassModal, setEmployeePassModal] = useState(false);
  const [infoModal, setInfoModal] = useState<string | null>(null); // employeePassword | googleId | cashback
  // consider removing
  const [qrModal, setQrModal] = useState(false);
  const [apiModal, setApiModal] = useState(false);
  const [depositAddressModal, setDepositAddressModal] = useState(false);

  // hooks
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { disconnectAsync } = useDisconnect();

  // listens to changes in save and saves the states to db
  useEffect(() => {
    return;
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
      // if (employeePass) {
      //   setCashoutSettingsState({ ...cashoutSettingsState, isEmployeePass: true });
      // } else {
      //   setCashoutSettingsState({ ...cashoutSettingsState, isEmployeePass: false });
      // }
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
    <section className="w-full h-full flex flex-col items-center overflow-y-auto">
      <div className="settingsFont px-3 settingsWidth">
        <div className="settingsTitle">Settings</div>
        {/*---form ---*/}
        <form className="w-full max-w-[640px]">
          {/*---EVM Address---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">Your EVM Address</label>
            <div className="relative h-full" onClick={copyAddress}>
              <div className="h-full flex items-center cursor-pointer desktop:hover:text-slate-500">
                {paymentSettingsState.merchantEvmAddress.slice(0, 7)}...{paymentSettingsState.merchantEvmAddress.slice(-5)}{" "}
                <div className="ml-2 relative w-[20px] h-[20px]">
                  <Image src={theme == "dark" ? "/copyWhite.svg" : "/copyBlack.svg"} alt="copy" fill />
                </div>
              </div>
              {popup == "copyAddress" && (
                <div className="copiedText absolute left-[50%] bottom-[calc(100%-4px)] translate-x-[-50%] px-2 py-1 bg-slate-700 text-white font-normal rounded-[4px]">copied</div>
              )}
            </div>
          </div>

          {/*---email---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">Email</label>
            <div
              className="w-full max-w-[300px] portrait:sm:max-w-[470px] landscape:lg:max-w-[400px] landscape:xl:desktop:max-w-[360px] h-full flex items-center cursor-pointer"
              onClick={() => document.getElementById("settingsEmail")?.focus()}
            >
              <input
                id="settingsEmail"
                className="settingsValueFont peer"
                onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantEmail}
                placeholder="empty"
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---merchantName---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">Business Name</label>
            <div
              className="w-full h-full max-w-[280px] portrait:sm:max-w-[380px] landscape:lg:max-w-[380px] landscape:xl:desktop:max-w-[320px] flex items-center cursor-pointer"
              onClick={() => document.getElementById("settingsName")?.focus()}
            >
              <input
                id="settingsName"
                className="settingsValueFont peer"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantName}
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---merchantCountry & merchantCurrency---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">Country / Currency</label>
            <div className="h-full flex items-center cursor-pointer">
              <select
                className="settingsSelectFont peer [-webkit-appearance:none]"
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
                  Your Website <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:align-baseline  text-light4" />
                </label>
                <div className="invisible group-hover:visible pointer-events-none absolute bottom-[calc(100%-6px)] w-[330px] px-3 py-1 text-base font-normal  leading-tight bg-light2 border border-light4 rounded-lg z-[1]">
                  <p>- start with "http(s)"</p>
                  <p>- this website is where customers look up item names & prices</p>
                </div>
              </span>
            </div>
            <input
              className="settingsValueFont peer"
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
            <div onClick={() => setMerchantBusinessTypeModal(true)} className="w-full flex items-center settingsValueFont cursor-pointer hover:bg-blue-100">
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
                  Fields <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 xs:align-baseline text-light4" />
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
            <div className={`${cashoutSettingsState.cex == "Coinbase" ? "border-bnot" : ""} settingsField`}>
              <label className="settingsLabelFont">Cash Out Platform</label>
              <div className="h-full flex items-center cursor-pointer">
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
                <div className="settingsRightAngle">&#10095;</div>
              </div>
            </div>
          )}

          {/*---cexEvmAddress---*/}
          <div className={`${paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" ? "hidden" : ""} settingsField border-bnone`}>
            <label className="settingsLabelFont">CEX EVM Address</label>
            <div className="h-full flex items-center cursor-pointer">
              <input
                className="settingsValueFont peer"
                onChange={(e) => {
                  setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value });
                }}
                onBlur={() => setSave(!save)}
                value={cashoutSettingsState.cexEvmAddress}
                autoComplete="none"
                placeholder="empty"
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---employee password---*/}
          <div className="settingsField">
            <label className="settingsLabelFont">
              Employee Password
              <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" onClick={() => setInfoModal("employeePassword")} />
            </label>
            <div className="relative w-full max-w-[280px] landscape:xl:desktop:max-w-[240px] h-full">
              {/*--- mask ---*/}
              <div className={`${employeePassMask ? "" : "hidden"} absolute w-full h-full flex items-center cursor-pointer z-[1]`} onClick={() => setEmployeePassModal(true)}>
                <div
                  id="employeePassMask"
                  className="peer w-full h-full px-3 text-end rounded-md flex items-center justify-end desktop:hover:text-slate-500 transition-all duration-[300ms]"
                >
                  {cashoutSettingsState.isEmployeePass ? (
                    "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  ) : (
                    <div className="italic pr-[2px] font-normal text-slate-400 dark:text-slate-600">empty</div>
                  )}
                </div>
                <div className="pt-0.5 text-lg desktop:peer-hover:text-slate-500 transition-all duration-[300ms]">&#10095;</div>
              </div>
              <div className={`w-full h-full flex items-center cursor-pointer`}>
                <input
                  id="employeePass"
                  className="settingsValueFont"
                  onBlur={(e) => {
                    saveEmployeePass(e);
                    setEmployeePassMask(true);
                  }}
                  autoComplete="off"
                ></input>
              </div>
            </div>
          </div>

          {/*---2% off---*/}
          {paymentSettingsState.merchantPaymentType === "inperson" && (
            <div className="settingsField relative">
              <label className="settingsLabelFont">
                Give 2% Cashback?
                <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" onClick={() => setInfoModal("cashback")} />
              </label>
              <div className="h-full flex items-center cursor-pointer">
                <select className="settingsSelectFont peer" onChange={(e) => {}}>
                  <option key="yes">Yes</option>
                  {/* <option key="no">No</option> */}
                </select>
                <div className="settingsRightAngle">&#10095;</div>
              </div>
            </div>
          )}

          {/*---merchantGoogleId---*/}
          <div className="settingsField border-b relative">
            <label className="settingsLabelFont">
              Google Place ID
              <FontAwesomeIcon icon={faCircleInfo} className="settingsInfo" onClick={() => setInfoModal("googleId")} />
            </label>
            <div className="h-full flex items-center cursor-pointer">
              <input
                id="settingsGoogleId"
                className="settingsValueFont peer"
                onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantGoogleId: e.target.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantGoogleId}
                placeholder="empty"
              ></input>
              <div className="settingsRightAngle" onClick={() => document.getElementById("settingsGoogleId")?.focus()}>
                &#10095;
              </div>
            </div>
          </div>

          {/*--- APPEARANCE  ---*/}
          <div className="settingsTitle">Apperance</div>
          <div className="settingsField">
            <label className="settingsLabelFont">Dark Mode</label>
            {/*--- toggle ---*/}
            <div className="mt-1 desktop:mt-2 w-[56px] h-[30px] flex items-center relative cursor-pointer" onClick={() => (theme == "dark" ? setTheme("light") : setTheme("dark"))}>
              <input type="checkbox" checked={theme == "dark" ? true : false} className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 peer-checked:bg-blue-600 dark:peer-checked:bg-darkButton rounded-full"></div>
              <div className="w-[26px] h-[26px] peer-checked:translate-x-full rtl:peer-checked:-translate-x-full content-[''] absolute left-[2px] border-gray-300 border rounded-full bg-white transition-all pointer-events-none"></div>
            </div>
          </div>

          {/*--- SUPPORT ---*/}
          <div className="settingsTitle">Support</div>
          {/*--- FAQs ---*/}
          <div className="settingsField cursor-pointer group" onClick={() => setFaqModal(true)}>
            <label className="settingsLabelFont text-lightText1 dark:text-darkText1 cursor-pointer desktop:group-hover:opacity-70 group-active:opacity-70">Instructions</label>
            <div className="pt-0.5 text-lg desktop:group-hover:opacity-70 group-active:opacity-70">&#10095;</div>
          </div>
          {/*--- Contact Us ---*/}
          <div className="settingsField cursor-pointer group">
            <label className="settingsLabelFont text-lightText1 dark:text-darkText1 cursor-pointer desktop:group-hover:opacity-70 group-active:opacity-70">Contact Us</label>
            <div className="pt-0.5 text-lg desktop:group-hover:opacity-70 group-active:opacity-70">&#10095;</div>
          </div>
          {/*--- Feedback ---*/}
          <div className="hidden settingsField cursor-pointer desktop:hover:brightness-[1.2] active:brightness-[1.2]">
            <label className="settingsLabelFont text-lightText1 dark:text-darkText1 cursor-pointer">Feedback</label>
            <div className="pt-0.5 text-lg">&#10095;</div>
          </div>
        </form>

        <div className="mb-[20px] portrait:sm:mb-[40px] landscape:lg:mb-[40px] h-[120px] portrait:sm:h-[130px] landscape:lg:h-[130px] landscape:xl:desktop:h-[120px] flex flex-col justify-center">
          {/*---Sign Out---*/}
          <div className="flex items-center justify-center relative">
            <button
              onClick={onClickSignOut}
              className="px-6 py-3 portrait:sm:px-8 landscape:lg:px-8 portrait:sm:py-4 landscape:lg:py-4 landscape:xl:desktop:py-3 rounded-full buttonPrimaryColor"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/*---5 MODALS---*/}
      {infoModal && (
        <div>
          <div className="settingsInfoModal overflow-y-auto">
            {/*--- desktop close button ---*/}
            <div className="hidden landscape:xl:desktop:flex absolute right-[12px] top-[12px] xButtonContainer" onClick={() => setInfoModal(null)}>
              <div className="xButton">&#10005;</div>
            </div>
            {/*--- TITLE ---*/}
            <div className="modalHeaderXl flex-none landscape:xl:desktop:w-[calc(100%-80px)] h-[90px] portrait:sm:h-[110px] landscape:lg:h-[110px] landscape:xl:desktop:h-[100px] flex justify-center items-center relative">
              {infoModal == "employeePassword" && <div>What is the Employee Password?</div>}
              {infoModal == "cashback" && <div>What is the 2% Cashback?</div>}
              {infoModal == "googleId" && <div>What is the Google ID?</div>}
            </div>
            {/*--- CONTENT ---*/}
            <div className="textBase2 flex-1 flex flex-col">
              {infoModal == "employeePassword" && (
                <div className="space-y-3">
                  <p>
                    When an employee signs into the Flash app using your email ({paymentSettingsState.merchantEmail}) and the{" "}
                    <span className="font-semibold">Employee Password</span>, they will have access to the <span className="font-semibold">Payments</span> menu tab in your Flash
                    app. This allows employees to confirm payments when a customer pays.
                  </p>
                  <p className="pt-2 font-semibold">Can employees make refunds?</p>
                  <p className="">
                    Because employees do not have access to the funds in Flash, they cannot make refunds. However, employees can label/unlabel payments with the "To Refund" tag.
                    You (the owner) can then later refund all payments with this label in a single click.
                  </p>
                </div>
              )}
              {infoModal == "cashback" && (
                <div className="space-y-3">
                  <p>
                    We are temporarily requiring businesses give customers a 2% discount, which is automatically applied at the time of payment. As always, Flash makes zero profit
                    per transaction.
                  </p>
                  <p>
                    Because most credit cards offer 1% cashback, the 2% discount is needed to help motivate customers to pay with USDC instead. Because Flash charges 0% fees and
                    credit cards charge &gt; 3% fees, you still save money when using Flash. Furthermore, the discount may attract new customers to your business.
                  </p>
                  <p>When crypto payments become more popular, we will make this cashback optional.</p>
                </div>
              )}
              {infoModal == "googleId" && (
                <div>
                  Search "Google Place ID Finder" and go to the Google Place ID Finder website. Find your Google Place ID and paste it here. When you do, your business will be
                  added to https://www.stablecoinmap.com, which is a database of places that accept crypto payments, thus allowing crypto users to more easily find your business.
                </div>
              )}
            </div>
            {/*---button---*/}
            <button onClick={() => setInfoModal(null)} className="my-8 buttonSecondary landscape:xl:desktop:hidden">
              CLOSE
            </button>
          </div>
          <div className="modalBlackout" onClick={() => setInfoModal(null)}></div>
        </div>
      )}
      {employeePassModal && (
        <div>
          <div className="modal">
            {/*---content---*/}
            <div className="modalContent">Do you want to change the Employee Password?</div>
            {/*---buttons---*/}
            <div className="modalButtonContainer">
              <button
                onClick={() => {
                  setEmployeePassMask(false);
                  setEmployeePassModal(false);
                  (document.getElementById("employeePass") as HTMLInputElement).value = "";
                  document.getElementById("employeePass")?.focus();
                  // no need to set PaymentSettingsState
                }}
                className="buttonPrimary"
              >
                Change Password
              </button>
              <button onClick={() => setEmployeePassModal(false)} className="buttonSecondary">
                Cancel
              </button>
            </div>
          </div>
          <div className="modalBlackout"></div>
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
      )}
      {faqModal && <FaqModal paymentSettingsState={paymentSettingsState} cashoutSettingsState={cashoutSettingsState} setFaqModal={setFaqModal} />}
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </section>
  );
};

export default Settings;
