"use client";
import { setCookieAction } from "@/utils/actions";
// constants
import { currencyList } from "@/utils/constants";

export default function HowClient({ merchantCurrency }: { merchantCurrency: string | undefined }) {
  return (
    <select
      className="mt-4 sm:mt-0 h-[44px] sm:h-[36px] py-0 font-medium pr-10 text-xl sm:text-base leading-none border bg-dark6 border-slate-600 outline-hidden focus:outline-hidden focus:ring-0 focus:border-slate-400 transition-colors duration-500 rounded-md"
      onChange={async (e) => setCookieAction("currency", e.currentTarget.value)}
      value={merchantCurrency}
    >
      {currencyList.map((i, index) => (
        <option key={index}>{i}</option>
      ))}
    </select>
  );
}
