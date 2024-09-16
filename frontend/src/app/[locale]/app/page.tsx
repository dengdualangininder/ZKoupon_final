"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";
// wagmi
import { useAccount, useWalletClient, useDisconnect, useAccountEffect } from "wagmi";
// react hooks
import { useWeb3Auth } from "@/contexts/ContextProvider";
import { useTheme } from "next-themes";
// others
import Pusher from "pusher-js";
import { getPublic } from "@toruslabs/eccrypto";
import { useTranslations } from "next-intl";
// constants
import { txns } from "@/utils/txns";
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
import { abb2full, countryData, currency2decimal, merchantType2data } from "@/utils/constants";
// import PullToRefresh from "pulltorefreshjs";

// types
import { PaymentSettings, CashoutSettings, Transaction } from "@/db/models/UserModel";

const User = () => {
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
  console.log("walletClient:", walletClient);
  let web3Auth = useWeb3Auth();

  const { disconnectAsync } = useDisconnect();

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
    },
    onDisconnect() {
      console.log("WAGMI Disconnected!");
    },
  });

  // IF NOT LOGGED IN
  // onClick => loading page, exit loading page when connected to web3Auth and wagmi
  // 1st useEffect run => web3Auth.status returns "ready", web3Auth.connected returns true, account.address returns address, walletClient is detected
  // IF PREVIOUSLY LOGGED IN
  // 1st useEffect run => web3Auth.status returns "ready", web3Auth.connected returns false, account.address returns the address, walletClient is not detected
  // useEffect ends and web3Auth even lsitener will log "connecting", and then "connected". /app will then be rendered twice (why??) but useEffect is not run
  // 2nd run => web3Auth.status returns "connected", web3Auth.connected returns true, account.address returns the address, walletClient is detected
  useEffect(() => {
    console.log("/app, page.tsx, useEffect run once");
    // usability test
    if (isUsabilityTest) {
      // detect and set light/dark mode
      if (window.localStorage.theme) {
        if (window.localStorage.theme == "dark") {
          setTheme("dark");
        } else if (window.localStorage.theme == "light") {
          setTheme("light");
        }
      } else {
        window.localStorage.setItem("theme", "dark");
        setTheme("dark");
      }

      if (!paymentSettingsState) {
        const paymentSettings = {
          merchantEvmAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          merchantEmail: "germany@gmail.com",
          merchantName: "",
          merchantCountry: "Germany",
          merchantCurrency: "EUR",
          merchantPaymentType: "inperson",
          merchantWebsite: "",
          merchantBusinessType: "",
          merchantFields: [],
          merchantGoogleId: "",
          qrCodeUrl: `https://metamask.app.link/dapp/${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/pay?paymentType=inperson&merchantName=A%20Store%20In%20Europe&merchantCurrency=EUR&merchantEvmAddress=0xA206df5844dA81470C82d07AE1b797d139bE58C2`,
        };
        const cashoutSettings = {
          cex: "Coinbase",
          cexEvmAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
          cexAccountName: "Tester Account",
          isEmployeePass: false,
          cashoutIntro: true,
        };
        setPaymentSettingsState(paymentSettings);
        setCashoutSettingsState(cashoutSettings);
        setTransactionsState(txns);
        setIsAdmin(true);
        console.log("set to login page 1");
        setPage("login");
      }
      return;
    }

    // if mobile & not standalone, then redirect to "saveToHome" page
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isMobileAndNotStandaloneTemp = !isDesktop && !isStandalone ? true : false; // need "temp" because will be using it inside this useEffect
    setIsMobile(!isDesktop);
    if (isMobileAndNotStandaloneTemp && process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL != "http://localhost:3000") {
      setPage("saveToHome");
      return;
    }

    // detect and set light/dark mode; set dark mode as default
    if (window.localStorage.theme) {
      if (window.localStorage.theme == "dark") {
        setTheme("dark");
      } else if (window.localStorage.theme == "light") {
        setTheme("light");
      }
    } else {
      window.localStorage.setItem("theme", "dark");
      setTheme("dark");
    }

    // check if employee login
    const jwt = getCookie("employeeJwt");
    if (jwt) {
      verifyAndGetEmployeeData();
      return;
    }

    // query localStorage to determine user logged into web3Auth (TODO: is sessionId sometimes invalid?)
    const sessionIdObject = window.localStorage.getItem("openlogin_store") || "";
    if (sessionIdObject && JSON.parse(sessionIdObject).sessionId) {
      // web3Auth sessionId detected
    } else {
      console.log("no web3Auth sessionId, page set to Login");
      console.log("set to login page 2");
      setPage("login");
      return;
    }

    console.log("web3Auth.status:", web3Auth?.status, "| web3Auth.connected:", web3Auth?.connected);
    console.log("account.address:", account.address);

    // prevent further work from being done if walletClient not loaded
    if (walletClient) {
      console.log("walletClient detected");
    } else {
      console.log("walletClient not detected");
      return;
    }

    verifyAndGetData();

    console.log("/app, page.tsx, useEffect ended");
  }, [walletClient]);
  // if you use web3Auth in dependency array, web3Auth.status will show "connected" but walletClient will still be undefined
  // if you use wagmi's "account" in dependency array, will achieve workable results, but too many rerenders, as account changes more frequently than walletClient

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

  const verifyAndGetData = async () => {
    console.log("/app, verifyAndGetData() run once");

    // get idToken from web3Auth
    try {
      const userInfo = await web3Auth?.getUserInfo();
      var idTokenTemp = userInfo?.idToken;
      console.log("/app, useEffect, verifyAndGetData, userInfo", userInfo);
    } catch (e) {
      console.log("error: could not get web3Auth.userInfo, page set to Login");
      console.log("set to login page 3");
      setPage("login");
    }

    // get publicKey from window
    try {
      if (!walletClient) {
        console.log("veryifyandGetData function, no walletClient");
        return;
      }
      const privateKey = (await walletClient?.request({
        // @ts-ignore
        method: "eth_private_key", // it somehow works even if not typed
      })) as string;
      var publicKeyTemp = getPublic(Buffer.from(privateKey?.padStart(64, "0"), "hex")).toString("hex");
    } catch (e) {
      console.log("error: could not get publicKey, page set to Login");
      console.log("set to login page 4");
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
        console.log(data);
        // if success
        if (data.status == "success") {
          console.log("fetched doc and set states");
          // set states
          setPaymentSettingsState(data.doc.paymentSettings);
          setCashoutSettingsState(data.doc.cashoutSettings);
          setTransactionsState(data.doc.transactions);
          setIsAdmin(true);
          subscribePusher(data.doc.paymentSettings.merchantEvmAddress);
          // check if redirected from Coinbase
          const cbRandomSecure = window.sessionStorage.getItem("cbRandomSecure");
          if (cbRandomSecure) {
            console.log("substate logic");
            const substate = cbRandomSecure.split("SUBSTATE")[1];
            console.log("substate", substate);
            substate == "cashOut" ? setMenu("cashOut") : null;
            substate == "fromIntro" ? setCbIntroModal(true) : null;
            window.sessionStorage.removeItem("cbRandomSecure");
          }
          setPage("intro"); // starthere
        }
        // if new user
        if (data == "create new user") {
          createNewUser();
        }
        // if error
        if (data.status == "error") {
          console.log(data);
          await disconnectAsync();
          console.log("set to login page 5");

          setPage("login");
        }
      } catch (err) {
        console.log("error: api request to getUserDoc failed");
        await disconnectAsync();
        console.log("set to login page 6");

        setPage("login");
      }
    }
  };

  const verifyAndGetEmployeeData = async () => {
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
  };

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
        <div className="text-xl w-full h-screen flex justify-center overflow-y-auto bg-white">
          <div className="w-[92%] max-w-[420px] h-screen min-h-[650px] my-auto max-h-[800px] relative">
            {/* LOADING */}
            <div className="w-full h-full absolute flex flex-col items-center justify-center">
              <div className="w-[340px] h-[60px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:desktop:h-[60px] animate-spin relative">
                <Image src="/loadingCircleBlack.svg" alt="loading" fill />
              </div>
              <div className="mt-4 font-medium textLg text-gray-500">{t("loading")}...</div>
            </div>
            {/*--- welcome ---*/}
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="pb-16 w-full flex flex-col items-center portrait:space-y-12 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-16">
                <div className="relative w-[300px] h-[100px] landscape:lg:h-[100px] portrait:sm:h-[100px] landscape:lg:desktop:h-[100px] mr-1">
                  <Image src="/logo.svg" alt="logo" fill priority />
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
          {/*---MENU: LEFT (w120/160/200px) or BOTTOM (h-84/140px) ---*/}
          {isAdmin && (
            <div className="fixed flex-none portrait:w-full landscape:w-[120px] landscape:lg:w-[160px] landscape:xl:desktop:w-[200px] landscape:h-screen portrait:h-[84px] portrait:sm:h-[140px] flex landscape:flex-col justify-center items-center shadow-[-2px_0px_16px_0px_rgb(0,0,0,0.20)] bg-white dark:portrait:bg-gradient-to-t dark:landscape:bg-gradient-to-r dark:from-dark1 dark:to-dark4 from-portrait:border-t landscape:border-r dark:landscape:border-none z-[1]">
              <div className="w-full h-full landscape:lg:h-[640px] landscape:xl:desktop:h-[500px] portrait:pb-[10px] portrait:px-[4px] flex landscape:flex-col items-center justify-around">
                {[
                  { id: "payments", title: t("payments"), imgWhite: "/paymentsWhite.svg", imgBlack: "/paymentsBlack.svg" },
                  { id: "cashOut", title: t("cashout"), imgWhite: "/cashOutWhite.svg", imgBlack: "/cashOutBlack.svg", modal: "cashoutIntroModal" },
                  { id: "settings", title: t("settings"), imgWhite: "/settingsWhite.svg", imgBlack: "/settingsBlack.svg" },
                ].map((i) => (
                  <div
                    className={`cursor-pointer flex flex-col items-center justify-center ${
                      menu == i.id ? "opacity-100" : "opacity-50"
                    } desktop:hover:opacity-100 active:opacity-100`}
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
                        if (data === "saved") {
                          // good
                        } else {
                          console.log("error: cashoutIntro not set to false");
                        }
                      }
                    }}
                  >
                    <div className="relative w-[20px] h-[20px] portrait:sm:w-[28px] portrait:sm:h-[28px] landscape:lg:w-[28px] landscape:lg:h-[28px]">
                      <Image src={theme == "dark" ? i.imgWhite : i.imgBlack} alt={i.id} fill />
                    </div>
                    <div className="menuText">{i.title}</div>
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
};

export default User;
