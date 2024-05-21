"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";
// wagmi
import { useAccount, useWalletClient, useDisconnect, useAccountEffect } from "wagmi";
// web3Auth
import { useWeb3Auth } from "@/app/provider/ContextProvider";
// others
import Pusher from "pusher-js";
import { getPublic } from "@toruslabs/eccrypto";
import { QRCodeSVG } from "qrcode.react";
// components
import Login from "./_components/Login";
import Payments from "./_components/Payments";
import CashOut from "./_components/CashOut";
import Settings from "./_components/Settings";
import PWA from "./_components/PWA";
import Intro from "./_components/Intro";
import Intro2B from "./_components/Intro2B";
import Intro2A from "./_components/Intro2A";
import CashoutIntroModal from "./_components/modals/CashoutIntroModal";

// constants
import { abb2full, countryData, currency2decimal, merchantType2data } from "@/utils/constants";
// import PullToRefresh from "pulltorefreshjs";
// types
import { PaymentSettings, CashoutSettings, Transaction } from "@/db/models/UserModel";

const User = () => {
  console.log("/app, page.tsx rendered once");

  // db values
  const [paymentSettingsState, setPaymentSettingsState] = useState<PaymentSettings | null>();
  const [cashoutSettingsState, setCashoutSettingsState] = useState<CashoutSettings | null>();
  const [transactionsState, setTransactionsState] = useState<Transaction[]>([]);
  // states
  const [menu, setMenu] = useState("payments"); // "payments" | "cashOut" | "settings"
  const [page, setPage] = useState("loading"); // "loading" (default) | "login" | "saveToHome" | "intro" | "app"
  // modals
  const [signOutModal, setSignOutModal] = useState(false);
  const [bannerModal, setBannerModal] = useState(false);
  const [coinbaseIntroModal, setCoinbaseIntroModal] = useState(false);
  const [cashoutIntroModal, setCashoutIntroModal] = useState(false);
  const [cashbackModal, setCashbackModal] = useState(false);
  // other
  const [isAdmin, setIsAdmin] = useState(true); // need to change to false
  const [isMobile, setIsMobile] = useState(false);
  const [browser, setBrowser] = useState<string>("Safari");
  // for verification
  const [idToken, setIdToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  // useEffect riggers
  const [newTxn, setNewTxn] = useState<Transaction | null>(null);

  // hooks
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  let web3Auth = useWeb3Auth();
  const { disconnectAsync } = useDisconnect();
  const initialized = useRef(false); //makes it so API runs once

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
    // usability test
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
      qrCodeUrl: "",
    };
    const cashoutSettings = {
      cex: "Coinbase",
      cexEvmAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      cexAccountName: "Tester Account",
      isEmployeePass: false,
      cashoutIntro: true,
    };
    const transactions: Transaction[] = [];
    setPaymentSettingsState(paymentSettings);
    setCashoutSettingsState(cashoutSettings);
    setTransactionsState(transactions);
    setIsAdmin(true);
    setPage("intro");
    return;

    console.log("/app, page.tsx, useEffect run once");

    // if mobile & not standalone, then redirect to "Save To Homescreen"
    const isMobileTemp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); // need "temp" because using it inside this useEffect
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isMobileAndNotStandaloneTemp = isMobileTemp && !isStandalone ? true : false; // need "temp" because will be using it inside this useEffect
    console.log("isMobileTemp:", isMobileTemp);
    setIsMobile(isMobileTemp);
    if (isMobileAndNotStandaloneTemp) {
      console.log("detected mobile & not standalone");
      // detect browser and redirect to "Save To Homescreen"
      const userAgent = navigator.userAgent;
      if (userAgent.match(/chrome|chromium|crios/i)) {
        setBrowser("Chrome");
      } else if (userAgent.match(/firefox|fxios/i)) {
        setBrowser("Firefox");
      } else if (userAgent.match(/safari/i)) {
        setBrowser("Safari");
      } else if (userAgent.match(/opr\//i)) {
        setBrowser("Opera");
      } else if (userAgent.match(/edg/i)) {
        setBrowser("Edge");
      } else if (userAgent.match(/samsungbrowser/i)) {
        setBrowser("Samsung");
      } else if (userAgent.match(/ucbrowser/i)) {
        setBrowser("UC");
      } else {
        setBrowser("");
      }
      // setPage("saveToHome");
      // console.log("page set to saveToHome");
      // return;
    }

    // check if employee login
    const jwt = getCookie("jwt");
    console.log("jwt:", jwt);
    if (jwt) {
      verifyAndGetEmployeeData();
      return;
    }

    // query localStorage to determine user logged into web3Auth (TODO: is sessionId sometimes invalid?)
    const sessionIdObject = window.localStorage.getItem("openlogin_store");
    if (!sessionIdObject || !JSON.parse(sessionIdObject).sessionId) {
      console.log("no web3Auth sessionId, page set to Login");
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

    // get user doc (w/ verification) || create new user
    if (!initialized.current) {
      initialized.current = true;
      verifyAndGetData();
    }
    console.log("/app, page.tsx, useEffect ended");
  }, [walletClient]);
  // if you use web3Auth in dependency array, web3Auth.status will show "connected" but walletClient will still be undefined
  // if you use wagmi's "account" in dependency array, will achieve workable results, but too many rerenders, as account changes more frequently than walletClient

  useEffect(() => {
    if (newTxn) {
      console.log("add new txn to transactionsState...");
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
            substate == "fromIntro" ? setCoinbaseIntroModal(true) : null;
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
  };

  const verifyAndGetEmployeeData = async () => {
    console.log("/app, verifyAndGetEmployeeData() run once");
    const res = await fetch("/api/getEmployeeData", {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    const data = await res.json();
    if (data.status == "success") {
      console.log("success");
      setTransactionsState(data.transactions);
      setPaymentSettingsState(data.paymentSettings);
      setIsAdmin(false);
      setPage("app");
    } else {
      console.log("employee login failed");
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
      var merchantCountry = abb2full[res.data.country] ?? "Any country";
      var merchantCurrency = countryData[merchantCountry]?.currency ?? "USD";
      var cex = countryData[merchantCountry]?.CEXes[0] ?? "";
      console.log("detected country, currency, and CEX:", merchantCountry, merchantCurrency, cex);
    } catch (err) {
      merchantCountry = "U.S.";
      merchantCurrency = "USD";
      cex = "Coinbase";
      console.log("detect country API failed, set default to US, USD, and Coinbase. Error:", err);
    }
    const merchantEmail = (await web3Auth?.getUserInfo())?.email || ""; // TODO:check if this works for Apple login
    const merchantEvmAddress = account.address;
    console.log("merchantEmail, merchantEvmAddress:", merchantEmail, merchantEvmAddress);
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
      setPage("login");
    }
  };

  return (
    <div className="pl-[calc(100vw-100%)] text-black">
      <Head>
        <script type="text/javascript" src="@/utils/maze.js"></script>
      </Head>
      {page === "loading" && (
        <div className="w-full h-screen flex items-center justify-center">
          {/* LOADING */}
          <div className="w-full absolute flex flex-col items-center">
            <div className="w-[340px] h-[60px] portrait:sm:h-[100px] landscape:lg:h-[100px] animate-spin">
              <Image src="/loadingCircleBlack.svg" alt="loading" fill />
            </div>
            <div className="mt-4 font-medium textLg text-gray-500">Loading...</div>
          </div>

          <div className="w-full h-full flex justify-center items-center">
            {/*--- welcome ---*/}
            <div className="introPageContainer">
              {/*--- content ---*/}
              <div className="introTextContainer1">
                <div className="introTextContainer2 portrait:space-y-16 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-20">
                  <div className="relative w-[300px] h-[90px] landscape:lg:h-[120px] portrait:sm:h-[120px] mr-1">
                    <Image src="/logo.svg" alt="logo" fill />
                  </div>

                  <div className="invisible text-3xl portrait:sm:text-4xl landscape:lg:text-4xl font-bold text-center animate-fadeInAnimation">Welcome to Flash!</div>
                  <div className="invisible introFontHowTo leading-relaxed text-center animate-fadeInAnimation">
                    Let us give you a quick
                    <br />
                    introduction of how it works
                  </div>
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="invisible introButtonContainer justify-end">
                <button className="introNext">Start</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === "saveToHome" && <PWA browser={browser} />}
      {page === "login" && <Login isMobile={isMobile} setPage={setPage} />}
      {page === "intro" && (
        <Intro2A
          isMobile={isMobile}
          page={page}
          setPage={setPage}
          idToken={idToken}
          publicKey={publicKey}
          paymentSettingsState={paymentSettingsState!}
          setPaymentSettingsState={setPaymentSettingsState}
          cashoutSettingsState={cashoutSettingsState!}
          setCashoutSettingsState={setCashoutSettingsState}
          setCoinbaseIntroModal={setCoinbaseIntroModal}
        />
      )}
      {page === "app" && (
        <div className="w-full h-screen flex portrait:flex-col-reverse landscape:flex-row">
          {/*---MENU: LEFT or BOTTOM (md 900px breakpoint) ---*/}
          <div className="portrait:w-full landscape:w-[120px] landscape:lg:w-[160px] landscape:h-screen portrait:h-[84px] portrait:sm:h-[140px] flex landscape:flex-col justify-center items-center flex-none portrait:border-t landscape:border-r border-gray-300 z-[1] relative">
            {/*---menu---*/}
            {isAdmin && (
              <div className="portrait:fixed portrait:bottom-0 landscape:static w-full portrait:h-[84px] portrait:sm:h-[140px] landscape:h-full landscape:lg:h-[640px] landscape:xl:h-[680px] flex landscape:flex-col items-center justify-around portrait:pb-[14px] portrait:px-1">
                {[
                  { id: "payments", title: "PAYMENTS", clickedImg: "/payments-clicked.svg", unclickedImg: "/payments-unclicked.svg" },
                  { id: "cashOut", title: "CASH OUT", clickedImg: "/cashout-clicked.svg", unclickedImg: "/cashout-unclicked.svg", modal: "cashoutIntroModal" },
                  { id: "settings", title: "SETTINGS", clickedImg: "/settings-clicked.svg", unclickedImg: "/settings-unclicked.svg" },
                ].map((i) => (
                  <div
                    className={`cursor-pointer flex flex-col items-center`}
                    id={i.id}
                    key={i.id}
                    onClick={async (e) => {
                      setMenu(e.currentTarget.id);
                      if (i.modal == "signOutModal") {
                        setSignOutModal(true);
                      }
                      if (i.modal == "cashoutIntroModal" && cashoutSettingsState?.cashoutIntro) {
                        setCashoutIntroModal(true);
                        setCashoutSettingsState({ ...cashoutSettingsState, cashoutIntro: false });

                        // usability test
                        return;

                        const res = await fetch("/api/saveSettings", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ paymentSettings: paymentSettingsState, cashoutSettings: { ...cashoutSettingsState, cashoutIntro: false }, idToken, publicKey }),
                        });
                        const data = await res.json();
                        if (data === "saved") {
                          console.log("cashoutIntro settings saved");
                        } else {
                          console.log("error: cashoutIntro settings not saved");
                        }
                      }
                    }}
                  >
                    <div className="relative w-[66px] h-[24px] portrait:sm:h-[36px] landscape:lg:h-[36px] point-events-none">
                      {menu === i.id ? <Image src={i.clickedImg} alt={i.title} fill /> : <Image src={i.unclickedImg} alt={i.title} fill />}
                    </div>
                    <div className="menuText">{i.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/*---menu pages---*/}
          {menu === "payments" && (
            <Payments paymentSettingsState={paymentSettingsState!} transactionsState={transactionsState} setTransactionsState={setTransactionsState} isAdmin={isAdmin} />
          )}
          {menu === "cashOut" && isAdmin && (
            <CashOut
              paymentSettingsState={paymentSettingsState!}
              cashoutSettingsState={cashoutSettingsState!}
              setCashoutSettingsState={setCashoutSettingsState}
              transactionsState={transactionsState}
              isMobile={isMobile}
              idToken={idToken}
              publicKey={publicKey}
            />
          )}
          {menu === "settings" && isAdmin && (
            <Settings
              paymentSettingsState={paymentSettingsState!}
              setPaymentSettingsState={setPaymentSettingsState}
              cashoutSettingsState={cashoutSettingsState!}
              setCashoutSettingsState={setCashoutSettingsState}
              isMobile={isMobile}
              idToken={idToken}
              publicKey={publicKey}
            />
          )}
          {menu === "qrCode" && (
            <div onClick={() => setMenu("payments")}>
              <div className="fixed inset-0 z-[10] bg-black">
                <div className="absolute bottom-[32px] w-full text-center text-base font-medium text-white z-[30]">Tap screen to exit</div>
              </div>
              <div className="portrait:w-full portrait:h-[calc(100vw*1.4142)] landscape:w-[calc(100vh/1.4142)] landscape:h-screen fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-[20]">
                <div className="w-full h-full relative">
                  <Image src="/placard.svg" alt="placard" fill />
                </div>
              </div>
              <div className="fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[20]">
                <QRCodeSVG
                  xmlns="http://www.w3.org/2000/svg"
                  size={window.innerWidth > window.innerHeight ? Math.round((window.innerHeight / 1.4142) * (210 / 424.26)) : Math.round(window.innerWidth * (210 / 424.26))}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  value={paymentSettingsState?.qrCodeUrl ?? ""}
                />
              </div>
            </div>
          )}
          {/*---bannerModal---*/}
          {transactionsState.length != 0 && (
            <div
              className={`${
                bannerModal ? "top-4" : "-top-[92px] portrait:sm:-top-[128px] landscape:lg:-top-[128px]"
              } w-full landscape:w-[calc(100%-120px)] landscape:lg:w-[calc(100%-160px)] h-[88px] portrait:sm:h-[120px] landscape:lg:h-[120px] flex justify-center fixed right-0 z-[90] transition-[top] duration-500`}
            >
              <div className="pl-[4%] w-[92%] landscape:lg:max-w-[560px] landscape:xl:max-w-[700px] portrait:sm:max-w-[560px] portrait:lg:max-w-[700px] flex items-center justify-between rounded-xl bg-gray-200 border border-gray-400">
                {/*---content---*/}
                <div className=" flex-col justify-center">
                  <div className="text-base landscape:lg:text-lg landscape:xl:text-xl portrait:sm:text-lg portrait:lg:text-xl font-bold text-gray-500 pb-1">NEW PAYMENT</div>
                  <div className="text-2xl landscape:lg:text-4xl landscape:xl:text-5xl portrait:sm:text-4xl portrait:lg:text-5xl">
                    {transactionsState?.slice(-1)[0].currencyAmount.toFixed(currency2decimal[paymentSettingsState?.merchantCurrency!])} {paymentSettingsState?.merchantCurrency}{" "}
                    from {transactionsState?.slice(-1)[0].customerAddress.slice(-4)}
                  </div>
                </div>
                {/*--- buttons ---*/}
                <button onClick={() => setBannerModal(false)} className="w-[20%] h-full text-4xl portrait:sm:text-5xl landscape:lg:text-5xl">
                  &#10005;
                </button>
              </div>
            </div>
          )}
          {/*---signOutModal---*/}
          {signOutModal && (
            <div>
              <div className="modal">
                {/*---content---*/}
                <div className="grow flex flex-col justify-center">Do you want to sign out?</div>
                {/*--- buttons ---*/}
                <div className="w-full space-y-6">
                  <button
                    onClick={() => {
                      setSignOutModal(false);
                      deleteCookie("jwt");
                      setPage("login");
                    }}
                    className="mt-10 modalButtonBlue"
                  >
                    Confirm
                  </button>
                  <button onClick={() => setSignOutModal(false)} className="modalButtonWhite">
                    Cancel
                  </button>
                </div>
              </div>
              <div className="modalBlackout" onClick={() => setSignOutModal(false)}></div>
            </div>
          )}
          {/*---coinbaseIntroModal---*/}
          {coinbaseIntroModal && (
            <div>
              <div className="w-[330px] portrait:sm:w-[420px] landscape:lg:w-[420px] min-h-[330px] py-10 portrait:sm:py-16 landscape:lg:py-16 space-y-10 portrait:sm:space-y-16 landscape:lg:space-y-16 px-6 portrait:sm:px-10 landscape:lg:px-10 textLg text-center flex flex-col items-center rounded-xl bg-white fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[90]">
                {/*---content---*/}
                <div className="grow flex flex-col justify-center space-y-6 text-start">
                  <p>Your Coinbase account is linked!</p>
                  <p>Your Flash account is ready.</p>
                  <p>
                    If you have questions, read the FAQs located in the <span className="font-bold">Settings</span> menu or contact us.
                  </p>
                </div>
                {/*--- buttons ---*/}
                <button onClick={() => setCoinbaseIntroModal(false)} className="modalButtonWhite">
                  Close
                </button>
              </div>
              <div
                className="modalBlackout"
                onClick={() => {
                  setCoinbaseIntroModal(false);
                  setCashbackModal(true);
                }}
              ></div>
            </div>
          )}
          {cashbackModal && (
            <div>
              <div className="modal">
                {/*---content---*/}
                <div className="grow flex flex-col justify-center space-y-6 text-start textBase">
                  <p>Our journey together towards global payments with 0% fees is a long one.</p>
                  <p>For one, credit cards charge businesses ~3% and gives ~1% back to customers. This locks customers into using credit cards.</p>
                  <p>
                    To be able to compete, we are requiring businesses give an instant 2% discount to customers. If a customer pays you 10 EUR, you will ultimately recieve 9.8 EUR
                    in the bank. All savings go to customers (Flash makes zero profit per transaction).
                  </p>
                  <p>When crypto payments become more popular, we will make this 2% discount optional.</p>
                </div>
                {/*--- buttons ---*/}
                <button onClick={() => setCoinbaseIntroModal(false)} className="modalButtonWhite">
                  Close
                </button>
              </div>
              <div className="modalBlackout" onClick={() => setCashbackModal(false)}></div>
            </div>
          )}
          {cashoutIntroModal && <CashoutIntroModal setCashoutIntroModal={setCashoutIntroModal} />}
        </div>
      )}
    </div>
  );
};

export default User;
