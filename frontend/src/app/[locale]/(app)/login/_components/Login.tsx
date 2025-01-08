"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
// wagmi
import { useConnect, useDisconnect } from "wagmi";
// i18n
import { useLocale, useTranslations } from "next-intl";
// components
import MoreOptionsModal from "./MoreOptionsModal";
import SelectLang from "@/utils/components/SelectLang";
// utils
import ErrorModal from "@/utils/components/ErrorModal";
// images
import { PiEyeLight, PiEyeSlashLight, PiGlobeLight, PiCaretDownBold } from "react-icons/pi";
import { ImSpinner2 } from "react-icons/im";
// types
import { MyConnector } from "@/utils/types";

export default function Login({ userTypeFromCookies }: { userTypeFromCookies: string | undefined }) {
  console.log("/login, Login.tsx");

  // hooks
  let { connectAsync, connectors } = useConnect();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("App.Login");
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // states
  const isUsabilityTest = false; // temp
  const [merchantEmail, setMerchantEmail] = useState("");
  const [employeePass, setEmployeePass] = useState("");
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [show, setShow] = useState(false);
  const [userType, setUserType] = useState(userTypeFromCookies ?? "owner");
  const [moreOptionsModal, setMoreOptionsModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [isApple, setIsApple] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState("");

  // redirect to "saveToHome" page if mobile & not standalone
  useEffect(() => {
    console.log("/login useEffect");
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isDesktop && !isStandalone && process.env.NODE_ENV != "development") {
      router.push("/saveAppToHome");
      return;
    }

    // create list of connectors (index is important)
    const isApple = /Mac|iPhone|iPod|iPad/.test(window.navigator.userAgent);
    setIsApple(isApple);

    return () => {
      console.log("/login useEffect cleanup, isLoggingIn set to false");
      setIsLoggingIn(false);
    };
  }, []);

  if (isApple) {
    var myConnectors: MyConnector[] = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Facebook", img: "/facebook.svg", connectorIndex: 1 },
      { name: "Apple", img: "/apple.svg", connectorIndex: 2 },
    ];
    var myConnectorsMore: MyConnector[] = [
      { name: "Telegram", img: "/telegram.svg", connectorIndex: 3 },
      { name: "Line", img: "/line.svg", connectorIndex: 4 },
      { name: "Discord", img: "/discord.svg", connectorIndex: 5 },
    ];
  } else {
    var myConnectors: MyConnector[] = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Facebook", img: "/facebook.svg", connectorIndex: 1 },
    ];
    var myConnectorsMore: MyConnector[] = [
      { name: "Telegram", img: "/telegram.svg", connectorIndex: 2 },
      { name: "Line", img: "/line.svg", connectorIndex: 3 },
      { name: "Discord", img: "/discord.svg", connectorIndex: 4 },
    ];
  }

  const ownerLogin = async (connectorIndex: number) => {
    console.log("/login, clicked ownerLogin");
    setIsLoggingIn(true); // TODO consider deleting

    if (isUsabilityTest) {
      router.push("/intro");
      return;
    }

    await connectAsync({ connector: connectors[connectorIndex] }); // wait for web3Auth.on CONNECT to initiate and redirect to /app
  };

  const employeeLogin = async () => {
    setIsLoggingIn(true);
    try {
      // receive jwt
      const res = await fetch("/api/employeeLogin", {
        method: "POST",
        body: JSON.stringify({ merchantEmail, employeePass }),
        headers: { "content-type": "application/json" },
      });
      const resJson = await res.json();
      // if success
      if (resJson.status == "success") {
        console.log("employee login authenticated");
        router.push("/app");
        // window.location.reload(); // trigger useEffect in page.tsx
      } else if (resJson.status == "error") {
        console.log("Incorrect email or password");
        setErrorModal(resJson.message);
      } else {
        setErrorModal("Server error");
      }
    } catch (e) {
      setErrorModal("Server error");
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="w-full h-screen font-medium textBaseApp flex flex-col items-center overflow-y-auto bg-light2 text-lightText1">
      {/*---showLang mask---*/}
      {langModal && <div className="absolute w-full h-screen left-0 top-0 z-[99]" onClick={() => setLangModal(false)}></div>}

      {/*--- CONTENT CONTAINER (for some reason, pb does not work, so added to last element) ---*/}
      <div className="pt-[12px] w-[320px] portrait:sm:w-[360px] landscape:lg:w-[360px] desktop:!w-[300px] h-full max-h-[900px] flex flex-col items-center my-auto">
        {/*--- LANG/LOGO/MENU CONTAINER ---*/}
        <div className="flex-none w-full h-[39%] min-h-[280px] flex flex-col items-center justify-between">
          {/*--- lang ---*/}
          <div className="h-[38px] ml-auto">
            <SelectLang langModal={langModal} setLangModal={setLangModal} />
          </div>
          {/*--- logo ---*/}
          <div className="pb-[24px] w-full flex flex-col items-center gap-[8px]">
            <div className="relative w-full h-[90px] desktop:h-[75px]">
              <Image src="/logoBlackNoBg.svg" alt="Flash logo" fill />
            </div>
            <div className="text-base desktop:!text-sm tracking-wide text-center">{t("subheader")}</div>
          </div>

          {/*--- menu bar ---*/}
          <div className="w-full h-[56px] desktop:!h-[48px] flex relative">
            <div className="w-full h-full rounded-full shadow-[inset_4px_4px_16px_0px_rgb(84,84,84,0.20),inset_2px_2px_8px_0px_rgb(120,116,140,0.20)] bg-white bg-opacity-20"></div>
            {["owner", "employee"].map((i) => (
              <div
                key={i}
                className={`${userType === i ? "bg-black drop-shadow-md text-white" : "bg-transparent text-gray-500"} ${
                  i === "owner" ? "left-0" : "right-0"
                } absolute w-[52%] h-full cursor-pointer flex items-center justify-center rounded-full z-[1]`}
                onClick={() => setUserType(i)}
              >
                {t(i)}
              </div>
            ))}
          </div>
        </div>

        {/*--- content below MENU ---*/}
        <div className="pt-[24px] pb-[48px] w-full">
          {/*--- FOR OWNERS ---*/}
          {userType == "owner" && (
            <div className="pt-[16px] w-full flex flex-col space-y-[32px] portrait:sm:space-y-[32px] landscape:lg:space-y-[28px]">
              {/*--- connectors: google, facebook, apple ---*/}
              {myConnectors.map((i: MyConnector) => (
                <div
                  key={i.name}
                  className="w-full h-[60px] portrait:sm:h-[68px] landscape:lg:h-[68px] desktop:!h-[56px] flex items-center text-slate-700 bg-white rounded-md desktop:hover:opacity-60 active:opacity-60 border border-gray-200 drop-shadow-md cursor-pointer select-none"
                  onClick={() => {
                    setSelectedSocial(i.name);
                    ownerLogin(i.connectorIndex);
                  }}
                >
                  <div className="relative ml-[20px] mr-[16px] w-[40px] h-[32px]">
                    <Image src={i.img} alt={i.name} fill />
                  </div>
                  <div>{isLoggingIn ? (i.name === selectedSocial ? "Signing in..." : t("signInWith", { socialMedia: i.name })) : t("signInWith", { socialMedia: i.name })}</div>
                </div>
              ))}
            </div>
          )}

          {/*--FOR EMPLOYEES---*/}
          {userType == "employee" && (
            <div className="flex flex-col">
              {/*--email---*/}
              <div className="">{t("email")}</div>
              <input type="email" className="loginInputFont" onBlur={(e) => setMerchantEmail(e.target.value)}></input>
              {/*--password---*/}
              <div className="mt-[16px] portrait:sm:mt-[24px] landscape:lg:mt-[20px] desktop:!mt-[12px]">{t("password")}</div>
              <div className="w-full relative">
                <input
                  ref={passwordRef}
                  type={show ? "text" : "password"}
                  autoComplete="none"
                  autoCapitalize="none"
                  className="loginInputFont peer"
                  onBlur={(e) => setEmployeePass(e.target.value)}
                ></input>
                <div
                  className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-lightText1 [transition:color_500ms]"
                  onClick={() => {
                    setShow(!show);
                    passwordRef.current?.focus();
                  }}
                >
                  {show ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
                </div>
              </div>
              {/*--sign in button---*/}
              <button
                className="buttonPrimary mt-[32px] portrait:sm:mt-[36px] landscape:lg:mt-[36px]desktop:!mt-[32px] w-full flex justify-center items-center"
                onClick={employeeLogin}
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-[16px]">
                    <ImSpinner2 className="animate-spin text-[24px]" />
                    <p>Signing in...</p>
                  </div>
                ) : (
                  t("signIn")
                )}
              </button>
              {/*--forgot password?---*/}
              <div
                className="pt-[48px] textSmApp text-center link"
                onClick={() => {
                  setErrorModal(t("forgotModalText"));
                }}
              >
                {t("forgot")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/*---MODALS---*/}
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
      {moreOptionsModal && <MoreOptionsModal setMoreOptionsModal={setMoreOptionsModal} myConnectorsMore={myConnectorsMore} />}
    </div>
  );
}
