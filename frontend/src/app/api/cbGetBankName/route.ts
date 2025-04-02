import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  console.log("entered /api/cbGetBankInfo");
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

    let res = await fetch("https://api.coinbase.com/api/v3/brokerage/payment_methods", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    if (res.status === 401) {
      newTokens = await getNewTokens(cbRefreshToken);
      cbAccessToken = newTokens.newAccessToken;
      res = await fetch("https://api.coinbase.com/api/v3/brokerage/payment_methods", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    }
    const resJson = await res.json();
    const cbBankName = resJson.payment_methods.find((i: any) => i.type === "ACH").name; // resJson.data.payment_methods is an array of payment methods
    if (cbBankName) {
      const nextRes = NextResponse.json({ status: "success", data: cbBankName });
      if (newTokens) {
        nextRes.cookies.set("cbAccessToken", newTokens.newAccessToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 }); // 1h
        nextRes.cookies.set("cbRefreshToken", newTokens.newRefreshToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }); // 30d
      }
      return nextRes;
    }
  } catch (e) {}
  return Response.json({ status: "error", msg: "error in getting cbBankName" });
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
  }
  throw new Error();
}
