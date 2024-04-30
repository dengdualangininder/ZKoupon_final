"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// other
import { v4 as uuidv4 } from "uuid";
// components
import Flow from "./Flow";
import Flow2 from "./Flow2";
import ErrorModal from "./modals/ErrorModal";
// constants
import { countryData, countryCurrencyList, merchantType2data } from "@/utils/constants";
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
    // saveSettings();
  }, [save]);

  const onClickSIWC = async () => {
    const cbRandomSecure = uuidv4() + "SUBSTATEfromIntro";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`);
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=wallet:accounts:read,wallet:addresses:read,wallet:buys:create,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read`
    );
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F6F9FC]">
      <div className="w-full portrait:max-w-[500px] portrait:sm:max-w-none h-full flex justify-center items-center">
        {/*--- welcome ---*/}
        {step == "welcome" && (
          <div className="introFontXl portrait:w-[88%] landscape:w-[350px] portrait:sm:w-[540px] landscape:lg:w-[540px] h-full portrait:sm:h-[90%] flex flex-col items-center">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center justify-center landscape:space-y-6 landscape:lg:space-y-24 portrait:space-y-16 portrait:sm:space-y-24">
              <div className="relative w-[300px] h-[90px] landscape:lg:h-[120px] portrait:sm:h-[120px] mr-1">
                <Image src="/logo.svg" alt="logo" fill />
              </div>
              <div className="text-3xl landscape:lg:text-5xl portrait:sm:text-5xl font-bold text-center animate-fadeInAnimation">Welcome to Flash!</div>
              <div className="text-center leading-relaxed animate-fadeInAnimation">
                Let us give you a quick
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
          <div className="w-full h-full flex portrait:flex-col">
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
            <div className="landscape:w-[50%] portrait:w-full portrait:h-[50%] introFontXl flex justify-center">
              <div className="w-[88%] sm:w-[92%] h-full flex flex-col items-center">
                {/*--- content, targetHeight ---*/}
                <div className="mt-4 md:mt-8 landscape:h-[80%] portrait:h-[calc(35/50*100%)] flex flex-col space-y-4 md:space-y-8 overflow-y-auto">
                  <div className="relative">
                    First, you print out and display a QR code. To pay, the customer scans your QR code, which will open their{" "}
                    <span className="group">
                      <span className="link">MetaMask App</span>
                      <div className="w-full top-[calc(100%-32px)] left-0 tooltipIntro">MetaMask is used by 50+ million crypto users worldwide to send and receive tokens.</div>
                    </span>
                    . The customer will then enter the amount of {paymentSettingsState?.merchantCurrency} for payment.
                  </div>
                  <div className="relative">
                    <span className="group">
                      <span className="link">USDC tokens</span>
                      <div className="bottom-[calc(100%+8px)] left-0 tooltipIntro">
                        USDC is a secure stablecoin used by almost every crypto user. 1 USDC token equals to 1 USD, as gauranteed by Circle.
                      </div>
                    </span>{" "}
                    equal {paymentSettingsState?.merchantCurrency == "USD" ? "" : "in value"} to the amount of {paymentSettingsState?.merchantCurrency} entered will be be sent to
                    your Flash account.
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
        {/*--- how2 ---*/}
        {step == "how2" && (
          <div className="introPageContainer">
            <Flow paymentSettingsState={paymentSettingsState} cashoutSettingsState={cashoutSettingsState} />
            {/*--- TEXT ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center text-xl portrait:sm:text-2xl landscape:lg:text-2xl portrait:lg:text-3xl landscape:xl:text-3xl portrait:sm:leading-relaxed landscape:lg:leading-relaxed portrait:lg:leading-relaxed landscape:xl:leading-relaxed">
              {paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" && (
                <div>
                  {paymentSettingsState.merchantCurrency == "USD" && (
                    <div className="space-y-3">
                      <div>To cash out to your bank, you will need a Coinbase account in order to convert USDC to USD (at 1:1 rate with no fees).</div>
                      <div>You can link your Coinbase account to the Flash App, and conveniently transfer all customer payments to your bank with just a few clicks.</div>
                      <div>
                        There is a ~0.10 USDC fee when you transfer USDC to Coinbase. Flash does not charge any other fee over the entire payment flow (from the customer to your
                        bank).
                      </div>
                    </div>
                  )}
                  {paymentSettingsState.merchantCurrency != "USD" && (
                    <div className="space-y-3">
                      <div>
                        To cash out to your bank, you will need to convert USDC to {paymentSettingsState.merchantCurrency}. To do this, we recommend getting a Coinbase account.
                      </div>
                      <div>In the Flash App, you can link your Coinbase account and cash out to your bank in just a few clicks.</div>
                      <div>Flash is designed in such a way that you will not lose money from fluctuating exchange rates.</div>
                      <div>Flash charges zero fees over the entire payments flow. We do not make profit by giving suboptimal exchange rates.</div>
                    </div>
                  )}
                </div>
              )}
              {paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex != "Coinbase" && (
                <div className="space-y-3">
                  <div>
                    To cash out to your bank, you will need to convert USDC to {paymentSettingsState.merchantCurrency}. You can easily do this on {cashoutSettingsState.cex}{" "}
                    Exchange.
                  </div>
                  <div>In you don't have a {cashoutSettingsState.cex} account, don't worry about it for now.</div>
                  <div>Flash is designed in such a way that you will not lose money from fluctuating exchange rates.</div>
                  <div>Flash charges zero fees over the entire payments flow. No profits are made from exchange rates, so you are always gauranteed market rates.</div>
                </div>
              )}
              {paymentSettingsState.merchantCountry == "Any country" && (
                <div className="space-y-3">
                  <div>
                    To cash out to your bank, you will need to convert USDC to fiat on a cryptocurrency exchange. Ensure that you are allowed to withdraw fiat from the exchange you
                    sign up for.
                  </div>
                  <div>In the Flash App, you can transfer USDC tokens (fee of ~0.10 USDC) to your cryptocurrency exchange with a few easy clicks.</div>
                  <div>Flash charges no other fees over the entire payments flow. We do not make profit by giving suboptimal exchange rates.</div>
                </div>
              )}
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
          <div className="introFont3xl introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col items-center justify-center landscape:space-y-8 landscape:lg:space-y-16 portrait:space-y-16">
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
              <button className={`${paymentSettingsState.merchantName ? "" : "hidden"} introNext animate-fadeInAnimation`} onClick={() => setStep("currency")}>
                Next
              </button>
            </div>
          </div>
        )}
        {/*--- currency ---*/}
        {step == "currency" && (
          <div className="introFont3xl introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col justify-center space-y-6 landscape:lg:space-y-16 portrait:sm:space-y-16">
              <div>Confirm (or select) your country / currency:</div>
              <div>
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
                  className="px-2 border-b-2 outline-none font-bold bg-white"
                >
                  {countryCurrencyList.map((i, index) => (
                    <option key={index}>{i}</option>
                  ))}
                </select>
              </div>
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
          <div className="introFont3xl introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col justify-center space-y-8 landscape:lg:space-y-16 portrait:sm:space-y-16">
              <div>Confirm (or edit) your email:</div>
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettingsState({ ...paymentSettingsState, merchantEmail: e.currentTarget.value })}
                onBlur={() => setSave(!save)}
                value={paymentSettingsState.merchantEmail}
                className="introFontXl sm:introFont3xl w-full border-b-2 outline-none font-bold"
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
          <div className="introFont3xl introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col justify-center space-y-10 portrait:sm:space-y-16 landscape:lg:space-y-16">
              <div>Your QR code was successfully created!</div>
              <div>We emailed it to you, along with instructions on how to print and display it.</div>
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
                  className="introFontXl w-full h-[54px] border-2 p-2 rounded-md outline-none placeholder:italic font-bold"
                ></input>
                <button className="mt-4 w-full h-[54px] text-white font-medium bg-blue-500 introFontXl rounded-[4px]">Send Email</button>
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
        {/*--- link (if coinbase && not "Any country") ---*/}
        {step == "link" && paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" && (
          <div className="portrait:introFont3xl landscape:introFontXl landscape:lg:introFont3xl introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col justify-center overflow-y-auto">
              <div className="flex flex-col items-center space-y-8 portrait:sm:space-y-16 landscape:lg:space-y-12">
                <div className="">
                  To transfer funds to your bank, you must link a cryptocurrency exchange to Flash. We recommend Coinbase, as they offer low fees and strong security.
                </div>
                <button onClick={onClickSIWC} className="introFontXl px-8 py-3 text-white font-medium bg-blue-500 border-2 border-blue-500 rounded-full">
                  Link Your Coinbase
                </button>
                <div className="pt-3 w-full textXl leading-relaxed">
                  Don't have a Coinbase account? Skip this step and sign up for one later. You can link it in the Flash App at any time.
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("emailSent")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                Skip
              </button>
            </div>
          </div>
        )}
        {/*--- link (if not coinbase or if "Any country") ---*/}
        {step == "link" && (paymentSettingsState.merchantCountry == "Any country" || cashoutSettingsState.cex != "Coinbase") && (
          <div className="portrait:introFont2xl landscape:introFontXl landscape:lg:introFont2xl portrait:lg:introFont3xl introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] flex flex-col justify-center sm:h-[80%]">
              <div className="flex flex-col items-center portrait:space-y-5 portrait:sm:space-y-16 landscape:space-y-8 landscape:lg:space-y-12 overflow-y-auto">
                <div className="w-full space-y-6">
                  <div>Enter the USDC (Polygon) deposit address of your cryptocurrency exchange account:</div>
                  <input
                    onChange={(e) => setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value })}
                    onBlur={() => setSave(!save)}
                    value={cashoutSettingsState.cexEvmAddress}
                    className="w-full portrait:text-[13px] landscape:text-lg portrait:sm:text-xl landscape:lg:text-xl portrait:lg:text-2xl landscape:xl:text-2xl border-b-2 outline-none placeholder:text-lg md:placeholder:text-2xl lg:placeholder:text-3xl xs:font-medium"
                    placeholder="Enter address here"
                  ></input>
                </div>
                <div className="pt-3 w-full leading-relaxed">If you don't have one now, you can skip this step and add it later.</div>
                <div className="pt-3 w-full leading-relaxed">The address is used to allow easy transfer of USDC from Flash to your cryptocurrency exchange.</div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="w-full h-[15%] sm:h-[20%] flex justify-between items-center">
              <button className="introBack" onClick={() => setStep("emailSent")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                Skip
              </button>
            </div>
          </div>
        )}
        {step == "final" && (
          <div className="introFont3xl introPageContainer">
            {/*--- content ---*/}
            <div className="w-full h-[85%] sm:h-[80%] flex flex-col justify-center space-y-10 portrait:sm:space-y-16 landscape:lg:space-y-16">
              <p>Your Flash account is ready!</p>
              <div>
                If you have questions, read to the FAQs located in the <span className="font-bold">Settings</span> menu or contact us.
              </div>
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
