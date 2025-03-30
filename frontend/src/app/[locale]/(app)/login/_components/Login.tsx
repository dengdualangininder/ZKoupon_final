"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
// others
import { useConnect } from "wagmi";
import { useTranslations } from "next-intl";
// images
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import { ImSpinner2 } from "react-icons/im";
// utils
import SelectLang from "@/utils/components/SelectLang";
import ErrorModalLight from "@/utils/components/ErrorModalLight";
import { MyConnector } from "@/utils/types";
import { SpinningCircleGraySm } from "@/utils/components/SpinningCircleGray";
import { setCookieAction } from "@/utils/actions";

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
      const res = await fetch("/api/employeeLogin", {
        method: "POST",
        body: JSON.stringify({ merchantEmail, employeePass }),
        headers: { "content-type": "application/json" },
      });
      const resJson = await res.json();
      if (resJson === "success") {
        router.push("/app");
        return;
      } else if (resJson.status === "error") {
        setErrorModal(resJson.message);
        setIsLoggingIn(false);
      }
    } catch (e) {}
    setErrorModal("Server error");
    setIsLoggingIn(false);
  };

  return (
    <div className="w-full h-screen flex justify-center overflow-y-auto textBaseApp bg-light2 text-lightText1">
      <div className="pt-[12px] px-[24px] w-full max-w-[440px] desktop:max-w-[360px] h-full max-h-[900px] flex flex-col items-center my-auto">
        {/*--- LANG/LOGO/MENU CONTAINER ---*/}
        <div className="flex-none w-full h-[34%] min-h-[240px] flex flex-col items-center justify-between">
          {/*--- lang ---*/}
          <div className="h-[38px] ml-auto z-[2]">
            <SelectLang langModal={langModal} setLangModal={setLangModal} />
          </div>
          {langModal && <div className="fixed left-0 top-0 w-screen h-screen z-[1]" onClick={() => setLangModal(false)}></div>}

          {/*--- logo ---*/}
          <div className="w-full flex flex-col items-center gap-[8px]">
            <div className="relative w-full h-[58px] portrait:sm:h-[64px] landscape:lg:h-[64px] desktop:h-[50px]!">
              <Image src="/logoBlackNoBg.svg" alt="logo" fill priority />
            </div>
            <div className="textSmApp font-medium text-center">{t("subheader")}</div>
          </div>

          {/*--- menu bar ---*/}
          <div className="w-full grid grid-cols-2 justify-items-center font-semibold">
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
                  } absolute left-0 bottom-[-4px] w-full h-[4px] cursor-pointer`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/*--- content below MENU ---*/}
        <div className="pt-[40px] pb-[48px] w-full">
          {/*--- FOR OWNERS ---*/}
          {userType == "owner" && (
            <div className="pt-[16px] w-full flex flex-col gap-[32px]">
              {myConnectors.map((i: MyConnector) => (
                <div
                  key={i.name}
                  className="w-full h-[68px] desktop:h-[54px] flex items-center text-slate-600 font-medium bg-white rounded-[8px] shadow-md hover:shadow-lg active:shadow-lg transition-all duration-300 cursor-pointer select-none"
                  onClick={async () => {
                    await setCookieAction("userType", "owner");
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
              <label className="appInputLabel">{t("email")}</label>
              <input type="email" className="appInputLightPx w-full" onBlur={(e) => setMerchantEmail(e.target.value)}></input>
              {/*--password---*/}
              <label className="mt-[24px] appInputLabel">{t("password")}</label>
              <div className="w-full relative">
                <input
                  ref={passwordRef}
                  type={show ? "text" : "password"}
                  autoComplete="off"
                  autoCapitalize="off"
                  className="appInputLightPx w-full peer"
                  onBlur={(e) => setEmployeePass(e.target.value)}
                ></input>
                <div
                  className="loginEyeContainer"
                  onClick={() => {
                    setShow(!show);
                    passwordRef.current?.focus();
                  }}
                >
                  {show ? <PiEyeLight /> : <PiEyeSlashLight />}
                </div>
              </div>
              {/*--sign in button---*/}
              <button className="appButton1Light mt-[40px] w-full flex justify-center items-center" onClick={employeeLogin}>
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
                className="mx-auto mt-[60px] desktop:mt-[50px] textSmApp linkLight"
                onClick={() => {
                  setErrorModal(t("forgotModalText"));
                  localStorage.clear();
                }}
              >
                {t("forgot")}
              </div>
            </div>
          )}
        </div>
      </div>

      {errorModal && <ErrorModalLight errorModal={errorModal} setErrorModal={setErrorModal} />}
    </div>
  );
}
