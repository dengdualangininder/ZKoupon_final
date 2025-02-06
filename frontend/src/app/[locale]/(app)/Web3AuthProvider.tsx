"use client";
// nextjs
import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams, usePathname } from "next/navigation";
import { logoutNoDisconnect } from "./hooks";
// wagmi
import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import { polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// web3auth
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getCookie, deleteCookie } from "cookies-next";
// wagmi
import { ADAPTER_EVENTS, CONNECTED_EVENT_DATA } from "@web3auth/base";
import { keccak256, getAddress } from "viem";
// others
import { getPublic } from "@toruslabs/eccrypto";
// actions
import { deleteUserJwtCookie, setFlashCookies } from "@/actions";
// types
import { W3Info } from "@/utils/types";

const queryClient = new QueryClient();

const W3InfoContext = createContext<W3Info | null>(null);
export const useW3Info = () => useContext(W3InfoContext);

// create privateKeyProvider
const chains = [polygon];
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x" + chains[0].id.toString(16),
  rpcTarget: chains[0].rpcUrls.default.http[0],
  displayName: chains[0].name,
  tickerName: chains[0].nativeCurrency?.name,
  ticker: chains[0].nativeCurrency?.symbol,
  blockExplorerUrl: chains[0].blockExplorers?.default.url,
  logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
};
const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

// creaet web3AuthInstance
const web3AuthInstance: Web3AuthNoModal = new Web3AuthNoModal({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_ID!,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider: privateKeyProvider,
});

// configure adapter, as 2FA prompt appears every now and then, which is undesired
const authAdapter = new AuthAdapter({
  loginSettings: {
    mfaLevel: "none",
  },
  privateKeyProvider: privateKeyProvider,
});
web3AuthInstance.configureAdapter(authAdapter);

const config: Config = createConfig({
  // wagmi default set up has ssr:true and storage: createStorage({storage:cookieStorage}), where cookieStorage is imported from wagmi (related to initialState?)
  chains: [polygon],
  transports: {
    [polygon.id]: http(),
  },
  connectors: [
    Web3AuthConnector({
      web3AuthInstance: web3AuthInstance,
      loginParams: { loginProvider: "google" },
    }),
    Web3AuthConnector({
      web3AuthInstance: web3AuthInstance,
      loginParams: { loginProvider: "facebook" },
    }),
    Web3AuthConnector({
      web3AuthInstance: web3AuthInstance,
      loginParams: { loginProvider: "apple" },
    }),
  ],
});
console.log("created new web3AuthInstance and config");

export default function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("(app)/web3auth-provider.tsx");
  // hooks
  const router = useRouter();
  const pathname = usePathname();
  // states
  const [w3Info, setW3Info] = useState<W3Info | null>(null);

  // Need to satisfy 3 conditions:
  // 1. user logins (no sessionId)
  // 2. user refreshes (sessionId is valid)
  // 3. user refreshes or returns to app, but sessionId is expired. TODO: find more efficient way to test if sessionId expired or not
  useEffect(() => {
    console.log("web3Auth-provider.tsx useEffect");

    // redirect to "saveToHome" if needed
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isDesktop && !isStandalone && process.env.NODE_ENV != "development") {
      router.push("/saveAppToHome");
      return;
    }

    // get user type from cookies (must use getCookie inside useEffect) & session Id
    const userType = getCookie("userType");
    const userJwt = getCookie("userJwt");
    let sessionId;
    const auth_store = window.localStorage.getItem("auth_store");
    if (auth_store) sessionId = JSON.parse(auth_store).sessionId;

    // if employee, then directly go to /app
    // if (userType && userType === "employee") {
    //   console.log("web3Auth-provider.tsx useEffect, userType = employee, pushed to /app");
    //   if (pathname != "/app") router.push("/app");
    //   return;
    // }

    // Condition 1
    if (!sessionId) {
      console.log("no sessionId");
      if (userJwt) deleteUserJwtCookie(); // just in case
      listenToOnConnect();
      if (pathname != "/login") router.push("/login"); // just in case
      return;
    }

    if (web3AuthInstance.connected) {
      console.log("web3AuthInstance already connected");
      setW3InfoAndFlashCookies(); // this sets W3Info and pushes to /app
    } else {
      // Condition 2
      console.log("sessionId exists but web3AuthInstance not connected");
      listenToOnConnect();
      // Condition 3
      console.log("set 6s countdown");
      setTimeout(() => {
        if (!web3AuthInstance.connected) {
          console.log("web3AuthInstance not connected after 10s, deleted userJwt and auth_store");
          deleteUserJwtCookie();
          window.localStorage.removeItem("auth_store");
          window.location.reload();
        }
      }, 6000);
    }

    return () => {
      web3AuthInstance.off(ADAPTER_EVENTS.CONNECTED, () => {
        console.log("web3AuthInstance onConnect listener off");
      });
    };
  }, []);

  async function listenToOnConnect() {
    console.log("listening to on connect...");
    web3AuthInstance?.on(ADAPTER_EVENTS.CONNECTED, async (data: CONNECTED_EVENT_DATA) => {
      console.log("web3Auth-provider.tsx, CONNECTED to web3Auth", web3AuthInstance.connected);
      setW3InfoAndFlashCookies();
    });
  }

  // merchantEvmAddress needed to set Flash cookies, so combine with set W3Info
  async function setW3InfoAndFlashCookies() {
    try {
      const userInfo = await web3AuthInstance?.getUserInfo();
      const privateKey: any = await web3AuthInstance?.provider?.request({ method: "eth_private_key" });
      const publicKey = getPublic(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");
      const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
      if (userInfo.idToken && publicKey) {
        const userType = getCookie("userType");
        const userJwt = getCookie("userJwt");
        if (!userType || userType === "employee" || !userJwt) await setFlashCookies("owner", merchantEvmAddress); // setFlashCookies will re-render entire route
        setW3Info({ idToken: userInfo.idToken, publicKey: publicKey, email: userInfo.email });
        console.log("web3Auth-provider.tsx, setW3Info successful");
        if (pathname != "/app") {
          console.log("pathname is", pathname, ", so pushed to /app");
          router.push("/app");
        }
      } else {
        console.log("web3Auth-provider.tsx, setUserAndFlashInfo(), logged out: idToken or publicKey returned undefined");
        logoutNoDisconnect();
      }
    } catch (e) {
      console.log("web3Auth-provider.tsx, setUserAndFlashInfo(), logged out: error when getting idToken or publicKey");
      logoutNoDisconnect();
    }
  }

  return (
    <W3InfoContext.Provider value={w3Info}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </W3InfoContext.Provider>
  );
}
