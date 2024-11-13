// next
import { cookies } from "next/headers";
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
// utils
import { abb2full, countryData } from "@/utils/constants";
import { getUsdcToLocal, getUsdToLocal } from "./_utils/constants";

//// this is a dynamic route, as we use unchaced fetch() and cookies() api ////

export default async function Home() {
  // get merchantCurrency from cookies or api
  let merchantCurrency: string | undefined;
  merchantCurrency = cookies().get("currency")?.value;
  if (!merchantCurrency) {
    try {
      const res = await fetch("https://api.country.is");
      const data = await res.json();
      const country = abb2full[data.country] ?? "Other";
      merchantCurrency = countryData[country]?.currency ?? "USD";
      console.log("page.tsx merchantCurrency:", merchantCurrency);
    } catch (e) {
      console.log("get country api failed, default to USD");
      merchantCurrency = "USD";
    }
  }

  // get rates in parallel
  try {
    var [usdcToLocal, usdToLocal] = await Promise.all([getUsdcToLocal(merchantCurrency), getUsdToLocal(merchantCurrency)]);
    if (usdcToLocal && usdcToLocal) {
      var rates = { usdcToLocal: usdcToLocal, usdToLocal: usdToLocal };
    } else {
      throw new Error();
    }
  } catch (e) {
    console.log(e);
    var rates = { usdcToLocal: 0, usdToLocal: 0 };
  }

  console.log(merchantCurrency, rates);
  return (
    <div className="homeTextBase overflow-x-hidden">
      <Navbar />

      <div className="w-full flex justify-center bg-light2 text-lightText1">
        <Hero merchantCurrency={merchantCurrency} />
      </div>

      <div id="How" className="w-full flex justify-center bg-[#121212] sm:bg-gradient-to-b sm:from-black sm:to-dark4 text-darkText1">
        <How merchantCurrency={merchantCurrency} />
      </div>

      <div
        id="LowCost"
        data-show="yes"
        className="w-full flex justify-center opacity-0 transition-all duration-1500 bg-light2 text-lightText1 sm:bg-[url('/globebg.svg')] bg-no-repeat [background-position:50%_calc(100%+200px)] lg:[background-position:50%_350%]"
      >
        <LowCost merchantCurrency={merchantCurrency} />
      </div>

      <div id="Simple" data-show="yes" className="w-full flex justify-center opacity-0 bg-dark1 text-darkText1 transition-all duration-1500">
        <Simple />
      </div>

      <div id="Benefits" data-show="yes" className="w-full flex justify-center opacity-0 bg-light2 text-lightText1 transition-all duration-1500">
        <Benefits merchantCurrency={merchantCurrency} rates={rates} />
      </div>

      <div id="Learn" data-show="yes" className="w-full flex justify-center bg-[#0A2540] text-white opacity-0 transition-all duration-1000">
        <Learn merchantCurrency={merchantCurrency} />
      </div>

      <div id="Support" data-show="yes" className="w-full flex justify-center bg-dark1 text-white opacity-0 transition-all duration-1000">
        <Support />
      </div>

      <div className="w-full flex justify-center bg-gradient-to-b from-dark1 to-dark5 text-white">
        <Footer />
      </div>
    </div>
  );
}
