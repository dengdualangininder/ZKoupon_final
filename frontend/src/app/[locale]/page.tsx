"use client";
// next
import { useState, useEffect } from "react";
// other
import axios from "axios";
// constants
import { abb2full, countryData } from "@/utils/constants";
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
  const [merchantCurrency, setMerchantCurrency] = useState<string | undefined>();

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
        console.log("currency set to ", merchantCurrencyTemp);
      } catch (err) {
        merchantCurrencyTemp = "USD";
        console.log("detect country failed, currency set to USD. Error:", err);
      }
      setMerchantCurrency(merchantCurrencyTemp);
    };
    getCurrency();
  }, []);

  return (
    <div className="homeTextBase">
      <Navbar />

      <div className="w-full flex justify-center bg-light2 text-lightText1">
        <Hero merchantCurrency={merchantCurrency} />
      </div>

      <div id="How" className="w-full flex justify-center bg-[#121212] sm:bg-gradient-to-b sm:from-black sm:to-dark4 text-darkText1">
        <How merchantCurrency={merchantCurrency} setMerchantCurrency={setMerchantCurrency} />
      </div>

      <div
        id="LowCost"
        data-show="yes"
        className="w-full flex justify-center opacity-0 transition-all duration-1500 bg-light2 sm:bg-[url('/globebg.svg')] bg-no-repeat [background-position:50%_calc(100%+200px)] lg:[background-position:50%_300%]"
      >
        <LowCost merchantCurrency={merchantCurrency} />
      </div>

      <div id="Simple" data-show="yes" className="w-full flex justify-center opacity-0 bg-dark1 text-darkText1 transition-all duration-1500">
        <Simple />
      </div>

      <div id="Benefits" data-show="yes" className="w-full flex justify-center opacity-0 bg-light2 transition-all duration-1500">
        <Benefits merchantCurrency={merchantCurrency} />
      </div>

      <div id="Learn" data-show="yes" className="w-full flex justify-center bg-[#0A2540] text-white opacity-0 transition-all duration-1000">
        <Learn merchantCurrency={merchantCurrency} />
      </div>

      <div data-show="yes" className="w-full flex justify-center bg-dark1 text-white opacity-0 transition-all duration-1000">
        <Support />
      </div>

      <div className="w-full flex justify-center bg-gradient-to-b from-dark1 to-dark5 text-white">
        <Footer />
      </div>
    </div>
  );
}
