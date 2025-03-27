"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { getCookie, deleteCookie } from "cookies-next";
// custom hooks
import { useSettingsMutation } from "../../hooks";
import { useWeb3AuthInfo } from "../../Web3AuthProvider";
// pdf
import { QRCodeSVG } from "qrcode.react";
import { pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer";
// wagmi
import { useAccount } from "wagmi";
// i18n
import { useTranslations } from "next-intl";
// others
import axios from "axios";
// components
import NullaToBankAnimation from "./NullaToBankAnimation";
import Placard from "../../app/_components/placard/Placard";
// utils
import ErrorModal from "@/utils/components/ErrorModal";
import { countryData, countryCurrencyList, abb2full, cexLinks } from "@/utils/constants";
import { NullaInfo } from "@/utils/types";

export default function Intro() {
  console.log("/intro.tsx");
  // hooks
  const router = useRouter();
  const t = useTranslations("App.Intro");
  const tcommon = useTranslations("Common");
  const account = useAccount();
  const web3AuthInfo = useWeb3AuthInfo();
  const { mutateAsync: saveSettings } = useSettingsMutation();

  // states
  const [step, setStep] = useState("loading");
  const [expand, setExpand] = useState(false);
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isApple, setIsApple] = useState(false);
  const [settings, setSettings] = useState({ merchantEmail: "", merchantName: "", merchantCountry: "", merchantCurrency: "", cex: "", cexEvmAddress: "", qrCodeUrl: "" });
  const [name, setName] = useState("");
  const [countyCurrency, setCountyCurrency] = useState("");

  useEffect(() => {
    if (web3AuthInfo?.publicKey) {
      console.log("/intro useEffect");
      const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
      const isAppleTemp = /Mac|iPhone|iPod|iPad/.test(window.navigator.userAgent);
      setIsMobile(!isDesktop);
      setIsApple(isAppleTemp);

      // need in case user refreshes while in /intro
      if (window.localStorage.getItem("isIntro")) {
        getSettings();
        return; // skip createNewUser() if isIntro
      }

      if (web3AuthInfo) createNewUser();
    }
  }, [web3AuthInfo]);

  const createNewUser = async () => {
    console.log("creating new user");

    // abort if no email
    if (!web3AuthInfo || !web3AuthInfo.email) {
      router.push("/login");
      return;
    }

    // get location and set default settings
    let merchantCountry = "U.S.";
    try {
      const res = await axios.get("https://api.country.is");
      merchantCountry = abb2full[res.data.country] ?? "Other";
    } catch (e) {
      console.log("api.country.is down");
    }
    const merchantEmail = web3AuthInfo.email;
    const merchantCurrency = countryData[merchantCountry]?.currency ?? "USD";
    const cex = countryData[merchantCountry]?.CEXes[0] ?? "";

    // create new user
    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchantEmail: web3AuthInfo.email, merchantCountry, merchantCurrency, cex, web3AuthInfo }),
      });
      if (!res.ok) router.push("/login");
      const resJson = await res.json();
      if (resJson === "success") {
        console.log("user created");
        window.localStorage.setItem("isIntro", "true"); // this ensures createNewUser() is skipped if browser refreshed
        setSettings({ merchantEmail, merchantName: "", merchantCountry, merchantCurrency, cex, cexEvmAddress: "", qrCodeUrl: "" });
        setStep("welcome");
      } else if (resJson === "user already exists") {
        console.log("user already exists, push to /app");
        router.push("/app");
        return;
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.log("request to createUser api failed");
      router.push("/login");
    }
  };

  const getSettings = async () => {
    console.log("getSettings()");
    // get cookies
    const userType = getCookie("userType");
    const userJwt = getCookie("userJwt");
    if (!userType || !userJwt) {
      router.push("/login");
      return;
    }

    // get settings and setSettings
    try {
      const res = await fetch("/api/getSettings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ web3AuthInfo, nullaInfo: { userType, userJwt } }),
      });
      if (!res.ok) router.push("/login");
      const resJson = await res.json();
      if (resJson.status === "success") {
        const { paymentSettings, cashoutSettings } = resJson.data;
        console.log("setSettings with fetched settings", paymentSettings, cashoutSettings);
        setSettings({
          merchantEmail: paymentSettings.merchantEmail,
          merchantName: paymentSettings.merchantName,
          merchantCountry: paymentSettings.merchantCountry,
          merchantCurrency: paymentSettings.merchantCurrency,
          cex: cashoutSettings.cex,
          cexEvmAddress: cashoutSettings.cexEvmAddress,
          qrCodeUrl: paymentSettings.qrCodeUrl,
        });
        setStep("welcome");
      }
    } catch (e) {}
  };

  const saveSettingsAndSendEmail = async () => {
    // form validation
    if (!settings.merchantName) {
      setErrorModal(t("errors.enterName"));
      return;
    }
    if (!settings.merchantEmail) {
      setErrorModal(t("errors.enterEmail"));
      return;
    }
    // check valid email
    if (!settings.merchantEmail.split("@")[1]?.includes(".")) {
      setErrorModal(t("errors.validEmail"));
      return;
    }

    // show next step
    setStep("emailSent");

    // save settings & send email
    await saveSettings(
      {
        changes: {
          "paymentSettings.merchantEmail": settings.merchantEmail,
          "paymentSettings.merchantName": settings.merchantName,
          "paymentSettings.merchantCountry": settings.merchantCountry,
          "paymentSettings.merchantCurrency": settings.merchantCurrency,
          "cashoutSettings.cex": settings.cex,
          "paymentSettings.qrCodeUrl": settings.qrCodeUrl,
        },
        web3AuthInfo,
      },
      {
        onSuccess: async () => {
          console.log("settings saved");
          await sendEmail();
        },
        onError: () => {
          setErrorModal("Error: Your information may not have been saved. But, don't worry. You can change your information in the app at any time.");
        },
      }
    );
  };

  async function sendEmail() {
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
      body: JSON.stringify({ merchantEmail: settings.merchantEmail, dataString }),
    });
    // api response
    const response = await res.json();
    if (response === "email sent") {
      console.log("email sent");
    } else {
      console.log("email did not send");
    }
  }

  return (
    <div className="w-full h-screen flex justify-center bg-light2 text-lightText1 textBaseApp overflow-y-auto">
      <div className="w-full mx-[16px] max-w-[450px] h-full min-h-[600px] max-h-[900px] my-auto">
        <div className="hidden">
          <QRCodeSVG id="introQrCode" xmlns="http://www.w3.org/2000/svg" size={210} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={settings.qrCodeUrl} />
        </div>

        {/*--- loading & welcome ---*/}
        {(step == "welcome" || step == "loading") && (
          <div className="w-full h-full flex flex-col items-center justify-center pb-[50px]">
            <Image src="/logoBlackNoBg.svg" width={220} height={55} alt="logo" priority />
            {/*--- loading || welcome ---*/}
            <div className="w-full h-[272px] flex flex-col items-center">
              {step === "loading" && (
                <>
                  <Image src="/loading.svg" width={80} height={80} alt="loading" className="mt-[80px] animate-spin" />
                  <div className="mt-4 font-medium textBaseApp text-slate-500">{tcommon("loading")}...</div>
                </>
              )}
              {step === "welcome" && (
                <>
                  <div className="mt-[70px] text-xl desktop:text-lg leading-relaxed font-medium text-center animate-fadeInAnimation">
                    {t("welcome.text-1")}
                    <br />
                    {t("welcome.text-2")}
                  </div>
                  <button
                    className="mt-[70px] w-[220px] desktop:w-[190px] appButtonHeight font-semibold tracking-wide rounded-full button1ColorLight animate-fadeInAnimation"
                    onClick={() => setStep("info")}
                  >
                    {t("welcome.start")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/*--- info ---*/}
        {step == "info" && (
          <div className="w-full h-full flex flex-col">
            {/*--- content ---*/}
            <div className="pb-[40px] flex-1 flex flex-col justify-center gap-[24px] portrait:sm:gap-[32px] landscape:lg:gap-[32px]">
              {/*--- name  ---*/}
              <div className="textLgApp font-semibold">{t("info.text-1")}:</div>
              <div className="pt-[16px]">
                <label className="introLabelFont">{t("info.label-1")}</label>
                <input
                  className="introInputFont"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      merchantName: e.currentTarget.value,
                      qrCodeUrl: `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=inperson&merchantName=${e.currentTarget.value}&merchantCurrency=${settings.merchantCurrency}&merchantEvmAddress=${account.address}`,
                    })
                  }
                  value={settings.merchantName}
                ></input>
              </div>
              {/*--- country / currency ---*/}
              <div>
                <label className="introLabelFont">{t("info.label-2")}</label>
                <select
                  className="introInputFont"
                  onChange={async (e) => {
                    const [merchantCountry, merchantCurrency] = e.currentTarget.value.split(" / ");
                    setSettings({
                      ...settings,
                      merchantCountry: merchantCountry,
                      merchantCurrency: merchantCurrency,
                      cex: merchantCountry === "Other" ? "" : countryData[merchantCountry].CEXes[0],
                      qrCodeUrl: `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=inperson&merchantName=${settings.merchantName}&merchantCurrency=${merchantCurrency}&merchantEvmAddress=${account.address}`,
                    });
                    e.target.closest("select")?.blur();
                  }}
                  value={`${settings.merchantCountry} / ${settings.merchantCurrency}`}
                >
                  {countryCurrencyList.map((i, index) => (
                    <option key={index}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("welcome")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={saveSettingsAndSendEmail}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- emailSent ---*/}
        {step == "emailSent" && (
          <div className="w-full h-full flex flex-col items-center">
            {/*--- text ---*/}
            <div className="px-[12px] flex-1 flex flex-col justify-center space-y-[32px]">
              <div className="textXlApp font-semibold leading-normal">{t("emailSent.text-1")}</div>
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
          <div className="w-full h-full flex flex-col">
            {/*--- content ---*/}
            <div className="flex-1 w-full flex flex-col items-center gap-[28px]">
              <div className="introHeaderFont">{t("how.title")}</div>
              <div className="relative w-full max-w-[380px] aspect-16/9">
                <Image src="/intro-scan.png" alt="customer scanning QR code" fill className="object-cover rounded-3xl" />
              </div>
              {/*--- text ---*/}
              <div className="introBulletContainer">
                <div className="relative flex">
                  <div className="introNumber">1</div>
                  <div>
                    {t.rich("how.text-1", {
                      span1: (chunks) => <span className="group">{chunks}</span>,
                      span2: (chunks) => <span className="dotted">{chunks}</span>,
                      div: (chunks) => <div className="w-full top-[calc(100%+4px)] left-0 tooltip text-base">{chunks}</div>,
                      tooltip: tcommon("mmTooltip"),
                    })}
                  </div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">2</div>
                  <div>{t.rich("how.text-2", { span: (chunks) => <span className="font-bold">{chunks}</span>, merchantCurrency: settings.merchantCurrency })}</div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">3</div>
                  <div>
                    {t.rich("how.text-3", {
                      span1: (chunks) => <span className="group">{chunks}</span>,
                      span2: (chunks) => <span className="dotted">{chunks}</span>,
                      div: (chunks) => <div className="bottom-[calc(100%+8px)] left-0 tooltip text-base">{chunks}</div>,
                      span3: (chunks: any) => <span className={`${settings?.merchantCurrency == "USD" ? "hidden" : ""}`}>{chunks}</span>,
                      merchantCurrency: settings?.merchantCurrency,
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
              <button className="introNext" onClick={() => (settings.merchantCountry != "Other" && settings.cex == "Coinbase" ? setStep("coinbase") : setStep("notCoinbase-1"))}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- coinbase ---*/}
        {step == "coinbase" && (
          <div className="w-full h-full flex flex-col">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col space-y-[16px]">
              {/*--- title ---*/}
              <div className="introHeaderFont">{t("cashoutCb-1.title")}</div>
              {/*--- animation ---*/}
              <div className="py-[16px] w-full flex items-center justify-center">
                <NullaToBankAnimation settings={settings} />
              </div>
              {/*--- text ---*/}
              <div className="flex flex-col gap-[16px]">
                <div className="relative">
                  {t.rich("cashoutCb-1.text-1", {
                    span1: (chunks) => <span className="group">{chunks}</span>,
                    span2: (chunks) => <span className="dotted">{chunks}</span>,
                    div: (chunks) => <div className="w-full top-[calc(100%+4px)] tooltip text-base">{chunks}</div>,
                    tooltip: tcommon("cbTooltip", { merchantCurrency: settings.merchantCurrency }),
                    a: (chunks) => (
                      <a
                        href={isMobile ? (isApple ? cexLinks[settings.cex].apple : cexLinks[settings.cex].google) : cexLinks[settings.cex].apple}
                        target="_blank"
                        className="linkLight"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </div>
                <div>{t("cashoutCb-1.text-2")}</div>
                <div>{t("cashoutCb-1.text-3", { merchantCurrency: settings.merchantCurrency })}</div>
                <div className={`relative ${settings.merchantCurrency === "USD" ? "hidden" : ""}`}>
                  {t.rich("cashoutCb-1.text-4", {
                    span1: (chunks: any) => <span className="group">{chunks}</span>,
                    span2: (chunks: any) => <span className="dotted">{chunks}</span>,
                    span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                    div: (chunks: any) => <div className="w-full bottom-[28px] whitespace-normal tooltip text-base">{chunks}</div>,
                    tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: settings.merchantCurrency }),
                    merchantCurrency: settings.merchantCurrency,
                  })}
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("how")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- notCoinbase-1 ---*/}
        {step == "notCoinbase-1" && (
          <div className="w-full h-full flex flex-col">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col gap-[40px]">
              {/*--- title ---*/}
              <div className="introHeaderFont">{t("notCoinbase-1.title")}</div>
              {/*--- text ---*/}
              <div className="introBulletContainer">
                <div className="w-full flex relative">
                  <div className="introNumber">1</div>
                  <div className="w-full">
                    {settings.cex
                      ? t.rich("notCoinbase-1.text-1", {
                          a1: (chunks) => (
                            <a
                              href={isMobile ? (isApple ? cexLinks[settings.cex].apple : cexLinks[settings.cex].google) : cexLinks[settings.cex].apple}
                              target="_blank"
                              className="linkLight"
                            >
                              {chunks}
                            </a>
                          ),
                          span1: (chunks) => <span className="group">{chunks}</span>,
                          span2: (chunks) => <span className="dotted">{chunks}</span>,
                          div: (chunks) => <div className="left-0 top-[calc(100%-20px)] tooltip text-base">{chunks}</div>,
                          tooltip: t("notCoinbase-1.tooltipCex", { cex: settings.cex, merchantCurrency: settings.merchantCurrency }),
                          cex: settings.cex,
                        })
                      : t("notCoinbase-1.text-1NoCex")}
                  </div>
                </div>
                <div className="w-full flex">
                  <div className="introNumber">2</div>
                  <div>{settings.cex ? t("notCoinbase-1.text-2", { cex: settings.cex }) : t("notCoinbase-1.text-2NoCex")}</div>
                </div>
                <div className="w-full flex relative">
                  <div className="introNumber">3</div>
                  <div>
                    {settings.cex
                      ? t("notCoinbase-1.text-3", { cex: settings.cex, merchantCurrency: settings.merchantCurrency })
                      : t("notCoinbase-1.text-3NoCex", { merchantCurrency: settings.merchantCurrency })}{" "}
                    {settings.merchantCurrency == "USD"
                      ? null
                      : t.rich("notCoinbase-1.text-4", {
                          span1: (chunks: any) => <span className="group">{chunks}</span>,
                          span2: (chunks: any) => <span className="dotted">{chunks}</span>,
                          span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                          div: (chunks: any) => <div className="w-full bottom-[32px] whitespace-normal tooltip text-base">{chunks}</div>,
                          tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: settings.merchantCurrency }),
                        })}
                  </div>
                </div>
              </div>
              {/*--- do you have an account? ---*/}
              <div className="flex flex-col">
                <div className="font-bold">{settings.cex ? t("notCoinbase-1.text-5", { cex: settings.cex }) : t("notCoinbase-1.text-5-default")}</div>
                <div className="w-full mt-[20px] flex justify-center gap-[32px]">
                  <button className="introButtonSecondary" onClick={() => setStep("notCoinbase-3")}>
                    {tcommon("no")}
                  </button>
                  <button className="introButtonPrimary" onClick={() => setStep("notCoinbase-2")}>
                    {tcommon("yes")}
                  </button>
                </div>
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

        {/*--- notCoinbase-2 (answer "yes") ---*/}
        {step == "notCoinbase-2" && (
          <div className="pt-[32px] w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="h-[8%] min-h-[70px]"></div>
            <div className="flex-1 flex flex-col gap-[24px]">
              <div>{t("notCoinbase-2.text", { cex: settings.cex ? settings.cex : tcommon("CEX") })}</div>
              <input
                onChange={(e) => setSettings({ ...settings, cexEvmAddress: e.currentTarget.value })}
                onBlur={() => saveSettings({ changes: { "cashoutSettings.cexEvmAddress": settings.cexEvmAddress }, web3AuthInfo })}
                value={settings.cexEvmAddress}
                className="introInputFontSmall"
                placeholder={t("notCoinbase-2.placeholder")}
              />
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("notCoinbase-1")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {settings.cexEvmAddress ? tcommon("next") : tcommon("skip")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- notCoinbase-3 (answer "no") ---*/}
        {step == "notCoinbase-3" && (
          <div className="w-full h-full flex flex-col">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col justify-center gap-[24px]">
              <p>{t("notCoinbase-3.text-1", { cex: settings.cex ? settings.cex : tcommon("CEX") })}</p>
              <p>
                {settings.cex
                  ? t.rich("notCoinbase-3.text-2", {
                      a1: (chunks) => (
                        <a
                          href={isMobile ? (isApple ? cexLinks[settings.cex].apple : cexLinks[settings.cex].google) : cexLinks[settings.cex].apple}
                          target="_blank"
                          className="linkLight"
                        >
                          {chunks}
                        </a>
                      ),
                      cex: settings.cex,
                    })
                  : t("notCoinbase-3.text-2-default")}
              </p>
              <p>{t("notCoinbase-3.text-3")}</p>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("notCoinbase-1")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {step == "final" && (
          <div className="w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col items-center justify-center gap-[40px]">
              <div className="textXlApp font-semibold leading-normal">{t("final.text-1")}</div>
              <div className="">{t.rich("final.text-2", { span: (chunks) => <span className="font-bold">{chunks}</span> })}</div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => (settings.merchantCountry != "Other" && settings.cex == "Coinbase" ? setStep("coinbase") : setStep("notCoinbase-1"))}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button
                className="introNext"
                onClick={() => {
                  window.localStorage.setItem("cashbackModal", "true");
                  window.localStorage.setItem("cashoutIntroModal", "true");
                  window.localStorage.removeItem("isIntro");
                  router.push("/app");
                }}
              >
                {t("final.finish")}
              </button>
            </div>
          </div>
        )}
      </div>
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </div>
  );
}
