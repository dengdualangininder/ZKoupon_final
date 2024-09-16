"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
// i18n
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
// constants
import { langObjectArray } from "@/utils/constants";
// images
import { FaBars, FaCaretDown, FaX } from "react-icons/fa6";
import { SlGlobe } from "react-icons/sl";

export default function Navbar() {
  const [isScrollTop, setIsScrollTop] = useState(true);
  const [menuModal, setMenuModal] = useState(false);
  const [langModal, setLangModal] = useState(false);

  // hooks
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("HomePage.Navbar");

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
    document.getElementById(e.target.id.replace("NavLink", ""))?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuModal(false);
  };

  const navLinks = [
    {
      id: "HowNavLink",
      title: t("how"),
    },
    {
      id: "LowCostNavLink",
      title: t("why"),
    },
    {
      id: "LearnNavLink",
      title: t("learn"),
    },
  ];

  return (
    <div
      className={`${
        isScrollTop
          ? "h-[92px] portrait:sm:h-[108px] landscape:lg:h-[108px]"
          : "h-[52px] portrait:sm:h-[68px] landscape:lg:h-[68px] landscape:xl:desktop:h-[40px] border-b border-slate-300"
      } w-full fixed flex justify-center z-50 backdrop-blur-md transition-all duration-1000 bg-light2 bg-opacity-80`}
    >
      <div className="mx-[12px] sm:mx-[16px] w-full landscape:xl:max-w-[1140px] h-full flex justify-center items-center relative">
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

        {/*--- ANIMATED START BUTTON---*/}
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
          {/*--- enter button ---*/}
          <button
            className={`heroButton h-full w-[130px] ${isScrollTop ? "" : "landscape:xl:desktop:w-[100px] desktop:text-sm"} transition-[height,font-size,width] duration-[1200ms]`}
            onClick={() => router.push("/app")}
          >
            {t("enterApp")}
          </button>
          {/*--- lang ---*/}
          <div
            className={`${
              langModal ? "bg-slate-300" : ""
            } h-full cursor-pointer flex items-center desktop:hover:bg-slate-300 rounded-md portrait:sm:rounded-lg landscape:lg:rounded-lg ml-[16px] px-[8px] relative`}
            onClick={() => setLangModal(!langModal)}
          >
            <SlGlobe size={40} className="mr-1 w-[22px] h-[22px]" />
            <FaCaretDown size={40} className="w-[18px] h-[18px]" />
            {/*--- lang modal ---*/}
            {langModal && (
              <div className="absolute top-[calc(100%)] right-0 py-[24px] px-[24px] space-y-[32px] text-[18px] desktop:text-[16px] font-medium bg-light2 border border-slate-300 rounded-md portrait:sm:rounded-lg landscape:lg:rounded-lg">
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
        </div>

        {/*---showLang mask---*/}
        {langModal && <div className="hidden lg:block absolute w-full h-screen left-0 top-0 z-[99]" onClick={() => setLangModal(false)}></div>}

        {/*--- MOBILE MENU ICON ---*/}
        <div className="lg:hidden absolute right-[12px] cursor-pointer">
          <FaBars
            size={36}
            onClick={async () => {
              setMenuModal(true);
              document.body.classList.add("halfHideScrollbar");
            }}
          />
        </div>
      </div>

      {/*---mobile menu modal---*/}
      <div
        className={`${
          menuModal ? "opacity-100 z-[100]" : "opacity-0 z-[-10] pointer-events-none"
        } w-full h-screen absolute left-0 top-0 bg-light2 transition-all duration-[700ms] overflow-y-auto`}
      >
        {/*--- close button ---*/}
        <div
          className={`${
            isScrollTop ? "pt-[30px] portrait:sm:pt-[38px]" : "pt-[14px] portrait:sm:pt-[18px]"
          } pr-[26px] sm:pr-[30px] transition-all duration-[500ms] w-full flex justify-end`}
        >
          <FaX
            size={32}
            onClick={async () => {
              setMenuModal(false);
              document.body.classList.remove("halfHideScrollbar");
              setLangModal(false);
            }}
          />
        </div>
        {/*--- menu contents ---*/}
        <div className="font-medium text-2xl px-[9%] pt-[6%] pb-[48px] w-full flex flex-col items-start relative space-y-[44px]">
          {navLinks.map((navLink, index) => (
            <div key={index} id={navLink.id} onClick={onClickLink} className="">
              {navLink.title}
            </div>
          ))}
          <div className="" onClick={onClickLink}>
            {t("support")}
          </div>
          <div className="flex items-center" onClick={() => (langModal ? setLangModal(false) : setLangModal(true))}>
            <SlGlobe size={40} className="mr-1 w-[22px] h-[22px]" />
            <FaCaretDown size={40} className="w-[20px] h-[20px]" />
          </div>
          {langModal && (
            <div className="w-[280px] grid grid-cols-2 gap-y-[44px] gap-x-[40px]">
              {langObjectArray.map((langObject) => (
                <div key={langObject.id}>
                  <span
                    className={`${langObject.id == locale ? "underline decoration-[2px] underline-offset-[8px]" : ""} text-xl`}
                    onClick={() => router.replace("/", { locale: langObject.id })}
                  >
                    {langObject.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
