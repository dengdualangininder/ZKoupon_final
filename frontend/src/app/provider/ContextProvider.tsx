"use client";
// nextjs
import { useState, useEffect, createContext, useContext } from "react";
// wagmi
import { WagmiProvider, createConfig, http } from "wagmi";
import { Chain } from "wagmi/chains";
import { polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// web3auth
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter, OPENLOGIN_NETWORK } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// import { Chain } from "wagmi/chains";
// import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";

const queryClient = new QueryClient();

const chains = [polygon];

export const Web3AuthContext = createContext<Web3AuthNoModal | null>(null);
export const useWeb3Auth = () => useContext(Web3AuthContext);

// useEffect(() => {}, []);

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  // create web3Auth instance
  console.log("new web3Auth instance");
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

  return (
    <Web3AuthContext.Provider value={web3AuthInstance}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </Web3AuthContext.Provider>
  );
};

export default ContextProvider;
