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
import { SlGlobe, SlMenu } from "react-icons/sl";
import { CgClose, CgMenu } from "react-icons/cg";

export default function Navbar() {
  const [isScrollTop, setIsScrollTop] = useState(true);
  const [menuModal, setMenuModal] = useState(false);
  const [langModal, setLangModal] = useState(false);

  // hooks
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("HomePage.Navbar");

  useEffect(() => {
    window.scrollY < 20 ? setIsScrollTop(true) : setIsScrollTop(false);

    window.onscroll = () => {
      if (window.scrollY < 20) {
        setIsScrollTop(true);
      } else {
        setIsScrollTop(false);
      }
    };
  }, []);

  const onClickLink = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    document.getElementById(e.currentTarget.id.replace("NavLink", ""))?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        isScrollTop ? "h-[84px]" : "h-[52px] portrait:sm:h-[60px] landscape:lg:h-[60px] desktop:!h-[44px] border-b border-slate-300"
      } w-full fixed flex justify-center transition-all duration-[1000ms] bg-light2 text-lightText1 bg-opacity-70 backdrop-blur-md z-50`}
    >
      <div className="mx-[12px] xs:mx-[24px] lg:mx-[32px] w-full max-w-[1440px] h-full flex justify-center items-center relative">
        {/*---logo ---*/}
        <Image
          src="/logo.svg"
          alt="Flash logo"
          width={0}
          height={0}
          className={`${
            isScrollTop ? "w-[150px] desktop:w-[150px]" : "w-[100px] portrait:sm:w-[110px] landscape:lg:w-[110px] desktop:!w-[90px]"
          } absolute left-0 h-full transition-all duration-[1000ms]`}
        />
        {/*---DESKTOP MENU LINKS---*/}
        <div className="hidden lg:flex space-x-[36px] xl:space-x-[60px] justify-between">
          {navLinks.map((navLink, index) => (
            <div
              className={`font-semibold cursor-pointer active:underline desktop:active:no-underline underline-offset-4 desktop:underlineAni relative`}
              id={navLink.id}
              key={index}
              onClick={onClickLink}
            >
              {navLink.title}
            </div>
          ))}
        </div>
        {/*--- ANIMATED ENTER BUTTON  ---*/}
        <div
          id="heroButtonContainer"
          className={`${
            isScrollTop
              ? "landscape:translate-y-[400px] landscape:lg:translate-y-[calc(74px+100vh*5.5/10)] portrait:translate-y-[calc(74px+100vh*5.5/10)]"
              : "translate-x-[24px] xs:translate-x-0"
          } lg:hidden w-full flex justify-center absolute left-0 transition-transform duration-[1200ms]`}
        >
          <button className={`${isScrollTop ? "heroButton" : "heroButtonSmall"} [transition:height_1.2s,width_1.2s,font-size_1.2s]`} onClick={() => router.push("/app")}>
            {t("enterApp")}
          </button>
        </div>

        {/*--- BUTTON + LANG ---*/}
        <div className={`absolute right-0 hidden h-full lg:flex items-center space-x-[24px] z-[100]`}>
          {/*--- button ---*/}
          <button className="heroButtonSmall" onClick={() => router.push("/app")}>
            {t("enterApp")}
          </button>
          {/*--- lang ---*/}
          <div className="relative flex items-center h-full">
            <div
              className="flex space-x-1 cursor-pointer desktop:hover:text-slate-600"
              onClick={() => {
                setLangModal(!langModal);
                const el = document.getElementById("homeLangModal");
                console.log(el?.scrollHeight);
              }}
            >
              <SlGlobe className="w-[22px] h-[22px]" />
              <FaCaretDown className="w-[18px] h-[18px]" />
            </div>
          </div>
          {/*--- lang modal ---*/}
          <div id="homeLangModal" className={`${langModal ? "max-h-[260px]" : "max-h-0"}  [transition:max-height_300ms] absolute top-[100%] right-0 overflow-hidden`}>
            <div className="py-[20px] px-[16px] space-y-[24px] text-[18px] desktop:text-[16px] font-medium bg-light2 bg-opacity-80 backdrop-blur-md border border-slate-500 rounded-lg">
              {langObjectArray.map((langObject) => (
                <div
                  key={langObject.id}
                  className={`${langObject.id == locale ? "underline underline-offset-[6px]" : ""} desktop:hover:underline desktop:hover:underline-offset-[6px] cursor-pointer`}
                  onClick={() => router.replace("/", { locale: langObject.id })}
                >
                  {langObject.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*---showLang mask---*/}
        {langModal && <div className="hidden lg:block absolute w-screen h-screen left-0 top-0 z-[99]" onClick={() => setLangModal(false)}></div>}

        {/*--- MOBILE MENU ICON ---*/}
        <div className="lg:hidden absolute right-[16px] cursor-pointer">
          <SlMenu
            size={32}
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
        } w-full h-screen absolute left-0 top-0 bg-light2 transition-all duration-[500ms] overflow-y-auto`}
      >
        {/*--- close button ---*/}
        <div
          className={`${
            isScrollTop ? "pt-[21px] portrait:sm:pt-[21px]" : "pt-[14px] portrait:sm:pt-[18px]"
          } pr-[22px] sm:pr-[34px] transition-all duration-[800ms] w-full flex justify-end cursor-pointer`}
        >
          <CgClose
            size={44}
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
            <div key={index} id={navLink.id} onClick={onClickLink} className="desktop:hover:underline decoration-[2px] underline-offset-[8px] cursor-pointer">
              {navLink.title}
            </div>
          ))}
          <div
            className="desktop:hover:underline decoration-[2px] underline-offset-[8px] cursor-pointer"
            onClick={() => {
              document.getElementById("Support")?.scrollIntoView({ behavior: "smooth", block: "start" });
              setMenuModal(false);
            }}
          >
            {t("support")}
          </div>
          <div className="flex items-center cursor-pointer" onClick={() => (langModal ? setLangModal(false) : setLangModal(true))}>
            <SlGlobe size={40} className="mr-1 w-[24px] h-[24px]" />
            <FaCaretDown size={40} className="w-[20px] h-[20px]" />
          </div>
          {langModal && (
            <div className="w-[280px] grid grid-cols-2 gap-y-[44px] gap-x-[40px]">
              {langObjectArray.map((langObject) => (
                <div key={langObject.id}>
                  <span
                    className={`${langObject.id == locale ? "underline" : ""} text-xl decoration-[2px] underline-offset-[8px] desktop:hover:underline cursor-pointer`}
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
