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
// constants
import { countryData, countryCurrencyList, currency2number, merchantType2data } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faCircleCheck, faPlus, faMinus, faX } from "@fortawesome/free-solid-svg-icons";
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
  const [expand, setExpand] = useState(false);

  // hooks
  const router = useRouter();

  useEffect(() => {
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
    <div className="w-full flex justify-center overflow-y-auto">
      <div className="w-[88%] min-h-screen flex justify-center">
        {/*--- welcome ---*/}
        {step == "welcome" && (
          <div className="w-full flex flex-col items-center">
            {/*--- text ---*/}
            <div className="flex-1 w-full flex flex-col items-center justify-center portrait:space-y-12 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-16">
              <div className="relative w-[300px] h-[90px] landscape:lg:h-[120px] portrait:sm:h-[120px] landscape:lg:desktop:h-[100px] mr-1">
                <Image src="/logo.svg" alt="logo" fill />
              </div>
              <div className="">
                <div className="text2xl font-medium text-center animate-fadeInAnimation">Welcome to Flash!</div>
                <div className="mt-3 introFontHowTo leading-relaxed text-center animate-fadeInAnimation">
                  Here's a quick tutorial
                  <br />
                  of how Flash works
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full portrait:h-[100px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-end">
              <button className="introNext2" onClick={() => setStep("how1")}>
                START &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- how1 ---*/}
        {step == "how1" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[7%]"></div>
            <div className="text-center textLg font-bold">Get Your Store Ready to Accept Cryptocurrency Payments</div>
            <div className="h-[4%]"></div>
            {/*--- image ---*/}
            <div className="relative w-full h-[40%]">
              <Image src="/intro-step1.png" alt="scan" fill style={{ objectFit: "contain" }} />
            </div>
            <div className="h-[4%]"></div>
            {/*--- text ---*/}
            <div className="px-3 flex-1 text-xl text-center">
              <span className="font-bold">Step 1.</span> Print out your unique QR code and put it where your customers can see it.
            </div>
            {/*--- buttons ---*/}
            <div className="w-full portrait:h-[100px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-between">
              <button className="introBack2" onClick={() => setStep("welcome")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext2" onClick={() => setStep("how2")}>
                NEXT &nbsp;&#10095;
              </button>
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
                NEXT
              </button>
            </div>
          </div> */}

        {/*--- how2 ---*/}
        {step == "how2" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[7%]"></div>
            <div className="text-center textLg font-bold">Get Your Store Ready to Accept Cryptocurrency Payments</div>
            <div className="h-[4%]"></div>
            {/*--- image ---*/}
            <div className="relative w-full h-[40%]">
              <Image src="/intro-step2.png" alt="scan" fill style={{ objectFit: "contain" }} />
            </div>
            <div className="h-[4%]"></div>
            {/*--- text ---*/}
            <div className="px-3 flex-1 text-xl text-center">
              <span className="font-bold">Step 2.</span> Customer scans your QR code using their phone and pays you in USDC cryptocurrency, which will have the same value as Euros.
              You’ll receive payment in your Flash account instantly.
            </div>
            {/*--- buttons ---*/}
            <div className="w-full portrait:h-[100px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-between">
              <button className="introBack2" onClick={() => setStep("how1")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext2" onClick={() => setStep("how3")}>
                NEXT &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- how3 ---*/}
        {step == "how3" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[7%]"></div>
            <div className="text-center textLg font-bold">Get Your Store Ready to Accept Cryptocurrency Payments</div>
            <div className="h-[4%]"></div>
            {/*--- image ---*/}
            <div className="flex flex-col items-center justify-center pb-12 space-y-5 w-full h-[40%] flex-none">
              <div className="font-bold text-4xl">
                10.00 <span className="text-xl">USDC</span>
              </div>
              <FontAwesomeIcon icon={faArrowDown} className="text-4xl" />
              <div className="border border-black rounded-md px-6 py-3 text-4xl font-bold">€10.05</div>
            </div>
            <div className="h-[4%]"></div>
            {/*--- text ---*/}
            <div className="px-3 text-center flex-1 text-xl">
              <div>
                <span className="font-bold">Step 3.</span> To turn your USDC into Euros and send it to your bank, just link your Coinbase account. It'll automatically convert the
                USDC to Euros for you when you cash out.
                <div className="hidden mt-4 font-bold text-lg text-center">Payment Completed!</div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full portrait:h-[100px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-between">
              <button className="introBack2" onClick={() => setStep("how2")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext2" onClick={() => setStep("name")}>
                NEXT &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- name/currency ---*/}
        {step == "name" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[12%]">
              <div onClick={() => setPage("app")} className="absolute top-3 right-5 text-3xl p-2">
                &#10005;
              </div>
            </div>
            <div className="text-center textLg font-bold">Create Your Unique QR Code</div>
            <div className="h-[6%]"></div>

            {/*--- text ---*/}
            <div className="flex flex-col space-y-10 flex-1">
              <div>
                <label className="w-full text-lg font-medium">Enter the name of your business</label>
                <input
                  className="mt-1 w-full text-lg border border-gray-400 px-3 py-3 outline-none focus:border-blue-500 transition-colors duration-500 rounded-sm placeholder:italic"
                  placeholder="Type in your business name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantName: e.currentTarget.value })}
                  onBlur={() => setSave(!save)}
                  value={paymentSettingsState.merchantName}
                ></input>
              </div>
              <div>
                <label className="w-full text-lg font-medium">Select your country / currency</label>
                <select
                  onChange={(e) => {
                    const merchantCountryTemp = e.target.value.split(" / ")[0];
                    const merchantCurrencyTemp = e.target.value.split(" / ")[1];
                    const cexTemp = merchantCountryTemp == "Any country" ? "" : countryData[merchantCountryTemp].CEXes[0];
                    setPaymentSettingsState({
                      ...paymentSettingsState,
                      merchantCountry: merchantCountryTemp,
                      merchantCurrency: merchantCurrencyTemp,
                    });
                    setCashoutSettingsState({ cex: cexTemp, cexEvmAddress: "" }); // need to set blank as cex will change
                    setSave(!save);
                  }}
                  value={paymentSettingsState.merchantCountry + " / " + paymentSettingsState.merchantCurrency}
                  className="mt-1 w-full text-lg border border-gray-400 px-3 py-3 outline-none focus:border-blue-500 transition-colors duration-500 rounded-sm placeholder:italic bg-white"
                >
                  {countryCurrencyList.map((i, index) => (
                    <option key={index}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full portrait:h-[100px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-between">
              <button className="introBack2" onClick={() => setStep("how3")}>
                &#10094;&nbsp; BACK
              </button>
              <button className="introNext2" onClick={() => setStep("email")}>
                NEXT &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- email ---*/}
        {step == "email" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[12%]">
              <div onClick={() => setPage("app")} className="absolute top-3 right-5 text-3xl p-2">
                &#10005;
              </div>
            </div>
            <div className="text-center textLg font-bold">QR Code Created!</div>
            <div className="h-[6%]"></div>
            {/*--- qr code ---*/}
            <div className="w-full flex justify-center">
              <QRCodeSVG xmlns="http://www.w3.org/2000/svg" size={170} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState?.qrCodeUrl ?? ""} />
            </div>
            {/*--- text + email ---*/}
            <div className="flex-1 flex flex-col justify-center space-y-12">
              <div className="text-center text-xl">Send the QR code to yourself and follow the instructions in the email to print and display it at your store. </div>
              {/*--- email ---*/}
              <div>
                <label className="w-full text-lg font-medium">Confirm or edit your email address</label>
                <input
                  className="mt-1 w-full text-lg border border-gray-400 px-3 py-3 outline-none focus:border-blue-500 transition-colors duration-500 rounded-sm placeholder:italic"
                  placeholder="Type in your email"
                  value={paymentSettingsState.merchantEmail}
                ></input>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full portrait:h-[100px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-between">
              <button className="w-full h-[60px] bg-blue-500 text-white font-medium rounded-[4px]" onClick={sendEmail}>
                SEND
              </button>
            </div>
          </div>
        )}

        {/*--- emailSent ---*/}
        {step == "emailSent" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[12%]">
              <div onClick={() => setPage("app")} className="absolute top-3 right-5 text-lg font-medium p-2">
                SKIP
              </div>
            </div>
            <FontAwesomeIcon icon={faCircleCheck} className="text-6xl text-green-500" />
            <div className="mt-6 w-full flex justify-center text-3xl font-medium">Email Sent!</div>
            {/*--- text ---*/}
            <div className="mt-10 flex-1 flex flex-col space-y-10">
              <div className="text-center text-xl">Check your inbox for your unique QR code and printing instructions.</div>
              <div className="text-center text-xl">Next, let's set up your Coinbase account</div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full portrait:h-[100px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-end">
              <button className="introNext2" onClick={() => setStep("link")}>
                NEXT &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- link (if coinbase && not "Any country") ---*/}
        {step == "link" && paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[12%]">
              <div onClick={() => setPage("app")} className="absolute top-3 right-5 text-lg font-medium p-2">
                SKIP
              </div>
            </div>
            <div className="text-center textLg font-bold">Link Your Coinbase Account</div>
            <div className="h-[6%]"></div>
            {/*--- text ---*/}
            <div className="text-center text-xl px-3">
              To transfer funds to your bank, connect a cryptocurrency exchange like Coinbase to Flash. We recommend Coinbase for its low fees and robust security.
            </div>
            <div className="h-[6%]"></div>
            {/*--- buttons ---*/}
            <div className="w-full flex flex-col space-y-6 text-lg">
              <button className="w-full h-[60px] bg-blue-500 border-2 border-blue-500 text-white font-medium rounded-[4px]" onClick={onClickSIWC}>
                Link Coinbase Account
              </button>
              <button className="w-full h-[60px] bg-white border-2 border-gray-500 text-gray-500 font-medium rounded-[4px]" onClick={() => setStep("nocoinbase")}>
                I don't have one
              </button>
            </div>
          </div>
        )}

        {step == "nocoinbase" && paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" && (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full h-[12%]">
              <div onClick={() => setPage("app")} className="absolute top-3 right-5 text-lg font-medium p-2">
                SKIP
              </div>
            </div>
            <div className="text-center textLg font-bold">Link Your Coinbase Account</div>
            <div className="h-[6%]"></div>
            {/*--- text ---*/}
            <div className="text-center text-xl px-3">
              To transfer funds to your bank, connect a cryptocurrency exchange like Coinbase to Flash. We recommend Coinbase for its low fees and robust security.
            </div>
            <div className="h-[6%]"></div>
            {/*--- buttons ---*/}
            <div className="w-full flex flex-col space-y-6 text-lg">
              <a href="https://www.coinbase.com/signup" target="_blank">
                <button className="w-full h-[60px] bg-blue-500 border-2 border-blue-500 text-white font-medium rounded-[4px]">Create Account</button>
              </a>
              <div className="flex space-x-3 bg-gray-200 p-4 text-base cursor-pointer rounded-[4px]" onClick={() => setExpand(!expand)}>
                <FontAwesomeIcon icon={expand ? faMinus : faPlus} className="pt-1" />
                <div className="">
                  <div className="">Can I use a different cryptocurrency exchange?</div>
                  <div className={`${expand ? "max-h-[300px]" : "max-h-0"} overflow-hidden`}>
                    <div className="py-2">
                      Flash only supports Coinbase to cash out to your bank. If you prefer another exchange, you won't be able to use this feature and must cash out yourself using
                      your preferred cryptocurrency exchange.
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
    </div>
  );
};

export default Intro;
