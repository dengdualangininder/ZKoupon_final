"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// other
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react";
// components
import Flow from "./Flow";
import Flow2 from "./Flow2";
import Flow3 from "./Flow3";
import ErrorModal from "./modals/ErrorModal";
import SkipModal from "./modals/SkipModal";
// constants
import { countryData, countryCurrencyList, currency2number, merchantType2data } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faCircleCheck, faPlus, faMinus, faX, faExternalLink } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const Intro = ({
  paymentSettingsState,
  setPaymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  page,
  setPage,
  isMobile,
  idToken,
  publicKey,
  setCoinbaseIntroModal,
  isUsabilityTest,
}: {
  paymentSettingsState: PaymentSettings;
  setPaymentSettingsState: any;
  cashoutSettingsState: CashoutSettings;
  setCashoutSettingsState: any;
  page: string;
  setPage: any;
  isMobile: boolean;
  idToken: string;
  publicKey: string;
  setCoinbaseIntroModal: any;
  isUsabilityTest: boolean;
}) => {
  const [step, setStep] = useState("welcome");
  const [url, setUrl] = useState("");
  const [save, setSave] = useState(false);
  const [expand, setExpand] = useState(false);
  // modal states
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  const [skipModal, setSkipModal] = useState(false);

  // hooks
  const router = useRouter();

  useEffect(() => {
    //usability test
    if (isUsabilityTest) {
      return;
    }

    // tempUrl is dependent on the UPDATED settingsState, so must use useEffect. Initially, had all this logic within a function,
    // but could not generate tempUrl with updated settingsState. Using "save" in dependency array instead of settingsState allows
    // control when to specifically trigger this useEffect
    console.log("saveSettings useEffect run once");
    console.log(paymentSettingsState);
    console.log(cashoutSettingsState);
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
    setUrl(tempUrl);
    console.log(tempUrl);

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

  const onClickSIWC = async () => {
    // usability test
    setPage("loading");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCoinbaseIntroModal(true);
    setPage("app");
    return;

    const cbRandomSecure = uuidv4() + "SUBSTATEfromIntro";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:buys:create,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read`
    );
  };

  const sendEmail = async () => {
    setStep("emailSent");
  };

  return (
    <div className="text-xl w-full h-screen flex justify-center overflow-y-auto">
      <div className="w-[85%] min-w-[354px] max-w-[420px] desktop:max-w-[450px] h-screen min-h-[650px] my-auto max-h-[800px]">
        {/*--- welcome ---*/}
        {step == "welcome" && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="pb-16 w-full flex flex-col items-center portrait:space-y-12 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-16">
              <div className="relative w-[300px] h-[100px] landscape:lg:h-[100px] portrait:sm:h-[100px] landscape:lg:desktop:h-[100px] mr-1">
                <Image src="/logo.svg" alt="logo" fill />
              </div>
              <div className="pb-4 text-center animate-fadeInAnimation leading-relaxed">
                Set up crypto payments
                <br />
                with 0% fees now
              </div>
              {/*--- buttons ---*/}
              <button
                className="w-[240px] h-[60px] portrait:sm:h-[60px] landscape:lg:h-[60px] landscape:desktop:xl:h-[48px] text-lg portrait:sm:text-lg landscape:lg:text-base landscape:desktop:xl:text-base font-medium text-white bg-blue-500 border-2 border-blue-500 active:opacity-50 lg:hover:opacity-50 rounded-[4px] animate-fadeInAnimation"
                onClick={() => setStep("info")}
              >
                START
              </button>
            </div>
          </div>
        )}

        {/*--- info ---*/}
        {step == "info" && (
          <div className="text-xl h-full flex flex-col">
            {/*--- skip ---*/}
            <div className="flex-none w-full h-[72px] flex justify-end items-center">
              <div onClick={() => setSkipModal(true)} className="text-lg font-medium cursor-pointer px-3 py-2 desktop:hover:bg-gray-200 active:bg-gray-200 rounded-[4px]">
                SKIP
              </div>
            </div>
            {/*--- content ---*/}
            <div className="px-1 flex-1 space-y-6 portrait:sm:space-y-8 landscape:lg:space-y-8 landscape:xl:desktop:space-y-8">
              <div className="">To start accepting crypto payments, you will need a QR code. To create one, fill out the form below:</div>
              <div className="flex flex-col">
                <label className="w-full font-medium">Your business's name</label>
                <input
                  className="mt-1 w-full max-w-[480px] px-3 py-3 border border-gray-400 outline-none focus:border-blue-500 transition-colors duration-500 rounded-[4px] placeholder:italic"
                  placeholder="Enter the name of your business"
                  onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value })}
                  onBlur={() => setSave(!save)}
                  value={paymentSettingsState.merchantName}
                ></input>
              </div>
              <div className="flex flex-col">
                <label className="w-full font-medium">Your country / currency</label>
                <select
                  className="mt-1 w-full max-w-[480px] border border-gray-400 px-3 py-3 outline-none focus:border-blue-500 transition-colors duration-500 rounded-[4px] placeholder:italic"
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
              </div>
              <div className="flex flex-col">
                <label className="w-full font-medium">Your email address</label>
                <input
                  className="mt-1 w-full max-w-[480px] border border-gray-400 px-3 py-3 outline-none focus:border-blue-500 transition-colors duration-500 rounded-[4px] placeholder:italic"
                  placeholder="Type in your email"
                  onChange={(e) => setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value })}
                  onBlur={() => setSave(!save)}
                  value={paymentSettingsState.merchantEmail}
                ></input>
                <div className="mt-0.5 textBase italic">Your QR code will be sent to this email</div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack2" onClick={() => setStep("welcome")}>
                &#10094;&nbsp; BACK
              </button>
              <button
                className="introNext2"
                onClick={() => {
                  if (!paymentSettingsState.merchantName) {
                    setErrorModal(true);
                    setErrorMsg("Please enter the name of your business");
                    return;
                  }
                  if (!paymentSettingsState.merchantEmail) {
                    setErrorModal(true);
                    setErrorMsg("Please enter a email address");
                    return;
                  }
                  setStep("emailSent");
                }}
              >
                NEXT &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- emailSent ---*/}
        {step == "emailSent" && (
          <div className="w-full h-full flex flex-col items-center">
            {/*--- spacer ---*/}
            <div className="w-full h-[7%] min-h-[72px]"></div>
            {/*--- text ---*/}
            <div className="px-3 flex-1 flex flex-col space-y-8">
              <div className="font-semibold">Your QR code was created!</div>
              <div className="">Please check your email. We emailed you the QR code, along with instructions on how to print and display it.</div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack2" onClick={() => setStep("info")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext2" onClick={() => setStep("how")}>
                NEXT &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- how customer pays ---*/}
        {step == "how" && (
          <div className="text-xl w-full h-full flex flex-col items-center">
            {/*--- title + image + text ---*/}
            <div className="mt-8 flex-1 w-full flex flex-col items-center space-y-5">
              {/*--- title ---*/}
              <div className="font-bold leading-none text-2xl">How does a customer pay?</div>
              {/*--- image ---*/}
              <div className="relative w-full max-w-[320px] sm:max-w-[360px] h-[calc(100vw*(3/4*0.85))] max-h-[calc(320px*(3/4))] sm:max-h-[calc(360px*(3/4))] flex-none">
                <Image
                  src="/intro-scan.png"
                  alt="scan"
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
              {/*--- text ---*/}
              <div className="flex flex-col space-y-3">
                <div className="relative flex">
                  <div className="introNumber">1</div>
                  <div>
                    Customer scans your QR code, which will open thier{" "}
                    <span className="group">
                      <span className="link">
                        MetaMask app<sup>?</sup>
                      </span>
                      <div className="w-full top-[calc(100%+4px)] left-0 introTooltip">
                        MetaMask is the most popular app to send/receive tokens and is used by 50+ million people worldwide.
                      </div>
                    </span>{" "}
                  </div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">2</div>
                  <div>
                    Customer <span className="font-semibold">enters the amount of {paymentSettingsState?.merchantCurrency} for payment</span>
                  </div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">3</div>
                  <div>
                    When the customer submits payment,{" "}
                    <span className="group">
                      <span className="link">
                        USDC tokens<sup>?</sup>
                      </span>
                      <div className="bottom-[calc(100%+8px)] left-0 introTooltip">
                        The USDC token is used by almost all crypto users. 1 USDC token equals to 1 USD, as gauranteed by Circle.
                      </div>
                    </span>{" "}
                    ({paymentSettingsState?.merchantCurrency == "USD" ? "" : "with a value "}equal to the amount of {paymentSettingsState?.merchantCurrency} entered) will be sent
                    from their MetaMask to your Flash app
                  </div>
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack2" onClick={() => setStep("emailSent")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext2" onClick={() => setStep("link")}>
                NEXT &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- link (coinbase && not any country) ---*/}
        {step == "link" && paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" && (
          <div className="w-full h-full flex flex-col items-center">
            {/*--- title + animation + text ---*/}
            <div className="mt-8 flex-1 flex flex-col space-y-6">
              {/*--- title ---*/}
              <div className="text-2xl font-bold text-center">How do I cash out?</div>
              {/*--- animation ---*/}
              <div className="w-full flex items-center justify-center">
                <Flow2 paymentSettingsState={paymentSettingsState} cashoutSettingsState={cashoutSettingsState} />
              </div>
              {/*--- text ---*/}
              <div className="pt-3 space-y-4">
                <div className="relative flex">
                  <div className="introNumber">1</div>
                  <div>
                    Link a{" "}
                    <span className="link">
                      Coinbase<sup>?</sup>
                    </span>{" "}
                    account to the Flash app
                  </div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">2</div>
                  <div>Click “Cash Out” in the Flash app. USDC will be automatically converted to EUR, and the money deposited to your bank</div>
                </div>
                <div className="">
                  Flash is designed such that you will not lose money due to changing conversion rates. If a customer pays you 10 EUR, you will receive 10 EUR in the bank (there
                  are no fees).
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="w-full pt-2 pb-[44px] space-y-8 portrait:sm:space-y-8 landscape:lg:space-y-8 textLg flex flex-col items-center">
                <button
                  className="w-full max-w-[350px] h-[56px] bg-blue-500 border-2 border-blue-500 text-white font-medium rounded-[4px] desktop:hover:bg-blue-700 active:opacity-50"
                  onClick={onClickSIWC}
                >
                  Link Coinbase Account
                </button>
                <div
                  className=" text-gray-600 font-medium underline underline-offset-[3px] text-center cursor-pointer desktop:hover:opacity-50 active:opacity-50"
                  onClick={() => setStep("nocoinbase")}
                >
                  I don't have one
                </div>
              </div>
            </div>
          </div>
        )}

        {step == "nocoinbase" && (
          <div className="w-full h-full flex flex-col items-center">
            {/*--- skip ---*/}
            <div className="flex-none w-full h-[72px] flex justify-end items-center">
              <div onClick={() => setSkipModal(true)} className="text-lg font-medium cursor-pointer px-3 py-2 desktop:hover:bg-gray-200 active:bg-gray-200 rounded-[4px]">
                SKIP
              </div>
            </div>
            <div className="flex flex-col items-center space-y-8">
              {/*--- title ---*/}
              <div className="text-2xl text-center font-bold">Don't Have a Coinbase Account?</div>
              {/*--- text ---*/}
              <div className="">
                No worries, creating one only takes a couple of minutes. {isMobile ? "Download the Coinbase app below" : "Go to Coinbase's official website below"}. There, you can
                create an account and return to Flash to link it later.
              </div>
              {/*--- button ---*/}
              <button
                className="w-full max-w-[350px] h-[56px] bg-blue-500 border-2 border-blue-500 text-white font-medium rounded-[4px] desktop:hover:bg-blue-700 active:opacity-50"
                onClick={() => {
                  window.open("https://www.coinbase.com/signup", "_blank");
                  setPage("app");
                  // TODO: set appropriate welcome modal
                }}
              >
                {isMobile ? (
                  "Download Coinbase App"
                ) : (
                  <div>
                    Coinbase's Official Site
                    <FontAwesomeIcon icon={faExternalLink} className="ml-2" />
                  </div>
                )}
              </button>
              {/*--- can I use another cex? ---*/}
              <div className="flex max-w-[350px] space-x-3 bg-gray-200 p-4 text-base cursor-pointer rounded-[4px]" onClick={() => setExpand(!expand)}>
                <FontAwesomeIcon icon={expand ? faMinus : faPlus} className="pt-1" />
                <div className="">
                  <div className="">Can I use a different cryptocurrency exchange?</div>
                  <div className={`${expand ? "max-h-[300px]" : "max-h-0"} overflow-hidden`}>
                    <div className="py-2">
                      If you prefer another exchange, you can transfer USDC tokens from Flash to any EVM address, including the one associated with your preferred platform. Then,
                      log into that platform and cash out yourself.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*--- link (if not coinbase or if "Any country") ---*/}
        {step == "link" && (paymentSettingsState.merchantCountry == "Any country" || cashoutSettingsState.cex != "Coinbase") && (
          <div className="introPageContainer portrait:text-2xl landscape:text-lg portrait:sm:text-3xl landscape:lg:text-3xl portrait:leading-relaxed portrait:sm:leading-relaxed landscape:lg:leading-relaxed">
            {/*--- content ---*/}
            <div className="introTextContainer1">
              <div className="introTextContainer2 portrait:space-y-5 landscape:space-y-3 portrait:sm:space-y-10 landscape:lg:space-y-8 landscape:xl:space-y-12">
                <div className="w-full portrait:space-y-6 landscape:space-y-3 landscape:lg:space-y-6">
                  <div>Enter the USDC (Polygon) deposit address of your cryptocurrency exchange account:</div>
                  <input
                    onChange={(e) => setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value })}
                    onBlur={() => setSave(!save)}
                    value={cashoutSettingsState.cexEvmAddress}
                    className="w-full portrait:text-[13px] landscape:text-lg portrait:sm:text-xl landscape:lg:text-xl portrait:lg:text-2xl landscape:xl:text-2xl border-b-2 outline-none placeholder:text-lg placeholder:portrait:sm:text-2xl placeholder:landscape:lg:text-2xl xs:font-medium bg-white"
                    placeholder="Enter address here"
                  ></input>
                </div>
                <div className="pt-3 w-full leading-relaxed">The address is used to allow easy transfer of USDC from Flash to your cryptocurrency exchange.</div>
                {cashoutSettingsState.cex ? (
                  <div className="pt-3 w-full leading-relaxed">
                    If you don't have one, please register an account on {cashoutSettingsState.cex} Exchange. You can skip this step for now.
                  </div>
                ) : (
                  <div>If you don't have one, please register an account on a cryptocurrency exchange. You can skip this step for now.</div>
                )}
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack2" onClick={() => setStep("emailSent")}>
                BACK
              </button>
              <button className="introNext2" onClick={() => setStep("final")}>
                {cashoutSettingsState.cexEvmAddress ? "NEXT" : "Skip"}
              </button>
            </div>
          </div>
        )}

        {step == "final" && (
          <div className="introPageContainer introFont3xl ">
            {/*--- content ---*/}
            <div className="introTextContainer1">
              <div className="introTextContainer2 space-y-10 portrait:sm:space-y-16 landscape:lg:space-y-16">
                <div className="w-full">Your Flash account is ready!</div>
                <div>
                  If you have questions, read to the FAQs located in the <span className="font-bold">Settings</span> menu or contact us.
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack2" onClick={() => setStep("link")}>
                BACK
              </button>
              <button className="introNext2" onClick={() => setPage("app")}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
      {skipModal && <SkipModal setSkipModal={setSkipModal} setPage={setPage} />}
    </div>
  );
};

export default Intro;
