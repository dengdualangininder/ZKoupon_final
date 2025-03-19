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
// react query
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ImSpinner2 } from "react-icons/im";
// utils
import Toggle from "@/utils/components/Toggle";
import { countryData, countryCurrencyList, langObjectArray } from "@/utils/constants";
import { W3Info } from "@/utils/types";
import { PaymentSettings, CashoutSettings } from "@/db/UserModel";
import EmailModal from "./(settings)/EmailModal";

// zod
const schema = z.object({
  merchantName: z.string().min(1, { message: "merchantName" }), // Enter a business name
  merchantCountryAndCurrency: z.string(),
  cex: z.string(),
  cexEvmAddress: z
    .string({ errorMap: () => ({ message: "cexEvmAddress" }) }) // Address must start with 0x and be 42 characters long
    .startsWith("0x")
    .length(42)
    .or(z.literal("")),
  employeePass: z
    .string({ errorMap: () => ({ message: "employeePass" }) }) // Password must be \u2265 8 characters and contain an uppercase letter, a lowercase letter, and a number.
    .min(8)
    .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"))
    .or(z.literal("")),
  merchantGoogleId: z.string(),
});
type FormFields = z.infer<typeof schema>;

export default function Settings({ paymentSettings, cashoutSettings, setErrorModal }: { paymentSettings: PaymentSettings; cashoutSettings: CashoutSettings; setErrorModal: any }) {
  console.log("/app Settings.tsx");

  // hooks
  const router = useRouter();
  const w3Info = useW3Info();
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations("App.Settings");
  const tcommon = useTranslations("Common");
  const queryClient = useQueryClient();
  const merchantNameRef = useRef<HTMLInputElement | null>(null);
  const [isSwitchingLang, startSwitchingLang] = useTransition();
  const logout = useLogout();

  // react-hook-form & zod
  const {
    register,
    trigger,
    getValues,
    setValue,
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
      employeePass: "",
      merchantGoogleId: paymentSettings.merchantGoogleId,
    },
  });
  const { ref: refMerchantName, ...restMerchantName } = register("merchantName");

  const { mutate: saveSettings } = useSettingsMutation();
  const { mutate: saveEmployeePass } = useMutation({
    mutationFn: async ({ employeePass, w3Info }: { employeePass: string; w3Info: W3Info | null }) => {
      console.log("saveEmployeePass mutationFn ran", employeePass);
      const res = await fetch("/api/saveEmployeePass", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ employeePass, w3Info }),
      });
      if (!res.ok) throw new Error("error");
      const resJson = await res.json();
      if (resJson === "not verified") await logout();
      if (resJson === "error") throw new Error("error");
    },
    onSuccess: () => {
      console.log("saveEmployeePass onSuccess => settingsQuery invalidated");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => {
      console.log("saveEmployeePass onError => reset");
      reset();
    },
  });

  // states
  const [popup, setPopup] = useState("");
  const [employeePassMask, setEmployeePassMask] = useState(true);
  const [isClicked, setIsClicked] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  // modal states
  const [faqModal, setFaqModal] = useState(false);
  const [employeePassModal, setEmployeePassModal] = useState(false);
  const [infoModal, setInfoModal] = useState<string | null>(null); // employeePassword | googleId | cashback
  const [hiddenLabel, setHiddenLabel] = useState(""); // googleId | cexEvmAddress
  const [hideCexEvmAddress, setHideCexEvmAddress] = useState<boolean>(cashoutSettings.cex === "Coinbase" && paymentSettings.merchantCountry != "Other"); // needed for optimistic update
  // email qr code
  const [email, setEmail] = useState(paymentSettings.merchantEmail);
  const [isSendingEmail, setIsSendingEmail] = useState("initial"); // "initial" | "sending" | "sent"
  const [emailModal, setEmailModal] = useState(false);

  const onClickChangeEmployeePass = useCallback(async () => {
    setEmployeePassMask(false);
    setEmployeePassModal(false);
    setValue("employeePass", "");
    setFocus("employeePass");
  }, []);

  // this function only applies to 1) mechantEmail, 2) merchantName, 3) cexEvmAddress, 4) merchantGoogleId
  async function validateAndSave(key: keyof FormFields, settingsType?: string) {
    setIsClicked(null); // not entirely efficient, as this is only applicable to merchantEmail and merchantName
    setHiddenLabel(""); // not entirely efficient, as this is only applicable to cexEvmAddress and merchantGoogleId
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
      } else if (key === "employeePass") {
        saveEmployeePass({ employeePass: value, w3Info });
        setValue("employeePass", "");
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

  const emailQrCode = async () => {
    // check if valid email
    if (!email.split("@")[1]?.includes(".")) {
      setErrorModal(t("emailModal.errors.validEmail"));
      return;
    }

    setIsSendingEmail("sending");

    // create PDF file blob
    const el = document.getElementById("qrCodeForDownload");
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
    try {
      const res = await fetch("/api/emailQrCode", {
        method: "POST",
        body: JSON.stringify({ merchantEmail: email, dataString }),
      });
      const resJson = await res.json();
      if (resJson === "email sent") {
        setIsSendingEmail("sent");
        return;
      }
    } catch (e) {}
    setErrorModal(t("emailModal.errors.notSend"));
    setIsSendingEmail("initial");
  };

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
    saveAs(blob, "Flash_QRCode");
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
              className="settingsFontFixed flex items-center desktop:cursor-pointer active:text-slate-500 desktop:hover:text-slate-500 desktop:transition-all desktop:duration-[300ms] relative"
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
            <label className="textGray">{t("email")}</label>
            <div className="settingsFontFixed text-end">{paymentSettings.merchantEmail}</div>
          </div>

          <div className="settingsTitle">{t("settings")}</div>

          {/*---merchantName---*/}
          <div className="settingsField">
            <label className="settingsLabel">{t("name")}</label>
            <div
              className="settingsInputContainer group w-full max-w-[280px] portrait:sm:max-w-[380px] landscape:lg:max-w-[380px] desktop:!max-w-[320px]"
              onClick={() => {
                if (merchantNameRef.current && isClicked != "merchantName") {
                  setIsClicked("merchantName");
                  const end = merchantNameRef.current.value.length;
                  merchantNameRef.current.setSelectionRange(end, end);
                  merchantNameRef.current.focus();
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
                className="settingsInput settingsFontFixed peer"
              ></input>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*--- merchantCountry / merchantCurrency ---*/}
          <div className="settingsField">
            <label className="settingsLabel">{t("country")}</label>
            <div className="settingsInputContainer group">
              <select
                className="settingsSelect settingsFontFixed peer"
                {...register("merchantCountryAndCurrency")}
                onChange={async (e) => {
                  // TODO: focus select element when rightAngle clicked
                  const [merchantCountry, merchantCurrency] = e.target.value.split(" / ");
                  const cex = merchantCountry === "Other" ? "" : countryData[merchantCountry].CEXes[0];
                  cex === "Coinbase" || merchantCountry === "Other" ? setHideCexEvmAddress(true) : setHideCexEvmAddress(false); // optimistic update
                  const qrCodeUrl = `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=${
                    paymentSettings.merchantPaymentType
                  }&merchantName=${encodeURI(paymentSettings.merchantName)}&merchantCurrency=${merchantCurrency}&merchantEvmAddress=${paymentSettings.merchantEvmAddress}`;
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
                }}
              >
                {countryCurrencyList.map((i, index) => (
                  <option key={index} className="px-[16px]">
                    {i}
                  </option>
                ))}
              </select>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*---cex---*/}
          {paymentSettings.merchantCountry != "Other" && (
            <div className="settingsField">
              <label className="settingsLabel">{t("platform")}</label>
              <div className="settingsInputContainer group">
                <select
                  className="settingsSelect settingsFontFixed peer"
                  {...register("cex")}
                  onChange={(e) => {
                    // focus select element when rightAngle clicked
                    e.currentTarget.value === "Coinbase" || paymentSettings.merchantCountry === "Other" ? setHideCexEvmAddress(true) : setHideCexEvmAddress(false); // optimistic update
                    saveSettings({ changes: { "cashoutSettings.cex": e.currentTarget.value, "cashoutSettings.cexEvmAddress": "" }, w3Info });
                    window.localStorage.removeItem("cbRefreshToken");
                    window.sessionStorage.removeItem("cbAccessToken");
                    e.target.closest("select")?.blur(); // makes outline disappear after item selected
                  }}
                >
                  {countryData[paymentSettings.merchantCountry].CEXes.map((i, index) => (
                    <option key={index} className="px-[16px]">
                      {i}
                    </option>
                  ))}
                </select>
                <div className="settingsRightAngle">&#10095;</div>
              </div>
            </div>
          )}

          {/*---cexEvmAddress---*/}
          <div className={`${hideCexEvmAddress ? "hidden" : ""} settingsField`}>
            <label className={`${hiddenLabel === "cexEvmAddress" ? "hidden" : ""} settingsLabel w-[160px] sm:w-auto leading-tight`}>
              {t("platformAddress")}
              <IoInformationCircleOutline size={20} className="settingsInfo" onClick={() => setInfoModal("cexDepositAddress")} />
            </label>
            <div
              className={`${hiddenLabel === "cexEvmAddress" ? "w-full" : "w-[148px] portrait:sm:w-[204px] landscape:lg:w-[204px] desktop:!w-[150px]"} settingsInputContainer group`}
              onClick={() => setFocus("cexEvmAddress")}
            >
              <input
                {...register("cexEvmAddress")}
                onFocus={() => setHiddenLabel("cexEvmAddress")}
                onBlur={async () => validateAndSave("cexEvmAddress", "cashoutSettings")}
                autoComplete="none"
                placeholder={t("empty")}
                className="settingsInput settingsFontFixed peer focus:settingsFontFixedSmall placeholder:settingsFont focus:placeholder:text-transparent peer truncate"
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
            <div className="relative w-full max-w-[280px] desktop:max-w-[240px] h-full">
              {/*--- employeePassMask ---*/}
              <div
                className={`${employeePassMask ? "" : "hidden"} absolute w-full h-full flex items-center cursor-pointer z-[1]`}
                onClick={() => (cashoutSettings.isEmployeePass ? setEmployeePassModal(true) : onClickChangeEmployeePass())}
              >
                <div className="peer w-full h-full px-[12px] text-end rounded-md flex items-center justify-end desktop:hover:text-slate-500 transition-all duration-[300ms]">
                  {cashoutSettings.isEmployeePass ? (
                    "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  ) : (
                    <div className="italic pr-[3px] text-slate-400 dark:text-slate-500">{t("empty")}</div>
                  )}
                </div>
                <div className="pt-[2px] text-[18px] desktop:peer-hover:text-slate-500 transition-all duration-[300ms]">&#10095;</div>
              </div>
              {/*--- input ---*/}
              <div className={`w-full h-full flex items-center cursor-pointer`}>
                <input
                  {...register("employeePass")}
                  className="settingsInput settingsFontFixed"
                  onBlur={async () => {
                    validateAndSave("employeePass");
                    setEmployeePassMask(true);
                  }}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/*---merchantGoogleId---*/}
          <div className="settingsField">
            <label className={`${hiddenLabel === "googleId" ? "hidden" : ""} settingsLabel`}>
              {t("google")}
              <IoInformationCircleOutline className="settingsInfo" onClick={() => setInfoModal("googleId")} />
            </label>
            <div
              className={`${hiddenLabel === "googleId" ? "w-full" : "w-[148px] portrait:sm:w-[204px] landscape:lg:w-[204px] desktop:!w-[150px]"} settingsInputContainer group`}
              onClick={() => setFocus("merchantGoogleId")}
            >
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
          {paymentSettings.merchantPaymentType === "inperson" && (
            <div className="settingsField border-b relative">
              <label className="settingsLabel">
                {t("cashback")}
                <IoInformationCircleOutline className="settingsInfo" onClick={() => setInfoModal("cashback")} />
              </label>
              <Toggle checked={true} onClick={() => setInfoModal("cashback")} />
            </div>
          )}

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
            <div className="settingsInputContainer group">
              <select
                className="settingsSelect settingsFontFixed peer"
                onChange={(e) => {
                  startSwitchingLang(() => router.replace(`/app`, { locale: e.currentTarget.value }));
                }}
                value={`${locale}`}
              >
                {langObjectArray.map((langObject) => (
                  <option key={langObject.id} value={langObject.id} className="px-[16px]">
                    {langObject.text}
                  </option>
                ))}
              </select>
              <div className="settingsRightAngle">&#10095;</div>
            </div>
          </div>

          {/*--- SUPPORT ---*/}
          <div className="settingsTitle">{t("support")}</div>
          {/*--- FAQs ---*/}
          <div
            className="settingsField desktop:hover:text-slate-500 dark:desktop:hover:text-slate-500 cursor-pointer transition-all duration-[300ms]"
            onClick={() => setFaqModal(true)}
          >
            <div className="cursor-pointer">{t("instructions")}</div>
            <div className="pt-[1px] text-[18px]">&#10095;</div>
          </div>
          {/*--- Contact Us ---*/}
          <div
            className="settingsField border-b desktop:hover:text-slate-500 dark:desktop:hover:text-slate-500 cursor-pointer transition-all duration-[300ms]"
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
          {loggingOut ? <ImSpinner2 className="animate-spin text-[28px] text-slate-300" /> : t("signOut")}
        </button>
      </div>

      {infoModal && <InfoModal infoModal={infoModal} setInfoModal={setInfoModal} />}
      {employeePassModal && <EmployeePassModal setEmployeePassModal={setEmployeePassModal} onClickChangeEmployeePass={onClickChangeEmployeePass} />}
      {faqModal && <FaqModal paymentSettings={paymentSettings} cashoutSettings={cashoutSettings} setFaqModal={setFaqModal} />}
      {isSwitchingLang && <SwitchLangModal />}
      {emailModal && (
        <EmailModal
          setEmailModal={setEmailModal}
          emailQrCode={emailQrCode}
          isSendingEmail={isSendingEmail}
          email={email}
          setEmail={setEmail}
          setIsSendingEmail={setIsSendingEmail}
        />
      )}
    </section>
  );
}
