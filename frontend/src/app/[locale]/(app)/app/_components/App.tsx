"use client";
// nextjs
import dynamic from "next/dynamic";
// custom hooks
import { useW3Info } from "../../Web3AuthProvider";
import { useSettingsQuery } from "../../hooks";
import { useAccount } from "wagmi";

// components
const LazyApp = dynamic(() => import("./LazyApp"));
import Loading from "./Loading";
// types
import { FlashInfo, AllRates } from "@/utils/types";

export default function App({ flashInfo, allRates }: { flashInfo: FlashInfo; allRates: AllRates }) {
  console.log("(app)/app/_components/App.tsx");
  const account = useAccount();

  // get user settings
  const w3Info = useW3Info();
  const { data: settings } = useSettingsQuery(w3Info, flashInfo);

  // reason we have App and LazyApp is to fetch App JS bundle only after flashInfo cookies have been set (don't want to fetch App JS twice)
  return (
    <div className="textBaseApp bg-light1 text-lightText1 dark:bg-dark1 dark:text-darkText1 overscroll-none" style={{ scrollbarGutter: "stable" }}>
      {(flashInfo?.userType === "owner" && settings) || (flashInfo?.userType === "employee" && settings?.paymentSettings) ? (
        <LazyApp flashInfo={flashInfo} allRates={allRates} settings={settings} />
      ) : (
        <Loading />
      )}
    </div>
  );
}
