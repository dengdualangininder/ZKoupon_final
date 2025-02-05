import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useDisconnect } from "wagmi";
import { useRouter } from "@/i18n/routing";
// utils
import { FlashInfo, W3Info } from "@/utils/types";
import { fakePaymentSettings, fakeCashoutSettings, fakeTxns } from "@/utils/txns";
import erc20Abi from "@/utils/abis/erc20Abi";
// actions
import { deleteUserJwtCookie } from "@/actions";
import { CashoutSettings, PaymentSettings } from "@/db/UserModel";
// types
import { Transaction } from "@/db/UserModel";
import { Rates, Filter } from "@/utils/types";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

export const useSettingsQuery = (w3Info: W3Info | null, flashInfo: FlashInfo) => {
  const router = useRouter();
  const logout = useLogout();
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<{ paymentSettings: PaymentSettings; cashoutSettings: CashoutSettings } | null> => {
      console.log("useSettingsQuery queryFn ran");

      const res = await fetch("/api/getSettings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ w3Info: w3Info }),
      });
      const resJson = await res.json();
      if (resJson.status === "success") {
        console.log("settings fetched", resJson.data);
        return resJson.data;
      }
      if (resJson === "create new user") {
        router.push("/intro");
        return null;
      }
      if (resJson === "not verified") {
        logout();
        return null;
      }
      throw new Error();
    },
    enabled: w3Info && flashInfo ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useSettingsMutation = () => {
  const queryClient = useQueryClient();
  const logout = useLogout();

  return useMutation({
    mutationFn: async ({ changes, w3Info }: { changes: { [key: string]: string }; w3Info: W3Info | null }) => {
      console.log("useSettingsMutation mutationFn ran");
      const res = await fetch("/api/saveSettings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ changes, w3Info }),
      });
      const resJson = await res.json();
      if (resJson === "saved") return;
      if (resJson === "not verified") logout();
      throw new Error();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useTxnsQuery = (w3Info: W3Info | null, flashInfo: FlashInfo, filter: Filter) => {
  const logout = useLogout();
  return useInfiniteQuery({
    queryKey: ["txns", filter],
    queryFn: async ({ pageParam }): Promise<Transaction[] | null> => {
      console.log("useTxnsQuery queryFn ran, pageParam:", pageParam);

      const res = await fetch("/api/getPayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageParam, w3Info, flashInfo, filter }),
      });
      const resJson = await res.json();
      if (resJson.status === "success") {
        console.log("txns fetched", resJson.data);
        return resJson.data;
      }
      if (resJson === "create new user") return null;
      if (resJson.status === "not verified") {
        logout();
        return null;
      }
      throw new Error();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length : undefined),
    enabled: w3Info && flashInfo ? true : false,
  });
};

export const useCexBalanceQuery = () => {
  return useQuery({
    queryKey: ["cexBalance"],
    queryFn: async (): Promise<string> => {
      console.log("useCexBalance queryFn ran");
      const cbAccessToken = window.sessionStorage.getItem("cbAccessToken");
      const cbRefreshToken = window.localStorage.getItem("cbRefreshToken");
      if (cbRefreshToken) {
        const res = await fetch("/api/cbGetBalance", {
          method: "POST",
          body: JSON.stringify({ cbAccessToken, cbRefreshToken }),
          headers: { "content-type": "application/json" },
        });
        const resJson = await res.json();
        if (resJson.status === "success") {
          console.log("fetched cexBalance");
          if (resJson.data.newCbAccessToken && resJson.data.newCbRefreshToken) {
            console.log("stored new tokens");
            window.sessionStorage.setItem("cbAccessToken", resJson.data.newCbAccessToken);
            window.localStorage.setItem("cbRefreshToken", resJson.data.newCbRefreshToken);
          }
          return (Math.floor(resJson.data.balance * 100) / 100).toString();
        }
      }
      throw new Error();
    },
    enabled: window && window.localStorage.getItem("cbRefreshToken") ? true : false,
  });
};

type CexTxns = { pendingUsdcDeposits: any[]; pendingUsdcWithdrawals: any[]; pendingUsdWithdrawals: any[] };
export const useCexTxnsQuery = () => {
  return useQuery({
    queryKey: ["cexTxns"],
    queryFn: async (): Promise<CexTxns> => {
      console.log("useCexTxns queryFn ran");
      const cbAccessToken = window.sessionStorage.getItem("cbAccessToken");
      const cbRefreshToken = window.localStorage.getItem("cbRefreshToken");
      if (cbRefreshToken) {
        const res = await fetch("/api/cbGetTxns", {
          method: "POST",
          body: JSON.stringify({ cbAccessToken, cbRefreshToken }),
          headers: { "content-type": "application/json" },
        });
        const resJson = await res.json();
        if (resJson.status === "success") {
          console.log("fetched cexTxns", resJson.data);
          if (resJson.data.newCbAccessToken && resJson.data.newCbRefreshToken) {
            console.log("stored new tokens");
            window.sessionStorage.setItem("cbAccessToken", resJson.data.newCbAccessToken);
            window.localStorage.setItem("cbRefreshToken", resJson.data.newCbRefreshToken);
          }
          return resJson.data.txns;
        }
      }
      throw new Error();
    },
    enabled: window && window.localStorage.getItem("cbRefreshToken") ? true : false,
  });
};

export const useFlashBalanceQuery = () => {
  const account = useAccount();
  return useReadContract({
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address ?? "0x0"],
    query: {
      enabled: account.address ? true : false,
      select: (data): string => (Math.floor(Number(formatUnits(data, 6)) * 100) / 100).toString(),
    },
  });
};

export const useLogout = () => {
  const { disconnectAsync } = useDisconnect();

  const logout = useCallback(async () => {
    console.log("logout()");
    window.sessionStorage.removeItem("cbAccessToken");
    window.localStorage.removeItem("cbRefreshToken");
    await deleteUserJwtCookie();
    await disconnectAsync();
    window.location.href = "/login"; // hard refresh so provider useEffect is re-run (router.push not effective); locale is facotred in
  }, []);

  return logout;
};

export async function logoutNoDisconnect() {
  console.log("logoutNoDisconnect()");
  window.sessionStorage.removeItem("cbAccessToken");
  window.localStorage.removeItem("cbRefreshToken");
  await deleteUserJwtCookie();
  window.location.href = "/login"; // hard refresh so provider useEffect is re-run (router.push not effective); locale is facotred in
}
