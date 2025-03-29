"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
// custom hooks
import { useSettingsQuery, useSettingsMutation } from "@/utils/hooks";
import { useWeb3AuthInfo } from "../../Web3AuthProvider";
// others
import { QRCodeSVG } from "qrcode.react";
import { pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer/lib/react-pdf.browser";
import { useTranslations } from "next-intl";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
// components
import NullaToBankAnimation from "./NullaToBankAnimation";
import Placard from "../../app/_components/placard/Placard";
// utils
import ErrorModal from "@/utils/components/ErrorModal";
import { countryData, countryCurrencyList, abb2full, cexLinks } from "@/utils/constants";
import { NullaInfo } from "@/utils/types";
import { endIntroAction } from "@/utils/actions";
import { fetchPost } from "@/utils/functions";

export default function Intro({ nullaInfo }: { nullaInfo: NullaInfo }) {
  // hooks
  const t = useTranslations("App.Intro");
  const tcommon = useTranslations("Common");
  const web3AuthInfo = useWeb3AuthInfo();
  const { mutateAsync: saveSettings } = useSettingsMutation();
  const { data: settings } = useSettingsQuery(web3AuthInfo, nullaInfo);
  console.log("/intro.tsx, settings:", settings);

  // states
  const [step, setStep] = useState("welcome");
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isApple, setIsApple] = useState(false);
  const [emailStatus, setEmailStatus] = useState("sending"); // sending | success | error
  const [merchantName, setMerchantName] = useState("");
  const [countryCurrency, setCountryCurrency] = useState("");
  const [cexEvmAddress, setCexEvmAddress] = useState("");

  // check device
  useEffect(() => {
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isAppleTemp = /Mac|iPhone|iPod|iPad/.test(window.navigator.userAgent);
    setIsMobile(!isDesktop);
    setIsApple(isAppleTemp);
  }, []);

  // sync react states with react query
  useEffect(() => {
    if (settings) {
      if (settings.paymentSettings.merchantCountry) {
        console.log("updating react states");
        setMerchantName(settings.paymentSettings.merchantName);
        setCountryCurrency(`${settings.paymentSettings.merchantCountry} / ${settings.paymentSettings.merchantCurrency}`);
        setCexEvmAddress(settings.cashoutSettings.cexEvmAddress);
      } else {
        updateUserLocation();
      }
    }
  }, [settings]);

  async function updateUserLocation() {
    console.log("updating settings with autolocater...");
    let merchantCountry = "U.S.";
    try {
      const res = await axios.get("https://api.country.is");
      merchantCountry = abb2full[res.data.country] ?? "Other";
    } catch (e) {
      console.log("api.country.is down");
    }
    const merchantCurrency = countryData[merchantCountry]?.currency ?? "USD";
    const cex = countryData[merchantCountry]?.CEXes[0] ?? "";
    console.log("settings to be saved:", merchantCountry, merchantCurrency, cex);

    await saveSettings({
      changes: { "paymentSettings.merchantCountry": merchantCountry, "paymentSettings.merchantCurrency": merchantCurrency, "cashoutSettings.cex": cex },
      web3AuthInfo,
    });
  }

  async function saveSettingsAndSendEmail() {
    // validate
    if (!merchantName) {
      setErrorModal(t("errors.enterName"));
      return;
    }
    setStep("emailSent");
    // define settings
    const [merchantCountry, merchantCurrency] = countryCurrency.split(" / ");
    const cex = merchantCountry === "Other" ? "" : countryData[merchantCountry].CEXes[0];
    const qrCodeUrl = `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=inperson&merchantName=${merchantName}&merchantCurrency=${merchantCurrency}&merchantEvmAddress=${settings?.paymentSettings.merchantEvmAddress}`;
    // save settings
    await saveSettings(
      {
        changes: {
          "paymentSettings.merchantName": merchantName,
          "paymentSettings.merchantCountry": merchantCountry,
          "paymentSettings.merchantCurrency": merchantCurrency,
          "cashoutSettings.cex": cex,
          "paymentSettings.qrCodeUrl": qrCodeUrl,
        },
        web3AuthInfo,
      },
      {
        onSuccess: async () => await sendEmail(), // 4. send email (TODO: may not use updated qrcode)
        onError: () => setErrorModal(t("errors.failedEmail")),
      }
    );
  }

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
    // call api
    try {
      const resJson = await fetchPost("/api/emailQrCode", { merchantEmail: settings?.paymentSettings.merchantEmail, dataString });
      if (resJson === "email sent") {
        setEmailStatus("success");
        return;
      }
    } catch (e) {}
    setStep("how");
    setEmailStatus("error");
    setErrorModal(t("errors.failedEmail"));
  }

  return (
    <div className="w-full h-screen flex justify-center bg-light2 text-lightText1 textBaseApp overflow-y-auto">
      <div className="w-full mx-[16px] max-w-[450px] desktop:max-w-[390px] h-full min-h-[600px] max-h-[900px] my-auto flex flex-col">
        <div className="hidden">
          <QRCodeSVG
            id="introQrCode"
            xmlns="http://www.w3.org/2000/svg"
            size={210}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            value={settings?.paymentSettings.qrCodeUrl ?? ""}
          />
        </div>

        {/*--- loading & welcome ---*/}
        {step === "welcome" && (
          <div className="w-full h-full flex flex-col items-center justify-center pb-[50px]">
            <Image src="/logoBlackNoBg.svg" width={220} height={54} alt="logo" priority />
            <AnimatePresence>
              {settings && settings.paymentSettings.merchantCountry ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}>
                  <div className="w-full h-[272px] flex flex-col items-center">
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
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-[272px] flex flex-col items-center">
                  <Image src="/loading.svg" width={80} height={80} alt="loading" className="mt-[80px] animate-spin" />
                  <div className="mt-4 font-medium textBaseApp text-slate-500">{tcommon("loading")}...</div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/*--- info ---*/}
        {step === "info" && (
          <>
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col justify-center">
              <div className="textLgApp font-semibold">{t("info.text-1")}:</div>
              {/*--- merchantName  ---*/}
              <label className="pt-[40px] appInputLabel">{t("info.label-1")}</label>
              <input className="appInputPx w-full" onChange={(e) => setMerchantName(e.currentTarget.value)} value={merchantName}></input>
              {/*--- country / currency ---*/}
              <label className="pt-[24px] appInputLabel">{t("info.label-2")}</label>
              <select
                className="appInputPx w-full"
                onChange={(e) => {
                  setCountryCurrency(e.currentTarget.value);
                  e.target.closest("select")?.blur();
                }}
                value={countryCurrency}
              >
                {settings ? countryCurrencyList.map((i, index) => <option key={index}>{i}</option>) : <option>Loading...</option>}
              </select>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("welcome")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={saveSettingsAndSendEmail} disabled={settings ? false : true}>
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </>
        )}

        {/*--- emailSent ---*/}
        {settings && step === "emailSent" && (
          <div className="w-full h-full flex flex-col items-center">
            {/*--- text ---*/}
            <div className="px-[12px] flex-1 flex flex-col justify-center space-y-[32px]">
              {(emailStatus === "sending" || emailStatus === "success") && (
                <>
                  <p className="textXlApp font-semibold">
                    {emailStatus === "sending" && t("emailSent.text-0")}
                    {emailStatus === "success" && t("emailSent.text-1")}
                  </p>
                  <p className={`${emailStatus === "success" ? "visible" : "invisible"}`}>{t("emailSent.text-2")}</p>
                </>
              )}
              {emailStatus === "error" && <p>{t("errors.failedEmail")}</p>}
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("info")} disabled={emailStatus === "sending" ? true : false}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button
                className="introNext disabled:bg-slate-500! disabled:border-slate-500!"
                onClick={() => {
                  setStep("how");
                  setEmailStatus("sending");
                }}
                disabled={emailStatus === "sending" ? true : false}
              >
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- how customer pays ---*/}
        {settings && step === "how" && (
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
                  <div>{t.rich("how.text-2", { span: (chunks) => <span className="font-bold">{chunks}</span>, merchantCurrency: settings?.paymentSettings.merchantCurrency })}</div>
                </div>
                <div className="relative flex">
                  <div className="introNumber">3</div>
                  <div>
                    {t.rich("how.text-3", {
                      span1: (chunks) => <span className="group">{chunks}</span>,
                      span2: (chunks) => <span className="dotted">{chunks}</span>,
                      div: (chunks) => <div className="bottom-[calc(100%+8px)] left-0 tooltip text-base">{chunks}</div>,
                      span3: (chunks: any) => <span className={`${settings?.paymentSettings.merchantCurrency == "USD" ? "hidden" : ""}`}>{chunks}</span>,
                      merchantCurrency: settings?.paymentSettings.merchantCurrency,
                      tooltip: tcommon("usdcTooltip"),
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("info")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button
                className="introNext"
                onClick={() =>
                  settings.paymentSettings.merchantCountry != "Other" && settings?.cashoutSettings.cex == "Coinbase" ? setStep("coinbase") : setStep("notCoinbase-1")
                }
              >
                {tcommon("next")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- coinbase ---*/}
        {settings && step === "coinbase" && (
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
                    tooltip: tcommon("cbTooltip", { merchantCurrency: settings.paymentSettings.merchantCurrency }),
                    a: (chunks) => (
                      <a
                        href={
                          isMobile
                            ? isApple
                              ? cexLinks[settings.cashoutSettings.cex].apple
                              : cexLinks[settings.cashoutSettings.cex].google
                            : cexLinks[settings.cashoutSettings.cex].apple
                        }
                        target="_blank"
                        className="linkLight"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </div>
                <div>{t("cashoutCb-1.text-2")}</div>
                <div>{t("cashoutCb-1.text-3", { merchantCurrency: settings.paymentSettings.merchantCurrency })}</div>
                <div className={`relative ${settings.paymentSettings.merchantCurrency === "USD" ? "hidden" : ""}`}>
                  {t.rich("cashoutCb-1.text-4", {
                    span1: (chunks: any) => <span className="group">{chunks}</span>,
                    span2: (chunks: any) => <span className="dotted">{chunks}</span>,
                    span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                    div: (chunks: any) => <div className="w-full bottom-[28px] whitespace-normal tooltip text-base">{chunks}</div>,
                    tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: settings.paymentSettings.merchantCurrency }),
                    merchantCurrency: settings.paymentSettings.merchantCurrency,
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
        {settings && step === "notCoinbase-1" && (
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
                    {settings.cashoutSettings.cex
                      ? t.rich("notCoinbase-1.text-1", {
                          a1: (chunks) => (
                            <a
                              href={
                                isMobile
                                  ? isApple
                                    ? cexLinks[settings.cashoutSettings.cex].apple
                                    : cexLinks[settings.cashoutSettings.cex].google
                                  : cexLinks[settings.cashoutSettings.cex].apple
                              }
                              target="_blank"
                              className="linkLight"
                            >
                              {chunks}
                            </a>
                          ),
                          span1: (chunks) => <span className="group">{chunks}</span>,
                          span2: (chunks) => <span className="dotted">{chunks}</span>,
                          div: (chunks) => <div className="left-0 top-[calc(100%-20px)] tooltip text-base">{chunks}</div>,
                          tooltip: t("notCoinbase-1.tooltipCex", { cex: settings.cashoutSettings.cex, merchantCurrency: settings.paymentSettings.merchantCurrency }),
                          cex: settings.cashoutSettings.cex,
                        })
                      : t("notCoinbase-1.text-1NoCex")}
                  </div>
                </div>
                <div className="w-full flex">
                  <div className="introNumber">2</div>
                  <div>{settings.cashoutSettings.cex ? t("notCoinbase-1.text-2", { cex: settings.cashoutSettings.cex }) : t("notCoinbase-1.text-2NoCex")}</div>
                </div>
                <div className="w-full flex relative">
                  <div className="introNumber">3</div>
                  <div>
                    {settings.cashoutSettings.cex
                      ? t("notCoinbase-1.text-3", { cex: settings.cashoutSettings.cex, merchantCurrency: settings.paymentSettings.merchantCurrency })
                      : t("notCoinbase-1.text-3NoCex", { merchantCurrency: settings.paymentSettings.merchantCurrency })}{" "}
                    {settings.paymentSettings.merchantCurrency == "USD"
                      ? null
                      : t.rich("notCoinbase-1.text-4", {
                          span1: (chunks: any) => <span className="group">{chunks}</span>,
                          span2: (chunks: any) => <span className="dotted">{chunks}</span>,
                          span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                          div: (chunks: any) => <div className="w-full bottom-[32px] whitespace-normal tooltip text-base">{chunks}</div>,
                          tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: settings.paymentSettings.merchantCurrency }),
                        })}
                  </div>
                </div>
              </div>
              {/*--- do you have an account? ---*/}
              <div className="flex flex-col">
                <div className="font-bold">
                  {settings.cashoutSettings.cex ? t("notCoinbase-1.text-5", { cex: settings.cashoutSettings.cex }) : t("notCoinbase-1.text-5-default")}
                </div>
                <div className="w-full mt-[20px] flex justify-center gap-[32px]">
                  <button className="appButton2 w-[120px] rounded-full!" onClick={() => setStep("notCoinbase-3")}>
                    {tcommon("no")}
                  </button>
                  <button className="appButton1Light w-[120px] rounded-full!" onClick={() => setStep("notCoinbase-2")}>
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
        {settings && step === "notCoinbase-2" && (
          <div className="pt-[32px] w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="h-[8%] min-h-[70px]"></div>
            <div className="flex-1 flex flex-col gap-[24px]">
              <div>{t("notCoinbase-2.text", { cex: settings.cashoutSettings.cex ? settings.cashoutSettings.cex : tcommon("CEX") })}</div>
              <input
                className="appInputSmPx"
                onChange={(e) => setCexEvmAddress(e.currentTarget.value)}
                onBlur={(e) => saveSettings({ changes: { "cashoutSettings.cexEvmAddress": e.currentTarget.value }, web3AuthInfo })}
                value={cexEvmAddress}
                placeholder={t("notCoinbase-2.placeholder")}
              />
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button className="introBack" onClick={() => setStep("notCoinbase-1")}>
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button className="introNext" onClick={() => setStep("final")}>
                {cexEvmAddress ? tcommon("next") : tcommon("skip")} &nbsp;&#10095;
              </button>
            </div>
          </div>
        )}

        {/*--- notCoinbase-3 (answer "no") ---*/}
        {settings && step === "notCoinbase-3" && (
          <div className="w-full h-full flex flex-col">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col justify-center gap-[24px]">
              <p>{t("notCoinbase-3.text-1", { cex: settings.cashoutSettings.cex ? settings.cashoutSettings.cex : tcommon("CEX") })}</p>
              <p>
                {settings.cashoutSettings.cex
                  ? t.rich("notCoinbase-3.text-2", {
                      a1: (chunks) => (
                        <a
                          href={
                            isMobile
                              ? isApple
                                ? cexLinks[settings.cashoutSettings.cex].apple
                                : cexLinks[settings.cashoutSettings.cex].google
                              : cexLinks[settings.cashoutSettings.cex].apple
                          }
                          target="_blank"
                          className="linkLight"
                        >
                          {chunks}
                        </a>
                      ),
                      cex: settings.cashoutSettings.cex,
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

        {settings && step === "final" && (
          <div className="w-full h-full flex flex-col items-center">
            {/*--- content ---*/}
            <div className="flex-1 flex flex-col items-center justify-center gap-[40px]">
              <div className="textXlApp font-semibold leading-normal">{t("final.text-1")}</div>
              <div className="">{t.rich("final.text-2", { span: (chunks) => <span className="font-bold">{chunks}</span> })}</div>
            </div>
            {/*--- buttons ---*/}
            <div className="introButtonContainer">
              <button
                className="introBack"
                onClick={() => (settings.paymentSettings.merchantCountry != "Other" && settings.cashoutSettings.cex == "Coinbase" ? setStep("coinbase") : setStep("notCoinbase-1"))}
              >
                &#10094;&nbsp; {tcommon("back")}
              </button>
              <button
                className="introNext"
                onClick={() => {
                  window.localStorage.setItem("cashbackModal", "true");
                  window.localStorage.setItem("cashoutIntroModal", "true");
                  endIntroAction();
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
