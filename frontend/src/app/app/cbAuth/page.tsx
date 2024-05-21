// afterning signing into Coinbase, it will redirect to this URL
"use client";
// nextjs
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const cbAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // need useEffect because need to access window object
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      (async () => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const browserState = window.sessionStorage.getItem("cbRandomSecure");
        // if successful, exit function
        if (code && state && state == browserState) {
          const res = await fetch("/api/cbGetNewTokens", {
            method: "POST",
            body: JSON.stringify({ code: code }),
            headers: { "content-type": "application/json" },
          });
          const data = await res.json();
          if (data.cbAccessToken && data.cbRefreshToken) {
            window.sessionStorage.setItem("cbAccessToken", data.cbAccessToken);
            window.localStorage.setItem("cbRefreshToken", data.cbRefreshToken); // TODO: store in MongoDB is safer
            router.push("/app");
            return;
          }
        }
        // if not successful, remove items from storage
        window.sessionStorage.removeItem("cbRandomSecure");
        window.sessionStorage.removeItem("cbAccessToken");
        window.localStorage.removeItem("cbRefreshToken");
        router.push("/app");
      })();
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="w-[340px] h-[60px] portrait:sm:h-[100px] landscape:lg:h-[100px] animate-spin">
        <Image src="/loadingCircleBlack.svg" alt="loading" fill />
      </div>
      <div className="mt-4 textLg">Connecting To Coinbase...</div>
    </div>
  );
};

export default cbAuth;
