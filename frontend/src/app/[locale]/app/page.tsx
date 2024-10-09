"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { getCookie } from "cookies-next";
// wagmi
import { useAccount, useWalletClient, useDisconnect, useAccountEffect } from "wagmi";
import { ADAPTER_EVENTS, CONNECTED_EVENT_DATA } from "@web3auth/base";
// react hooks
import { useWeb3Auth } from "@/contexts/ContextProvider";
import { useTheme } from "next-themes";
// others
import Pusher from "pusher-js";
import { getPublic } from "@toruslabs/eccrypto";
import { useTranslations } from "next-intl";
// constants
import { fakePaymentSettings, fakeCashoutSettings, fakeTxns } from "@/utils/txns";
// components
import Login from "./_components/Login";
import Payments from "./_components/Payments";
import CashOut from "./_components/CashOut";
import Settings from "./_components/Settings";
import SaveToHome from "./_components/SaveToHome";
import Intro from "./_components/Intro";
import CbIntroModal from "./_components/modals/CbIntroModal";
import CashoutIntroModal from "./_components/modals/CashoutIntroModal";
import QrCodeModal from "./_components/modals/QrCodeModal";
import ErrorModal from "./_components/modals/ErrorModal";
import CashbackModal from "./_components/modals/CashbackModal";
import TradeMAXModal from "./_components/modals/exchanges/TradeMAXModal";
// constants
import { abb2full, countryData, currency2decimal } from "@/utils/constants";
// import PullToRefresh from "pulltorefreshjs";

// types
import { PaymentSettings, CashoutSettings, Transaction } from "@/db/UserModel";

