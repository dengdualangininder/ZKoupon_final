// afterning signing into Coinbase, it will redirect to this URL
"use client";
// nextjs
import Image from "next/image";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const cbAuth = () => {
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
    <div className="w-full h-screen flex flex-col justify-center items-center bg-light1 text-lightText1">
      <div className="w-[340px] h-[60px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:desktop:h-[60px] animate-spin">
        <Image src="/loadingCircleBlack.svg" alt="loading" fill />
      </div>
      <div className="mt-4 textBaseApp">{t("connecting")}...</div>
    </div>
  );
};

export default cbAuth;
