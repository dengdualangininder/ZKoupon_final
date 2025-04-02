import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";

// strategy: 3 api calls to coinbase - execute 1 individually to test validity of access token, then execute other 2
export async function GET() {
  console.log("/api/cbGetAccountInfo");
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

    let resAccounts = await fetch("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    if (resAccounts.status === 401) {
      newTokens = await getNewTokens(cbRefreshToken);
      cbAccessToken = newTokens.newAccessToken;
      resAccounts = await fetch("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    }
    const resAccountsJson = await resAccounts.json();
    const usdcAccountId = resAccountsJson.data.find((i: any) => i.name === "USDC Wallet").id; // resAccounts.data.data = array of accounts

    // simulatneously get cbEvmAddress & cbAccountName
    if (usdcAccountId) {
      const [cbEvmAddress, cbAccountName] = await Promise.all([getCbEvmAddress(cbAccessToken, usdcAccountId), getCbAccountName(cbAccessToken)]);
      if (cbEvmAddress && cbAccountName) {
        const nextRes = NextResponse.json({ status: "success", data: { cbEvmAddress, cbAccountName } });
        if (newTokens) {
          nextRes.cookies.set("cbAccessToken", newTokens.newAccessToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 }); // 1h
          nextRes.cookies.set("cbRefreshToken", newTokens.newRefreshToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }); // 30d
        }
        return nextRes;
      }
    }
  } catch (e) {}
  return Response.json({ status: "error", message: "failed to get cbAccountInfo" });
}

// if error thrown, main fn has try/catch
async function getCbEvmAddress(cbAccessToken: string, usdcAccountId: string) {
  let res = await fetch(`https://api.coinbase.com/v2/accounts/${usdcAccountId}/addresses`, { headers: { Authorization: `Bearer ${cbAccessToken}` } });
  const resJson = await res.json();
  const cbEvmAddress = resJson.data.find((i: any) => i.network === "ethereum").address; // address is same for polygon, op, arb, base, etc.
  return cbEvmAddress;
}

// if error thrown, main fn has try/catch
async function getCbAccountName(cbAccessToken: string) {
  const res = await fetch(`https://api.coinbase.com/v2/user`, { headers: { Authorization: `Bearer ${cbAccessToken}`, "content-type": "application/json" } });
  const resJson = await res.json();
  const cbAccountName = resJson.data.name;
  return cbAccountName;
}

// if error thrown, main fn has try/catch; returns undefined if nothing returned
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
