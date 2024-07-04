"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

const SaveToHome = () => {
  const [browser, setBrowser] = useState("");
  const [os, setOs] = useState("");

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
    <div className="h-[100dvh] py-6 flex flex-col items-center dark:bg-light2 dark:text-black overflow-y-auto">
      <div className="w-full flex flex-col items-center pb-12 my-auto">
        {/*---image---*/}
        <div className="flex-none relative h-[320px] w-[160px] drop-shadow-[0px_4px_8px_rgb(0,0,0,0.3)] overflow-visible">
          <Image src="/PWA.png" alt="phone" fill />
        </div>
        {/*---text---*/}
        <div className={`${browser && os ? "" : "invisible"} mt-12 flex flex-col items-center`}>
          {/*--- header ---*/}
          <div className="text3xl font-bold">Add To Home Screen</div>
          {/*--- body ---*/}
          <div className="mt-3 portrait:sm:mt-6 landscape:lg:mt-6 textLg2 w-[320px] portrait:sm:w-[440px] landscape:lg:w-[440px] space-y-2 portrait:sm:space-y-4 landscape:lg:space-y-4">
            <div>To install the App, you need to add this website to your home screen.</div>
            <div>
              In your browser{browser === "Safari" ? " menu" : ""}, tap the{" "}
              {os === "ios" ? (
                <span>
                  Share icon{" "}
                  <span className="whitespace-nowrap break-none text-nowrap">
                    (<FontAwesomeIcon icon={faArrowUpFromBracket} className="mx-0.5" />)
                  </span>{" "}
                </span>
              ) : (
                <span>
                  menu icon{" "}
                  <span className="whitespace-nowrap">
                    (<FontAwesomeIcon icon={faEllipsisVertical} className="mx-1" />)
                  </span>
                </span>
              )}{" "}
              and choose <span className="font-bold">Add to Home Screen</span>. Then open the saved website on your home screen.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveToHome;
