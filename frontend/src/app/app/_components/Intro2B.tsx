"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// other
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react";
import { renderToStream, pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
// components
import Flow from "./Flow";
import Flow2 from "./Flow2";
import Flow3 from "./Flow3";
import IntroErrorModal from "./modals/IntroErrorModal";
import SkipModal from "./modals/SkipModal";
import Placard from "./placard/Placard";

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
  const [introErrorModal, setIntroErrorModal] = useState(false);
  const [skipModal, setSkipModal] = useState(false);

  // hooks
  const router = useRouter();

  const saveSettings = async () => {};

  const sendEmail = async () => {
    // check if form completed
    if (!paymentSettingsState.merchantName) {
      setIntroErrorModal(true);
      setErrorMsg("Please enter the name of your business");
      return;
    }
    if (!paymentSettingsState.merchantEmail) {
      setIntroErrorModal(true);
      setErrorMsg("Please enter an email address");
      return;
    }

    // show next step
    setStep("emailSent");

    // save settings
    try {
      const res = await fetch("/api/saveSettings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentSettings: paymentSettingsState, cashoutSettings: cashoutSettingsState, idToken, publicKey }),
      });
      const data = await res.json();

      if (data == "saved") {
        console.log("settings saved");
      } else {
        setErrorMsg("Internal server error. Data was not saved.");
        setIntroErrorModal(true);
        return;
      }
    } catch (e) {
      setErrorMsg("Server request error. Data was not saved.");
      setIntroErrorModal(true);
      return;
    }

    // create PDF file string
    const el = document.getElementById("introQrCode");
    const dataString = await pdf(
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
    ).toString();

    // create the formData
    const formData = new FormData();
    formData.append("merchantEmail", paymentSettingsState.merchantEmail);
    formData.append("dataString", dataString);

    // send datat to api endpoint
    const res = await fetch("/api/emailQrCode", {
      method: "POST",
      body: formData,
    });

    // api response
    const response = await res.json();
    console.log(response);
    if (response == "email sent") {
      console.log("email sent");
    } else {
      console.log("email did not send");
    }
  };

  const onClickSIWC = async () => {
    // usability test
    if (isUsabilityTest) {
      setPage("loading");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCoinbaseIntroModal(true);
      setPage("app");
      return;
    }

    const cbRandomSecure = uuidv4() + "SUBSTATEfromIntro";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:buys:create,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read`
    );
  };

  return (
    <div className="text-xl w-full h-screen flex justify-center overflow-y-auto bg-light2 text-black">
      <div className="w-[85%] min-w-[354px] max-w-[420px] desktop:max-w-[450px] h-screen min-h-[650px] my-auto max-h-[800px]">
        <div className="hidden">
          <QRCodeSVG id="introQrCode" xmlns="http://www.w3.org/2000/svg" size={210} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
        </div>

        {/*--- welcome ---*/}
        {step == "welcome" && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="pb-16 w-full flex flex-col items-center portrait:space-y-12 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-16">
              <div className="relative w-[300px] h-[100px] landscape:lg:h-[100px] portrait:sm:h-[100px] landscape:lg:desktop:h-[100px] mr-1">
                <Image src="/logo.svg" alt="logo" fill />
              </div>
              <div className="pb-4 text-center animate-fadeInAnimation leading-relaxed font-medium">
                Set up crypto payments
                <br />
                with 0% fees now
              </div>
              {/*--- buttons ---*/}
              <button className="buttonStart" onClick={() => setStep("info")}>
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
              <div className="">To start accepting crypto payments, create your QR code with the information below:</div>
              <div className="flex flex-col">
                <label className="w-full introLabelFont">Your business's name</label>
                <input
                  className="introInputFont"
                  placeholder="Enter the name of your business"
                  onChange={(e) =>
                    setPaymentSettingsState({
                      ...paymentSettingsState,
                      merchantName: e.currentTarget.value,
                      qrCodeUrl: `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=${paymentSettingsState.merchantPaymentType}&merchantName=${e.currentTarget.value}&merchantCurrency=${paymentSettingsState.merchantCurrency}&merchantEvmAddress=${paymentSettingsState.merchantEvmAddress}`,
                    })
                  }
                  value={paymentSettingsState.merchantName}
                ></input>
              </div>
              <div className="flex flex-col">
                <label className="w-full introLabelFont">Your country / currency</label>
                <select
                  className="introInputFont"
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const merchantCountryTemp = e.target.value.split(" / ")[0];
                    const merchantCurrencyTemp = e.target.value.split(" / ")[1];
                    const cexTemp = merchantCountryTemp == "Any country" ? "" : countryData[merchantCountryTemp].CEXes[0];
                    setPaymentSettingsState({
                      ...paymentSettingsState,
                      merchantCountry: merchantCountryTemp,
                      merchantCurrency: merchantCurrencyTemp,
                      qrCodeUrl: `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=${paymentSettingsState.merchantPaymentType}&merchantName=${paymentSettingsState.merchantName}&merchantCurrency=${merchantCurrencyTemp}&merchantEvmAddress=${paymentSettingsState.merchantEvmAddress}`,
                    });
                    setCashoutSettingsState({ cex: cexTemp, cexEvmAddress: "" }); // need to set blank as cex will change
                    e.target.closest("select")?.blur();
                  }}
                  value={`${paymentSettingsState.merchantCountry} / ${paymentSettingsState.merchantCurrency}`}
                >
                  {countryCurrencyList.map((i, index) => (
                    <option key={index}>{i}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="w-full introLabelFont">Your email address</label>
                <input
                  className="introInputFont"
                  placeholder="Type in your email"
                  onChange={(e) =>
                    setPaymentSettingsState({
                      ...paymentSettingsState,
                      merchantEmail: e.currentTarget.value,
                    })
                  }
                  value={paymentSettingsState.merchantEmail}
                ></input>
                <div className="mt-0.5 textBase italic">Your QR code will be sent to this email</div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack" onClick={() => setStep("welcome")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext" onClick={sendEmail}>
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
              <div className="">We emailed you the QR code, along with instructions on how to print and display it.</div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack" onClick={() => setStep("info")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext" onClick={() => setStep("how")}>
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
                    Customer scans your QR code, which will open their{" "}
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
                      <div className="bottom-[calc(100%+8px)] left-0 introTooltip">1 USDC token equals to 1 USD, as gauranteed by Circle. Almost all crypto users have USDC.</div>
                    </span>{" "}
                    ({paymentSettingsState?.merchantCurrency == "USD" ? "" : "with a value "}equal to the amount of {paymentSettingsState?.merchantCurrency} entered) will be sent
                    from their MetaMask to your Flash app
                  </div>
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack" onClick={() => setStep("emailSent")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext" onClick={() => setStep("link")}>
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
                    <span className="group">
                      <span className="link">
                        Coinbase<sup>?</sup>
                      </span>
                      <div className="w-full left-0 introTooltip">
                        Coinbase is a platform where USDC can be exchanged for {paymentSettingsState.merchantCurrency} and where you can link a bank account.
                      </div>
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
                <button className="buttonPrimary dark:bg-black border-none landscape:xl:desktop:hover:bg-dark5" onClick={onClickSIWC}>
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
              <div onClick={() => setPage("app")} className="text-lg font-medium cursor-pointer px-3 py-2 desktop:hover:bg-gray-200 active:bg-gray-200 rounded-[4px]">
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
                className="buttonBlack"
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
              <div className="w-full flex space-x-3 bg-gray-200 p-4 text-base cursor-pointer rounded-[4px]" onClick={() => setExpand(!expand)}>
                <FontAwesomeIcon icon={expand ? faMinus : faPlus} className="pt-1" />
                <div className="">
                  <div className="">Can I use a different cryptocurrency exchange?</div>
                  <div className={`${expand ? "max-h-[300px]" : "max-h-0"} overflow-hidden`}>
                    <div className="py-2">
                      To cash out from the Flash app, you must use Coinbase. If you prefer another exchange, you can transfer USDC tokens from Flash to any EVM address, including
                      the one associated with your preferred platform. Then, log into that platform and cash out yourself.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*--- link (if not coinbase or if "Any country") ---*/}
        {step == "link" && (paymentSettingsState.merchantCountry == "Any country" || cashoutSettingsState.cex != "Coinbase") && (
          <div className="introPageContainer">
            {/*--- spacer ---*/}
            <div className="w-full h-[7%] min-h-[72px]"></div>
            {/*--- content ---*/}
            <div className="px-1 flex-1 space-y-6 portrait:sm:space-y-8 landscape:lg:space-y-8 landscape:xl:desktop:space-y-8">
              <div className="w-full portrait:space-y-6 landscape:space-y-3 landscape:lg:space-y-6">
                <div>
                  <div>Enter the USDC (Polygon) deposit address of your cryptocurrency exchange account:</div>
                  <input
                    onChange={(e) => setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value })}
                    onBlur={() => setSave(!save)}
                    value={cashoutSettingsState.cexEvmAddress}
                    className="mt-2 w-full introInputFontSmall text-[13px] px-1 placeholder:text-lg placeholder:pl-2 placeholder:focus:text-transparent"
                    placeholder="Paste address here"
                  ></input>
                </div>
              </div>
              <div className="">The address is used to allow easy transfer of USDC from Flash to your cryptocurrency exchange.</div>
              <div className="">
                If you don't have one, you can skip this step. Register an account on {`${cashoutSettingsState.cex} Exchange` || "a cryptocurrency exchange"} and enter the address
                in the "Settings" section of the Flash app at a later time.
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack" onClick={() => setStep("how")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {cashoutSettingsState.cexEvmAddress ? "NEXT " : "SKIP "}&nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {step == "final" && (
          <div className="introPageContainer">
            {/*--- spacer ---*/}
            <div className="w-full h-[7%] min-h-[72px]"></div>
            {/*--- content ---*/}
            <div className="px-1 flex-1 space-y-6 portrait:sm:space-y-8 landscape:lg:space-y-8 landscape:xl:desktop:space-y-8">
              <div className="w-full">Your Flash account is ready!</div>
              <div>
                If you have questions, read to the FAQs located in the <span className="font-bold">Settings</span> menu or contact us.
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer2">
              <button className="introBack" onClick={() => setStep("link")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext" onClick={() => setPage("app")}>
                FINISH
              </button>
            </div>
          </div>
        )}
      </div>
      {introErrorModal && <IntroErrorModal errorMsg={errorMsg} setIntroErrorModal={setIntroErrorModal} />}
      {skipModal && <SkipModal setSkipModal={setSkipModal} setPage={setPage} />}
    </div>
  );
};

export default Intro;
