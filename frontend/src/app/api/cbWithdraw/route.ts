import axios from "axios";

export const POST = async (request: Request) => {
  console.log("cbWithdraw api");

  const { amount, cbAccessToken } = await request.json();
  console.log("amount:", amount, "cbAccessToken:", cbAccessToken);

  const paymentMethodId = await getPaymentMethodId(cbAccessToken);
  const accountId = await getAccountId(cbAccessToken);
  console.log("paymentMethodId:", paymentMethodId, "accountId:", accountId);

  try {
    const res = await axios.post(
      `https://api.coinbase.com/v2/accounts/${accountId}/withdrawals`,
      { amount: amount, currency: "USD", payment_method: paymentMethodId },
      { headers: { Authorization: `Bearer ${cbAccessToken}` } }
    );
    console.log("res.data.data.status", res.data.data.status);
    if (res.data.data.status == "created") {
      return Response.json("withdrawal made");
    } else {
      return Response.json("withdrawal not made");
    }
  } catch (err: any) {
    console.log(err.response.data);
    return Response.json("withdrawal not made");
  }
};

const getPaymentMethodId = async (cbAccessToken: string) => {
  try {
    const res = await axios.get(`https://api.coinbase.com/api/v3/brokerage/payment_methods`, {
      headers: { Authorization: `Bearer ${cbAccessToken}` },
    });
    const paymentMethods = res.data.payment_methods; // array of payment methods
    const paymentMethod = paymentMethods.find((i: any) => i.type === "ACH"); // find payment method where type is ACH
    const paymentMethodId = paymentMethod.id;
    return paymentMethodId;
  } catch (err) {
    console.log("error in getting paymentMethodId", err);
    return;
  }
};

const getAccountId = async (cbAccessToken: string) => {
  const res = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
  const accounts = res.data.data; // accounts = array of accounts
  const usdcAccount = accounts.find((i: any) => i.name === "Cash (USD)");
  const accountId = usdcAccount.id;
  return accountId;
};
