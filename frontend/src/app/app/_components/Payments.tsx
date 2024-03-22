"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useWeb3Auth } from "@/app/provider/ContextProvider";

const Payments = ({ transactionsState, isMobile }: { transactionsState: any; isMobile: boolean }) => {
  // console.log(txns);
  // console.log(paymentSettings);
  // console.log(isMobile);

  const [products, setProducts] = useState([]);

  // const web3Auth = useWeb3Auth();

  // useEffect(() => {
  //   (async () => {
  //     console.log("/app, Payments, web3Auth:", web3Auth);
  //     const userInfo = await web3Auth?.getUserInfo();
  //     console.log("/app, Payments, userInfo:", userInfo);
  //   })();
  // }, []);

  // useEffect(() => {
  //   const getProducts = async () => {
  //     const products = (await axios.get("./api/products")).data;
  //     console.log(products);
  //     setProducts(products);
  //   };
  //   getProducts();
  // }, []);

  return (
    <div>
      <div>Payments</div>
      <div>products here:</div>
      <button
        onClick={async () => {
          const res = await fetch("/api/line", { method: "POST", headers: {}, body: "" });
          // const lineAccessToken =
          //   "rI25D9JZ2IiEf1vZm+t3iS+tXVCbR7r3+25fGgCS1LRGmeAQ2ZJWYSbwuYWVrkXw6kkXAZzPQRgkHTLS11F2MA30aNrXxz5wtgwmJMHu4MaSYSOjsTXSU/R4VlBFk0rDZv90hRgSBz+0wjCzPnHdAwdB04t89/1O/w1cDnyilFU=";
          // try {
          //   await axios.post(
          //     "https://api.line.me/v2/bot/message/push",
          //     {
          //       to: "U34665e2abd196a0da01a3fb6d25c9195",
          //       messages: [
          //         {
          //           type: "text",
          //           text: "Hello",
          //         },
          //       ],
          //     },
          //     {
          //       headers: {
          //         "Content-Type": "application/json",
          //         Authorization: `Bearer ${lineAccessToken}`,
          //         "Access-Control-Allow-Origin": "*",
          //         "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
          //         "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          //       },
          //     }
          //   );
          // } catch (err) {
          //   console.log(err);
          // }
        }}
      >
        send line message
      </button>
      <div>{products}</div>
    </div>
  );
};

export default Payments;
