"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";
import { QRCodeSVG } from "qrcode.react";
import ErrorModal from "./modals/ErrorModal";
import { countryData, activeCountries, merchantType2data } from "@/utils/constants";

const Intro = ({
  paymentSettingsState,
  setPaymentSettingsState,
  cashoutSettingsState,
  setCashoutSettingsState,
  setPage,
  isMobile,
  idToken,
  publicKey,
}: {
  paymentSettingsState: PaymentSettings;
  setPaymentSettingsState: any;
  cashoutSettingsState: CashoutSettings;
  setCashoutSettingsState: any;
  setPage: any;
  isMobile: boolean;
  idToken: string;
  publicKey: string;
}) => {
  const [step, setStep] = useState("welcome");
  const [isSent, setIsSent] = useState(true);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  const [url, setUrl] = useState("");
  const [save, setSave] = useState(false);

  const [qrWidth, setQrWidth] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(20000);
  const [dailyTxn, setDailyTxn] = useState(100);
  const [feePercentage, setFeePercentage] = useState(0.027);
  const [feePerTxn, setFeePerTxn] = useState(0.1);

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

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-full portrait:max-w-[500px] portrait:sm:max-w-none h-full flex justify-center items-center">
        {/*--- welcome ---*/}
        {step == "welcome" && (
          <div className="introFont landscape:w-[350px] landscape:md:w-[540px] portrait:w-[88%] portrait:sm:w-[540px] h-full portrait:sm:h-[90%] flex flex-col items-center">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center justify-center landscape:space-y-6 landscape:md:space-y-24 portrait:space-y-16 portrait:sm:space-y-24">
              <div className="relative w-[300px] h-[90px] landscape:md:h-[120px] portrait:sm:h-[120px] mr-1">
                <Image src="/logo.svg" alt="logo" fill />
              </div>
              <div className="text-3xl landscape:md:text-5xl portrait:sm:text-5xl font-bold text-center">Welcome to Flash!</div>
              <div className="text-center leading-relaxed">
                Here's a quick 1 minute
                <br />
                introduction of how it works
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex items-center justify-end">
              <button className="introNext" onClick={() => setStep("how1")}>
                Next
              </button>
            </div>
          </div>
        )}
        {/*--- how1 ---*/}
        {step == "how1" && (
          <div className="w-full h-full flex portrait:flex-col introFont">
            {/*--- image ---*/}
            <div className="relative landscape:w-[50%] portrait:w-full landscape:h-[100%] portrait:h-[50%]">
              <Image
                src="/intro-scan.png"
                alt="scan"
                fill
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            {/*--- content + buttons---*/}
            <div className="landscape:w-[50%] portrait:w-full portrait:h-[50%] flex justify-center ">
              <div className="w-[88%] sm:w-[92%] h-full flex flex-col items-center">
                {/*--- content, targetHeight ---*/}
                <div className="landscape:h-[80%] portrait:h-[calc(35/50*100%)] flex flex-col justify-center space-y-4 md:space-y-8 overflow-y-auto">
                  <div>
                    Customers pay you by scanning a QR code (you will create one later) with their mobile camera and then entering the amount of{" "}
                    {paymentSettingsState.merchantCurrency} for payment.
                  </div>
                  <div className="relative">
                    <span className="group">
                      <span className="link">USDC tokens</span>
                      <div className="invisible group-hover:visible absolute bottom-[calc(100%+8px)] left-0 px-3 py-2 border border-gray-400 rounded-lg bg-gray-200">
                        1 USDC token equals to 1 USD, as gauranteed by Circle
                      </div>
                    </span>{" "}
                    equal in value to the amount of EUR entered will be sent from the customer's{" "}
                    <span className="group">
                      <span className="link">MetaMask</span>
                      <div className="invisible group-hover:visible absolute bottom-[calc(100%+8px)] left-0 px-3 py-2 border border-gray-400 rounded-lg bg-gray-200">
                        MetaMask is currently the most popular Web3 wallet used by 50+ million people worldwide
                      </div>
                    </span>{" "}
                    to your Flash account (with 0% fees).
                  </div>
                </div>
                {/*--- buttons ---*/}
                <div className="w-full landscape:h-[20%] portrait:h-[calc(15/50*100%)] flex items-center justify-between">
                  <button className="introBack" onClick={() => setStep("welcome")}>
                    Back
                  </button>
                  <button className="introNext" onClick={() => setStep("how2")}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* <div className="w-[88%] h-full flex flex-col items-center">
            <div className="h-[85%] sm:h-[80%] text-xl flex flex-col justify-center">
              <div className="text-2xl leading-[36px]">
                <p className=""></p>
                <p className="mt-4">
                  <span className="font-bold">Flash charges 0% fees.</span> Estimate your savings over credit cards below:
                </p>
              </div>
              <div className="mt-8 p-4 border-2 rounded-2xl text-lg">
                <div className="text-lg leading-tight">
                  <div className="flex items-center">
                    <label className="w-full">Your Avg. Monthly Revenue</label>
                    <span className=" text-2xl">$</span>
                    <input placeholder="20000" className="ml-1 text-2xl px-1 w-[108px] h-[52px] border border-gray-300 rounded-[4px]"></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-full">Your Avg. Daily Transaction Count</label>
                    <input placeholder="100" className="ml-1 text-2xl px-2 w-[108px] h-[52px] border border-gray-300 rounded-[4px]"></input>
                  </div>
                </div>
                <div className="mt-6 text-lg">
                  Based on a credit card fee of 2.7% + $0.10 per transaction, you will save{" "}
                  <span className="font-bold">${(monthlyRevenue * feePercentage + feePerTxn * dailyTxn).toFixed(2)}</span> per month
                </div>
              </div>
            </div>
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("2")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("4")}>
                Next
              </button>
            </div>
          </div> */}
        {/*--- HOW IT WORKS, 2 of 2 ---*/}
        {step == "how2" && (
          <div className="introFont introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center justify-center landscape:space-y-5 landscape:lg:space-y-10 portrait:space-y-12">
              {/* <div className="flex text-base space-x-3">
                <div>Customer</div>
                <div className="relative">
                  &#10230;<div className="absolute w-[50px] text-center text-xs font-bold bottom-[calc(100%-4px)] right-[calc(50%-25px)]">USDC</div>
                </div>
                <div>Flash</div>
                <div className="relative">
                  &#10230;<div className="absolute w-[50px] text-center text-xs font-bold bottom-[calc(100%-4px)] right-[calc(50%-25px)]">USDC</div>
                </div>
                <div>Coinbase</div>
                <div className="relative">
                  &#10230;<div className="absolute w-[50px] text-center text-xs font-bold bottom-[calc(100%-4px)] right-[calc(50%-25px)]">EUR</div>
                </div>
                <div>Bank</div>
              </div> */}
              <div>You can transfer funds from Flash to your bank with near zero fees (~$0.10 per transfer). Funds will appear in ~24 hours.</div>
              <div>
                Behind the scenes, USDC is converted to EUR on a cryptocurrency exchange, such as {cashoutSettingsState.cex.replace(" Exchange", "")}. Flash is designed in such a
                way that you will not lose money from fluctuating exchange rates.
              </div>
              <div>So, to cash out, you will need a Coinbase account. If you don't have one, don't worry about it now.</div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("how1")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("name")}>
                Next
              </button>
            </div>
          </div>
        )}
        {/*--- name ---*/}
        {step == "name" && (
          <div className="introFontLarge introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center justify-center landscape:space-y-8 landscape:md:space-y-16 portrait:space-y-16">
              <div className="">Now, let's create your QR code. It'll only take 15 seconds.</div>
              <div>
                <label>Enter the name of your business:</label>
                <input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value })}
                  onBlur={() => setSave(!save)}
                  value={paymentSettingsState.merchantName}
                  placeholder="type name here"
                  className="mt-4 w-full border-b-2 outline-none placeholder:italic placeholder:font-normal font-bold"
                ></input>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("how2")}>
                Back
              </button>
              <button className={`${paymentSettingsState.merchantName ? "" : "hidden"} introNext`} onClick={() => setStep("currency")}>
                Next
              </button>
            </div>
          </div>
        )}
        {/*--- currency ---*/}
        {step == "currency" && (
          <div className="introFontLarge introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center justify-center space-y-6 landscape:md:space-y-16 portrait:sm:space-y-16">
              <div>Confirm (or select) your currency:</div>
              <select
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const merchantCountryTemp = e.target.value.split(" (")[0];
                  const merchantCurrencyTemp = e.target.value.split(" (")[1].replace(")", "");
                  const cexTemp = countryData[merchantCountryTemp].CEXes[0];
                  setPaymentSettingsState({
                    ...paymentSettingsState,
                    merchantCountry: merchantCountryTemp,
                    merchantCurrency: merchantCurrencyTemp,
                  });
                  setCashoutSettingsState({ cex: cexTemp, cexEvmAddress: "", cexApiKey: "", cexSecretKey: "" }); // need to set blank as cex will change
                  setSave(!save);
                }}
                className="px-2 border-b-2 outline-none font-bold"
              >
                {activeCountries.map((i, index) => (
                  <option key={index} selected={paymentSettingsState.merchantCountry === i.split(" (")[0]}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("name")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("email")}>
                Next
              </button>
            </div>
          </div>
        )}
        {/*--- email ---*/}
        {step == "email" && (
          <div className="introFontLarge introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center justify-center space-y-8 landscape:md:space-y-16 portrait:sm:space-y-16">
              <div>Confirm (or edit) your email:</div>
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantEmail}
                className="introFont sm:introFontLarge w-full max-w-[590px] text-center border-b-2 outline-none font-bold"
              ></input>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("currency")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("emailSent")}>
                Next
              </button>
            </div>
          </div>
        )}
        {/*--- emailSent ---*/}
        {step == "emailSent" && (
          <div className="introFontLarge introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col justify-center space-y-10 portrait:sm:space-y-16 landscape:md:space-y-16">
              <div>Your QR code was successfully created!</div>
              <div>We emailed it to you, along with instructions on how to print and display it</div>
            </div>

            {/* <div id="introQrContainer" className="w-[200px] h-[280px] flex-none relative bg-red-300">
                <Image src="/placard.svg" alt="placard" fill />
                <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[30]">
                  <QRCodeSVG xmlns="http://www.w3.org/2000/svg" size={qrWidth} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
                </div>
              </div> */}
            {/* <div>
                <input
                  defaultValue={paymentSettingsState.merchantEmail}
                  className="introFont w-full h-[54px] border-2 p-2 rounded-md outline-none placeholder:italic font-bold"
                ></input>
                <button className="mt-4 w-full h-[54px] text-white font-medium bg-blue-500 introFont rounded-[4px]">Send Email</button>
              </div> */}

            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("email")}>
                Back
              </button>
              <button className={`${isSent ? "" : "hidden"} introNext`} onClick={() => setStep("link")}>
                Next
              </button>
            </div>
          </div>
        )}
        {/*--- link ---*/}
        {step == "link" && (
          <div className=" landscape:introFont landscape:md:introFontLarge portrait:introFontLarge introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] flex flex-col justify-center sm:h-[80%]">
              <div className="flex flex-col items-center portrait:space-y-5 portrait:sm:space-y-16 landscape:space-y-8 landscape:lg:space-y-12 overflow-y-auto">
                <div className="w-full">To transfer funds to your bank, you must link a cryptocurrency exchange to Flash.</div>
                <div className="w-full">We recommend Coinbase, as they offer low fees and strong security.</div>
                <button className="px-8 py-2 text-white font-medium bg-blue-500 border-2 border-blue-500 introFont rounded-[4px]">Link Your Coinbase Account</button>
                <div className="w-full">Don't have a Coinbase account? Register an account and link it later.</div>
                {/* <button className="mt-4 w-full h-[54px] text-gray-500 font-medium bg-white border-2 border-gray-500 introFont rounded-[4px]">Create Coinbase Account</button> */}
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("emailSent")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                Next
              </button>
            </div>
          </div>
        )}
        {step == "final" && (
          <div className="introFontLarge introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col justify-center space-y-10 portrait:sm:space-y-16 landscape:md:space-y-16">
              <p>Your Flash account is ready!</p>
              <div>If you have questions, read to the FAQs under Settings or contact us.</div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("link")}>
                Back
              </button>
              <button className="introNext" onClick={() => setPage("app")}>
                App
              </button>
            </div>
          </div>
        )}
      </div>
      {errorModal && <ErrorModal errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </div>
  );
};

export default Intro;
