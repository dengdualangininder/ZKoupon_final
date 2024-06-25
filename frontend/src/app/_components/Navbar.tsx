"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { logo } from "../assets";
// import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrollTop, setIsScrollTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

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
  };

  const navLinks = [
    {
      id: "overview",
      title: "How It Works",
    },
    {
      id: "advantage",
      title: "Why Use Flash",
    },
    {
      id: "learn",
      title: "Learning Center",
    },
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
              : "w-[108px] portrait:sm:w-[140px] landscape:lg:w-[140px] landscape:xl:desktop:w-[96px]"
          } h-full absolute left-0 transition-all duration-1000`}
        >
          <Image src="/logo.svg" alt="logo" fill />
        </div>

        {/*---DESKTOP MENU LINKS---*/}
        <div className="hidden lg:flex w-[500px] xl:w-[560px] xl:desktop:w-[500px] justify-between">
          {navLinks.map((navLink, index) => (
            <div
              className={`${
                isScrollTop ? "xl:desktop:text-lg font-semibold" : "xl:desktop:text-base font-medium"
              } text-xl text-center cursor-pointer desktop:xl:hover:scale-[108%] [transition:font-size_1.2s_cubic-bezier(0,0,1,1),font-weight_1.2s_cubic-bezier(0,0,1,1),transform_.5s_cubic-bezier(0,0,1,1)]`}
              id={navLink.id}
              key={index}
              onClick={onClickLink}
            >
              {navLink.title}
            </div>
          ))}
        </div>

        {/*--- ENTER BUTTON---*/}
        <div
          className={`${
            isScrollTop ? "scale-[1.15] lg:scale-100 translate-y-[calc(84px+(100vh-92px)*(6.5/10))]" : "portrait:translate-x-[20px] portrait:xs:translate-x-0"
          } w-full lg:w-auto h-full flex justify-center items-center absolute left-0 lg:left-auto lg:right-0 lg:translate-y-0 transition-transform duration-[1200ms]`}
        >
          <button
            className={`heroButton ${isScrollTop ? "" : "lg:h-[56px] desktop:text-base lg:desktop:h-[36px]"} transition-[height,font-size] duration-[1200ms]`}
            onClick={() => router.push("/app")}
          >
            Enter App
          </button>
        </div>

        {/*--- MOBILE BLACKOUT BG ---*/}
        <div className={`${isMenuOpen ? "" : "hidden"} w-screen h-screen absolute left-0 top-0 z-[10]`} onClick={() => setIsMenuOpen(false)}></div>

        {/*--- animated open/close icon ---*/}
        <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="h-[36px] w-[36px] absolute right-4 lg:hidden">
          <div className={`${isMenuOpen ? "rotate-45 top-[16px] scale-110" : "top-[4px]"} absolute bg-black h-[2px] w-[36px] rounded transition-all duration-500`}></div>
          <div className={`${isMenuOpen ? "hidden" : ""} absolute bg-black h-[2px] w-[36px] rounded top-[16px] transition-all duration-500`}></div>
          <div className={`${isMenuOpen ? "-rotate-45 top-[16px] scale-110" : "top-[28px]"} absolute bg-black h-[2px] w-[36px] rounded transition-all duration-500`}></div>
        </div>
      </div>
      {/*---sidebar---*/}
      <div
        className={`${
          isMenuOpen ? "translate-x-[2px]" : " translate-x-[270px]"
        } absolute top-[90px] right-0 w-[260px] pl-8 py-8 bg-slate-200 border-2 border-slate-400 rounded-tl-3xl rounded-bl-3xl duration-500 z-[-20]`}
      >
        <div className="flex flex-col z-50 relative space-y-8">
          {navLinks.map((navLink, index) => (
            <div key={index} id={navLink.id} onClick={onClickLink} className="font-medium cursor-pointer text-2xl">
              {navLink.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
