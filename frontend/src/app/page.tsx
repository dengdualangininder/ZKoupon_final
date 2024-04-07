"use client";
// next
import { useEffect } from "react";
// components
import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import Advantage from "./_components/Advantage";
import Overview from "./_components/Overview";
// import Why from "../components/Why.jsx";
// import Learn from "../components/Learn.jsx";
// import Contact from "../components/Contact.jsx";

const Home = () => {
  useEffect(() => {
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
    <div className="overflow-hidden font-nunito">
      <div className="h-screen bg-cover bg-[url('/background.svg')] w-full flex justify-center">
        <Navbar />
        <div className="w-full xl:max-w-[1440px] flex items-center justify-center">
          <Hero />
        </div>
      </div>

      <div className="bg-white w-full flex justify-center">
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
