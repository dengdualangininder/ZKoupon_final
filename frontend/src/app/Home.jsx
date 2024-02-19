import React, { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import Advantage from "../components/Advantage.jsx";
import Overview from "../components/Overview.jsx";
import Why from "../components/Why.jsx";
import Learn from "../components/Learn.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";

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
    document.querySelectorAll("div[show='yes']").forEach((el) => observer.observe(el));

    const observerSlide = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll("div[show='step']").forEach((el) => el.classList.remove("translate-x-[1500px]"));
            observerSlide.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-100px" }
    );
    document.querySelectorAll("div[show='slide']").forEach((el) => observerSlide.observe(el));
  }, []);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  window.onscroll = () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById("navbar").classList.add("h-[52px]", "bg-slate-100/70", "border-b");
      document.getElementById("navbar").classList.remove("h-[92px]");
      document.getElementById("navlogo").classList.add("h-[32px]", "lg:h-[40px]");
      document.getElementById("navlogo").classList.remove("h-[60px]", "lg:h-[68px]");
      document.getElementById("start").classList.remove("translate-y-[530px]", "scale-125");
    } else {
      document.getElementById("navbar").classList.add("h-[92px]");
      document.getElementById("navbar").classList.remove("h-[52px]", "bg-slate-100/70", "border-b");
      document.getElementById("navlogo").classList.add("h-[60px]", "lg:h-[68px]");
      document.getElementById("navlogo").classList.remove("h-[32px]", "lg:h-[40px]");
      document.getElementById("start").classList.add("translate-y-[530px]", "scale-125");
    }
  };

  return (
    <div className="overflow-hidden font-nunito">
      <div className="h-screen bg-cover bg-[url('/background.svg')] w-full flex justify-center">
        <Navbar isMobile={isMobile} className="" />
        <div className="w-full xl:max-w-[1440px] flex items-center justify-center">
          <Hero className="" />
        </div>
      </div>

      <div className="bg-white w-full flex justify-center">
        <div className="w-full xl:max-w-[1440px]">
          <Overview />
        </div>
      </div>

      <div id="advantageEl" show="yes" className="opacity-0 bg-cover bg-darkblue w-full flex justify-center transition-all duration-1500">
        <div className="w-full xl:max-w-[1440px]">
          <Advantage />
        </div>
      </div>

      <div show="yes" className="bg-cover bg-bggrayone w-full flex justify-center text-lg opacity-0 transition-all duration-2000">
        <div className="w-full xl:max-w-[1440px]">
          <Why />
        </div>
      </div>

      <div show="yes" className="bg-white flex w-full justify-center opacity-0 transition-all duration-1000">
        <div className="w-full xl:max-w-[1440px]">
          <Learn />
        </div>
      </div>

      <div show="yes" className="bg-cover bg-[url('/src/assets/background.svg')] w-full flex justify-center opacity-0 transition-all duration-1000">
        <div className="w-full xl:max-w-[1440px]">
          <Contact />
        </div>
      </div>

      <div className="bg-darkblue w-full flex justify-center">
        <div className="w-full xl:max-w-[1440px]">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
