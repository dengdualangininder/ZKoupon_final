// afterning signing into Coinbase, it will redirect to this URL
"use client";
// nextjs
import Image from "next/image";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function CbAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("App.CbAuth");

  // need useEffect because need to access window object
  useEffect(() => {
    (async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const browserState = window.sessionStorage.getItem("cbRandomSecure");
      window.sessionStorage.removeItem("cbRandomSecure");
      // if verified
      if (code && state && state === browserState) {
        const res = await fetch("/api/cbGetNewTokens", {
          method: "POST",
          body: JSON.stringify({ code: code }),
          headers: { "content-type": "application/json" },
        });
        if (!res.ok) throw new Error("failed to fetch");
        const resJson = await res.json();
        if (resJson.status === "success") {
          window.sessionStorage.setItem("cbAccessToken", resJson.data.cbAccessToken);
          window.localStorage.setItem("cbRefreshToken", resJson.data.cbRefreshToken);
          window.localStorage.setItem("cbNewlyLinked", "true");
          router.push("/app");
          return;
        }
      }
      // if not verified
      window.sessionStorage.removeItem("cbAccessToken");
      window.localStorage.removeItem("cbRefreshToken");
      router.push("/app");
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
