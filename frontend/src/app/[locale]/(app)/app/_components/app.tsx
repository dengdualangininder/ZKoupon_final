"use client";
// nextjs
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
// custom hooks
import { useUserInfo } from "../../web3auth-provider";
import { usePaymentsQuery, useSettingsQuery } from "../../hooks";
import { useQuery } from "@tanstack/react-query";
import { deleteCookie } from "cookies-next";
// others
import Pusher from "pusher-js";
// components
import Navbar from "./navbar";
import Payments from "./payments";
import CashOut from "./cashout";
import Settings from "./settings";
import Loading from "./loading";
import CbIntroModal from "./modals/CbIntroModal";
import CashoutIntroModal from "./modals/CashoutIntroModal";
import QrCodeModal from "./modals/QrCodeModal";
import ErrorModal from "./modals/ErrorModal";
import CashbackModal from "./modals/CashbackModal";
import TradeMAXModal from "./modals/exchanges/TradeMAXModal";
// types
import { FlashInfo } from "@/utils/types";
import { PaymentSettings, CashoutSettings, Transaction } from "@/db/UserModel";
import Notification from "./modals/Notification";
// import PullToRefresh from "pulltorefreshjs";

export default function App({ flashInfo }: { flashInfo: FlashInfo }) {
  const searchParams = useSearchParams();
  const userInfo = useUserInfo();
  const router = useRouter();

  // states
  const [menu, setMenu] = useState("payments"); // "payments" | "cashOut" | "settings"
  // modals
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [notification, setNotification] = useState(false);
  const [cbIntroModal, setCbIntroModal] = useState(false);
  const [cashoutIntroModal, setCashoutIntroModal] = useState(false);
  const [cashbackModal, setCashbackModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tradeMAXModal, setTradeMAXModal] = useState(false);
  // useEffect triggers
  const [newTxn, setNewTxn] = useState<Transaction | null>(null);

  // react query
  // const { data: transactions } = usePaymentsQuery(userInfo, flashInfo);
  // const { data: settings } = useSettingsQuery(userInfo, flashInfo);
  // if (settings) {
  //   var paymentSettings = settings.paymentSettings;
  //   var cashoutSettings = settings.cashoutSettings;
  // }

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      console.log("useSettingsQuery queryFn");
      if (flashInfo.isUsabilityTest) {
        return;
        // return { paymentSettings: fakePaymentSettings, cashoutSettings: fakeCashoutSettings };
      } else {
        const res = await fetch("/api/getSettings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userInfo: userInfo }),
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const resJson = await res.json();
        if (resJson.status === "success") {
          return resJson.data;
        } else if (resJson === "create new user") {
          // create user
        } else if (resJson === "error") {
          await useLogout();
        }
        throw new Error("error");
      }
    },
    enabled: userInfo && flashInfo ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  if (settings) {
    var paymentSettings = settings.paymentSettings;
    var cashoutSettings = settings.cashoutSettings;
  }

  const { data: transactions } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      console.log("usePaymentsQuery queryFn");
      if (flashInfo.isUsabilityTest) {
        // return fakeTxns;
        return;
      } else {
        const res = await fetch("/api/getPayments", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userInfo: userInfo, flashInfo: flashInfo }),
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const resJson = await res.json();

        if (resJson.status === "success") {
          return resJson.data;
        } else if (resJson === "create new user") {
          //
        } else if (resJson.status === "error") {
          await useLogout();
        }
      }
    },
    enabled: userInfo && flashInfo ? true : false,
  });

  async function useLogout() {
    const router = useRouter();
    deleteCookie("flashToken");
    deleteCookie("userType");
    router.push("./login");
  }

  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log("/app app.tsx", time, "flashInfo:", flashInfo, "userInfo:", userInfo, "transactions:", transactions?.length, "settings:", settings);

  const isLoadingComplete = getIsLoadingComplete();

  function getIsLoadingComplete() {
    if (flashInfo && flashInfo.userType === "merchant") {
      if (settings && transactions) {
        return true;
      }
    } else if (flashInfo && flashInfo.userType === "employee") {
      if (transactions) {
        return true;
      }
    }
    return false;
  }

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
      // set notification
      // mutate database (after mutation, needs to invalidate paymentsQuery)
      // setNewTxn(txn); TODO: set up newTx context obeject with newTx.set and newTx.state
    });
  };

  async function verifyAndGetMerchantData() {
    // console.log("/app, verifyAndGetData()");
    // // get idToken and publicKey
    // try {
    //   const userInfo = await web3AuthInstance?.getUserInfo();
    //   var idToken = userInfo?.idToken;
    //   var privateKey: any = await web3AuthInstance?.provider?.request({ method: "eth_private_key" });
    //   var publicKey = getPublic(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");
    // } catch (e) {
    //   console.log("error: could not get idToken and publicKey, page set to Login");
    //   // router.push("/app/login");
    //   return;
    // }
    // // get user doc (idToken and publicKey will be verified)
    // if (idToken && privateKey) {
    //   const publicKey = getPublic(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");
    //   // set idToken and publicKey
    //   try {
    //     const res = await fetch("/api/getUserDoc", {
    //       method: "POST",
    //       body: JSON.stringify({ idToken: idToken, publicKey: publicKey }),
    //       headers: { "content-type": "application/json" },
    //     });
    //     var data = await res.json();
    //   } catch (err) {
    //     console.log("error: api request to getUserDoc failed");
    //     // await disconnectAsync();
    //     // router.push("/app/login");
    //     return;
    //   }
    //   // THREE POSSIBLE REUTRN VALUES
    //   if (data.status == "success") {
    //     console.log("user doc fetched");
    //     // set userInfo state
    //     setUserInfo({ idToken: idToken, publicKey: publicKey });
    //     // // subscribe pusher
    //     // subscribePusher(data.doc.paymentSettings.merchantEvmAddress);
    //     // check if redirected from Coinbase
    //     const cbRandomSecure = window.sessionStorage.getItem("cbRandomSecure");
    //     if (cbRandomSecure) {
    //       // console.log("cbRandomSecure", cbRandomSecure);
    //       // const substate = cbRandomSecure.split("SUBSTATE")[1];
    //       // console.log("substate", substate);
    //       // substate == "cashOut" ? setMenu("cashOut") : null;
    //       // substate == "fromIntro" ? setCbIntroModal(true) : null;
    //       // window.sessionStorage.removeItem("cbRandomSecure");
    //     }
    //     // router.push("/app"); // starthere
    //   } else if (data == "create new user") {
    //     createNewUser();
    //   } else if (data.status == "error") {
    //     // await disconnectAsync();
    //     // router.push("/app/login"); // starthere
    //   }
    // }
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
    <div className="pl-[calc(100vw-100%)] bg-light1 text-lightText1 dark:bg-dark1 dark:text-darkText1 overscroll-none">
      {!isLoadingComplete ? (
        <Loading />
      ) : (
        <div className="w-full h-screen flex portrait:flex-col-reverse landscape:flex-row relative">
          {/*--- Navbar width=120/lg:160/desktop:200 or height=80/sm:140 ---*/}
          {userInfo && <Navbar flashInfo={flashInfo} menu={menu} setMenu={setMenu} setCashoutIntroModal={setCashoutIntroModal} cashoutSettings={cashoutSettings} />}

          {/*---menu tabs---*/}
          {menu === "payments" && <Payments flashInfo={flashInfo} paymentSettings={paymentSettings} />}
          {/* {menu === "cashOut" && userInfo && <CashOut flashInfo={flashInfo} />} */}
          {/* {menu === "settings" && userInfo && <Settings flashInfo={flashInfo} />} */}

          {/*--- 6 MODALS ---*/}
          {/* {notification && <Notification notification={notification} setNotification={setNotification} transactions={transactions} paymentSettings={paymentSettings} />}
          {errorModal && <ErrorModal setErrorModal={setErrorModal} errorMsg={errorMsg} />}
          {qrCodeModal && paymentSettings && <QrCodeModal setQrCodeModal={setQrCodeModal} paymentSettings={paymentSettings} />}
          {cbIntroModal && <CbIntroModal setCbIntroModal={setCbIntroModal} setCashbackModal={setCashbackModal} />}
          {cashbackModal && <CashbackModal setCashbackModal={setCashbackModal} />}
          {cashoutIntroModal && paymentSettings && cashoutSettings && (
            <CashoutIntroModal
              paymentSettings={paymentSettings}
              cashoutSettings={cashoutSettings}
              setCashoutIntroModal={setCashoutIntroModal}
              setTradeMAXModal={setTradeMAXModal}
            />
          )}
          {tradeMAXModal && <TradeMAXModal setTradeMAXModal={setTradeMAXModal} />} */}
        </div>
      )}
    </div>
  );
}
