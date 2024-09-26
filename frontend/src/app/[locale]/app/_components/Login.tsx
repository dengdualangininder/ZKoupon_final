"use client";
// nextjs
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
// other
import { useConnect } from "wagmi";
import { useLocale, useTranslations } from "next-intl";
// components
import ErrorModalLight from "./modals/ErrorModalLight";
// constants
import { langObjectArray } from "@/utils/constants";
// images
import { SpinningCircleWhiteLarge } from "@/utils/components/SpinningCircleWhite";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faBars, faCaretDown, faGlobe, faX } from "@fortawesome/free-solid-svg-icons";
// images
import { FaBars, FaCaretDown, FaX } from "react-icons/fa6";
import { SlGlobe } from "react-icons/sl";

const Login = ({ setPage, isUsabilityTest }: { setPage: any; isUsabilityTest: boolean }) => {
  const [merchantEmail, setMerchantEmail] = useState("");
  const [employeePass, setEmployeePass] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [show, setShow] = useState(false);
  const [userType, setUserType] = useState("owners");
  const [moreOptionsModal, setMoreOptionsModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLangs, setShowLangs] = useState(false);

  // hooks
  let { connectAsync, connectors } = useConnect();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("App.Login");

  // include AppleID login or not
  const isApple = /Mac|iPhone|iPod|iPad/.test(window.navigator.userAgent);
  if (isApple) {
    var myConnectors = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Facebook", img: "/facebook.svg", connectorIndex: 1 },
      { name: "Apple", img: "/apple.svg", connectorIndex: 2 },
    ];
    var myConnectorsMore = [
      { name: "Telegram", img: "/telegram.svg", connectorIndex: 3 },
      { name: "Line", img: "/line.svg", connectorIndex: 4 },
      { name: "Discord", img: "/discord.svg", connectorIndex: 5 },
    ];
  } else {
    var myConnectors = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Facebook", img: "/facebook.svg", connectorIndex: 1 },
    ];
    var myConnectorsMore = [
      { name: "Telegram", img: "/telegram.svg", connectorIndex: 2 },
      { name: "Line", img: "/line.svg", connectorIndex: 3 },
      { name: "Discord", img: "/discord.svg", connectorIndex: 4 },
    ];
  }

  const employeeLogin = async () => {
    setIsLoggingIn(true);
    try {
      // receive jwt
      const res = await fetch("/api/employeeLogin", {
        method: "POST",
        body: JSON.stringify({ merchantEmail, employeePass }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      // if success
      if (data.status == "success") {
        console.log("employee login authenticated");
        setPage("loading");
        window.location.reload(); // trigger useEffect in page.tsx
      } else if (data.status == "error") {
        console.log("Incorrect email or password");
        setErrorModal(true);
        setErrorMsg(data.message);
      } else {
        setErrorModal(true);
        setErrorMsg("Error: Could not connect to server API");
      }
    } catch (err) {
      console.log("failed to login");
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="w-full h-screen font-medium text-lg landscape:xl:desktop:text-base flex flex-col items-center overflow-y-auto bg-light2 text-black">
      {/*---showLang mask---*/}
      {showLangs && <div className="absolute w-full h-screen left-0 top-0 z-[99]" onClick={() => setShowLangs(false)}></div>}
      <div className="w-[344px] portrait:sm:w-[340px] landscape:lg:w-[340px] landscape:xl:desktop:w-[300px] h-full max-h-[800px] portrait:sm:max-h-[900px] landscape:lg:max-h-[900px] flex flex-col items-center my-auto">
        {/*--- lang + logo + menu bar ---*/}
        <div className="flex-none w-full h-[40%] min-h-[280px] landscape:lg:min-h-[300px] flex flex-col justify-between">
          {/*--- lang ---*/}
          <div className="flex-none h-[60px] w-full flex justify-end items-end">
            <div
              className={`${
                showLangs ? "bg-slate-300 rounded-br-none rounded-bl-none" : ""
              } p-[12px] flex items-center desktop:hover:bg-slate-300 rounded-md relative cursor-pointer `}
              onClick={() => setShowLangs(!showLangs)}
            >
              <SlGlobe size={40} className="mr-[4px] w-[24px] h-[24px] landscape:xl:desktop:w-[22px] landscape:xl:desktop:h-[22px]" />
              <FaCaretDown size={40} className="w-[20px] h-[20px] landscape:xl:desktop:w-[18px] landscape:xl:desktop:h-[18px]" />
              {showLangs && (
                <div className="absolute top-[calc(100%)] right-0 rounded-md rounded-tr-none p-[32px] space-y-[32px] text-xl landscape:xl:desktop:text-base font-medium bg-slate-300 z-[100]">
                  {langObjectArray.map((langObject) => (
                    <div
                      key={langObject.id}
                      className={`${
                        langObject.id == locale ? "underline decoration-[2px] underline-offset-[8px]" : ""
                      } xl:desktop:hover:underline xl:desktop:hover:decoration-[2px] xl:desktop:hover:underline-offset-[8px] cursor-pointer`}
                      onClick={() => router.replace("/app", { locale: langObject.id })}
                    >
                      {langObject.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/*--- logo ---*/}
          <div className="w-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[88px] mr-1">
              <Image src="/logo.svg" alt="Flash logo" fill />
            </div>
            <div className="my-4 textBase text-center">{t("subheader")}</div>
          </div>

          {/*--- menu bar ---*/}
          <div className="w-full h-[52px] portrait:sm:h-[56px] landscape:lg:h-[56px] landscape:xl:desktop:h-[48px] flex items-center justify-center flex-none relative">
            <div className="absolute w-full h-full rounded-full shadow-[inset_4px_4px_16px_0px_rgb(84,84,84,0.20),inset_2px_2px_8px_0px_rgb(120,116,140,0.20)] bg-white bg-opacity-20"></div>
            <div
              className={`${
                userType == "owners" ? "bg-black w-[54%] drop-shadow-md text-white" : "bg-transparent text-gray-500 w-[46%]"
              } h-full cursor-pointer flex items-center justify-center rounded-full z-[1]`}
              onClick={() => setUserType("owners")}
            >
              {t("owners")}
            </div>
            <div
              className={`${
                userType == "employees" ? "bg-black w-[54%] drop-shadow-md text-white" : "bg-transparent text-gray-500 w-[46%]"
              }  h-full cursor-pointer flex items-center justify-center rounded-full z-[1]`}
              onClick={() => setUserType("employees")}
            >
              {t("employees")}
            </div>
          </div>
        </div>

        {/*--- content below MENU ---*/}
        <div className="pt-[24px] pb-[32px] w-full landscape:xl:desktop:text-base">
          {/*--- FOR OWNERS ---*/}
          {userType == "owners" && (
            <div className="pt-[16px] w-full flex flex-col space-y-[32px] portrait:sm:space-y-[32px] landscape:lg:space-y-[28px]">
              {/*--- connectors: google, facebook, apple ---*/}
              {myConnectors.map<any>((i: any) => (
                <div
                  key={i.name}
                  className="w-full h-[68px] portrait:sm:h-[68px] landscape:lg:h-[68px] landscape:xl:desktop:h-[56px] flex items-center text-gray-700 bg-white rounded-md lg:hover:opacity-50 active:opacity-50 border border-gray-200 drop-shadow-md cursor-pointer select-none"
                  onClick={async () => {
                    // usability test
                    if (isUsabilityTest) {
                      setPage("loading");
                      await new Promise((resolve) => setTimeout(resolve, 3000));
                      setPage("intro");
                      return;
                    }

                    console.log("login page, clicked connect, set page to Loading");
                    setPage("loading");
                    await connectAsync({ connector: connectors[i.connectorIndex] });
                    console.log("login page, finished connecting");
                  }}
                >
                  <div className="relative ml-[20px] mr-[16px] w-[40px] h-[32px]">
                    <Image src={i.img} alt={i.name} fill />
                  </div>
                  <div>{t("signInWith", { socialMedia: i.name })}</div>
                </div>
              ))}
            </div>
          )}

          {/*--FOR EMPLOYEES---*/}
          {userType == "employees" && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full">
                {/*--email---*/}
                <div className="">{t("email")}</div>
                <input type="email" className="loginInputFont" onBlur={(e) => setMerchantEmail(e.target.value)}></input>
                {/*--password---*/}
                <div className="mt-[16px] portrait:sm:mt-[24px] landscape:lg:mt-[20px] landscape:xl:desktop:mt-[12px]">{t("password")}</div>
                <div className="w-full relative">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="none"
                    autoCapitalize="none"
                    className="loginInputFont"
                    onBlur={(e) => setEmployeePass(e.target.value)}
                  ></input>
                  <div className="absolute h-full right-4 top-0 flex justify-center items-center z-[2]">
                    <div
                      className="relative w-[28px] h-[28px] portrait:sm:w-[36px] portrait:sm:h-[36px] landscape:md:w-[36px] landscape:md:h-[36px] landscape:xl:desktop:w-[24px] landscape:xl:desktop:h-[24px] cursor-pointer"
                      onClick={() => {
                        show ? setShow(false) : setShow(true);
                      }}
                    >
                      <Image src={show ? "/eyesOpen.svg" : "/eyesClosed.svg"} alt="eye icon" fill />
                    </div>
                  </div>
                </div>
                {/*--sign in button---*/}
                <button
                  type="submit"
                  className="buttonPrimaryLight mt-[32px] portrait:sm:mt-[36px] landscape:lg:mt-[36px] landscape:xl:desktop:mt-[32px] w-full flex justify-center items-center"
                  onClick={employeeLogin}
                >
                  {isLoggingIn ? <SpinningCircleWhiteLarge /> : t("signIn")}
                </button>
              </div>
              <div
                className="pt-[48px] textBase text-center link"
                onClick={() => {
                  setErrorMsg(t("forgotModalText"));
                  setErrorModal(true);
                }}
              >
                {t("forgot")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/*---MODALS---*/}
      {errorModal && <ErrorModalLight errorMsg={errorMsg} setErrorModal={setErrorModal} />}

      {moreOptionsModal && (
        <div className="">
          <div className="w-[340px] h-[360px] flex flex-col items-center justify-between px-6 py-10 bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            {/*---title---*/}
            <div className="text-xl font-bold">Choose A Sign In Method</div>
            {/*---grid options---*/}
            <div className="w-full mt-8 grid grid-cols-3 gap-2">
              {myConnectorsMore.map<any>((i: any) => (
                <div
                  key={i.name}
                  className="flex flex-col items-center"
                  onClick={async () => {
                    console.log("login page, clicked connect, set page to Loading");
                    setPage("loading");
                    await connectAsync({ connector: connectors[i.connectorIndex] });
                    console.log("login page, finished connecting");
                  }}
                >
                  <div className="relative w-[40px] h-[36px]">
                    <Image src={i.img} alt={i.name} fill />
                  </div>
                  <div className="xs:text-xl">{i.name}</div>
                </div>
              ))}
            </div>
            {/*---close button---*/}
            <button
              onClick={() => setMoreOptionsModal(false)}
              className="mt-8 text-xl font-bold w-[160px] py-3 bg-white border border-gray-200 rounded-full tracking-wide drop-shadow-md"
            >
              CLOSE
            </button>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
    </div>
  );
};

export default Login;
