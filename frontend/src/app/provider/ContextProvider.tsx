"use client";
// nextjs
import { useState, useEffect, createContext, useContext } from "react";
// wagmi
import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import { Chain } from "wagmi/chains";
import { polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// web3auth
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, WALLET_ADAPTERS, ADAPTER_EVENTS, CONNECTED_EVENT_DATA } from "@web3auth/base";
import { OpenloginAdapter, OPENLOGIN_NETWORK } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const queryClient = new QueryClient();
const chains = [polygon];

const Web3AuthContext = createContext<Web3AuthNoModal | null>(null); // always starts with null
export const useWeb3Auth = () => useContext(Web3AuthContext);

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  console.log("ContextProvider.tsx rendered once");

  // create web3Auth instance
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x" + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0],
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
    blockExplorerUrl: chains[0].blockExplorers?.default.url,
    logo: "chainLogo",
  };
  const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
  const web3AuthInstance = new Web3AuthNoModal({
    chainConfig: chainConfig,
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_ID!,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET, // doc says "Defines the Web3Auth network. It accepts OPENLOGIN_NETWORK_TYPE"
    uiConfig: {
      // mode: "dark",
      // useLogoLoader: true,
      // logoLight: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      // logoDark: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      // defaultLanguage: "en",
      // theme: {
      //   primary: "#768729",
      // },
    }, // takes type WhiteLabelData as value
    privateKeyProvider: privateKeyProvider,
  });
  // configure social logins
  const openloginAdapterInstance = new OpenloginAdapter({
    // privateKeyProvider,
    adapterSettings: {
      whiteLabel: {
        appName: "Flash Pay",
        appUrl: "https://www.flashpayments.xyz",
        defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
        useLogoLoader: true,
      },
    },
    privateKeyProvider,
  });
  web3AuthInstance.configureAdapter(openloginAdapterInstance);

  const config = createConfig({
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
        loginParams: { loginProvider: "apple" },
      }),
      Web3AuthConnector({
        web3AuthInstance: web3AuthInstance,
        loginParams: { loginProvider: "line" },
      }),
    ],
  });

  // // calling init() on web3Auth removes the ability of walletClient in Page.tsx useEffect's dependency array to detect appropriate changes
  // useEffect(() => {
  //   (async () => {
  //     await web3AuthInstance.init();
  //   })();
  // }, []);

  web3AuthInstance.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
    console.log("connected to wallet", data);
    // web3auth.provider will be available here after user is connected
  });
  web3AuthInstance.on(ADAPTER_EVENTS.CONNECTING, () => {
    console.log("connecting");
  });
  web3AuthInstance.on(ADAPTER_EVENTS.DISCONNECTED, () => {
    console.log("disconnected");
  });
  web3AuthInstance.on(ADAPTER_EVENTS.ERRORED, (error: any) => {
    console.log("error", error);
  });
  web3AuthInstance.on(ADAPTER_EVENTS.ERRORED, (error: any) => {
    console.log("error", error);
  });

  // const [web3Auth, setWeb3Auth] = useState(web3AuthInstance);

  return (
    <Web3AuthContext.Provider value={web3AuthInstance}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </Web3AuthContext.Provider>
  );
}
