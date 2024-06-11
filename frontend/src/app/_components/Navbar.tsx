"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { logo } from "../assets";
// import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrollTop, setIsScrollTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const isMobileTemp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileTemp);
  }, []);

  useEffect(() => {
    // consider setTimeout
    window.onscroll = () => {
      if (window.scrollY < 20) {
        setIsScrollTop(true);
      } else {
        setIsScrollTop(false);
      }
    };
  }, []);

  // TODO: might have to change this to media query
  useEffect(() => {
    if (isMobile) {
      const checkClickedOutside = (e: React.MouseEvent) => {
        if (isMenuOpen && !ref.current?.contains(e.target as HTMLElement)) {
          setIsMenuOpen(false);
        }
      };
      document.addEventListener("click", () => checkClickedOutside);
    }
  }, [isMenuOpen]);

  const navLinks = [
    {
      id: "overview",
      title: "How It Works",
    },
    {
      id: "advantage",
      title: "Why Ling Pay",
    },
    {
      id: "why",
      title: "How You Benefit",
    },
    {
      id: "learn",
      title: "Learning Center",
    },
  ];

  // const handleOnNavClick = (e: React.SyntheticEvent) => {
  //   setIsMenuOpen(false);
  //   document.getElementById(`${e.target.id}El`).scrollIntoView({ behavior: "smooth", block: "start" });
  // };

  return (
    <div
      className={`${
        isScrollTop ? "h-[92px]" : "h-[52px] bg-light2/70 border-b"
      } fixed px-4 w-full flex items-center justify-between z-50 backdrop-blur-md transition-all duration-1000`}
    >
      {/*---LOGO---*/}
      <div className="w-[160px] h-full flex items-center">
        <div className={`${isScrollTop ? "w-[120px] lg:w-[160px]" : "w-[80px] lg:w-[80px]"} h-full relative transition-all duration-1000`}>
          <Image src="/logo.svg" alt="navLogo" fill />
        </div>
      </div>

      {/*---DESKTOP MENU LINKS---*/}
      <div className="hidden md:flex space-x-4 lg:space-x-12">
        {navLinks.map((navLink, index) => (
          <div
            className="text-slate-800 text-base font-bold text-center cursor-pointer hover:scale-[108%] ease-in-out duration-300"
            id={navLink.id}
            // onClick={handleOnNavClick}
            key={index}
          >
            {navLink.title}
          </div>
        ))}
      </div>

      {/*---ENTER APP BUTTON---*/}
      <div className="absolute left-0 md:left-auto md:relative w-full md:w-auto flex justify-center md:justify-start space-x-1">
        <button
          onClick={() => router.push("/app")}
          className={`${
            isScrollTop ? "scale-125 translate-y-[530px]" : ""
          } h-[44px] md:h-[40px] w-[132px] md:w-[150px] font-bold rounded-full bg-blue-500 xs:hover:border xs:hover:border-blue-700 xs:hover:bg-blue-600 md:translate-y-0 text-white md:transform-none transition-transform duration-1000`}
        >
          Enter App
        </button>
      </div>

      {/*---MOBILE MENU LINKS---*/}
      <div className="flex items-center justify-end md:hidden mr-6">
        {/*---need to wrap icon and menu into 1 div, for useRef---*/}
        <div ref={ref} className="">
          {/*---animated menu open/close icon ---*/}
          <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative h-[36px] w-[36px]">
            <div className={`${isMenuOpen ? "rotate-45 top-[16px] scale-110" : "top-[4px]"} absolute bg-black h-[3px] w-[36px] rounded transition-all duration-500`}></div>
            <div className={`${isMenuOpen ? "hidden" : ""} absolute bg-black h-[3px] w-[36px] rounded top-[16px] transition-all duration-500`}></div>
            <div className={`${isMenuOpen ? "-rotate-45 top-[16px] scale-110" : "top-[28px]"} absolute bg-black h-[3px] w-[36px] rounded transition-all duration-500`}></div>
          </div>
          {/*---menu contents---*/}
          <div className={`${isMenuOpen ? "right-[-2px]" : " right-[-250px]"} pl-6 py-10 absolute top-[72px] w-[240px] duration-500`}>
            <div className="w-full h-full absolute bg-white opacity-95 backdrop-blur-md top-0 left-0 rounded-tl-2xl rounded-bl-2xl border"></div>
            <div className="flex flex-col z-50 relative space-y-10">
              {navLinks.map((navLink, index) => (
                <div
                  key={index}
                  id={navLink.id}
                  // onClick={handleOnNavClick}
                  className="font-bold text-slate-700 cursor-pointer text-2xl"
                >
                  {navLink.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
