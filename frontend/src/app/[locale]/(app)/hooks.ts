"use client";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FlashInfo, UserInfo } from "@/utils/types";
import { fakePaymentSettings, fakeCashoutSettings, fakeTxns } from "@/utils/txns";

export default function hooks() {
  return;
}

export const useSettingsQuery = (userInfo: UserInfo | null, flashInfo: FlashInfo) => {
  console.log("useSettingsQuery hook");
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      console.log("useSettingsQuery queryFn");
      if (flashInfo.isUsabilityTest) {
        return { paymentSettings: fakePaymentSettings, cashoutSettings: fakeCashoutSettings };
      } else {
        const res = await fetch("/api/getSettings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userInfo: userInfo }),
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const resJson = await res.json();
        if (resJson.status === "success") {
          return resJson.data;
        } else if (resJson === "create new user") {
          // create user
        } else if (resJson === "error") {
          await useLogout();
        }
        throw new Error("error");
      }
    },
    enabled: userInfo && flashInfo ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const usePaymentsQuery = (userInfo: UserInfo | null, flashInfo: FlashInfo) => {
  console.log("usePaymentsQuery hook");
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      console.log("usePaymentsQuery queryFn");
      if (flashInfo.isUsabilityTest) {
        return fakeTxns;
      } else {
        const res = await fetch("/api/getPayments", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userInfo: userInfo, flashInfo: flashInfo }),
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const resJson = await res.json();

        if (resJson.status === "success") {
          return resJson.data;
        } else if (resJson === "create new user") {
          //
        } else if (resJson.status === "error") {
          await useLogout();
        }
      }
    },
    enabled: userInfo && flashInfo ? true : false,
  });
};

export async function useLogout() {
  const router = useRouter();
  deleteCookie("flashToken");
  deleteCookie("userType");
  router.push("./login");
}
