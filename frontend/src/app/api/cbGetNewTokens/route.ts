import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("/api/cbGetNewTokens");
  const { code } = await req.json();

  try {
    const { data } = await axios.post("https://api.coinbase.com/oauth/token", {
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
      client_secret: process.env.COINBASE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/cbAuth`,
    });

    // create nextRes
    if (data.refresh_token && data.access_token) {
      console.log("set cbToken cookies");
      let nextRes = NextResponse.json({ status: "success" });
      nextRes.cookies.set("cbAccessToken", data.access_token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 }); // 1h
      nextRes.cookies.set("cbRefreshToken", data.refresh_token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }); // 30d
      return nextRes;
    }
  } catch (e) {}
  return NextResponse.json({ status: "failed", message: "failed to get tokens" });
}
