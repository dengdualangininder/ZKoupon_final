"use client";
// nextjs
import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
// actions
import { setFlashInfoCookie } from "@/actions";
// wagmi
import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import { Chain } from "wagmi/chains";
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
import { useAccount, useWalletClient, useDisconnect, useAccountEffect } from "wagmi";
import { ADAPTER_EVENTS, CONNECTED_EVENT_DATA } from "@web3auth/base";
// others
import { getPublic } from "@toruslabs/eccrypto";
// types
import { UserInfo } from "@/utils/types";

const queryClient = new QueryClient();

const UserInfoContext = createContext<UserInfo | null>(null);
export const useUserInfo = () => useContext(UserInfoContext);

// prevent re-render from creating these variables again
let web3AuthInstance: Web3AuthNoModal;
let config: Config;

export default function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log("web3auth-provider.tsx", time);

  // hooks
  const router = useRouter();
  // const { disconnectAsync } = useDisconnect();
  // for usability test
  const searchParams = useSearchParams();
  const isUsabilityTest = searchParams.get("test") ? true : false;
  // states
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  //************************ CREATE WAGMI CONFIG ************************//

  if (!web3AuthInstance || !config) {
    console.log("create web3AuthInstance and config");
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

    web3AuthInstance = new Web3AuthNoModal({
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

    config = createConfig({
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
        Web3AuthConnector({
          web3AuthInstance: web3AuthInstance,
          loginParams: { loginProvider: "line" },
        }),
      ],
    });
  }

  useEffect(() => {
    if (isUsabilityTest) return;

    console.log("web3Auth-provider.tsx useEffect");
    // redirect to "saveToHome" page if mobile & not standalone
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isDesktop && !isStandalone && process.env.NODE_ENV != "development") {
      router.push("/saveAppToHome");
      return;
    }

    // get user type from cookies
    const userType = getCookie("userType");

    if (userType && userType === "employee") {
      console.log("web3Auth-provider.tsx useEffect, userType = employee");
      return;
    }

    if (web3AuthInstance.connected) {
      console.log("web3Auth-provider.tsx useEffect, web3Auth already connected");
      // get and set user info
      (async () => {
        try {
          const web3AuthUserInfo = await web3AuthInstance?.getUserInfo();
          console.log(web3AuthUserInfo);
          var idToken = web3AuthUserInfo.idToken;
          var privateKey: any = await web3AuthInstance?.provider?.request({ method: "eth_private_key" });
          var publicKey = getPublic(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");
          if (idToken && publicKey) {
            setFlashInfoCookie("merchant", publicKey);
            setUserInfo({ idToken: idToken, publicKey: publicKey });
            router.push("/app");
          } else {
            console.log("web3Auth-provider.tsx useEffect, logged out: idToken or publicKey returned undefined");
            logout();
            return;
          }
        } catch (e) {
          console.log("web3Auth-provider.tsx useEffect, logged out: error when getting idToken or publicKey");
          logout();
          return;
        }
      })();
    }

    // set a global web3Auth listener for both /login and /app => use this methohd so don't have to use web3Auth as context
    // potential issue => this listener still on when employee signs in, which is not clean
    console.log("web3Auth-provider.tsx useEffect, listener on, web3AuthInstance.connected:", web3AuthInstance.connected);
    web3AuthInstance?.on(ADAPTER_EVENTS.CONNECTED, async (data: CONNECTED_EVENT_DATA) => {
      console.log("web3Auth-provider.tsx useEffect, CONNECTED to web3Auth", web3AuthInstance.connected);
      // get and set user info
      try {
        const web3AuthUserInfo = await web3AuthInstance?.getUserInfo();
        console.log(web3AuthUserInfo);
        var idToken = web3AuthUserInfo.idToken;
        var privateKey: any = await web3AuthInstance?.provider?.request({ method: "eth_private_key" });
        var publicKey = getPublic(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");
        if (idToken && publicKey) {
          setFlashInfoCookie("merchant", publicKey);
          setUserInfo({ idToken: idToken, publicKey: publicKey });
          router.push("/app");
        } else {
          console.log("web3Auth-provider.tsx useEffect, logged out: idToken or publicKey returned undefined");
          logout();
          return;
        }
      } catch (e) {
        console.log("web3Auth-provider.tsx useEffect, logged out: error when getting idToken or publicKey");
        logout();
        return;
      }
    });

    // if merchant is supposedly already logged in (indicated by presence of userType), then web3Auth should re-connnect. If this doesn't happen within 6s, then logout.
    // TODO: consider refreshing first?
    // TODO: consider adding account.address (from wagmi), if web3AuthInstance.connected returns false after linking coinbase account
    if (userType && userType === "merchant") {
      console.log("web3Auth-provider.tsx useEffect, userType=merchant detected, 6s countdown, web3Auth.connected:", web3AuthInstance?.connected);
      setTimeout(async () => {
        if (!web3AuthInstance?.connected) {
          console.log("web3Auth-provider.tsx useEffect, logged out: 6s passed and still not connected");
          logout();
        }
      }, 6000);
    }
  }, []);

  function logout() {
    deleteCookie("userType");
    deleteCookie("flashToken");
    router.push("/login");
  }

  return (
    <UserInfoContext.Provider value={userInfo}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </UserInfoContext.Provider>
  );
}
