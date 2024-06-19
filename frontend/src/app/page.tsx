"use client";
// next
import { useEffect } from "react";
import { useTheme } from "next-themes";
// components
import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import Advantage from "./_components/Advantage";
import Overview from "./_components/Overview";
// import Why from "../components/Why.jsx";
// import Learn from "../components/Learn.jsx";
// import Contact from "../components/Contact.jsx";

const Home = () => {
  // hooks
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-100px" }
    );
    document.querySelectorAll("div[data-show='yes']").forEach((el) => observer.observe(el));

    const observerSlide = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll("div[data-show='step']").forEach((el) => el.classList.remove("translate-x-[1500px]"));
            observerSlide.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-100px" }
    );
    document.querySelectorAll("div[data-show='slide']").forEach((el) => observerSlide.observe(el));
  }, []);

  return (
    <div className="overflow-hidden">
      <Navbar />

      <div className="w-full flex justify-center bg-light2">
        <div className="w-full xl:max-w-[1440px]">
          <Hero />
        </div>
      </div>

      <div className="w-full flex justify-center bg-[#121212] sm:bg-gradient-to-b sm:from-black sm:to-dark4 text-darkText1">
        <div className="w-full xl:max-w-[1440px]">
          <Overview />
        </div>
      </div>

      <div id="advantageEl" data-show="yes" className="opacity-0 bg-cover bg-darkblue w-full flex justify-center transition-all duration-1500">
        <div className="w-full xl:max-w-[1440px]">
          <Advantage />
        </div>
      </div>

      {/* <div data-show="yes" className="bg-cover bg-bggrayone w-full flex justify-center text-lg opacity-0 transition-all duration-2000">
        <div className="w-full xl:max-w-[1440px]">
          <Why />
        </div>
      </div>

      <div data-show="yes" className="bg-white flex w-full justify-center opacity-0 transition-all duration-1000">
        <div className="w-full xl:max-w-[1440px]">
          <Learn />
        </div>
      </div>

      <div data-show="yes" className="bg-cover bg-[url('/src/assets/background.svg')] w-full flex justify-center opacity-0 transition-all duration-1000">
        <div className="w-full xl:max-w-[1440px]">
          <Contact />
        </div>
      </div>

      <div className="bg-darkblue w-full flex justify-center">
        <div className="w-full xl:max-w-[1440px]">
          <Footer />
        </div>
      </div> */}
    </div>
  );
};

export default Home;
