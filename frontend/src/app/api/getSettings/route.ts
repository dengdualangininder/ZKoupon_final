import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log(time, "entered /api/getSettings");

  const { w3Info } = await request.json();

  // verify
  const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(w3Info.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
  const publicKeyCompressed = prefix + w3Info.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
  const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(w3Info.publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
  const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jwtVerify(w3Info.idToken, jwks, { algorithms: ["ES256"] });
  const verified = (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
  if (!verified) return NextResponse.json("not verified");

  // fetch data
  try {
    await dbConnect();
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress }, { paymentSettings: 1, cashoutSettings: 1 });
    if (doc) {
      const date2 = new Date();
      const time2 = date2.toLocaleTimeString("en-US", { hour12: false }) + `.${date2.getMilliseconds()}`;
      console.log(time2, "/api/getSettings, doc fetched");
      return NextResponse.json({ status: "success", data: { paymentSettings: doc.paymentSettings, cashoutSettings: doc.cashoutSettings } });
    } else {
      console.log("/api/getSettings create new user");
      // return NextResponse.redirect(new URL("/intro", request.url));
      return NextResponse.json("create new user");
    }
  } catch (e) {
    console.log("/api/getSettings error");
    return NextResponse.json("error");
  }
};
