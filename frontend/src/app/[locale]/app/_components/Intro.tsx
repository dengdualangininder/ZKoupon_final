"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/navigation";
// other
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { renderToStream, pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
// components
import FlashToBankAnimation from "./FlashToBankAnimation";
import ErrorModalLight from "./modals/ErrorModalLight";
import Placard from "./placard/Placard";

// constants
import { countryData, countryCurrencyList, cexToLinks, merchantType2data, cexToName } from "@/utils/constants";
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
  setCbIntroModal,
  isUsabilityTest,
  setCashbackModal,
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
  setCbIntroModal: any;
  isUsabilityTest: boolean;
  setCashbackModal: any;
}) => {
  const [step, setStep] = useState("welcome");
  const [url, setUrl] = useState("");
  const [save, setSave] = useState(false);
  const [expand, setExpand] = useState(false);
  // modal states
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [errorModal, setErrorModal] = useState(false);
  const [isIOS, setIsIOS] = useState(true);

  // hooks
  const router = useRouter();
  const t = useTranslations("App.Intro");
  const tcommon = useTranslations("Common");

  useEffect(() => {
    const isIOSTemp = /iPad|iPhone|iPod|MacIntel/.test(navigator.platform);
    console.log("platform:", navigator.platform);
    console.log("isIOS:", isIOSTemp);
    setIsIOS(isIOSTemp);
  }, []);

  const sendEmail = async () => {
    // check if form completed
    if (!paymentSettingsState.merchantName) {
      setErrorMsg(t("errors.enterName"));
      setErrorModal(true);
      return;
    }
    if (!paymentSettingsState.merchantEmail) {
      setErrorMsg(t("errors.enterEmail"));
      setErrorModal(true);
      return;
    }

    // check valid email
    if (!paymentSettingsState.merchantEmail.split("@")[1]?.includes(".")) {
      setErrorMsg(t("errors.validEmail"));
      setErrorModal(true);
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
        setErrorModal(true);
        return;
      }
    } catch (e) {
      setErrorMsg("Server request error. Data was not saved.");
      setErrorModal(true);
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

    // make api call
    const res = await fetch("/api/emailQrCode", {
      method: "POST",
      body: JSON.stringify({ merchantEmail: paymentSettingsState.merchantEmail, dataString }),
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
      setCbIntroModal(true);
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
    <div className="text-lg w-full h-screen flex justify-center overflow-y-auto bg-light2 text-black">
      <div className="w-[85%] min-w-[354px] max-w-[420px] desktop:max-w-[420px] h-screen my-auto max-h-[850px]">
        <div className="hidden">
          <QRCodeSVG id="introQrCode" xmlns="http://www.w3.org/2000/svg" size={210} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
        </div>

        {/*--- welcome ---*/}
        {step == "welcome" && (
          <div className="text-xl w-full h-full flex flex-col items-center justify-center">
            <div className="pb-16 w-full flex flex-col items-center portrait:space-y-12 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-16">
              <div className="relative w-[300px] h-[100px] landscape:lg:h-[100px] portrait:sm:h-[100px] landscape:lg:desktop:h-[100px] mr-1">
                <Image src="/logo.svg" alt="logo" fill />
              </div>
              <div className="pb-4 text-center animate-fadeInAnimation leading-relaxed font-medium">
                {t("welcome.text-1")}
                <br />
                {t("welcome.text-2")}
              </div>
              {/*--- buttons ---*/}
              <button className="buttonStart" onClick={() => setStep("info")}>
                {t("welcome.start")}
              </button>
            </div>
          </div>
        )}

        {/*--- info ---*/}
        {step == "info" && (
          <div className="text-xl h-full flex flex-col">
            {/*--- spacer ---*/}
            <div className="h-[8%] landscape:xl:desktop:h-[12%] min-h-[40px]"></div>
            {/*--- content ---*/}
            <div className="px-1 flex-1 space-y-[24px] portrait:sm:space-y-[32px] landscape:lg:space-y-[32px] landscape:xl:desktop:space-y-[32px]">
              <div className="">{t("info.text-1")}:</div>
              <div className="flex flex-col">
                <label className="w-full introLabelFont">{t("info.label-1")}</label>
                <input
                  className="introInputFont"
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
                <label className="w-full introLabelFont">{t("info.label-2")}</label>
                <select
                  className="introInputFont"
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const merchantCountryTemp = e.target.value.split(" / ")[0];
                    const merchantCurrencyTemp = e.target.value.split(" / ")[1];
                    const cexTemp = merchantCountryTemp == "Other" ? "" : countryData[merchantCountryTemp].CEXes[0];
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
                <label className="w-full introLabelFont">{t("info.label-3")}</label>
                <input
                  className="introInputFont"
                  onChange={(e) =>
                    setPaymentSettingsState({
                      ...paymentSettingsState,
                      merchantEmail: e.currentTarget.value,
                    })
                  }
                  value={paymentSettingsState.merchantEmail}
                ></input>
                <div className="mt-0.5 textBase italic">{t("info.note")}</div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("welcome")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={sendEmail}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- emailSent ---*/}
        {step == "emailSent" && (
          <div className="text-xl w-full h-full flex flex-col items-center">
            {/*--- spacer ---*/}
            <div className="h-[8%] landscape:xl:desktop:h-[12%] min-h-[40px]"></div>
            {/*--- text ---*/}
            <div className="px-3 flex-1 flex flex-col space-y-8">
              <div className="font-semibold">{t("emailSent.text-1")}</div>
              <div className="">{t("emailSent.text-2")}</div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("info")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("how")}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- how customer pays ---*/}
        {step == "how" && (
          <div className="pt-[28px] flex-none w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="flex-1 w-full flex flex-col items-center space-y-[20px]">
              {/*--- title ---*/}
              <div className="introHeaderFont">{t("how.title")}</div>
              {/*--- image ---*/}
              <div className="flex-none relative w-[340px] h-[calc(340px*(3/4))]">
                <Image src="/intro-scan.png" alt="scan" fill />
              </div>
              {/*--- text ---*/}
              <div className="flex flex-col space-y-[12px]">
                <div className="relative flex">
                  <div className="introNumber">1</div>
                  <div>
                    {t.rich("how.text-1", {
                      span1: (chunks) => <span className="group">{chunks}</span>,
                      span2: (chunks) => <span className="linkLight">{chunks}</span>,
                      sup: (chunks) => <sup>{chunks}</sup>,
                      div: (chunks) => <div className="w-full top-[calc(100%+4px)] left-0 tooltip text-base">{chunks}</div>,
                      tooltip: tcommon("mmTooltip"),
                    })}
                  </div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">2</div>
                  <div>{t.rich("how.text-2", { span: (chunks) => <span className="font-bold">{chunks}</span>, merchantCurrency: paymentSettingsState.merchantCurrency })}</div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">3</div>
                  <div>
                    {t.rich("how.text-3", {
                      span1: (chunks) => <span className="group">{chunks}</span>,
                      span2: (chunks) => <span className="linkLight">{chunks}</span>,
                      sup: (chunks) => <sup>{chunks}</sup>,
                      div: (chunks) => <div className="bottom-[calc(100%+8px)] left-0 tooltip text-base">{chunks}</div>,
                      span3: (chunks: any) => <span className={`${paymentSettingsState?.merchantCurrency == "USD" ? "hidden" : ""}`}>{chunks}</span>,
                      merchantCurrency: paymentSettingsState?.merchantCurrency,
                      tooltip: tcommon("usdcTooltip"),
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("emailSent")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button
                className="introNext"
                onClick={() => (paymentSettingsState.merchantCountry != "Other" && cashoutSettingsState.cex == "Coinbase" ? setStep("cashoutCb-1") : setStep("cashoutNoCb-1"))}
              >
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- cashoutCb-1 ---*/}
        {step == "cashoutCb-1" && (
          <div className="pt-[28px] flex-none w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col space-y-[16px]">
              {/*--- title ---*/}
              <div className="introHeaderFont">{t("cashoutCb-1.title")}</div>
              {/*--- animation ---*/}
              <div className="w-full flex items-center justify-center">
                <FlashToBankAnimation paymentSettingsState={paymentSettingsState} />
              </div>
              {/*--- text ---*/}
              <div className="pt-2 space-y-[12px]">
                <div className="relative flex">
                  <div className="introNumber">1</div>
                  <div>
                    {t.rich("cashoutCb-1.text-1", {
                      span1: (chunks) => <span className="group">{chunks}</span>,
                      span2: (chunks) => <span className="linkLight">{chunks}</span>,
                      sup: (chunks) => <sup>{chunks}</sup>,
                      div: (chunks) => <div className="left-0 top-[calc(100%+8px)] tooltip text-base">{chunks}</div>,
                      tooltip: tcommon("cbTooltip", { merchantCurrency: paymentSettingsState.merchantCurrency }),
                    })}
                  </div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">2</div>
                  <div>{t("cashoutCb-1.text-2")}</div>
                </div>
                <div className="relative">
                  {t.rich("cashoutCb-1.text-3", {
                    span1: (chunks: any) => <span className="group">{chunks}</span>,
                    span2: (chunks: any) => <span className="linkLight">{chunks}</span>,
                    span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                    span4: (chunks: any) => <span className={`${paymentSettingsState.merchantCurrency == "USD" ? "hidden" : ""}`}>{chunks}</span>,
                    div: (chunks: any) => <div className="w-full bottom-[28px] whitespace-normal tooltip text-base">{chunks}</div>,
                    tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: paymentSettingsState.merchantCurrency }),
                    merchantCurrency: paymentSettingsState.merchantCurrency,
                  })}
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="pt-[4px] w-full space-y-[24px] flex flex-col items-center">
                <button className="introButtonBlack" onClick={onClickSIWC}>
                  {t("cashoutCb-1.button-1")}
                </button>
                <button className="introButtonWhite" onClick={() => setStep("cashoutCb-2")}>
                  {t("cashoutCb-1.button-2")}
                </button>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("how")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
            </div>
          </div>
        )}

        {/*--- cashoutCb-2 ---*/}
        {step == "cashoutCb-2" && (
          <div className="pt-8 w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col items-center space-y-8">
              <div className="introHeaderFont">{t("cashoutCb-2.title")}</div>
              <div>{t.rich("cashoutCb-2.text-1", { span: (chunks) => <span className={`${isMobile ? "hidden" : ""}`}>{chunks}</span> })}</div>
              <button className="introButtonBlack" onClick={() => window.open("https://www.coinbase.com/signup", "_blank")}>
                Download Coinbase App
              </button>
              <button className={`${isMobile ? "hidden" : ""} introButtonBlack`}>
                Coinbase's Official Website
                <FontAwesomeIcon icon={faExternalLink} className="ml-2" />
              </button>
              <div>{t("cashoutCb-2.text-2")}</div>
              {/*--- can I use another cex? ---*/}
              <div className="w-full flex flex-col bg-gray-200 p-4 text-base cursor-pointer rounded-[4px]" onClick={() => setExpand(!expand)}>
                <div className="flex space-x-3">
                  <FontAwesomeIcon icon={expand ? faMinus : faPlus} className="pt-1" />
                  <div className="">{t("cashoutCb-2.question")}</div>
                </div>
                <div className={`${expand ? "max-h-[300px]" : "max-h-0"} w-full overflow-hidden`}>
                  <div className="py-2">{t("cashoutCb-2.answer")}</div>
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("cashoutCb-1")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- cashoutNoCb-1 ---*/}
        {step == "cashoutNoCb-1" && (
          <div className="pt-8 w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="w-full flex-1 flex flex-col items-center space-y-4">
              {/*--- title ---*/}
              <div className="introHeaderFont">{t("cashoutNoCb-1.title")}</div>
              {/*--- body ---*/}
              <div className="w-full">{t("cashoutNoCb-1.text-1", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}</div>
              <div>
                {t("cashoutNoCb-1.text-2", {
                  cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : `${tcommon("your")}${tcommon("CEX")}`,
                  merchantCurrency: paymentSettingsState.merchantCurrency,
                  asterix: paymentSettingsState.merchantCurrency == "USD" ? "" : "*",
                })}
              </div>
              <div className={`${paymentSettingsState.merchantCurrency == "USD" ? "hidden" : ""} w-full relative`}>
                {t.rich("cashoutNoCb-1.text-3", {
                  span1: (chunks: any) => <span className="group">{chunks}</span>,
                  span2: (chunks: any) => <span className="linkLight">{chunks}</span>,
                  span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                  div: (chunks: any) => <div className="w-full bottom-[32px] whitespace-normal tooltip text-base">{chunks}</div>,
                  tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: paymentSettingsState.merchantCurrency }),
                })}
              </div>
              <div className="pt-4 space-y-8">
                <button
                  className={`${cashoutSettingsState.cex ? "" : "text-base portrait:sm:text-lg landscape:lg:text-lg"} introButtonBlack`}
                  onClick={() => setStep("cashoutNoCb-2")}
                >
                  {t("cashoutNoCb-1.button-1", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}
                </button>
                <button
                  className={`${cashoutSettingsState.cex ? "" : "text-base portrait:sm:text-lg landscape:lg:text-lg"} introButtonWhite`}
                  onClick={() => setStep("cashoutNoCb-3")}
                >
                  {t("cashoutNoCb-1.button-2", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}
                </button>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("how")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
            </div>
          </div>
        )}

        {/*--- cashoutNoCb-2 ---*/}
        {step == "cashoutNoCb-2" && (
          <div className="pt-8 w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="h-[8%] min-h-[70px]"></div>
            <div className="flex-1 flex flex-col items-center space-y-8">
              <div>{t("cashoutNoCb-2.text", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}</div>
              <div>
                <label className="text-lg font-medium">{t("cashoutNoCb-2.label")}</label>
                <input
                  onChange={(e) => setCashoutSettingsState({ ...cashoutSettingsState, cexEvmAddress: e.currentTarget.value })}
                  onBlur={() => setSave(!save)}
                  value={cashoutSettingsState.cexEvmAddress}
                  className="mt-0.5 w-full introInputFontSmall text-[13px] px-1 placeholder:text-lg placeholder:pl-2 placeholder:focus:text-transparent"
                  placeholder={t("cashoutNoCb-2.placeholder")}
                ></input>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("cashoutNoCb-1")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {cashoutSettingsState.cexEvmAddress ? tcommon("next") : tcommon("skip")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- cashoutNoCb-3 ---*/}
        {step == "cashoutNoCb-3" && (
          <div className="pt-8 w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col items-center space-y-8">
              <div className="introHeaderFont">{t("cashoutNoCb-3.title", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}</div>
              <div className={`${cashoutSettingsState.cex ? "" : "hidden"}`}>
                {t.rich("cashoutNoCb-3.text-1", {
                  span: (chunks) => <span className={`${isMobile ? "hidden" : ""}`}>{chunks}</span>,
                  cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX"),
                })}
              </div>
              <button
                className={`${!cashoutSettingsState.cex ? "hidden" : ""} introButtonBlack`}
                onClick={() => window.open(isIOS ? cexToLinks[cashoutSettingsState.cex].appleStore : cexToLinks[cashoutSettingsState.cex].googlePlay, "_blank")}
              >
                {t("cashoutNoCb-3.mobile", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}
              </button>
              <button
                className={`${!cashoutSettingsState.cex ? "hidden" : ""} ${isMobile ? "hidden" : ""} introButtonBlack`}
                onClick={() => window.open(cexToLinks[cashoutSettingsState.cex].website, "_blank")}
              >
                {t("cashoutNoCb-3.desktop", { cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : tcommon("CEX") })}{" "}
                <FontAwesomeIcon icon={faExternalLink} className="ml-2" />
              </button>
              <div className={`${cashoutSettingsState.cex ? "hidden" : ""}`}>{t("cashoutNoCb-3.text-1-noCex")}</div>
              <div>{t("cashoutNoCb-3.text-2")}</div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("cashoutNoCb-1")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {step == "final" && (
          <div className="text-xl introPageContainer">
            {/*--- spacer ---*/}
            <div className="h-[25%] min-h-[120px]"></div>
            {/*--- content ---*/}
            <div className="flex-1 text-center flex flex-col items-center space-y-12">
              <div className="text-3xl font-semibold leading-normal">{t("final.text-1")}</div>
              <div className="leading-normal">
                {t.rich("final.text-2", { span1: (chunks) => <span className="font-bold">{chunks}</span>, span2: (chunks) => <span className="font-bold">{chunks}</span> })}
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button
                className="introBack"
                onClick={() => (paymentSettingsState.merchantCountry != "Other" && cashoutSettingsState.cex == "Coinbase" ? setStep("cashoutCb-2") : setStep("cashoutNoCb-1"))}
              >
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button
                className="introNext"
                onClick={() => {
                  setPage("app");
                  setCashbackModal(true);
                }}
              >
                {t("final.finish")}
              </button>
            </div>
          </div>
        )}
      </div>
      {errorModal && <ErrorModalLight errorMsg={errorMsg} setErrorModal={setErrorModal} />}
    </div>
  );
};

export default Intro;
