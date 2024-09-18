"use client";
// next
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
// other
import axios from "axios";
// constants
import { abb2full, countryData, currency2decimal, merchantType2data } from "@/utils/constants";

// components
import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import How from "./_components/How";
import LowCost from "./_components/LowCost";
import Simple from "./_components/Simple";
import Benefits from "./_components/Benefits";
import Learn from "./_components/Learn";
import Support from "./_components/Support";
import Footer from "./_components/Footer";

export default function Home() {
  const [merchantCurrency, setMerchantCurrency] = useState("EUR");

  const { setTheme } = useTheme();

  useEffect(() => {
    // setTheme("light");

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
            document.querySelectorAll("div[data-show='step']").forEach((el) => el.classList.remove("translate-x-[1600px]"));
            observerSlide.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-100px" }
    );
    document.querySelectorAll("div[data-show='slide']").forEach((el) => observerSlide.observe(el));

    // set currency
    const getCurrency = async () => {
      let merchantCurrencyTemp: string;
      try {
        const res = await axios.get("https://api.country.is");
        const merchantCountry = abb2full[res.data.country] ?? "Other";
        merchantCurrencyTemp = countryData[merchantCountry]?.currency ?? "USD";
        console.log("homePage detected currency:", merchantCurrencyTemp);
      } catch (err) {
        merchantCurrencyTemp = "USD";
        console.log("homePage detect country failed, set to USD. Error:", err);
      }
      setMerchantCurrency(merchantCurrencyTemp);
    };
    getCurrency();
  }, []);

  return (
    <div className="homeTextBase overflow-x-hidden">
      {/* 1440px wrapper put into Navbar because want a conditional border-b across entire screen */}
      <Navbar />

      <div className="w-full flex justify-center bg-light2 text-lightText1">
        <div className="w-full flex justify-center xl:max-w-[1280px]">
          <Hero merchantCurrency={merchantCurrency} />
        </div>
      </div>

      <div id="How" className="w-full flex justify-center bg-[#121212] sm:bg-gradient-to-b sm:from-black sm:to-dark4 text-darkText1">
        <div className="w-full flex justify-center xl:max-w-[1440px]">
          <How merchantCurrency={merchantCurrency} setMerchantCurrency={setMerchantCurrency} />
        </div>
      </div>

      <div
        id="LowCost"
        data-show="yes"
        className="opacity-0 bg-light2 w-full flex justify-center transition-all duration-1500 sm:bg-[url('/globebg.svg')] bg-no-repeat [background-position:50%_calc(100%+200px)] lg:[background-position:50%_300%]"
      >
        <LowCost merchantCurrency={merchantCurrency} />
      </div>

      <div id="Simple" data-show="yes" className="opacity-0 bg-dark1 text-darkText1 w-full flex justify-center transition-all duration-1500">
        <div className="w-full flex justify-center xl:max-w-[1440px]">
          <Simple />
        </div>
      </div>

      <div id="Benefits" data-show="yes" className="opacity-0 bg-light2 w-full flex justify-center transition-all duration-1500">
        <div className="w-full flex justify-center xl:max-w-[1440px]">
          <Benefits merchantCurrency={merchantCurrency} />
        </div>
      </div>

      <div id="Learn" data-show="yes" className="bg-[#0A2540] text-white flex w-full justify-center opacity-0 transition-all duration-1000">
        <div className="w-full flex justify-center xl:max-w-[1440px]">
          <Learn merchantCurrency={merchantCurrency} />
        </div>
      </div>

      <div data-show="yes" className="bg-dark1 text-white w-full flex justify-center opacity-0 transition-all duration-1000">
        <div className="w-full flex justify-center xl:max-w-[1440px]">
          <Support />
        </div>
      </div>

      <div className="bg-gradient-to-b from-dark1 to-dark5 text-white w-full flex justify-center">
        <div className="w-full flex justify-center xl:max-w-[1440px]">
          <Footer />
        </div>
      </div>
    </div>
  );
}
