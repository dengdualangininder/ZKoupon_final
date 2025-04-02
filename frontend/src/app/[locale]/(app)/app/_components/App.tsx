"use client";
// nextjs
import dynamic from "next/dynamic";
// custom hooks
import { useWeb3AuthInfo } from "../../Web3AuthProvider";
import { useSettingsQuery } from "@/utils/hooks";
// components
const LazyApp = dynamic(() => import("./LazyApp"));
import Loading from "./Loading";
// utils
import { NullaInfo, AllRates } from "@/utils/types";

// reason we have App and LazyApp is to fetch App JS bundle only after nullaInfo cookies have been set (don't want to fetch App JS twice)
export default function App({ nullaInfo, allRates, isCbLinked }: { nullaInfo: NullaInfo; allRates: AllRates; isCbLinked: boolean }) {
  console.log("(app)/app/_components/App.tsx");

  const web3AuthInfo = useWeb3AuthInfo();
  const { data: settings } = useSettingsQuery(web3AuthInfo, nullaInfo);

  // use "settings?.paymentSettings.merchantCountry" instead of "settings" to ensure LazyApp is not loaded for newly created users
  return (
    <div className="textBaseApp bg-light1 text-lightText1 dark:bg-dark1 dark:text-darkText1 overscroll-none" style={{ scrollbarGutter: "stable" }}>
      {nullaInfo?.userJwt && settings?.paymentSettings.merchantCountry ? (
        <LazyApp nullaInfo={nullaInfo} allRates={allRates} settings={settings} isCbLinked={isCbLinked} />
      ) : (
        <Loading />
      )}
    </div>
  );
}
