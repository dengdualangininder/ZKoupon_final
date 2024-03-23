"use client";
// nextjs
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
// wagmi
import { useAccount, useConfig, useWalletClient, useDisconnect } from "wagmi";
// web3Auth
import { useWeb3Auth } from "@/app/provider/ContextProvider";
// others
import { getPublicCompressed } from "@toruslabs/eccrypto";
// components
import Login from "./_components/Login";
import Payments from "./_components/Payments";
import CashOut from "./_components/CashOut";
import Settings from "./_components/Settings";
import PWA from "./_components/PWA";
import { SpinningCircleGrayLarge } from "@/utils/components/SpinningCircleGray";
// constants
import { abb2full, countryData } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faFileInvoiceDollar, faGear, faPlus, faRightFromBracket, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
// import { logo } from "../assets/index.js";
// import PullToRefresh from "pulltorefreshjs";

const User = () => {
  console.log("/app, page rendered once");
  const [paymentSettingsState, setPaymentSettingsState] = useState({});
  const [cashoutSettingsState, setCashoutSettingsState] = useState({});
  const [transactionsState, setTransactionsState] = useState([]);
  const [menu, setMenu] = useState("payments"); // "payments" | "cashOut" | "settings"
  const [page, setPage] = useState("loading"); // "loading" | "login" | "saveToHome" | "app"
  const [reload, setReload] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // need to change to false
  const [introModal, setIntroModal] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [browser, setBrowser] = useState<string>("Safari");

  // hooks
  const router = useRouter();
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  let web3Auth = useWeb3Auth();
  let config = useConfig();
  const { disconnectAsync } = useDisconnect();

  // in case if someone needs to redirect to /app page with specific menu tab
  const searchParams = useSearchParams();
  const menuTemp = searchParams.get("menu");
  if (menuTemp) {
    console.log("searchParam detected, menuTemp:", menuTemp);
    setMenu(menuTemp);
  }

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

  useEffect(() => {
    console.log("/app, useEffect run once");

    // if mobile & not standalone, then redirect to "Save To Homescreen"
    const isMobileTemp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); // need "temp" because using it inside this useEffect
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isMobileAndNotStandaloneTemp = isMobileTemp && !isStandalone ? true : false; // need "temp" because will be using it inside this useEffect
    console.log("/app, useEffect, isMobileTemp", isMobileTemp);
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
      setPage("saveToHome");
      return;
    }

    // if already logged in
    const test = Object.keys(paymentSettingsState).length != 0 ? "true" : "false";
    console.log("paymentSettingsState", test);
    if (Object.keys(paymentSettingsState).length != 0) {
      setPage("app");
      return;
    }

    // if not connected to web3Auth, then redirect to /login (account.address returns undefined sometimes, account.isConnected seems more stable)
    console.log("/app, useEffect, address:", account.address);
    console.log("/app, useEffect, account.isConnected:", account.isConnected);
    if (account.address) {
      setIsAdmin(true);
      setPage("app");
    } else {
      setPage("login");
      return;
    }

    // exit useEffect if walletClient not detected (account.address will be detected first, then walletClient)
    if (walletClient) {
      console.log("walletClient detected");
    } else {
      console.log("walletClient not detected");
      return;
    }

    // get user doc (w/ verification) || create new user
    const verifyAndGetData = async () => {
      console.log("/app, verifyAndGetData() run once");
      // get idToken
      try {
        console.log("/app, useEffect, verifyAndGetData, web3Auth", web3Auth);
        const userInfo = await web3Auth?.getUserInfo();
        console.log("/app, useEffect, verifyAndGetData, userInfo", userInfo);
        var idToken = userInfo?.idToken;
        // var idToken = (await web3Auth?.getUserInfo())?.idToken;
      } catch (e) {
        console.log("verifyAndGetData, Cannot get idToken, likely web3Auth not fully updated");
      }
      // get publicKey
      try {
        const privateKey = (await walletClient?.request({
          // @ts-ignore
          method: "eth_private_key", // it somehow works even if not typed
        })) as string;
        var publicKey = getPublicCompressed(Buffer.from(privateKey?.padStart(64, "0"), "hex")).toString("hex");
      } catch (e) {
        var publicKey = "";
        console.log("Cannot get publicKey");
      }
      // get user doc (with verification)
      if (idToken && publicKey) {
        console.log("fetching doc...");
        try {
          const res = await fetch("/api/getUserDoc", {
            method: "POST",
            body: JSON.stringify({ merchantEvmAddress: account.address, idToken: idToken, publicKey: publicKey }),
            headers: { "content-type": "application/json" },
          });
          const data = await res.json();

          if (data.status === "success") {
            console.log("/app, successfully fetched doc:", data.doc);
            setPaymentSettingsState(data.doc.paymentSettings);
            setCashoutSettingsState(data.doc.cashoutSettings);
            setTransactionsState(data.doc.transactions);
            // show intro modal
            if (data.doc.intro) {
              setIntroModal(true);
              setMenu("appSettings");
            }
          }

          if (data === "create new user") {
            await createNewUser();
          }

          if (data.status === "error") {
            console.log("/app, something in getUserDoc api failed");
            await disconnectAsync();
            router.push("/login");
          }

          setIsAppLoading(false);
        } catch (err) {
          console.log("/app, verify failed");
          await disconnectAsync();
          router.push("/login");
        }
      }
    };
    verifyAndGetData();
  }, [walletClient]);

  const createNewUser = async () => {
    console.log("creating new user");
    // detect IP and set merchantCountry, merchantCurrency, and cex
    let merchantCountry: string;
    let merchantCurrency: string;
    let cex: string;
    try {
      const res = await axios.get("https://api.country.is");
      merchantCountry = abb2full[res.data.country] || "United States";
      merchantCurrency = countryData[merchantCountry]?.currency || "USD";
      cex = countryData[merchantCountry]?.CEXes[0] || "Coinbase";
      console.log("detected country, currency, and CEX:", merchantCountry, merchantCurrency, cex);
    } catch (err) {
      merchantCountry = "United States";
      merchantCurrency = "USD";
      cex = "Coinbase";
      console.log("detect country API failed", err);
    }
    // call createUser API (should have already passed verification)
    const merchantEmail = (await web3Auth?.getUserInfo())?.email || "";
    const merchantEvmAddress = account.address;
    console.log(merchantEvmAddress, merchantEmail, merchantCountry, merchantCurrency, cex);
    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchantEvmAddress, merchantEmail, merchantCountry, merchantCurrency, cex }),
      });
      const docTemp = await res.json();
      console.log("new user created, doc:", docTemp);
      setPaymentSettingsState(docTemp.paymentSettings);
      setCashoutSettingsState(docTemp.cashoutSettings);
      // show intro modal
      if (docTemp.intro) {
        setIntroModal(true);
        setMenu("appSettings");
      }
    } catch (err) {
      console.log(err);
      router.push("/login");
    }
  };

  const menuArray = [
    { id: "appPayments", title: "Payments", fa: faList },
    { id: "appCashOut", title: "Cash Out", fa: faFileInvoiceDollar },
    { id: "appSettings", title: "Settings", fa: faGear },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {page === "loading" && (
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <SpinningCircleGrayLarge />
          <div className="mt-1">Loading...</div>
        </div>
      )}
      {page === "saveToHome" && <PWA browser={browser} />}
      {page === "login" && <Login isMobile={isMobile} />}
      {page === "app" && (
        <div className="flex flex-col md:flex-row">
          {/*---LEFT/TOP MENU---*/}
          <div className="h-[96px] flex justify-center items-center sm:px-4 md:block md:justify-start md:items-start md:h-auto md:w-[210px] md:flex-none md:border-r-[2px] text-blue-700">
            <div className="flex items-center md:flex-col md:h-screen">
              {/*---LOGO + CREDITS---*/}
              <div className="hidden md:flex flex-col items-center w-full">
                {/*---logo---*/}
                <div className="relative w-[96px] h-[48px]">
                  <Image src={"/logo.svg"} alt="logo" fill />
                </div>
                {/*---credits---*/}
                <div className="mt-4 px-2 text-base font-bold bg-white rounded-lg py-3">
                  <div className="line-clamp-1 break-all">user info</div>
                </div>
              </div>
              {/*---MENU + SIGNOUT---*/}
              <div className="w-full h-[80px] md:h-full flex md:w-auto md:flex-col justify-center">
                {/*---menu items---*/}
                {isAdmin ? (
                  <div className="flex md:block text-lg font-bold space-x-2 xs:space-x-4 md:space-x-0 md:space-y-4">
                    {menuArray.map((i, index) => (
                      <div
                        id={i.id}
                        key={index}
                        data-category="appMenu"
                        className={`${
                          menu === i.id ? "bg-white" : ""
                        } cursor-pointer xs:hover:bg-white px-4 py-3 flex flex-col xs:flex-row justify-center xs:justify-start items-center rounded-3xl`}
                        onClick={(e) => {
                          setMenu(e.currentTarget.id);
                          // so if user activates automation, when they switch to payments, they won't see blocking modal
                          e.currentTarget.id === "appPayments" ? setReload(!reload) : null;
                        }}
                      >
                        <div className="w-[36px] flex justify-center pointer-events-none">
                          <FontAwesomeIcon icon={i.fa} className="text-2xl mr-1 pointer-events-none" />
                        </div>
                        <div className="mt-1 pointer-events-none leading-none">{i.title}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex md:block text-lg font-bold space-x-3 xs:space-x-4 md:space-x-0 md:space-y-4">
                    <div id="appPayments" className="cursor-pointer hover:bg-white px-4 py-3 flex flex-col xs:flex-row items-center rounded-3xl">
                      <div className="w-[36px] flex justify-center pointer-events-none">
                        <FontAwesomeIcon icon={faList} className="text-2xl mr-1 pointer-events-none" />
                      </div>
                      <div className="pointer-events-none">Payments</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/*---menu pages---*/}
          {menu === "payments" && <Payments transactionsState={transactionsState} isMobile={isMobile} />}
          {menu === "cashOut" && isAdmin && (
            <CashOut
              paymentSettingsState={paymentSettingsState}
              setPaymentSettingsState={setPaymentSettingsState}
              cashoutSettingsState={cashoutSettingsState}
              setCashoutSettingsState={setCashoutSettingsState}
              isMobile={isMobile}
            />
          )}
          {menu === "settings" && isAdmin && (
            <Settings
              paymentSettingsState={paymentSettingsState}
              setPaymentSettingsState={setPaymentSettingsState}
              cashoutSettingsState={cashoutSettingsState}
              setCashoutSettingsState={setCashoutSettingsState}
              isMobile={isMobile}
              introModal={introModal}
              setIntroModal={setIntroModal}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default User;
