import { FallbackProvider, JsonRpcProvider } from "ethers";
import type { Chain, Client, Transport } from "viem";
import { currency2decimal } from "./constants";

export async function fetchPost(url: string, obj: { [key: string]: any }) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) throw new Error("error");
  const resJson = await res.json();
  return resJson;
}

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback") {
    const providers = (transport.transports as ReturnType<Transport>[]).map(({ value }) => new JsonRpcProvider(value?.url, network));
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }
  return new JsonRpcProvider(transport.url, network);
}

// functions
export const getLocalTime = (mongoDate: string | undefined) => {
  if (!mongoDate) {
    return;
  }
  const time = new Date(mongoDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  const timeObject = { time: time.split(" ")[0], ampm: time.split(" ")[1] };
  return timeObject;
};

// return format: April 2
export const getLocalDateWords = (mongoDate: string | undefined) => {
  if (!mongoDate) return;
  let date = new Date(mongoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }).split(",");
  return date[0];
};

// return format: 2024-04-02
export const getLocalDate = (mongoDate: string) => {
  let date = new Date(mongoDate).toLocaleString("en-GB").split(", ")[0].split("/");
  return `${date[2]}-${date[1]}-${date[0]}`;
};

export const formatCurrency = (currency: string, amount: string) => {
  const decimals = currency2decimal[currency];
  return (Math.floor(Number(amount) * Math.pow(10, decimals)) / Math.pow(10, decimals)).toString();
};

export const formatUsd = (amount: string) => {
  return (Math.floor(Number(amount) * 100) / 100).toString();
};

// const { data: settings } = useQuery({
//   queryKey: ["settings"],
//   queryFn: async () => {
//     console.log("useSettingsQuery queryFn");
//     if (nullaInfo.isUsabilityTest) {
//       return;
//       // return { paymentSettings: fakePaymentSettings, cashoutSettings: fakeCashoutSettings };
//     } else {
//       const res = await fetch("/api/getSettings", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({ w3Info: w3Info }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch");
//       const resJson = await res.json();
//       if (resJson.status === "success") {
//         return resJson.data;
//       } else if (resJson === "create new user") {
//         // create user
//       } else if (resJson === "error") {
//         await useLogout();
//       }
//       throw new Error("error");
//     }
//   },
//   enabled: w3Info && nullaInfo ? true : false,
//   staleTime: Infinity,
//   gcTime: Infinity,
// });
// if (settings) {
//   var paymentSettings = settings.paymentSettings;
//   var cashoutSettings = settings.cashoutSettings;
// }

// const { data: transactions } = useQuery({
//   queryKey: ["payments"],
//   queryFn: async () => {
//     console.log("usePaymentsQuery queryFn");
//     if (nullaInfo.isUsabilityTest) {
//       // return fakeTxns;
//       return;
//     } else {
//       const res = await fetch("/api/getPayments", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({ w3Info: w3Info, nullaInfo: nullaInfo }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch");
//       const resJson = await res.json();

//       if (resJson.status === "success") {
//         return resJson.data;
//       } else if (resJson === "create new user") {
//         //
//       } else if (resJson.status === "error") {
//         await useLogout();
//       }
//     }
//   },
//   enabled: w3Info && nullaInfo ? true : false,
// });

async function verifyAndGetMerchantData() {
  // console.log("/app, verifyAndGetData()");
  // // get idToken and publicKey
  // try {
  //   const w3Info = await web3AuthInstance?.getW3Info();
  //   var idToken = w3Info?.idToken;
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
  //     // set w3Info state
  //     setW3Info({ idToken: idToken, publicKey: publicKey });
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
