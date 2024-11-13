"use client";
// nextjs
import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import axios from "axios";
import { getCookie } from "cookies-next";
// wagmi
import { useAccount, useWalletClient, useDisconnect, useAccountEffect } from "wagmi";
import { ADAPTER_EVENTS, CONNECTED_EVENT_DATA } from "@web3auth/base";
// others
import Pusher from "pusher-js";
import { getPublic } from "@toruslabs/eccrypto";
import { Router } from "next/router";
// constants
import { fakePaymentSettings, fakeCashoutSettings, fakeTxns } from "@/utils/txns";
// types
import { PaymentSettings, CashoutSettings, Transaction } from "@/db/UserModel";
type UserInfo = {
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  idToken: string;
  publicKey: string;
  isUsabilityTest: boolean;
};

const queryClient = new QueryClient();

const UserInfoContext = createContext<UserInfo | null>(null);
export const useUserInfo = () => useContext(UserInfoContext);

// prevent re-render from creating these variables again
let web3AuthInstance: Web3AuthNoModal;
let config: Config;

export default function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  // get cookies
  const employeeJwt = getCookie("employeeJwt");
  console.log("ContextProvider.tsx, employeeJwt:", employeeJwt);

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

  //************************ LOG IN ************************//

  useEffect(() => {
    console.log("/ContextProvider.tsx useEffect");

    // usability test
    if (isUsabilityTest) {
      setUserInfo({ idToken: "admin", publicKey: "admin", paymentSettings: fakePaymentSettings, cashoutSettings: fakeCashoutSettings, isUsabilityTest: true });
      // setTransactionsState(fakeTxns);
      // setIsAdmin(true);
      router.push("/intro");
      return;
    }

    // redirect to "saveToHome" page if mobile & not standalone
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isDesktop && !isStandalone && process.env.NODE_ENV != "development") {
      router.push("/saveAppToHome");
      return;
    }

    // check if employee login
    if (employeeJwt) {
      verifyAndGetEmployeeData(); // should still in background
      return;
    }

    // if no sessionId in local storage, then redirect to login
    const authStoreJson = window.localStorage.getItem("auth_store") || "";
    if (!authStoreJson || !JSON.parse(authStoreJson).sessionId) {
      console.log("no web3Auth sessionId, redirect to Login");
      router.push("/login");
      return;
    }

    // if all above passes, create web3Auth listener
    if (!web3AuthInstance.connected) {
      web3AuthInstance?.on(ADAPTER_EVENTS.CONNECTED, async (data: CONNECTED_EVENT_DATA) => {
        console.log("CONNECTED to web3Auth", web3AuthInstance.connected);

        // verify provider is available, can possibly remove as seems this event only fires when it is available
        try {
          var privateKey: any = await web3AuthInstance?.provider?.request({ method: "eth_private_key" });
          verifyAndGetData(); // should run in background
          // router.push("/app");
        } catch {
          console.log("error: web3Auth provider not available");
        }
      });
    } else {
      verifyAndGetData(); // should run in background
    }

    // if sessionId exists and if not connected after 6s, then redirect to login; sessionId expires in 7 days
    if (JSON.parse(authStoreJson).sessionId && web3AuthInstance?.connected) {
      setTimeout(() => {
        console.log("6s countdown", "web3Auth.connected", web3AuthInstance?.connected);
        // consider adding account.address (from wagmi), if web3AuthInstance.connected returns false after linking coinbase account
        if (!web3AuthInstance?.connected) {
          // router.push("/app/login");
        }
      }, 6000);
    }

    // // set dark mode as default
    // if (window.localStorage.theme) {
    //   setTheme(window.localStorage.theme);
    // } else {
    //   window.localStorage.setItem("theme", "dark");
    //   setTheme("dark");
    // }
  }, []);

  // useEffect(() => {
  //   if (newTxn) {
  //     console.log("added new txn to transactionsState");
  //     setTransactionsState([...transactionsState, newTxn]);
  //     setBannerModal(true);
  //     setTimeout(() => {
  //       setBannerModal(false);
  //       setNewTxn(null);
  //     }, 5000);
  //   }
  // }, [newTxn]);

  async function verifyAndGetData() {
    console.log("/app, verifyAndGetData()");

    // get idToken and publicKey
    try {
      const userInfo = await web3AuthInstance?.getUserInfo();
      var idToken = userInfo?.idToken;
      var privateKey: any = await web3AuthInstance?.provider?.request({ method: "eth_private_key" });
    } catch (e) {
      console.log("error: could not get idToken and publicKey, page set to Login");
      // router.push("/app/login");
      return;
    }

    // get user doc (idToken and publicKey will be verified)
    if (idToken && privateKey) {
      const publicKey = getPublic(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");

      try {
        const res = await fetch("/api/getUserDoc", {
          method: "POST",
          body: JSON.stringify({ idToken: idToken, publicKey: publicKey }),
          headers: { "content-type": "application/json" },
        });
        var data = await res.json();
      } catch (err) {
        console.log("error: api request to getUserDoc failed");
        // await disconnectAsync();
        // router.push("/app/login");
        return;
      }

      // THREE POSSIBLE REUTRN VALUES
      if (data.status == "success") {
        console.log("user doc fetched");
        // set userInfo state
        setUserInfo({ idToken: idToken, publicKey: publicKey, paymentSettings: data.doc.paymentSettings, cashoutSettings: data.doc.cashoutSettings, isUsabilityTest: false });

        // subscribe pusher
        subscribePusher(data.doc.paymentSettings.merchantEvmAddress);

        // check if redirected from Coinbase
        const cbRandomSecure = window.sessionStorage.getItem("cbRandomSecure");
        if (cbRandomSecure) {
          // console.log("cbRandomSecure", cbRandomSecure);
          // const substate = cbRandomSecure.split("SUBSTATE")[1];
          // console.log("substate", substate);
          // substate == "cashOut" ? setMenu("cashOut") : null;
          // substate == "fromIntro" ? setCbIntroModal(true) : null;
          // window.sessionStorage.removeItem("cbRandomSecure");
        }

        // router.push("/app"); // starthere
      } else if (data == "create new user") {
        createNewUser();
      } else if (data.status == "error") {
        // await disconnectAsync();
        // router.push("/app/login"); // starthere
      }
    }
  }

  async function verifyAndGetEmployeeData() {
    // console.log("verifyAndGetEmployeeData()");
    // const res = await fetch("/api/getEmployeeData", {
    //   method: "GET",
    //   headers: { "content-type": "application/json" },
    // });
    // const data = await res.json();
    // if (data.status == "success") {
    //   console.log("fetched employee data");
    //   setTransactionsState(data.transactions);
    //   setPaymentSettingsState(data.paymentSettings);
    //   setIsAdmin(false);
    //   setPage("app");
    // } else {
    //   console.log("employee login failed");
    //   setPage("login");
    // }
  }

  const subscribePusher = async (merchantEvmAddress: string) => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! });
    // test for connection errors
    pusher.connection.bind("error", (e: any) => {
      console.error("Pusher connection error:", e);
    });
    // listen for events called "payment" on channel with name equal to merchantEvmAddress
    var channel = pusher.subscribe(merchantEvmAddress);
    console.log("listening to channel:", merchantEvmAddress);
    channel.bind("payment", async ({ txn }: { txn: Transaction }) => {
      console.log("pusher txn", txn);
      // setNewTxn(txn); TODO: set up newTx context obeject with newTx.set and newTx.state
    });
  };

  // reason this is not in newuser component is because web3auth context already used here, don't want to use in another component
  const createNewUser = async () => {
    console.log("creating new user");
    // set merchantCountry, merchantCurrency, and cex
    // try {
    //   const res = await axios.get("https://api.country.is");
    //   var merchantCountry = abb2full[res.data.country] ?? "Other";
    //   var merchantCurrency = countryData[merchantCountry]?.currency ?? "USD";
    //   var cex = countryData[merchantCountry]?.CEXes[0] ?? "";
    //   console.log("createNewUser: detected country, currency, and CEX:", merchantCountry, merchantCurrency, cex);
    // } catch (err) {
    //   merchantCountry = "U.S.";
    //   merchantCurrency = "USD";
    //   cex = "Coinbase";
    //   console.log("createNewUser error: country not detect, set to default");
    // }
    // // set merchantEmail and merchantEvmAddress
    // const merchantEmail = (await web3Auth?.getUserInfo())?.email || ""; // TODO:check if this works for Apple login
    // const merchantEvmAddress = account.address;
    // // create new user in db
    // try {
    //   const res = await fetch("/api/createUser", {
    //     method: "POST",
    //     headers: { "content-type": "application/json" },
    //     body: JSON.stringify({ merchantEvmAddress, merchantEmail, merchantCountry, merchantCurrency, cex }),
    //   });
    //   const doc = await res.json();
    //   console.log("new user created, doc:", doc);
    //   setPaymentSettingsState(doc.paymentSettings);
    //   setCashoutSettingsState(doc.cashoutSettings);
    //   setPage("intro");
    // } catch (error) {
    //   console.log("request to createUser api failed");
    //   setErrorMsg(t("error.failedNewAccount"));
    //   setErrorModal(true);
    //   setPage("login");
    // }
  };

  return (
    <UserInfoContext.Provider value={userInfo}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </UserInfoContext.Provider>
  );
}
