// next
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
// prisma
import { PrismaClient, Rate } from "@prisma/client";
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
import { abb2full, countryData, currencyToKeys, defaultRates } from "@/utils/constants";
import { AllRates } from "@/utils/types";

const prisma = new PrismaClient();

//// this is a dynamic route, as we use unchaced fetch() and cookies() api ////
export default async function Home() {
  console.log("(landing)/page.tsx");

  // get merchantCurrency from cookies or api
  let merchantCurrency: string | undefined;
  merchantCurrency = cookies().get("currency")?.value;
  if (!merchantCurrency) {
    try {
      const res = await fetch("https://api.country.is", { cache: "no-store" });
      const data = await res.json();
      const country = abb2full[data.country] ?? "Other";
      merchantCurrency = countryData[country]?.currency ?? "USD";
      console.log("page.tsx country:", country, "merchantCurrency", merchantCurrency);
    } catch (e) {
      console.log("get country api failed, default to USD");
      merchantCurrency = "USD";
    }
  }

  // get rates from Supabase, cache to Data Cache
  const getAllRates = unstable_cache(
    async () => {
      const data = await prisma.rate.findMany({ orderBy: { id: "desc" }, take: 1 });
      var allRates: AllRates = {
        EUR: { usdToLocal: data[0].usdToEur ?? defaultRates.EUR.usdToLocal, usdcToLocal: data[0].usdcToEur ?? defaultRates.EUR.usdcToLocal },
        GBP: { usdToLocal: data[0].usdToGbp ?? defaultRates.GBP.usdToLocal, usdcToLocal: data[0].usdcToGbp ?? defaultRates.GBP.usdcToLocal },
        TWD: { usdToLocal: data[0].usdToTwd ?? defaultRates.TWD.usdToLocal, usdcToLocal: data[0].usdcToTwd ?? defaultRates.TWD.usdcToLocal },
        USD: { usdToLocal: 1, usdcToLocal: 1 },
      };
      return allRates;
    },
    ["rates"],
    { revalidate: 600 }
  );

  try {
    var allRates = await getAllRates();
  } catch (e) {
    var allRates = defaultRates;
  }
  console.log("allRates", allRates);

  return (
    <div className="overflow-x-hidden textLgHome tracking-[-0.01em]">
      <Navbar />

      <div className="w-full flex justify-center bg-light2 text-lightText1">
        <Hero merchantCurrency={merchantCurrency} />
      </div>

      <div id="How" className="w-full flex justify-center bg-[#121212] sm:bg-linear-to-b sm:from-black sm:to-dark4 text-darkText1">
        <How merchantCurrency={merchantCurrency} />
      </div>

      <div
        id="LowCost"
        data-show="yes"
        className="w-full flex justify-center opacity-0 transition-all duration-[1500ms] bg-light2 text-lightText1 sm:bg-[url('/globebg.svg')] bg-no-repeat [background-position:50%_calc(100%+200px)] lg:[background-position:50%_350%]"
      >
        <LowCost merchantCurrency={merchantCurrency} />
      </div>

      <div id="Simple" data-show="yes" className="w-full flex justify-center opacity-0 bg-dark1 text-darkText1 transition-all duration-[1500ms]">
        <Simple />
      </div>

      <div id="Benefits" data-show="yes" className="w-full flex justify-center opacity-0 bg-light2 text-lightText1 transition-all duration-[1500ms]">
        <Benefits merchantCurrency={merchantCurrency} allRates={allRates} />
      </div>

      <div id="Learn" data-show="yes" className="w-full flex justify-center bg-[#0A2540] text-white opacity-0 transition-all duration-[1000ms]">
        <Learn merchantCurrency={merchantCurrency} />
      </div>

      <div id="Support" data-show="yes" className="w-full flex justify-center bg-dark1 text-darkText1 opacity-0 transition-all duration-[1000ms]">
        <Support />
      </div>

      <div className="w-full flex justify-center bg-linear-to-b from-dark1 to-dark5 text-darkText1">
        <Footer />
      </div>
    </div>
  );
}
