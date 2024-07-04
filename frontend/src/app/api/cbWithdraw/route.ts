import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export const POST = async (request: Request) => {
  const { amount, merchantCurrency, cbAccessToken } = await request.json();
  console.log("entered cbWithdraw api,", "amount:", amount, "| merchantCurrency:", merchantCurrency);

  // frontend should already have these checks
  if (!["USD", "EUR"].includes(merchantCurrency)) {
    return Response.json({ status: "error", messsage: "Currency not supported" });
  } else if (Number(amount) < 11) {
    return Response.json({ status: "error", messsage: "11 USDC minimum withdrawal" });
  } else if (Number(amount) > 10000.1) {
    return Response.json({ status: "error", messsage: "10,000 USDC maximum withdrawal" });
  }

  const error1 = "There was a connection error. Please try to make the transfer again.";
  const error2 =
    "There was a connection error. Your USDC in Coinbase was successfully converted to USDT, but it failed to convert to USD. Please log into your Coinbase account and sell the USDT for USD. Then, withdraw the USD to your bank. We apologize for any inconvenience."; // this is critical
  const error3 =
    "There was a connection error. Your USDC in Coinbase was successfully converted to USD, but the withdrawal to your bank was not made. Please log into your Coinbase account and withdraw the USD to your bank. We apologize for any inconvenience."; // this is critical
  const headers = { Authorization: `Bearer ${cbAccessToken}`, "CB-VERSION": "2024-07-01", "Content-Type": "application/json" };

  // USD
  if (merchantCurrency == "USD") {
    const { usdAccountId, usdtAccountId } = await getAccountIdsForUsd();
    if (!usdAccountId || !usdtAccountId) {
      return Response.json({ status: "error", message: error1 });
    }
    // 1. convert usdc to usdt
    const { limitOrderStatus, usdcAmountSold, usdtAmountBought } = await makeUsdcToUsdtLimitOrder();
    if (limitOrderStatus != "success") {
      return Response.json({ status: "error", message: error1 });
    }

    // 2. convert usdt to usd
    await new Promise((resolve) => setTimeout(resolve, 3000)); // need pause or 400 error will happen
    const marketOrderId = await makeUsdtToUsdMarketOrder(usdtAmountBought.toString());
    if (!marketOrderId) {
      return Response.json({ status: "error", message: error2 });
    }
    // get usdAmountBought
    await new Promise((resolve) => setTimeout(resolve, 3000)); // need pause or will return details of a partial fill order
    const usdAmountBought = await getUsdtToUsdMarketOrderDetails(marketOrderId, usdAccountId);
    if (!usdAmountBought) {
      return Response.json({ status: "error", message: error3 });
    }

    // 3. withdraw usd to bank
    const withdrawStatus = await withdrawUsd(usdAmountBought, usdAccountId);
    if (withdrawStatus == "created") {
      return Response.json({ status: "success", usdcAmountSold: usdcAmountSold, fiatAmountBought: usdAmountBought });
    } else {
      return Response.json({ status: "error", message: error3 });
    }
  }

  // EUR
  if (merchantCurrency == "EUR") {
    const eurAccountId = await getEurAccountId();
    if (!eurAccountId) {
      return Response.json({ status: "error", message: error1 });
    }
    // 1. convert usdc to eur
    const marketOrderId = await makeUsdcToEurMarketOrder(amount);
    if (!marketOrderId) {
      return Response.json({ status: "error", message: error1 });
    }
    // get eurAmountBought
    await new Promise((resolve) => setTimeout(resolve, 3000)); // need pause or will return details of a partial fill order
    const eurAmountBought = await getUsdcToEurMarketOrderDetails(marketOrderId, eurAccountId);
    if (!eurAmountBought) {
      return Response.json({ status: "error", message: error3 });
    }
    console.log("usdcAmountSold:", amount, "eurAmountBought:", eurAmountBought);

    // 3. withdraw usd to bank
    const withdrawStatus = await withdrawEur(eurAmountBought, eurAccountId);
    if (withdrawStatus == "created") {
      return Response.json({ status: "success", usdcAmountSold: amount, fiatAmountBought: eurAmountBought });
    } else {
      return Response.json({ status: "error", message: error3 });
    }
  }

  async function getAccountIdsForUsd(): Promise<any> {
    try {
      const res = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}`, "CB-VERSION": "2024-07-01" } });
      const accounts = res.data.data; // array of accounts
      const usdAccountId = accounts.find((i: any) => i.name === "Cash (USD)").id;
      const usdtAccountId = accounts.find((i: any) => i.name === "USDT Wallet").id;
      return { usdAccountId, usdtAccountId };
    } catch (e: any) {
      console.log("error in getAccountIdsForUsd:", e.message);
    }
  }

  async function getEurAccountId(): Promise<any> {
    try {
      const res = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}`, "CB-VERSION": "2024-07-01" } });
      const accounts = res.data.data; // array of accounts
      const eurAccountId = accounts.find((i: any) => i.name === "Cash (EUR)").id; // need to double check this
      return eurAccountId;
    } catch (e: any) {
      console.log("error in getEurAccountId:", e.message);
    }
  }

  async function getUsdtPrice() {
    const res = await axios.get(`https://api.coinbase.com/api/v3/brokerage/product_book?product_id=USDT-USDC&limit=1`, { headers: headers });
    const usdtPrice = res.data.pricebook.asks[0].price; // ~20,000 available volume
    return usdtPrice;
  }

  async function makeLimitOrder(usdtAmountToBuyRoundedDown: number, usdtPrice: string) {
    const limitClientOrderId = uuidv4();
    const res = await axios.post(
      `https://api.coinbase.com/api/v3/brokerage/orders`,
      {
        client_order_id: limitClientOrderId,
        product_id: "USDT-USDC",
        side: "BUY",
        order_configuration: {
          limit_limit_fok: {
            base_size: usdtAmountToBuyRoundedDown.toString(),
            limit_price: usdtPrice,
          },
        },
      },
      { headers: headers }
    );
    console.log("limitOrder:", res.data);
    if (res.data.success) {
      const limitOrderStatus = "success";
      return limitOrderStatus;
    }
  }

  async function makeUsdcToUsdtLimitOrder(): Promise<any> {
    // try 3 attemps in case usdtPrice changes and FOK order is killed. In 99.9% cases, should succeed on 1st attempt.
    for (let attempts = 0; attempts < 3; attempts++) {
      console.log("convertUsdcToUsdt attempts:", attempts); // ideally 0
      try {
        const usdtPrice = await getUsdtPrice(); // gets best askPrice
        const usdtAmountToBuy = amount / usdtPrice - amount * 0.00001; // need to substract the fees
        const usdtAmountToBuyRoundedDown = Math.floor(usdtAmountToBuy * 100) / 100;
        console.log("usdtAmountToBuy:", usdtAmountToBuy, "| usdtAmountToBuyRoundedDown:", usdtAmountToBuyRoundedDown);
        const limitOrderStatus = await makeLimitOrder(usdtAmountToBuyRoundedDown, usdtPrice);
        if (limitOrderStatus == "success") {
          const usdcAmountSold = usdtAmountToBuyRoundedDown * usdtPrice * 1.00001;
          console.log("usdcAmountSold", usdcAmountSold, "| usdtAmountBought:", usdtAmountToBuyRoundedDown);
          return { limitOrderStatus, usdcAmountSold, usdtAmountBought: usdtAmountToBuyRoundedDown };
        }
      } catch (e: any) {
        console.log(e.message);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s cooldown
    }
  }

  async function makeUsdtToUsdMarketOrder(usdtAmountBought: string) {
    try {
      const marketClientOrderId = uuidv4();
      const res = await axios.post(
        `https://api.coinbase.com/api/v3/brokerage/orders`,
        {
          client_order_id: marketClientOrderId,
          product_id: "USDT-USD",
          side: "SELL",
          order_configuration: {
            market_market_ioc: {
              base_size: usdtAmountBought,
            },
          },
        },
        { headers: headers }
      );
      console.log("marketOrder:", res.data);
      const marketOrderId = res.data.success_response.order_id;
      return marketOrderId;
    } catch (e: any) {
      console.log("makeUsdtToUsdMarketOrder failed:", e.message); // this is a critical error
    }
  }

  async function makeUsdcToEurMarketOrder(amount: string) {
    try {
      const marketClientOrderId = uuidv4();
      const res = await axios.post(
        `https://api.coinbase.com/api/v3/brokerage/orders`,
        {
          client_order_id: marketClientOrderId,
          product_id: "USDC-EUR",
          side: "SELL",
          order_configuration: {
            market_market_ioc: {
              base_size: amount,
            },
          },
        },
        { headers: headers }
      );
      const marketOrderId = res.data.success_response.order_id;
      console.log("marketOrderId:", marketOrderId);
      return marketOrderId;
    } catch (e: any) {
      console.log("makeUsdtToUsdMarketOrder failed:", e.message); // this is a critical error
    }
  }

  async function getUsdtToUsdMarketOrderDetails(marketOrderId: string, usdAccountId: string) {
    for (let attempts = 0; attempts < 4; attempts++) {
      const res = await axios.get(`https://api.coinbase.com/v2/accounts/${usdAccountId}/transactions`, { headers: headers });
      const txns = res.data.data.slice(0, 5);
      console.log("getUsdtToUsdMarketOrderDetails attempt:", attempts); // should be 0
      for (let i = 0; i < txns.length; i++) {
        if (txns[i].advanced_trade_fill.order_id == marketOrderId) {
          const matchedTxn = txns[i];
          console.log("matchedTx index:", i, "| matchedTxn:", matchedTxn);
          const usdAmountBought = matchedTxn.native_amount.amount; // native_amount.amount is slightly more accurate than amount.amount
          console.log("usdAmountBought:", usdAmountBought);
          return usdAmountBought;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 4 attempts, 2s interval
    }
  }

  async function getUsdcToEurMarketOrderDetails(marketOrderId: string, eurAccountId: string) {
    for (let attempts = 0; attempts < 4; attempts++) {
      const res = await axios.get(`https://api.coinbase.com/v2/accounts/${eurAccountId}/transactions`, { headers: headers });
      const txns = res.data.data.slice(0, 5);
      console.log("getUsdcToEurMarketOrderDetails attempt:", attempts); // should be 0
      for (let i = 0; i < txns.length; i++) {
        if (txns[i].advanced_trade_fill.order_id == marketOrderId) {
          const matchedTxn = txns[i];
          console.log("matchedTx index:", i, "| matchedTxn:", matchedTxn);
          const eurAmountBought = matchedTxn.amount.amount;
          console.log("eurAmountBought:", eurAmountBought);
          return eurAmountBought;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 4 attempts, 2s interval
    }
  }

  async function withdrawUsd(usdAmountBought: string, usdAccountId: string) {
    // get usdPaymentMethodId
    const usdPaymentMethodId = await getPaymentMethodId("USD");
    if (!usdPaymentMethodId) {
      return;
    }

    try {
      const res = await axios.post(
        `https://api.coinbase.com/v2/accounts/${usdAccountId}/withdrawals`,
        { amount: usdAmountBought, currency: "USD", payment_method: usdPaymentMethodId },
        { headers: { Authorization: `Bearer ${cbAccessToken}` } }
      );
      const withdrawStatus = res.data.data.status;
      console.log("withdrawStatus", withdrawStatus);
      return withdrawStatus;
    } catch (e: any) {
      console.log(e.message);
    }
  }

  async function withdrawEur(eurAmountBought: string, eurAccountId: string) {
    // get usdPaymentMethodId
    const eurPaymentMethodId = await getPaymentMethodId("EUR");
    if (!eurPaymentMethodId) {
      return;
    }

    try {
      const res = await axios.post(
        `https://api.coinbase.com/v2/accounts/${eurAccountId}/withdrawals`,
        { amount: eurAmountBought, currency: "EUR", payment_method: eurPaymentMethodId },
        { headers: { Authorization: `Bearer ${cbAccessToken}` } }
      );
      const withdrawStatus = res.data.data.status;
      console.log("withdrawStatus", withdrawStatus);
      return withdrawStatus;
    } catch (e: any) {
      console.log(e.message);
    }
  }

  async function getPaymentMethodId(merchantCurrency: string) {
    const paymentMethodType: any = { USD: "ACH", EUR: "SEPA" }; // need to confirm "SEPA"
    try {
      const res = await axios.get(`https://api.coinbase.com/api/v3/brokerage/payment_methods`, {
        headers: { Authorization: `Bearer ${cbAccessToken}` },
      });
      const paymentMethods = res.data.payment_methods; // array of payment methods
      const paymentMethodId = paymentMethods.find((i: any) => i.type == paymentMethodType[merchantCurrency]).id;
      console.log("paymentMethodId:", paymentMethodId);
      return paymentMethodId;
    } catch (err) {
      console.log("error in getPaymentMethodId", err);
    }
  }
};

// async function getUsdcToUsdtLimitOrderDetails(limitOrderId: string, usdtAccountId: string): Promise<any> {
//   for (let attempts = 0; attempts < 4; attempts++) {
//     const res = await axios.get(`https://api.coinbase.com/v2/accounts/${usdtAccountId}/transactions`, { headers: headers });
//     const txns = res.data.data.slice(0, 20);
//     console.log("getUsdcToUsdtLimitOrderDetails attempt:", attempts); // should be 0
//     for (let i = 0; i < txns.length; i++) {
//       if (txns[i].advanced_trade_fill.order_id == limitOrderId) {
//         const matchedTxn = txns[i];
//         console.log("matchedTx index:", i, "| matchedTxn:", matchedTxn);
//         const usdtAmountBought = matchedTxn.amount.amount;
//         const usdcAmountSold = (Number(matchedTxn.advanced_trade_fill.commission) + Number(matchedTxn.advanced_trade_fill.fill_price) * Number(usdtAmountBought)).toFixed(6);
//         console.log("usdcAmountSold:", usdcAmountSold, "| usdtAmountBought:", usdtAmountBought);
//         return { usdcAmountSold, usdtAmountBought };
//       }
//     }
//     await new Promise((resolve) => setTimeout(resolve, 2000)); // 4 attempts, 2s interval
//   }
// }
