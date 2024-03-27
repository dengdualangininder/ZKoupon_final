"use client";
import { useState, useEffect } from "react";

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
      <div>List of payments here:</div>
    </div>
  );
};

export default Payments;
