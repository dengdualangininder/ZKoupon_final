import axios from "axios";
import { Varela } from "next/font/google";

export const POST = async (request: Request) => {
  console.log("/api/cbGetTxns");
  const { cbAccessToken, cbRefreshToken } = await request.json();

  // if cbAccessToken exists, get balance
  let txns;
  if (cbAccessToken) txns = await getCbTxns(cbAccessToken);

  if (txns) {
    return Response.json({ status: "success", data: { txns } });
  } else {
    // 1. get new tokens
    const {
      data: { refresh_token: newCbRefreshToken },
      data: { access_token: newCbAccessToken },
    } = await axios.post("https://api.coinbase.com/oauth/token", {
      grant_type: "refresh_token",
      client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
      client_secret: process.env.COINBASE_CLIENT_SECRET,
      refresh_token: cbRefreshToken,
    });
    // 2. get balance
    const txns = await getCbTxns(newCbAccessToken);
    if (txns) {
      return Response.json({ status: "success", data: { txns, newCbRefreshToken, newCbAccessToken } });
    } else {
      return Response.json({ status: "error", message: "Failed to get Coinbase txns" });
    }
  }
};

async function getCbTxns(accessToken: string) {
  console.log("getCbTxns function");
  // get accountId
  const { usdAccountId, usdcAccountId } = await getAccountIdsForUsd(accessToken);

  let pendingUsdcDeposits, pendingUsdcWithdrawals, pendingUsdWithdrawals;
  // get pending usdc deposits & withdrawals
  try {
    const res = await axios.get(`https://api.coinbase.com/v2/accounts/${usdcAccountId}/transactions`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const txns = res.data.data; // txns = array of last 25 txns
    pendingUsdcDeposits = txns.filter((txn: any) => txn.status === "pending" && Number(txn.amount.amount) > 0);
    pendingUsdcWithdrawals = txns.filter((txn: any) => txn.status === "pending" && Number(txn.amount.amount) < 0);
  } catch (e) {}
  // get pending usd withdrawals
  try {
    const res = await axios.get(`https://api.coinbase.com/v2/accounts/${usdAccountId}/transactions`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const txns = res.data.data; // txns = array of last 25 txns
    pendingUsdWithdrawals = txns.filter((txn: any) => txn.status === "pending" && txn.type === "fiat_withdrawal");
  } catch (e) {}

  return { pendingUsdcDeposits, pendingUsdcWithdrawals, pendingUsdWithdrawals };
}

async function getAccountIdsForUsd(accessToken: string): Promise<any> {
  try {
    const res = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${accessToken}`, "CB-VERSION": "2024-07-01" } });
    const accounts = res.data.data; // array of accounts
    const usdAccountId = accounts.find((i: any) => i.name === "Cash (USD)")?.id ?? null;
    const usdcAccountId = accounts.find((i: any) => i.name === "USDC Wallet")?.id ?? null;
    return { usdAccountId: usdAccountId, usdcAccountId: usdcAccountId };
  } catch (e) {
    console.log("error in getAccountIdsForUsd");
  }
}
