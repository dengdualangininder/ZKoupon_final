"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
// images
import { BsBoxArrowUp } from "react-icons/bs";
import { useTranslations } from "next-intl";

export default function SaveToHome() {
  // states
  const [browser, setBrowser] = useState("");
  const [os, setOs] = useState("");

  // hooks
  const t = useTranslations("App.SaveToHome");

  useEffect(() => {
    // detect browser
    const userAgent = navigator.userAgent;
    if (userAgent.match(/chrome|chromium|crios/i)) {
      setBrowser("Chrome");
    } else if (userAgent.match(/firefox|fxios/i)) {
      setBrowser("Firefox");
    } else if (userAgent.match(/safari/i)) {
      setBrowser("Safari");
    } else if (userAgent.match(/opr\//i)) {
      setBrowser("Opera");
    } else if (userAgent.match(/edg/i)) {
      setBrowser("Edge");
    } else if (userAgent.match(/samsungbrowser/i)) {
      setBrowser("Samsung");
    } else if (userAgent.match(/ucbrowser/i)) {
      setBrowser("UC");
    } else {
      setBrowser("other");
    }
    // detect os
    if (/Android/i.test(navigator.userAgent)) {
      setOs("android");
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setOs("ios");
    } else {
      setOs("other");
    }
  }, []);

  return (
    <div className="h-[100dvh] py-[24px] flex flex-col items-center dark:bg-light1 dark:text-lightText1 overflow-y-auto">
      <div className="w-full flex flex-col items-center pb-[48px] my-auto">
        {/*---image---*/}
        <div className="flex-none relative h-[320px] w-[160px] rounded-[16px] shadow-[0px_2px_20px_0px_rgb(0,0,0,0.3)]">
          <Image src="/PWA.png" alt="phone showing homescreen" fill />
        </div>
        {/*---text---*/}
        <div className={`${browser && os ? "" : "invisible"} mt-[48px] flex flex-col items-center`}>
          {/*--- header ---*/}
          <div className="textXlApp font-bold">{t("title")}</div>
          {/*--- body ---*/}
          <div className="mt-[12px] portrait:sm:mt-[24px] landscape:lg:mt-[24px] textBaseApp w-[320px] portrait:sm:w-[440px] landscape:lg:w-[440px] space-y-2 portrait:sm:space-y-4 landscape:lg:space-y-4">
            <div>{t("text-1")}</div>
            <div>
              {t.rich("text-2", {
                span1: (chunks) => <span className="whitespace-nowrap">{chunks}</span>,
                span2: (chunks) => <span className="font-bold">{chunks}</span>,
                icon: () => <BsBoxArrowUp className="inline-block mx-[2px] text-xl" />,
                location: os === "ios" ? t("bottomMenu") : t("topRight"),
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
