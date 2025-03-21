"use client";
// nextjs
import dynamic from "next/dynamic";
// custom hooks
import { useW3Info } from "../../Web3AuthProvider";
import { useSettingsQuery } from "../../hooks";
// components
const LazyApp = dynamic(() => import("./LazyApp"));
import Loading from "./Loading";
// types
import { NullaInfo, AllRates } from "@/utils/types";

export default function App({ nullaInfo, allRates }: { nullaInfo: NullaInfo; allRates: AllRates }) {
  console.log("(app)/app/_components/App.tsx");

  // get user settings
  const w3Info = useW3Info();
  const { data: settings } = useSettingsQuery(w3Info, nullaInfo);

  // const settings = null;

  // reason we have App and LazyApp is to fetch App JS bundle only after nullaInfo cookies have been set (don't want to fetch App JS twice)
  return (
    <div className="textBaseApp bg-light1 text-lightText1 dark:bg-dark1 dark:text-darkText1 overscroll-none" style={{ scrollbarGutter: "stable" }}>
      {(nullaInfo?.userType === "owner" && settings) || (nullaInfo?.userType === "employee" && settings?.paymentSettings) ? (
        <LazyApp nullaInfo={nullaInfo} allRates={allRates} settings={settings} />
      ) : (
        <Loading />
      )}
    </div>
  );
}