export default function App() {
  console.log("/app, page.tsx rendered once");
  const searchParams = useSearchParams();

  // db values
  const [paymentSettingsState, setPaymentSettingsState] = useState<PaymentSettings | undefined>(undefined);
  const [cashoutSettingsState, setCashoutSettingsState] = useState<CashoutSettings | undefined>(undefined);
  const [transactionsState, setTransactionsState] = useState<Transaction[]>([]);
  // states
  const [menu, setMenu] = useState("payments"); // "payments" | "cashOut" | "settings"
  const [page, setPage] = useState("loading"); // "loading" (default) | "login" | "saveToHome" | "intro" | "app"
  // modals
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [bannerModal, setBannerModal] = useState(false);
  const [cbIntroModal, setCbIntroModal] = useState(false);
  const [cashoutIntroModal, setCashoutIntroModal] = useState(false);
  const [cashbackModal, setCashbackModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tradeMAXModal, setTradeMAXModal] = useState(false);
  // other
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUsabilityTest, setIsUsabilityTest] = useState(searchParams.get("test") == "true" ? true : false);
  // for verification
  const [idToken, setIdToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  // useEffect riggers
  const [newTxn, setNewTxn] = useState<Transaction | null>(null);

  // hooks
  const t = useTranslations("App.Page");
  const tcommon = useTranslations("Common");
  const { theme, setTheme } = useTheme();
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  let web3Auth = useWeb3Auth();
  const isConnectedRef = useRef(false); // this is set to true when onConnect event fires
  const { disconnectAsync } = useDisconnect();
  // const runOnce = useRef(true);

  // if (isStandalone) {
  //   PullToRefresh.init({
  //     mainElement: "body",
  //     distReload: 60,
  //     onRefresh() {
  //       window.location.reload();
  //     },
  //     iconArrow: ReactDOMServer.renderToString(<FontAwesomeIcon icon={faSyncAlt} />),
  //     iconRefreshing: ReactDOMServer.renderToString(<FontAwesomeIcon icon={faSyncAlt} spin={true} />),
  //   });
  // }

  useAccountEffect({
    onConnect(data) {
      console.log("WAGMI Connected!", data);
      isConnectedRef.current = true;
    },
    onDisconnect() {
      console.log("WAGMI Disconnected!");
    },
  });

  useEffect(() => {
    console.log("activate web3Auth event listeners");
    web3Auth?.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
      console.log("connected to web3Auth", data);
      isConnectedRef.current = true;
    });
    web3Auth?.on(ADAPTER_EVENTS.CONNECTING, () => {
      console.log("connecting to web3Auth");
    });
    web3Auth?.on(ADAPTER_EVENTS.DISCONNECTED, () => {
      console.log("disconnected from web3Auth");
    });
    web3Auth?.on(ADAPTER_EVENTS.ERRORED, (error: any) => {
      console.log("error when connecting to web3Auth", error);
    });
  }, []);

  useEffect(() => {
    console.log("/app useEffect run once");

    // set dark mode as default
    if (window.localStorage.theme) {
      setTheme(window.localStorage.theme);
    } else {
      window.localStorage.setItem("theme", "dark");
      setTheme("dark");
    }

    // usability test
    if (isUsabilityTest) {
      setPaymentSettingsState(fakePaymentSettings);
      setCashoutSettingsState(fakeCashoutSettings);
      setTransactionsState(fakeTxns);
      setIsAdmin(true);
      setPage("intro");
      return;
    }

    // redirect to "saveToHome" page if mobile & not standalone
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsMobile(!isDesktop);
    // if (!isDesktop && !isStandalone) {
    //   setPage("saveToHome");
    //   return;
    // }

    // check if employee login
    const jwt = getCookie("employeeJwt");
    if (jwt) {
      verifyAndGetEmployeeData();
      return;
    }

    // if no sessionId in local storage, then redirect to login
    const openLoginJson = window.localStorage.getItem("openlogin_store") || "";
    if (!openLoginJson || !JSON.parse(openLoginJson).sessionId) {
      console.log("no web3Auth sessionId, redirect to Login");
      setPage("login");
      return;
    }

    // if sessionId exists and if not connected after 6s, then redirect to login; important as sessionId expires after 7 days
    // account.address is required, as after linking Coinbase, isConnectedRef returns false for some reason
    if (JSON.parse(openLoginJson).sessionId) {
      setTimeout(() => {
        console.log("isConnectedRef", isConnectedRef);
        console.log("account.address", account.address);
        if (!isConnectedRef.current && !account.address) {
          setPage("login");
        }
      }, 6000);
    }

    // if no walletClient, then try again
    if (!walletClient) {
      return;
    }

    verifyAndGetData();
  }, [walletClient]);

  useEffect(() => {
    if (newTxn) {
      console.log("added new txn to transactionsState");
      setTransactionsState([...transactionsState, newTxn]);
      setBannerModal(true);
      setTimeout(() => {
        setBannerModal(false);
        setNewTxn(null);
      }, 5000);
    }
  }, [newTxn]);

  async function verifyAndGetData() {
    console.log("/app, verifyAndGetData() run once");
    if (!walletClient) {
      console.log("veryifyandGetData function, no walletClient");
      return;
    }

    // get idToken and publicKey
    try {
      const userInfo = await web3Auth?.getUserInfo();
      var idTokenTemp = userInfo?.idToken;
      const privateKey = (await walletClient?.request({
        // @ts-ignore
        method: "eth_private_key", // it somehow works even if not typed
      })) as string;
      var publicKeyTemp = getPublic(Buffer.from(privateKey?.padStart(64, "0"), "hex")).toString("hex");
    } catch (e) {
      console.log("error: could not get idToken and publicKey, page set to Login");
      setPage("login");
      return;
    }

    // get user doc (idToken and publicKey will be verified)
    if (idTokenTemp && publicKeyTemp) {
      setIdToken(idTokenTemp);
      setPublicKey(publicKeyTemp);

      try {
        //fetch doc
        console.log("fetching doc...");
        const res = await fetch("/api/getUserDoc", {
          method: "POST",
          body: JSON.stringify({ idToken: idTokenTemp, publicKey: publicKeyTemp }),
          headers: { "content-type": "application/json" },
        });
        const data = await res.json();
        console.log(data.doc);
        // if success
        if (data.status == "success") {
          console.log("doc fetched, setting states...");
          // set states
          setPaymentSettingsState(data.doc.paymentSettings);
          setCashoutSettingsState(data.doc.cashoutSettings);
          setTransactionsState(data.doc.transactions);
          setIsAdmin(true);
          subscribePusher(data.doc.paymentSettings.merchantEvmAddress);
          // check if redirected from Coinbase
          const cbRandomSecure = window.sessionStorage.getItem("cbRandomSecure");
          if (cbRandomSecure) {
            console.log("cbRandomSecure", cbRandomSecure);
            const substate = cbRandomSecure.split("SUBSTATE")[1];
            console.log("substate", substate);
            substate == "cashOut" ? setMenu("cashOut") : null;
            substate == "fromIntro" ? setCbIntroModal(true) : null;
            window.sessionStorage.removeItem("cbRandomSecure");
          }
          setPage("app"); // starthere
        }
        // if new user
        if (data == "create new user") {
          createNewUser();
        }
        // if error
        if (data.status == "error") {
          console.log(data);
          await disconnectAsync();
          setPage("login");
        }
      } catch (err) {
        console.log("error: api request to getUserDoc failed");
        await disconnectAsync();
        setPage("login");
      }
    }
  }

  async function verifyAndGetEmployeeData() {
    console.log("verifyAndGetEmployeeData()");
    const res = await fetch("/api/getEmployeeData", {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    const data = await res.json();
    if (data.status == "success") {
      console.log("fetched employee data");
      setTransactionsState(data.transactions);
      setPaymentSettingsState(data.paymentSettings);
      setIsAdmin(false);
      setPage("app");
    } else {
      console.log("employee login failed");
      setPage("login");
    }
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
      setNewTxn(txn);
    });
  };

  // reason this is not in newuser component is because web3auth context already used here, don't want to use in another component
  const createNewUser = async () => {
    console.log("creating new user");
    // set merchantCountry, merchantCurrency, and cex
    try {
      const res = await axios.get("https://api.country.is");
      var merchantCountry = abb2full[res.data.country] ?? "Other";
      var merchantCurrency = countryData[merchantCountry]?.currency ?? "USD";
      var cex = countryData[merchantCountry]?.CEXes[0] ?? "";
      console.log("createNewUser: detected country, currency, and CEX:", merchantCountry, merchantCurrency, cex);
    } catch (err) {
      merchantCountry = "U.S.";
      merchantCurrency = "USD";
      cex = "Coinbase";
      console.log("createNewUser error: country not detect, set to default");
    }
    // set merchantEmail and merchantEvmAddress
    const merchantEmail = (await web3Auth?.getUserInfo())?.email || ""; // TODO:check if this works for Apple login
    const merchantEvmAddress = account.address;
    // create new user in db
    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchantEvmAddress, merchantEmail, merchantCountry, merchantCurrency, cex }),
      });
      const doc = await res.json();
      console.log("new user created, doc:", doc);
      setPaymentSettingsState(doc.paymentSettings);
      setCashoutSettingsState(doc.cashoutSettings);
      setPage("intro");
    } catch (error) {
      console.log("request to createUser api failed");
      setErrorMsg(t("error.failedNewAccount"));
      setErrorModal(true);
      setPage("login");
    }
  };

  return (
    <div className="pl-[calc(100vw-100%)] bg-light1 text-lightText1 dark:bg-dark1 dark:text-darkText1 overscroll-none">
      {page === "loading" && (
        <div className="text-xl w-full h-screen flex justify-center overflow-y-auto bg-light1">
          <div className="w-[92%] max-w-[420px] h-screen min-h-[650px] my-auto max-h-[800px] relative">
            {/* LOADING */}
            <div className="w-full h-full absolute flex flex-col items-center justify-center">
              <div className="w-[340px] h-[60px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:desktop:h-[60px] animate-spin relative">
                <Image src="/loadingCircleBlack.svg" alt="loading icon" fill />
              </div>
              <div className="mt-4 font-medium textLg text-gray-500">{t("loading")}...</div>
            </div>
            {/*--- welcome ---*/}
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="pb-16 w-full flex flex-col items-center portrait:space-y-12 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-16">
                <div className="relative w-[300px] h-[100px] landscape:lg:h-[100px] portrait:sm:h-[100px] landscape:lg:desktop:h-[100px] mr-1">
                  <Image src="/logo.svg" alt="Flash logo" fill priority />
                </div>
                <div className="pb-4 text-center animate-fadeInAnimation leading-relaxed invisible">
                  Set up crypto payments
                  <br />
                  with 0% fees now
                </div>
                {/*--- buttons ---*/}
                <button className="invisible w-[240px] h-[60px] portrait:sm:h-[60px] landscape:lg:h-[60px] landscape:desktop:xl:h-[48px] text-lg portrait:sm:text-lg landscape:lg:text-base landscape:desktop:xl:text-base font-medium text-white bg-blue-500 border-2 border-blue-500 active:opacity-50 lg:hover:opacity-50 rounded-[4px] animate-fadeInAnimation">
                  START &nbsp;&#10095;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === "saveToHome" && <SaveToHome />}
      {page === "login" && <Login setPage={setPage} isUsabilityTest={isUsabilityTest} />}
      {page === "intro" && (
        <Intro
          isMobile={isMobile}
          setPage={setPage}
          idToken={idToken}
          publicKey={publicKey}
          paymentSettingsState={paymentSettingsState!}
          setPaymentSettingsState={setPaymentSettingsState}
          cashoutSettingsState={cashoutSettingsState!}
          setCashoutSettingsState={setCashoutSettingsState}
          setCbIntroModal={setCbIntroModal}
          isUsabilityTest={isUsabilityTest}
          setCashbackModal={setCashbackModal}
        />
      )}
      {page === "app" && (
        <div className="w-full h-screen flex portrait:flex-col-reverse landscape:flex-row relative">
          {/*---MENU: LEFT (w120/lg:160/desktop:200px) or BOTTOM (h-80/sm:140px) ---*/}
          {isAdmin && (
            <div className="fixed flex-none landscape:w-[120px] landscape:lg:w-[160px] landscape:desktop:!w-[200px] landscape:h-screen portrait:w-full portrait:h-[80px] portrait:sm:h-[140px] flex justify-center items-center bg-light1 dark:portrait:bg-gradient-to-t dark:landscape:bg-gradient-to-r dark:from-dark1 dark:via-dark2 dark:to-dark3 from-0% via-80% to-100% portrait:border-t landscape:border-r dark:!border-none border-light5 z-[1]">
              <div className="w-full h-full landscape:lg:h-[640px] landscape:xl:desktop:h-[500px] portrait:pb-[10px] portrait:px-[4px] flex landscape:flex-col items-center justify-around">
                {[
                  { id: "payments", title: t("payments"), imgBlack: "/paymentsBlack.svg" },
                  { id: "cashOut", title: t("cashout"), imgBlack: "/cashOutBlack.svg", modal: "cashoutIntroModal" },
                  { id: "settings", title: t("settings"), imgBlack: "/settingsBlack.svg" },
                ].map((i) => (
                  <div
                    className={`cursor-pointer flex flex-col items-center justify-center ${
                      menu == i.id ? "filterBlack dark:filterWhite" : "filterGray"
                    } desktop:hover:filterBlack dark:desktop:hover:filterWhite`}
                    id={i.id}
                    key={i.id}
                    onClick={async (e) => {
                      setMenu(e.currentTarget.id);
                      if (i.modal == "cashoutIntroModal" && cashoutSettingsState?.cashoutIntro) {
                        setCashoutIntroModal(true);
                        setCashoutSettingsState({ ...cashoutSettingsState, cashoutIntro: false });
                        // usability test
                        if (isUsabilityTest) {
                          return;
                        }
                        const res = await fetch("/api/saveSettings", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            paymentSettings: paymentSettingsState,
                            cashoutSettings: { ...cashoutSettingsState, cashoutIntro: false },
                            idToken,
                            publicKey,
                          }),
                        });
                        const data = await res.json();
                        if (data != "saved") {
                          console.log("error: cashoutIntro not set to false");
                        }
                      }
                    }}
                  >
                    <div className="relative w-[20px] h-[20px] portrait:sm:w-[28px] portrait:sm:h-[28px] landscape:lg:w-[28px] landscape:lg:h-[28px]">
                      <Image src={i.imgBlack} alt={i.id} fill className="" />
                    </div>
                    <div className="menuText text-black">{i.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*---menu pages---*/}
          {menu === "payments" && (
            <Payments
              paymentSettingsState={paymentSettingsState!}
              transactionsState={transactionsState}
              setTransactionsState={setTransactionsState}
              isAdmin={isAdmin}
              setPage={setPage}
            />
          )}
          {menu === "cashOut" && isAdmin && (
            <CashOut
              paymentSettingsState={paymentSettingsState!}
              cashoutSettingsState={cashoutSettingsState!}
              setCashoutSettingsState={setCashoutSettingsState}
              transactionsState={transactionsState}
              idToken={idToken}
              publicKey={publicKey}
              isUsabilityTest={isUsabilityTest}
            />
          )}
          {menu === "settings" && isAdmin && (
            <Settings
              paymentSettingsState={paymentSettingsState!}
              setPaymentSettingsState={setPaymentSettingsState}
              cashoutSettingsState={cashoutSettingsState!}
              setCashoutSettingsState={setCashoutSettingsState}
              setPage={setPage}
              idToken={idToken}
              publicKey={publicKey}
              isUsabilityTest={isUsabilityTest}
            />
          )}

          {/*--- 6 MODALS ---*/}

          {/*---bannerModal---*/}
          {transactionsState.length != 0 && (
            <div
              className={`${
                bannerModal ? "top-4" : "-top-[92px] portrait:sm:-top-[128px] landscape:lg:-top-[128px]"
              } w-full landscape:w-[calc(100%-120px)] landscape:lg:w-[calc(100%-160px)] h-[88px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:desktop:h-[84px] flex justify-center fixed right-0 z-[90] transition-[top] duration-500`}
            >
              <div className="pl-[4%] bannerWidth flex items-center justify-between rounded-xl bg-lightButton dark:bg-darkButton">
                {/*---content---*/}
                <div className=" flex-col justify-center">
                  <div className="pb-1 text-base portrait:sm:text-lg landscape:lg:text-lg font-medium text-white">{t("bannerModal.new")}</div>
                  <div className="font-semibold text-[22px] portrait:sm:text-3xl landscape:lg:text-3xl landscape:xl:desktop:text-2xl">
                    {transactionsState?.slice(-1)[0].currencyAmount.toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])} {paymentSettingsState?.merchantCurrency}{" "}
                    {t("bannerModal.from")} ..{transactionsState?.slice(-1)[0].customerAddress.slice(-4)}
                  </div>
                </div>
                {/*--- buttons ---*/}
                <button onClick={() => setBannerModal(false)} className="xButtonBanner">
                  &#10005;
                </button>
              </div>
            </div>
          )}

          {errorModal && <ErrorModal setErrorModal={setErrorModal} errorMsg={errorMsg} />}

          {qrCodeModal && paymentSettingsState && <QrCodeModal setQrCodeModal={setQrCodeModal} paymentSettingsState={paymentSettingsState} />}

          {cbIntroModal && <CbIntroModal setCbIntroModal={setCbIntroModal} setCashbackModal={setCashbackModal} />}

          {cashbackModal && <CashbackModal setCashbackModal={setCashbackModal} />}

          {cashoutIntroModal && (
            <CashoutIntroModal
              paymentSettingsState={paymentSettingsState!}
              cashoutSettingsState={cashoutSettingsState!}
              setCashoutIntroModal={setCashoutIntroModal}
              setTradeMAXModal={setTradeMAXModal}
            />
          )}

          {tradeMAXModal && <TradeMAXModal setTradeMAXModal={setTradeMAXModal} />}
        </div>
      )}
    </div>
  );
}
