import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  console.log("/api/cbGetTxns");
  let newTokens;

  try {
    // get cookies
    const cookieStore = cookies();
    let cbAccessToken = cookieStore.get("cbAccessToken")?.value;
    const cbRefreshToken = cookieStore.get("cbRefreshToken")?.value;

    if (!cbRefreshToken) throw new Error();

    if (!cbAccessToken) {
      newTokens = await getNewTokens(cbRefreshToken);
      cbAccessToken = newTokens.newAccessToken;
    }

    // get usdAccountId & usdcAccountId
    let res = await fetch("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    if (res.status === 401) {
      newTokens = await getNewTokens(cbRefreshToken);
      cbAccessToken = newTokens.newAccessToken;
      res = await fetch("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    }
    const resJson = await res.json();
    const usdAccountId = resJson.data.find((i: any) => i.name === "Cash (USD)")?.id ?? ""; // resJson.data = array of accounts
    const usdcAccountId = resJson.data.find((i: any) => i.name === "USDC Wallet")?.id ?? "";

    if (usdAccountId && usdcAccountId) {
      // get pending usdc deposits & withdrawals
      try {
        const res = await axios.get(`https://api.coinbase.com/v2/accounts/${usdcAccountId}/transactions`, { headers: { Authorization: `Bearer ${cbAccessToken}` } });
        const txns = res.data.data; // txns = array of last 25 txns
        var pendingUsdcDeposits = txns.filter((txn: any) => txn.status === "pending" && Number(txn.amount.amount) > 0);
        var pendingUsdcWithdrawals = txns.filter((txn: any) => txn.status === "pending" && Number(txn.amount.amount) < 0);
      } catch (e) {}

      // get pending usd withdrawals
      try {
        const res = await axios.get(`https://api.coinbase.com/v2/accounts/${usdAccountId}/transactions`, { headers: { Authorization: `Bearer ${cbAccessToken}` } });
        const txns = res.data.data; // txns = array of last 25 txns
        var pendingUsdWithdrawals = txns.filter((txn: any) => txn.status === "pending" && txn.type === "fiat_withdrawal");
      } catch (e) {}

      // create response
      if (pendingUsdcDeposits && pendingUsdcWithdrawals && pendingUsdWithdrawals) {
        const nextRes = NextResponse.json({ status: "success", data: { pendingUsdcDeposits, pendingUsdcWithdrawals, pendingUsdWithdrawals } });
        if (newTokens) {
          nextRes.cookies.set("cbAccessToken", newTokens.newAccessToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 }); // 1h
          nextRes.cookies.set("cbRefreshToken", newTokens.newRefreshToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }); // 30d
        }
        return nextRes;
      }
    }
  } catch (e) {}
  return NextResponse.json({ status: "error", message: "error in getting cbTxns" });
}

// if error, above has try/catch; returns undefined if nothing returned
async function getNewTokens(cbRefreshToken: string): Promise<{ newRefreshToken: string; newAccessToken: string }> {
  const { data } = await axios.post("https://api.coinbase.com/oauth/token", {
    grant_type: "refresh_token",
    client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
    client_secret: process.env.COINBASE_CLIENT_SECRET,
    refresh_token: cbRefreshToken,
  });

  if (data.refresh_token && data.access_token) {
    console.log("fetched new cbTokens");
    return { newRefreshToken: data.refresh_token, newAccessToken: data.access_token };
  } else {
    throw new Error();
  }
}
