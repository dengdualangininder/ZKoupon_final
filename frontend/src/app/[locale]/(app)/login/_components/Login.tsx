"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
// wagmi
import { useConnect } from "wagmi";
// i18n
import { useTranslations } from "next-intl";
// components
import MoreOptionsModal from "./MoreOptionsModal";
import SelectLang from "@/utils/components/SelectLang";
// utils
import ErrorModal from "@/utils/components/ErrorModal";
// images
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import { ImSpinner2 } from "react-icons/im";
// types
import { MyConnector } from "@/utils/types";
import { SpinningCircleGraySm } from "@/utils/components/SpinningCircleGray";

export default function Login({ userTypeFromCookies }: { userTypeFromCookies: string | undefined }) {
  console.log("(app)/login/_components/Login.tsx");

  // hooks
  let { connectAsync, connectors } = useConnect();
  const router = useRouter();
  const t = useTranslations("App.Login");
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // states
  const [merchantEmail, setMerchantEmail] = useState("");
  const [employeePass, setEmployeePass] = useState("");
  const [show, setShow] = useState(false); // eye - show/hide password
  const [userType, setUserType] = useState(userTypeFromCookies ?? "owner");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState("");
  const [myConnectors, setMyConnectors] = useState<MyConnector[]>([
    { name: "Google", img: "/google.svg", connectorIndex: 0 },
    { name: "Facebook", img: "/facebook.svg", connectorIndex: 1 },
  ]);
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);

  // redirect to "saveToHome" page if mobile & not standalone
  useEffect(() => {
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isDesktop && !isStandalone && process.env.NODE_ENV != "development") {
      router.push("/saveAppToHome");
      return;
    }
  }, []);

  // if Apple, add Apple social login
  useEffect(() => {
    const isApple = /Mac|iPhone|iPod|iPad/.test(window.navigator.userAgent);
    if (isApple && myConnectors.length === 2) setMyConnectors([...myConnectors, { name: "Apple", img: "/apple.svg", connectorIndex: 2 }]);
  }, []);

  const ownerLogin = async (connectorIndex: number) => {
    setIsLoggingIn(true);
    try {
      await connectAsync({ connector: connectors[connectorIndex] }); // wait for web3Auth.on CONNECT to initiate and redirect to /app
    } catch (e) {
      console.log(e);
      setSelectedSocial("");
      setIsLoggingIn(false);
    }
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
      if (resJson.status == "success") {
        console.log("employee login authenticated, pushed to /app");
        router.push("/app");
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
    <div className="w-full h-screen flex flex-col items-center overflow-y-auto text-lg desktop:text-sm bg-light2 text-lightText1">
      {/*---showLang mask---*/}
      {langModal && <div className="absolute w-full h-screen left-0 top-0 z-[99]" onClick={() => setLangModal(false)}></div>}

      {/*--- CONTENT CONTAINER (for some reason, pb does not work, so added to last element) ---*/}
      <div className="pt-[12px] w-[320px] desktop:w-[280px] h-full max-h-[900px] flex flex-col items-center my-auto">
        {/*--- LANG/LOGO/MENU CONTAINER ---*/}
        <div className="flex-none w-full h-[38%] min-h-[280px] flex flex-col items-center justify-between">
          {/*--- lang ---*/}
          <div className="h-[38px] ml-auto">
            <SelectLang langModal={langModal} setLangModal={setLangModal} />
          </div>
          {/*--- logo ---*/}
          <div className="pb-[24px] desktop:pb-[16px] w-full flex flex-col items-center gap-[8px]">
            <div className="relative w-full h-[80px] desktop:h-[75px]">
              <Image src="/logoBlackNoBg.svg" alt="Flash logo" fill />
            </div>
            <div className="text-base desktop:text-xs font-medium tracking-wide text-center">{t("subheader")}</div>
          </div>

          {/*--- menu bar ---*/}
          <div className="pb-[16px] desktop:pb-[12px] w-full grid grid-cols-2 justify-items-center font-semibold">
            {["owner", "employee"].map((i) => (
              <div
                key={i}
                className={`${userType === i ? "" : "text-slate-400"} w-full h-[40px] desktop:h-[32px] flex justify-center cursor-pointer relative`}
                onClick={() => setUserType(i)}
              >
                {t(i)}
                <div
                  className={`${userType === i ? "bg-lightText1" : "bg-slate-300"} ${
                    userType === "owner" ? "rounded-l-md" : "rounded-r-md"
                  } absolute left-0 bottom-0 w-full h-[4px] cursor-pointer`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/*--- content below MENU ---*/}
        <div className="pt-[24px] pb-[48px] w-full">
          {/*--- FOR OWNERS ---*/}
          {userType == "owner" && (
            <div className="pt-[16px] w-full flex flex-col gap-[32px] desktop:gap-[24px]">
              {/*--- connectors: google, facebook, apple ---*/}
              {myConnectors.map((i: MyConnector) => (
                <div
                  key={i.name}
                  className="w-full h-[64px] desktop:h-[52px] flex items-center font-medium text-slate-700 bg-white rounded-[8px] desktop:hover:drop-shadow-sm active:drop-shadow-sm border border-slate-200 drop-shadow-md cursor-pointer select-none"
                  onClick={() => {
                    setSelectedSocial(i.name);
                    ownerLogin(i.connectorIndex);
                  }}
                >
                  <div className="relative ml-[20px] mr-[16px] w-[40px] h-[32px] desktop:h-[26px]">
                    <Image src={i.img} alt={i.name} fill />
                  </div>
                  <div>
                    {isLoggingIn ? (
                      i.name === selectedSocial ? (
                        <div className="flex items-center">
                          <SpinningCircleGraySm />
                          <p>&nbsp;&nbsp;Signing in...</p>
                        </div>
                      ) : (
                        t("signInWith", { socialMedia: i.name })
                      )
                    ) : (
                      t("signInWith", { socialMedia: i.name })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/*--FOR EMPLOYEES---*/}
          {userType == "employee" && (
            <div className="flex flex-col">
              {/*--email---*/}
              <div className="loginLabel">{t("email")}</div>
              <input type="email" className="loginInput" onBlur={(e) => setMerchantEmail(e.target.value)}></input>
              {/*--password---*/}
              <div className="mt-[16px] loginLabel">{t("password")}</div>
              <div className="w-full relative">
                <input
                  ref={passwordRef}
                  type={show ? "text" : "password"}
                  autoComplete="none"
                  autoCapitalize="none"
                  className="loginInput peer"
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
              <button className="loginButton mt-[32px] w-full flex justify-center items-center" onClick={employeeLogin}>
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
                className="pt-[40px] text-lg desktop:text-sm text-center link"
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

      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </div>
  );
}
