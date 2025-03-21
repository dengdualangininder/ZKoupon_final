import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
// qr code
import { pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer/lib/react-pdf.browser";
import Placard from "../placard/Placard";
// assets
import { FaAngleLeft, FaCircleCheck } from "react-icons/fa6";
import Spinner from "@/utils/components/Spinner";

export default function EmailModal({ defaultEmail, setEmailModal, setErrorModal }: { defaultEmail: string; setEmailModal: any; setErrorModal: any }) {
  // hooks
  const t = useTranslations("App.Settings");
  const tcommon = useTranslations("Common");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);

  //states
  const [email, setEmail] = useState(defaultEmail);
  const [isSendingEmail, setIsSendingEmail] = useState("initial"); // "initial" | "sending" | "sent"

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
    if (!e.currentTarget.value.split("@")[1]?.includes(".")) {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  };

  const emailQrCode = async () => {
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

  return (
    <div>
      <div className="fullModal">
        {/*--- CLOSE/BACK BUTTON ---*/}
        {isSendingEmail != "sending" && (
          <>
            {/*--- tablet/desktop close ---*/}
            <div className="xButtonContainer" onClick={() => setEmailModal(false)}>
              <div className="xButton">&#10005;</div>
            </div>
            {/*--- mobile back ---*/}
            <FaAngleLeft className="mobileBack" onClick={() => setEmailModal(false)} />
          </>
        )}

        {/*--- header ---*/}
        <div className="fullModalHeader">{t("emailModal.title")}</div>

        {/*---content---*/}
        <div className="fullModalContentContainer">
          <div className="fullModalContentContainer2 max-w-[480px] desktop:max-w-[430px]">
            <div className="mt-[32px]">{t("emailModal.text")}</div>
            <label className="mt-[32px] appInputLabel">{tcommon("email")}</label>
            <div className="flex items-center relative">
              <input className="appInput pr-[42px] w-full peer" ref={inputRef} onChange={onChangeEmail} value={email} placeholder="Enter an email address" />
              {email && (
                <div
                  className="absolute w-[32px] h-[32px] flex items-center justify-center right-[10px] cursor-pointer desktop:hover:text-slate-500 peer-focus:hidden"
                  onClick={() => {
                    setEmail("");
                    setIsEmailValid(false);
                    inputRef.current?.focus();
                  }}
                >
                  &#10005;
                </div>
              )}
            </div>
            {/*---button---*/}
            <div className="w-full pt-[50px] pb-[16px] flex justify-center items-center">
              {isSendingEmail == "initial" && (
                <button
                  className="appButton1 w-full disabled:bg-slate-500 disabled:border-slate-500 disabled:pointer-events-none"
                  onClick={emailQrCode}
                  disabled={isEmailValid ? false : true}
                >
                  {t("emailModal.sendEmail")}
                </button>
              )}
              {isSendingEmail == "sending" && (
                <div className="appButton1 w-full">
                  <Spinner />
                </div>
              )}
              {isSendingEmail == "sent" && (
                <div className="appButtonHeight flex items-center justify-center gap-[12px]">
                  <FaCircleCheck className="inline-block text-green-500 text-[1.4em]" />
                  {t("emailModal.sent")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
