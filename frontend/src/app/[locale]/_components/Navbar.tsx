"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/navigation";
// other
import { useLocale, useTranslations } from "next-intl";
// images
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faBars, faCaretDown, faGlobe, faX } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isScrollTop, setIsScrollTop] = useState(true);
  const [mobileMenuModal, setMobileMenuModal] = useState(false);
  const [showLangs, setShowLangs] = useState(false);

  // hooks
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("HomePage.Navbar");
  console.log("locale:", locale);

  useEffect(() => {
    window.onscroll = () => {
      if (window.scrollY < 20) {
        setIsScrollTop(true);
      } else {
        setIsScrollTop(false);
      }
    };
  }, []);

  const onClickLink = (e: any) => {
    document.getElementById(`${e.target.id}El`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuModal(false);
  };

  const navLinks = [
    {
      id: "how",
      title: t("how"),
    },
    {
      id: "advantage",
      title: t("why"),
    },
    {
      id: "learn",
      title: t("learn"),
    },
  ];

  type LangObject = { id: "en" | "fr" | "it" | "zh-TW"; text: string };
  const langObjectArray: LangObject[] = [
    { id: "en", text: "English" },
    { id: "fr", text: "Français" },
    { id: "it", text: "Italiana" },
    { id: "zh-TW", text: "中文" },
  ];

  return (
    <div
      className={`${
        isScrollTop
          ? "h-[92px] portrait:sm:h-[108px] landscape:lg:h-[108px]"
          : "h-[52px] portrait:sm:h-[68px] landscape:lg:h-[68px] landscape:xl:desktop:h-[40px] bg-[rgb(241,245,249,0.8)] border-b border-slate-400"
      } w-full fixed flex justify-center z-50 backdrop-blur-md transition-all duration-1000`}
    >
      <div className="mx-3 sm:mx-6 w-full landscape:xl:max-w-[1250px] h-full flex justify-center items-center relative">
        {/*---LOGO---*/}
        <div
          className={`${
            isScrollTop
              ? "w-[160px] portrait:sm:w-[190px] landscape:lg:w-[190px] landscape:xl:desktop:w-[180px]"
              : "w-[96px] portrait:sm:w-[140px] landscape:lg:w-[140px] landscape:xl:desktop:w-[96px]"
          } h-full absolute left-0 transition-all duration-1000`}
        >
          <Image src="/logo.svg" alt="logo" fill />
        </div>

        {/*---DESKTOP MENU LINKS---*/}
        <div className="hidden lg:flex w-[500px] xl:w-[560px] xl:desktop:w-[500px] justify-between">
          {navLinks.map((navLink, index) => (
            <div
              className={`${
                isScrollTop ? "xl:desktop:text-lg" : "xl:desktop:text-base"
              } text-xl text-center font-semibold cursor-pointer desktop:xl:hover:text-slate-700 desktop:xl:hover:underline underline-offset-[6px] [transition:font-size_1s_cubic-bezier(0,0,1,1),font-weight_1s_cubic-bezier(0,0,1,1),transform_.3s_cubic-bezier(0,0,1,1)]`}
              id={navLink.id}
              key={index}
              onClick={onClickLink}
            >
              {navLink.title}
            </div>
          ))}
        </div>

        {/*--- ANIMATED BUTTON---*/}
        <div
          className={`${
            isScrollTop ? "scale-[1.15] translate-y-[calc(84px+(100vh-92px)*(6.5/10))]" : "portrait:translate-x-[20px]"
          } lg:hidden w-full flex justify-center absolute left-0 transition-transform duration-[1200ms]`}
        >
          <button
            className={`heroButton ${
              isScrollTop ? "" : "h-[40px] lg:h-[56px] xl:desktop:h-[32px] landscape:xl:desktop:w-[100px] desktop:text-sm"
            } transition-[height,font-size,width] duration-[1200ms]`}
            onClick={() => router.push("/app")}
          >
            {t("enterApp")}
          </button>
        </div>

        {/*--- LANG + ENTER BUTTON ---*/}
        <div
          className={`${
            isScrollTop ? "h-[44px] portrait:sm:h-[60px] landscape:lg:h-[60px] landscape:xl:desktop:h-[44px]" : "h-[40px] lg:h-[56px] landscape:xl:desktop:h-[32px]"
          } hidden lg:flex items-center absolute right-0 transition-all duration-[1200ms] z-[100]`}
        >
          {/*--- globe + angleDown ---*/}
          <div
            className={`${
              showLangs ? "bg-slate-300" : ""
            } h-full cursor-pointer flex items-center desktop:hover:bg-slate-300 rounded-md portrait:sm:rounded-lg landscape:lg:rounded-lg mr-6 px-3 relative`}
            onClick={() => setShowLangs(!showLangs)}
          >
            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-xl" />
            <FontAwesomeIcon icon={faCaretDown} className="text-lg pb-0.5" />
            {showLangs && (
              <div className="absolute top-[calc(100%)] right-0 border border-slate-300 rounded-md portrait:sm:rounded-lg landscape:lg:rounded-lg py-6 px-6 space-y-8 text-xl font-medium bg-light2">
                {langObjectArray.map((langObject) => (
                  <div
                    key={langObject.id}
                    className={`${
                      langObject.id == locale ? "underline decoration-[2px] underline-offset-[8px]" : ""
                    } xl:desktop:hover:underline xl:desktop:hover:decoration-[2px] xl:desktop:hover:underline-offset-[8px] cursor-pointer`}
                    onClick={() => router.replace("/", { locale: langObject.id })}
                  >
                    {langObject.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/*--- enter button ---*/}
          <button
            className={`heroButton h-full w-[130px] ${isScrollTop ? "" : "landscape:xl:desktop:w-[100px] desktop:text-sm"} transition-[height,font-size,width] duration-[1200ms]`}
            onClick={() => router.push("/app")}
          >
            {t("enterApp")}
          </button>
        </div>

        {/*---showLang mask---*/}
        {showLangs && <div className="hidden lg:block absolute w-full h-screen left-0 top-0 z-[99]" onClick={() => setShowLangs(false)}></div>}

        {/*--- MOBILE MENU ICON ---*/}
        <div className="lg:hidden absolute right-2 cursor-pointer">
          <FontAwesomeIcon
            icon={faBars}
            className="text-3xl"
            onClick={async () => {
              setMobileMenuModal(true);
              document.body.classList.add("halfHideScrollbar");
            }}
          />
        </div>
      </div>

      {/*---mobile menu modal---*/}
      <div
        className={`${
          mobileMenuModal ? "opacity-100 z-[100]" : "opacity-0 z-[-10] pointer-events-none"
        } w-full h-screen absolute left-0 top-0 bg-light2 transition-all duration-[700ms]`}
      >
        <div
          className={`${
            isScrollTop ? "pt-[29px] portrait:sm:pt-[36px] pr-[22px] sm:pr-[34px]" : "pt-[16px] pr-[22px] sm:pr-[34px]"
          } transition-all duration-[500ms] w-full flex justify-end`}
        >
          <FontAwesomeIcon
            icon={faX}
            className="text-3xl cursor-pointer"
            onClick={async () => {
              setMobileMenuModal(false);
              document.body.classList.remove("halfHideScrollbar");
            }}
          />
        </div>
        <div className="p-6 w-full flex flex-col items-start relative space-y-12">
          {navLinks.map((navLink, index) => (
            <div key={index} id={navLink.id} onClick={onClickLink} className="font-medium cursor-pointer text-2xl">
              {navLink.title}
            </div>
          ))}
          <div id="support" className="font-medium cursor-pointer text-2xl" onClick={onClickLink}>
            Customer Support
          </div>
          <div></div>
          <div className="font-medium cursor-pointer text-2xl flex items-center" onClick={() => (showLangs ? setShowLangs(false) : setShowLangs(true))}>
            <FontAwesomeIcon icon={faGlobe} className="mr-2" /> Language <FontAwesomeIcon icon={showLangs ? faAngleUp : faAngleDown} className="ml-2" />
          </div>
          {showLangs && (
            <div className="w-full text-xl grid grid-cols-2 gap-y-8 gap-x-4">
              {langObjectArray.map((langObject) => (
                <div
                  key={langObject.id}
                  className={`${langObject.id == locale ? "underline decoration-[2px] underline-offset-[8px]" : ""}`}
                  onClick={() => router.replace("/", { locale: langObject.id })}
                >
                  {langObject.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
