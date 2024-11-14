"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
// custom hooks
import { useUserInfo } from "../_contexts/Web3AuthProvider";
// react query
import { useQuery } from "@tanstack/react-query";
// wagmi
import { useAccount, useWalletClient, useDisconnect, useAccountEffect } from "wagmi";
import { ADAPTER_EVENTS, CONNECTED_EVENT_DATA } from "@web3auth/base";

// others
import Pusher from "pusher-js";
import { getPublic } from "@toruslabs/eccrypto";
import { useTranslations } from "next-intl";
// constants
import { fakePaymentSettings, fakeCashoutSettings, fakeTxns } from "@/utils/txns";
// components
import Payments from "./_components/Payments";
import CashOut from "./_components/CashOut";
import Settings from "./_components/Settings";
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
  const userInfo = useUserInfo();
  const employeeJwt = getCookie("employeeJwt");

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
  const account = useAccount();
  const router = useRouter();
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

  // react query
  const paymentsQuery = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await fetch("/api/getPayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken: userInfo!.idToken, publicKey: userInfo!.publicKey, employeeJwt: employeeJwt }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
    enabled: userInfo || employeeJwt ? true : false,
  });

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/getSettings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken: userInfo!.idToken, publicKey: userInfo!.publicKey }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
    enabled: userInfo ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  console.log("/app, page.tsx payments.length:", paymentsQuery?.data?.length);

  return (
    <div className="pl-[calc(100vw-100%)] bg-light1 text-lightText1 dark:bg-dark1 dark:text-darkText1 overscroll-none">
      {!userInfo && !employeeJwt ? (
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
      ) : (
        <div className="w-full h-screen flex portrait:flex-col-reverse landscape:flex-row relative">
          {/*---MENU: LEFT (w120/lg:160/desktop:200px) or BOTTOM (h-80/sm:140px) ---*/}
          {userInfo && (
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
                      if (i.modal === "cashoutIntroModal" && userInfo.cashoutSettings.cashoutIntro) {
                        setCashoutIntroModal(true);
                        // usability test
                        if (isUsabilityTest) {
                          return;
                        }
                        const res = await fetch("/api/saveSettings", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            key: "cashoutSettings.cashoutIntro",
                            value: false,
                            idToken: userInfo?.idToken,
                            publicKey: userInfo?.publicKey,
                          }),
                        });
                        const data = await res.json();
                        if (data === "not verified") router.push("/login");
                        if (data === "failed") console.log("failed to save cashoutSettings.cashoutIntro");
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
          {menu === "payments" && <Payments />}
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
