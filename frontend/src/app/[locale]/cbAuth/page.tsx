// afterning signing into Coinbase, it will redirect to this URL
"use client";
// nextjs
import Image from "next/image";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { fetchPost } from "@/utils/functions";

export default function CbAuth() {
  console.log("/cbAuth/page.tsx");
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("App.CbAuth");

  useEffect(() => {
    (async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const browserState = window.sessionStorage.getItem("cbRandomSecure");
      window.sessionStorage.removeItem("cbRandomSecure");
      // if verified
      if (code && state && state === browserState) {
        const resJson = await fetchPost("/api/cbGetNewTokens", { code: code });
        if (resJson.status === "success") {
          console.log("cb linked");
        } else {
          console.log("cb not linked");
        }
      }
      window.localStorage.setItem("goToCashout", "true");
      window.location.href = "/app"; // use this instead of router.push() to get full page reload so browser sees new cookie
    })();
  }, []);

  return (
    <div className="w-full h-screen flex justify-center bg-light2 overflow-y-auto">
      <div className="w-full mx-[16px] max-w-[450px] h-full min-h-[600px] max-h-[900px] my-auto">
        {/*--- welcome ---*/}
        <div className="w-full h-full flex flex-col items-center justify-center pb-[50px]">
          <Image src="/logoBlackNoBg.svg" width={220} height={54} alt="logo" priority />
          {/* loading */}
          <div className="w-full h-[272px] flex flex-col items-center">
            <Image src="/loading.svg" width={80} height={80} alt="loading" className="mt-[80px] animate-spin" />
            <div className="mt-4 font-medium textBaseApp text-slate-500">{t("connecting")}...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
