import { useState, useRef } from "react";
// hook-form & zod
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
// others
import { useLocale, useTranslations } from "next-intl";
import { IoInformationCircleOutline } from "react-icons/io5";
import { paymentSettings, cashoutSettings } from "@/utils/constants";

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

export default function Zod() {
  // if you need input element to be associated with a ref, must create one
  const merchantNameRef = useRef<HTMLInputElement | null>(null);

  // hooks
  const t = useTranslations("App.Settings");

  // react-hook-form & zod
  const {
    register,
    trigger,
    getValues,
    setValue, // instead of setState, can use setValue(key, value), where key is a key in "schema". Usually not needed.
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

  // states
  const [popup, setPopup] = useState("");
  const [employeePassMask, setEmployeePassMask] = useState(true);
  const [isFocused, setIsFocused] = useState<string | null>(null); // needed so that subsequent clicks on input does not right-align cursor
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

  async function validateAndSave(key: keyof FormFields, settingsType?: string) {
    setIsFocused(null); // only applies to merchantName
    setHiddenLabel(""); // only applies to cexEvmAddress and merchantGoogleId
    const isValid = await trigger(key); // zod validation
    if (isValid) {
      const value = getValues(key);
      // proceed to save "key" and "value" to database
    } else {
      // if error, then display error modal. alternatively, display error below <input>
      let msg = "Error";
      if (errors[key]?.message === key) {
        msg = t(`zodErrors.${key}`);
      }
      // setErrorModal(msg);
      reset();
    }
  }

  return (
    <div>
      {/*---merchantName---*/}
      <div className="settingsField">
        <label className="settingsLabel">{t("name")}</label>
        <div
          className="settingsInputContainer group w-full"
          onClick={() => {
            if (merchantNameRef.current && isFocused != "merchantName") {
              setIsFocused("merchantName");
              const end = merchantNameRef.current.value.length;
              merchantNameRef.current.setSelectionRange(end, end);
            }
          }}
        >
          <input
            {...restMerchantName}
            ref={(e) => {
              refMerchantName(e);
              merchantNameRef.current = e;
            }} // do this to set up own ref, normal way will conflict with react-hook-form
            onBlur={async () => validateAndSave("merchantName", "paymentSettings")}
            autoComplete="off"
            className="settingsInput settingsFontFixed peer truncate"
          ></input>
          <div className="settingsRightAngle">&#10095;</div>
        </div>
      </div>

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
    </div>
  );
}
