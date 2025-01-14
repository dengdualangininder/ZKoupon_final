"use client";
// nextjs
import { useState, useEffect } from "react";
// custom hooks
import { useQueryClient } from "@tanstack/react-query";
import { useW3Info } from "../../web3auth-provider";
import { useSettingsQuery } from "../../hooks";
import { useAccount } from "wagmi";
import Pusher from "pusher-js"; // pusher
import { useTheme } from "next-themes";
// components
import Navbar from "./Navbar";
import Payments from "./Payments";
import CashOut from "./Cashout";
import Settings from "./Settings";
import Loading from "./Loading";
import Notification from "./Notification";
import CbIntroModal from "./modals/CbIntroModal";
import CashbackModal from "./modals/CashbackModal";
import TradeMAXModal from "./modals/exchanges/TradeMAXModal";
import QrCodeModal from "./(payments)/QrCodeModal";
// utils
import ErrorModal from "@/utils/components/ErrorModal";
// types
import { FlashInfo, Filter } from "@/utils/types";
import { Transaction } from "@/db/UserModel";
// import PullToRefresh from "pulltorefreshjs";

export default function App({ flashInfo }: { flashInfo: FlashInfo }) {
  console.log("/app, page.tsx");

  // hooks
  const w3Info = useW3Info();
  const queryClient = useQueryClient();
  const { data: settings } = useSettingsQuery(w3Info, flashInfo);
  const { address } = useAccount();
  const { setTheme } = useTheme();

  // states
  const [menu, setMenu] = useState("payments"); // "payments" | "cashout" | "settings"
  const [newTxn, setNewTxn] = useState<Transaction | null>(null);
  // modal states
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [cbIntroModal, setCbIntroModal] = useState(false);
  const [cashbackModal, setCashbackModal] = useState(false);
  const [errorModal, setErrorModal] = useState<React.ReactNode>(null); // React.ReactNode includes string and null
  const [tradeMAXModal, setTradeMAXModal] = useState(false);

  // useEffect(() => {
  //   console.log("/app, useEffect");
  //   if (flashInfo?.userType === "owner") {
  //     if (paymentSettings && txns) setIsLoading(false);
  //   } else if (flashInfo?.userType === "employee") {
  //     if (txns) setIsLoading(false);
  //   }
  // }, [txns, settings]);

  useEffect(() => {
    if (window.localStorage.getItem("cashbackModal")) setCashbackModal(true);
    if (window.localStorage.getItem("cbNewlyLinked")) {
      window.localStorage.removeItem("cbNewlyLinked");
      setMenu("cashout");
    }
    if (!window.localStorage.getItem("theme")) setTheme("dark");
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! });

    if (address) {
      pusher.connection.bind("error", (e: any) => {
        console.error("Pusher connection error:", e);
      }); // bind to "error" event
      var channel = pusher.subscribe(address); // subscribes to channel with name equal to merchantEvmAddress
      channel.bind("payment", async ({ txn }: { txn: Transaction }) => {
        console.log("payment event detected, txn:", txn);
        queryClient.invalidateQueries({ queryKey: ["txns"] });
        setNewTxn(txn);
        setTimeout(() => {
          setNewTxn(null);
        }, 8000);
      });
      console.log("subscribed to channel:", address, "and listening to payment events");
    } else {
      console.log("address not detected, Pusher not subscribed");
    }

    return () => {
      console.log("Pusher disconnected");
      pusher.unbind("payment");
      pusher.disconnect();
    };
  }, []);

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

  return (
    <div className="textBaseApp bg-light1 text-lightText1 dark:bg-dark1 dark:text-darkText1 overscroll-none" style={{ scrollbarGutter: "stable" }}>
      {(flashInfo?.userType === "owner" && settings) || (flashInfo?.userType === "employee" && settings?.paymentSettings) ? (
        <div className="w-full h-screen flex portrait:flex-col-reverse landscape:flex-row relative">
          {/*--- Navbar width=120/lg:160/desktop:200 or height=80/sm:140 ---*/}
          <Navbar flashInfo={flashInfo} menu={menu} setMenu={setMenu} cashoutSettings={settings.cashoutSettings} />
          {/*---menu tabs---*/}
          {menu === "payments" && <Payments flashInfo={flashInfo} setErrorModal={setErrorModal} paymentSettings={settings.paymentSettings} />}
          {menu === "cashout" && w3Info && (
            <CashOut
              flashInfo={flashInfo}
              paymentSettings={settings.paymentSettings}
              cashoutSettings={settings.cashoutSettings}
              setErrorModal={setErrorModal}
              setTradeMAXModal={setTradeMAXModal}
            />
          )}
          {menu === "settings" && w3Info && <Settings paymentSettings={settings.paymentSettings} cashoutSettings={settings.cashoutSettings} setErrorModal={setErrorModal} />}
          {/*--- modals ---*/}
          {newTxn && <Notification paymentSettings={settings.paymentSettings} newTxn={newTxn} setNewTxn={setNewTxn} />}
          {errorModal && <ErrorModal setErrorModal={setErrorModal} errorModal={errorModal} />}
          {qrCodeModal && settings.paymentSettings && <QrCodeModal setQrCodeModal={setQrCodeModal} paymentSettings={settings.paymentSettings} setErrorModal={setErrorModal} />}
          {cbIntroModal && <CbIntroModal setCbIntroModal={setCbIntroModal} setCashbackModal={setCashbackModal} />}
          {cashbackModal && <CashbackModal setCashbackModal={setCashbackModal} />}
          {tradeMAXModal && <TradeMAXModal setTradeMAXModal={setTradeMAXModal} />}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}
