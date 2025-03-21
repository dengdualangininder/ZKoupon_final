"use client";
// nextjs
import { useState, useCallback, useRef, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
// hooks
import { useTheme } from "next-themes";
import { useW3Info } from "../../Web3AuthProvider";
import { useLogout, useSettingsMutation } from "../../hooks";
// i18n
import { useLocale, useTranslations } from "next-intl";
// hook-form & zod
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
// other
import { QRCodeSVG } from "qrcode.react";
import { pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer/lib/react-pdf.browser";
import { saveAs } from "file-saver";
// components
import FaqModal from "./(settings)/FaqModal";
import EmployeePassModal from "./(settings)/EmployeePassModal";
import InfoModal from "./(settings)/InfoModal";
import SwitchLangModal from "./modals/SwitchLangModal";
import Placard from "./placard/Placard";
// images
import { IoInformationCircleOutline } from "react-icons/io5";
import { LuCopy } from "react-icons/lu";
// utils
import Toggle from "@/utils/components/Toggle";
import { countryData, countryCurrencyList, langObjectArray } from "@/utils/constants";
import { PaymentSettings, CashoutSettings } from "@/db/UserModel";
import EmailModal from "./(settings)/EmailModal";
import Spinner from "@/utils/components/Spinner";

// zod
const schema = z.object({
  merchantName: z.string().min(1, { message: "merchantName" }),
  merchantCountryAndCurrency: z.string(),
  cex: z.string(),
  cexEvmAddress: z
    .string({ errorMap: () => ({ message: "cexEvmAddress" }) }) // Address must start with 0x and be 42 characters long
    .startsWith("0x")
    .length(42)
    .or(z.literal("")),
  merchantGoogleId: z.string(),
});
type FormFields = z.infer<typeof schema>;

export default function Settings({ paymentSettings, cashoutSettings, setErrorModal }: { paymentSettings: PaymentSettings; cashoutSettings: CashoutSettings; setErrorModal: any }) {
  console.log("/app Settings.tsx");

  // hooks
  const merchantNameRef = useRef<HTMLInputElement | null>(null); // needed to focus input and move cursor to right
  const router = useRouter();
  const w3Info = useW3Info();
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations("App.Settings");
  const tcommon = useTranslations("Common");
  const [isSwitchingLang, startSwitchingLang] = useTransition();
  const logout = useLogout();
  // react query
  const { mutate: saveSettings } = useSettingsMutation();
  // react-hook-form & zod
  const {
    register,
    trigger,
    getValues,
    setFocus,
    formState: { errors },
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      merchantName: paymentSettings.merchantName,
      merchantCountryAndCurrency: `${paymentSettings.merchantCountry} / ${paymentSettings.merchantCurrency}`,
      cex: cashoutSettings.cex,
      cexEvmAddress: cashoutSettings.cexEvmAddress,
      merchantGoogleId: paymentSettings.merchantGoogleId,
    },
  });
  const { ref: refMerchantName, ...restMerchantName } = register("merchantName");

  // states
  const [popup, setPopup] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null); // needed so that subsequent clicks on input does not right-align cursor
  const [loggingOut, setLoggingOut] = useState(false);
  // modal states
  const [faqModal, setFaqModal] = useState(false);
  const [employeePassModal, setEmployeePassModal] = useState(false);
  const [infoModal, setInfoModal] = useState<string | null>(null); // employeePassword | googleId | cashback
  const [emailModal, setEmailModal] = useState(false);
  // settings input states
  const [hiddenLabel, setHiddenLabel] = useState(""); // googleId | cexEvmAddress
  const [hideCexEvmAddress, setHideCexEvmAddress] = useState<boolean>(cashoutSettings.cex === "Coinbase" && paymentSettings.merchantCountry != "Other"); // needed for optimistic update

  const onChangeMerchantCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [merchantCountry, merchantCurrency] = e.target.value.split(" / ");
    const cex = merchantCountry === "Other" ? "" : countryData[merchantCountry].CEXes[0];
    cex === "Coinbase" ? setHideCexEvmAddress(true) : setHideCexEvmAddress(false);
    const qrCodeUrl = `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=${paymentSettings.merchantPaymentType}&merchantName=${encodeURI(
      paymentSettings.merchantName
    )}&merchantCurrency=${merchantCurrency}&merchantEvmAddress=${paymentSettings.merchantEvmAddress}`;
    saveSettings({
      changes: {
        "paymentSettings.merchantCountry": merchantCountry,
        "paymentSettings.merchantCurrency": merchantCurrency,
        "paymentSettings.qrCodeUrl": qrCodeUrl,
        "cashoutSettings.cex": cex,
        "cashoutSettings.cexEvmAddress": "", // reset cexEvmAddress for all cases, even if CEX is the same
      },
      w3Info,
    });
    window.localStorage.removeItem("cbRefreshToken");
    window.sessionStorage.removeItem("cbAccessToken");
    e.target.closest("select")?.blur(); // makes outline disappear after item selected
  };

  const onChangeCex = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.currentTarget.value === "Coinbase" ? setHideCexEvmAddress(true) : setHideCexEvmAddress(false);
    saveSettings({ changes: { "cashoutSettings.cex": e.currentTarget.value, "cashoutSettings.cexEvmAddress": "" }, w3Info });
    window.localStorage.removeItem("cbRefreshToken");
    window.sessionStorage.removeItem("cbAccessToken");
    e.target.closest("select")?.blur(); // makes outline disappear after item selected
  };

  // this applies to merchantName, cexEvmAddress, merchantGoogleId
  async function validateAndSave(key: keyof FormFields, settingsType?: string) {
    setIsFocused(null); // only applies to merchantName
    setHiddenLabel(""); // only applies to cexEvmAddress and merchantGoogleId
    const isValid = await trigger(key); // zod validation
    if (isValid) {
      const value = getValues(key);
      if (["merchantEmail", "merchantGoogleId", "cexEvmAddress"].includes(key)) {
        saveSettings({ changes: { [`${settingsType}.${key}`]: value }, w3Info });
      } else if (key === "merchantName") {
        const qrCodeUrl = `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=${
          paymentSettings.merchantPaymentType
        }&merchantName=${encodeURI(value)}&merchantCurrency=${paymentSettings.merchantCurrency}&merchantEvmAddress=${paymentSettings.merchantEvmAddress}`;
        saveSettings({ changes: { "paymentSettings.merchantName": value, "paymentSettings.qrCodeUrl": qrCodeUrl }, w3Info });
      }
    } else {
      let msg = "Error";
      if (errors[key]?.message === key) {
        msg = t(`zodErrors.${key}`);
      }
      setErrorModal(msg);
      reset();
    }
  }

  const downloadQrCode = async () => {
    const el = document.getElementById("qrCodeForDownload");
    const blob = await pdf(
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
    ).toBlob();
    saveAs(blob, "Nulla Pay QR Code");
  };

  // render notes: onBlur => 1. trigger() causes settings.tsx/hooks to re-render, 2. print isValid and field value 3. useMutateAsync runs => causes settings.tsx/hooks to re-render 4. settingsQuery invalidated & queryFn run at same time 5. settings.tsx is re-rendered
  return (
    <section className="appPageContainer overflow-y-auto">
      {/*--- qr code for download purposes ---*/}
      <div className="hidden">
        <QRCodeSVG id="qrCodeForDownload" xmlns="http://www.w3.org/2000/svg" size={210} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettings.qrCodeUrl} />
      </div>

      <div className="settingsFont settingsWidth">
        {/*---form ---*/}
        <form className="w-full">
          <div className="settingsTitle">{t("account")}</div>

          {/*---QR Code---*/}
          <div className="settingsField">
            <label className="settingsLabel">{t("qrCode")}</label>
            <div className="relative h-full flex gap-[28px] py-[6px] desktop:py-[2px]">
              <button className="settingsFontButton" type="button" onClick={downloadQrCode}>
                {tcommon("download")}
              </button>
              <button className="settingsFontButton" type="button" onClick={() => setEmailModal(true)}>
                {tcommon("email")}
              </button>
            </div>
          </div>

          {/*---EVM Address---*/}
          <div className="settingsField">
            <label className="settingsLabel">{t("accountAddress")}</label>
            <div
              className="settingsFontFixed flex items-center desktop:cursor-pointer active:text-slate-500 desktop:hover:text-slate-500 desktop:transition-all desktop:duration-[500ms] relative"
              onClick={() => {
                setPopup("copyAddress");
                setTimeout(() => setPopup(""), 1500);
                navigator.clipboard.writeText(paymentSettings.merchantEvmAddress);
              }}
            >
              {paymentSettings.merchantEvmAddress.slice(0, 7)}...{paymentSettings.merchantEvmAddress.slice(-5)} <LuCopy className="ml-[8px] w-[20px] h-[20px]" />
              {/*--- "copied" popup ---*/}
              {popup == "copyAddress" && (
                <div className="textSmApp font-normal absolute left-[50%] bottom-[calc(100%+4px)] translate-x-[-50%] px-[12px] py-[4px] bg-slate-700 text-white rounded-full">
                  {tcommon("copied")}
                </div>
              )}
            </div>
          </div>

          {/*--- merchantEmail ---*/}
          <div className="settingsField border-b">
            <label className="settingsLabel">{t("email")}</label>
            <div className="settingsFontFixed text-end">{paymentSettings.merchantEmail}</div>
          </div>

          <div className="settingsTitle">{t("settings")}</div>

          {/*---merchantName---*/}
          <div className="settingsField">
            <label className="settingsLabel">{t("name")}</label>
            <div
              className="settingsInputContainer group w-full"
              onClick={() => {
                if (merchantNameRef.current && isFocused != "merchantName") {
                  setIsFocused("merchantName"); // ensures this isn't run if already focused, so user can click elsewhere
                  const end = merchantNameRef.current.value.length;
                  merchantNameRef.current.setSelectionRange(end, end);
                  merchantNameRef.current.focus(); // needed if clicked on rightAngle
                }
              }}
            >
              <input
                {...restMerchantName}
                ref={(e) => {
                  refMerchantName(e);
                  merchantNameRef.current = e;
                }}
                onBlur={async () => validateAndSave("merchantName", "paymentSettings")}
                autoComplete="off"
                className="settingsInput settingsFontFixed peer truncate"
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*--- merchantCountry / merchantCurrency ---*/}
          <div className="settingsField">
            <label className="settingsLabel">{t("country")}</label>
            <div className="settingsInputContainer group relative">
              <select className="settingsSelect settingsFontFixed peer" {...register("merchantCountryAndCurrency")} onChange={onChangeMerchantCountry}>
                {countryCurrencyList.map((i, index) => (
                  <option key={index} className="px-[12px]">
                    {i}
                  </option>
                ))}
              </select>
              <div className="settingsRightAngleSelect">&#10095;</div>
            </div>
          </div>

          {/*---cex---*/}
          {paymentSettings.merchantCountry != "Other" && (
            <div className="settingsField">
              <label className="settingsLabel">{t("platform")}</label>
              <div className="settingsInputContainer group relative">
                <select className="settingsSelect settingsFontFixed peer" {...register("cex")} onChange={onChangeCex}>
                  {countryData[paymentSettings.merchantCountry].CEXes.map((i, index) => (
                    <option key={index} className="px-[12px]">
                      {i}
                    </option>
                  ))}
                </select>
                <div className="settingsRightAngleSelect">&#10095;</div>
              </div>
            </div>
          )}

          {/*---cexEvmAddress---*/}
          <div className={`${hideCexEvmAddress ? "hidden" : ""} settingsField`}>
            <label className={`${hiddenLabel === "cexEvmAddress" ? "hidden" : ""} settingsLabel`}>
              {t("platformAddress")}
              <IoInformationCircleOutline size={20} className="settingsInfo" onClick={() => setInfoModal("cexDepositAddress")} />
            </label>
            <div className={`${hiddenLabel === "cexEvmAddress" ? "" : "max-w-[160px]"} w-full settingsInputContainer group`} onClick={() => setFocus("cexEvmAddress")}>
              <input
                className="settingsInput settingsFontFixed focus:settingsFontFixedSmall placeholder:settingsFont peer truncate"
                {...register("cexEvmAddress")}
                onFocus={() => setHiddenLabel("cexEvmAddress")}
                onBlur={async () => validateAndSave("cexEvmAddress", "cashoutSettings")}
                autoComplete="off"
                placeholder={t("empty")}
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---employee password---*/}
          <div className="settingsField">
            <label className="settingsLabel">
              {t("employeePass")}
              <IoInformationCircleOutline className="settingsInfo" onClick={() => setInfoModal("employeePassword")} />
            </label>
            <div
              className="h-full flex items-center gap-[12px] desktop:hover:text-slate-500 transition-all duration-[500ms] cursor-pointer"
              onClick={() => setEmployeePassModal(true)}
            >
              {cashoutSettings.isEmployeePass ? (
                "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              ) : (
                <p className="italic pr-[3px] text-slate-400 dark:text-slate-500">{t("empty")}</p>
              )}
              <div className="pt-[2px] text-[18px]">&#10095;</div>
            </div>
          </div>

          {/*---merchantGoogleId---*/}
          <div className="settingsField">
            <label className={`${hiddenLabel === "googleId" ? "hidden" : ""} settingsLabel`}>
              {t("google")}
              <IoInformationCircleOutline className="settingsInfo" onClick={() => setInfoModal("googleId")} />
            </label>
            <div className={`${hiddenLabel === "googleId" ? "" : "max-w-[160px]"} w-full settingsInputContainer group`} onClick={() => setFocus("merchantGoogleId")}>
              <input
                {...register("merchantGoogleId")}
                onFocus={() => setHiddenLabel("googleId")}
                onBlur={async () => validateAndSave("merchantGoogleId", "paymentSettings")}
                placeholder={t("empty")}
                className="settingsInput settingsFontFixed peer focus:settingsFontFixedSmall placeholder:settingsFont focus:placeholder:text-transparent peer truncate"
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---2% off---*/}
          <div className="settingsField border-b relative">
            <label className="settingsLabel">
              {t("cashback")}
              <IoInformationCircleOutline className="settingsInfo" onClick={() => setInfoModal("cashback")} />
            </label>
            <Toggle checked={true} onClick={() => setInfoModal("cashback")} />
          </div>

          {/*--- DISPLAY  ---*/}
          <div className="settingsTitle">{t("display")}</div>
          {/*---DARK MODE ---*/}
          <div className="settingsField">
            <label className="">{t("dark")}</label>
            <Toggle
              checked={theme === "dark" ? true : false}
              onClick={() => {
                if (theme === "dark") {
                  setTheme("light");
                  window.localStorage.setItem("theme", "light");
                } else {
                  setTheme("dark");
                  window.localStorage.setItem("theme", "dark");
                }
              }}
            />
          </div>
          {/*---LANGUAGE ---*/}
          <div className="settingsField border-b">
            <label className="">{t("language")}</label>
            <div className="settingsInputContainer group relative">
              <select
                className="settingsSelect settingsFontFixed peer"
                onChange={(e) => {
                  startSwitchingLang(() => router.replace(`/app`, { locale: e.currentTarget.value }));
                }}
                value={`${locale}`}
              >
                {langObjectArray.map((langObject) => (
                  <option key={langObject.id} value={langObject.id} className="px-[12px]">
                    {langObject.text}
                  </option>
                ))}
              </select>
              <div className="settingsRightAngleSelect">&#10095;</div>
            </div>
          </div>

          {/*--- SUPPORT ---*/}
          <div className="settingsTitle">{t("support")}</div>
          {/*--- FAQs ---*/}
          <div className="settingsField hover:text-slate-500 dark:hover:text-slate-500 cursor-pointer transition-all duration-[500ms]" onClick={() => setFaqModal(true)}>
            <div className="cursor-pointer">{t("instructions")}</div>
            <div className="pt-[1px] text-[18px]">&#10095;</div>
          </div>
          {/*--- Contact Us ---*/}
          <div
            className="settingsField border-b hover:text-slate-500 dark:hover:text-slate-500 cursor-pointer transition-all duration-[500ms]"
            onClick={() => setErrorModal(tcommon("contact"))}
          >
            <div className="cursor-pointer">{t("contact")}</div>
            <div className="pt-[1px] text-[18px]">&#10095;</div>
          </div>
          {/*--- can insert feedbackField here (see unused) ---*/}
        </form>

        {/*---Sign Out---*/}
        <button
          onClick={() => {
            setLoggingOut(true);
            logout();
          }}
          className="signoutButton mx-auto my-[48px]"
        >
          {loggingOut ? <Spinner /> : t("signOut")}
        </button>
      </div>

      {infoModal && <InfoModal infoModal={infoModal} setInfoModal={setInfoModal} />}
      {employeePassModal && <EmployeePassModal setEmployeePassModal={setEmployeePassModal} setErrorModal={setErrorModal} isEmployeePass={cashoutSettings.isEmployeePass} />}
      {faqModal && <FaqModal paymentSettings={paymentSettings} cashoutSettings={cashoutSettings} setFaqModal={setFaqModal} />}
      {isSwitchingLang && <SwitchLangModal />}
      {emailModal && <EmailModal defaultEmail={paymentSettings.merchantEmail} setEmailModal={setEmailModal} setErrorModal={setErrorModal} />}
    </section>
  );
}
