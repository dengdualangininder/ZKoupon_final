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
      // onClick={async () => {
      //   const res = await fetch("/api/line", { method: "POST", headers: {}, body: "" });
      // }}
      >
        send line message
      </button>
      <div>{products}</div>
    </div>
  );
};

export default Payments;
