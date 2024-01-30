"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { logo } from "../assets";
// import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  // const [isStandaloneiOS, setIsStandaloneiOS] = useState<boolean | undefined>(false); // undefined on desktop
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isScrollTop, setIsScrollTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    // detect mobile or desktop
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent));
    console.log("USERAGENT", window.navigator.userAgent);

    // detect standalone or not
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    console.log("Is standalone?", window.matchMedia("(display-mode: standalone)").matches);
    // setIsStandaloneiOS((window.navigator as any).standalone ?? false);
    // console.log(window.navigator.standalone);
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
      id="navbar"
      className={`${
        isScrollTop ? "h-[92px]" : "h-[52px] bg-slate-100/70 border-b"
      } fixed px-4 w-full flex items-center justify-between z-50 backdrop-blur-md transition-all duration-1000`}
    >
      {/*---logo---*/}
      <div className="w-[160px] h-full flex items-center">
        <div className={`${isScrollTop ? "w-[120px] lg:w-[160px]" : "w-[80px] lg:w-[80px]"} h-full relative transition-all duration-1000`}>
          <Image src="/logo.svg" alt="navLogo" fill />
        </div>
      </div>
      {/*---menu links---*/}
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
      {/*---login + signup button---*/}
      <div className="absolute left-0 md:left-auto md:relative w-full md:w-auto flex justify-center md:justify-start space-x-1">
        <button
          id="navLogin"
          onClick={() => (isMobile && !isStandalone ? router.push("/app") : router.push("/login"))}
          className="hidden md:block h-[40px] w-[100px] border border-blue-500 text-base font-bold text-blue-500 rounded-[4px] hover:border-blue-600 xs:hover:text-blue-600"
        >
          Log In
        </button>
        <button
          onClick={() => (isMobile && !isStandalone ? router.push("/app") : router.push("/signup"))}
          className={`${
            isScrollTop ? "scale-125 translate-y-[530px]" : ""
          } flex flex-col justify-center items-center md:translate-y-0 text-white md:transform-none h-[44px] md:h-[40px] w-[132px] md:w-[110px] rounded-full md:rounded-[4px] bg-blue-500 xs:hover:bg-blue-600 transition-transform duration-1000 hover:animate-textTwo`}
        >
          <div className="text-sm font-bold leading-tight pointer-events-none">Get Started</div>
          <div className="text-xs leading-tight pointer-events-none">at $0/month</div>
        </button>
      </div>
      {/*---MOBILE ONLY---*/}
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
              <div onClick={() => (isMobile && !isStandalone ? router.push("/app") : router.push("/login"))} className="font-bold text-slate-700 cursor-pointer text-2xl">
                Log In
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
