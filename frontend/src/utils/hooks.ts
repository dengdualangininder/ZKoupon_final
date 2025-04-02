import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useDisconnect, useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
// utils
import { fetchPost, fetchGetWithCred } from "@/utils/functions";
import { queueQuery } from "@/utils/queueQuery";
import { deleteCookieAction, initIntroAction } from "@/utils/actions";
import erc20Abi from "@/utils/abis/erc20Abi";
import { Transaction } from "@/db/UserModel";
import { NullaInfo, Web3AuthInfo } from "@/utils/types";
import { Filter } from "@/utils/types";
import { CashoutSettings, PaymentSettings } from "@/db/UserModel";

export const useSettingsQuery = (web3AuthInfo: Web3AuthInfo | null, nullaInfo: NullaInfo) => {
  const logout = useLogout();
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<{ paymentSettings: PaymentSettings; cashoutSettings: CashoutSettings }> => {
      console.log("useSettingsQuery queryFn ran");
      const resJson = await fetchPost("/api/getSettings", { web3AuthInfo, nullaInfo });
      if (resJson.status === "success") {
        console.log("settings fetched", resJson.data);
        return resJson.data;
      }
      if (resJson.status === "new user") {
        console.log("queryFn detected new user, set isIntro=true, pushed to /intro");
        initIntroAction();
        return resJson.data;
      }
      if (resJson === "not verified") {
        logout();
      }
      throw new Error();
    },
    enabled: (nullaInfo && nullaInfo.userType === "owner" && web3AuthInfo) || (nullaInfo && nullaInfo.userType === "employee") ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useSettingsMutation = () => {
  const queryClient = useQueryClient();
  const logout = useLogout();
  return useMutation({
    mutationFn: async ({ changes, web3AuthInfo }: { changes: { [key: string]: string }; web3AuthInfo: Web3AuthInfo | null }) => {
      console.log("useSettingsMutation mutationFn ran");
      const res = await fetch("/api/saveSettings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ changes, web3AuthInfo }),
      });
      const resJson = await res.json();
      if (resJson === "saved") return;
      if (resJson === "not verified") logout();
      throw new Error();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] }); // use onSettled over onSuccess to revert any optimistic updates
    },
  });
};

export const useTxnsQuery = (web3AuthInfo: Web3AuthInfo | null, nullaInfo: NullaInfo, filter: Filter) => {
  const logout = useLogout();
  return useInfiniteQuery({
    queryKey: ["txns", filter],
    queryFn: async ({ pageParam }): Promise<Transaction[] | null> => {
      console.log("useTxnsQuery queryFn ran, pageParam:", pageParam, filter);

      const res = await fetch("/api/getPayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageParam, web3AuthInfo, nullaInfo, filter }),
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
    getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length : undefined), // lastPage = [10 items], allPages = [[10 items]]; should return "undefined" if no next page
    enabled: (nullaInfo && nullaInfo.userType === "owner" && web3AuthInfo) || (nullaInfo && nullaInfo.userType === "employee") ? true : false,
  });
};

export const useCbBalanceQuery = (isCbLinked: boolean) => {
  return useQuery({
    queryKey: ["cbBalance"],
    queryFn: () =>
      queueQuery(async () => {
        console.log("queued useCbBalanceQuery queryFn");
        const resJson = await fetchGetWithCred("/api/cbGetBalance");
        if (resJson.status === "success") {
          console.log("fetched cbBalance");
          return resJson.data;
        }
        console.log("error fetching cbBalance");
        throw new Error();
      }),
    enabled: isCbLinked ? true : false,
  });
};

export const useCbTxnsQuery = (isCbLinked: boolean) => {
  return useQuery({
    queryKey: ["cbTxns"],
    queryFn: () =>
      queueQuery(async () => {
        console.log("queued useCbTxnQuery queryFn");
        const resJson = await fetchGetWithCred("/api/cbGetTxns");
        if (resJson.status === "success") {
          console.log("fetched cbTxns");
          return resJson.data;
        }
        console.log("error fetching cbTxns");
        throw new Error();
      }),
    enabled: isCbLinked ? true : false,
  });
};

export const useNullaBalanceQuery = () => {
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
    window.localStorage.removeItem("auth_store");
    await deleteCookieAction("userJwt");
    await disconnectAsync();
    window.location.href = "/login"; // hard refresh so provider useEffect is re-run (router.push not effective); locale is facotred in
  }, []);

  return logout;
};

export async function logoutNoDisconnect() {
  console.log("logoutNoDisconnect()");
  window.sessionStorage.removeItem("cbAccessToken");
  window.localStorage.removeItem("cbRefreshToken");
  await deleteCookieAction("userJwt");
  window.location.href = "/login"; // hard refresh so provider useEffect is re-run (router.push not effective); locale is facotred in
}

// export const useCbBalanceQuery = () => {
//   return useQuery({
//     queryKey: ["cbBalance"],
//     queryFn: () =>
//       queueQuery(async () => {
//         console.log("queued useCbBalanceQuery queryFn");
//         const cbRefreshToken = window.localStorage.getItem("cbRefreshToken");
//         const cbAccessToken = window.sessionStorage.getItem("cbAccessToken");
//         const resJson = await fetchPost("/api/cbGetBalance", { cbRefreshToken, cbAccessToken });
//         if (resJson.status === "success") {
//           console.log("fetched cbBalance");
//           if (resJson.newTokens) {
//             console.log("set new cbTokens");
//             window.localStorage.setItem("cbRefreshToken", resJson.newTokens.newRefreshToken);
//             window.sessionStorage.setItem("cbAccessToken", resJson.newTokens.newAccessToken);
//           }
//           return resJson.data;
//         }
//         console.log("error fetching cbBalance");
//         throw new Error();
//       }),
//     enabled: window && window.localStorage.getItem("cbRefreshToken") ? true : false,
//   });
// };

// export const useCbTxnsQuery = () => {
//   return useQuery({
//     queryKey: ["cbTxns"],
//     queryFn: () =>
//       queueQuery(async () => {
//         console.log("queued useCbTxnQuery queryFn");
//         const cbRefreshToken = window.localStorage.getItem("cbRefreshToken");
//         const cbAccessToken = window.sessionStorage.getItem("cbAccessToken");
//         const resJson = await fetchPost("/api/cbGetTxns", { cbRefreshToken, cbAccessToken });
//         if (resJson.status === "success") {
//           console.log("fetched cbTxns");
//           if (resJson.newTokens) {
//             console.log("set new cbTokens");
//             window.localStorage.setItem("cbRefreshToken", resJson.newTokens.newRefreshToken);
//             window.sessionStorage.setItem("cbAccessToken", resJson.newTokens.newAccessToken);
//           }
//           return resJson.data;
//         }
//         console.log("error fetching cbTxns");
//         throw new Error();
//       }),
//     enabled: window && window.localStorage.getItem("cbRefreshToken") ? true : false,
//   });
// };
