import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: NextRequest) => {
  console.log("/api/createUser");
  const { merchantEmail, merchantCountry, merchantCurrency, cex, w3Info } = await request.json();

  // verify
  const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(w3Info.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
  const publicKeyCompressed = prefix + w3Info.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
  const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(w3Info.publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
  const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jwtVerify(w3Info.idToken, jwks, { algorithms: ["ES256"] });
  const verified = (jwtDecoded.payload as any).wallets[2].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
  if (!verified) return Response.json("not verified");

  await dbConnect();

  // return doc of existing user or create new user
  try {
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    if (doc) {
      return NextResponse.json("user already exists"); // this should not happen, as merchantEvmAddress already checked in /api/getSettings. But, use this in case.
    } else {
      const doc = await UserModel.create({
        "paymentSettings.merchantEvmAddress": merchantEvmAddress,
        "paymentSettings.merchantEmail": merchantEmail,
        "paymentSettings.merchantName": "",
        "paymentSettings.merchantCountry": merchantCountry,
        "paymentSettings.merchantCurrency": merchantCurrency,
        "paymentSettings.merchantPaymentType": "inperson",
        "paymentSettings.merchantWebsite": "",
        "paymentSettings.merchantBusinessType": "",
        "paymentSettings.merchantFields": [],
        "paymentSettings.merchantGoogleId": "",
        "paymentSettings.qrCodeUrl": "",
        "cashoutSettings.isEmployeePass": false,
        "cashoutSettings.cex": cex,
        "cashoutSettings.cexEvmAddress": "",
        "cashoutSettings.cexAccountName": "",
        transactions: [],
      });
      return NextResponse.json("success");
    }
  } catch (e) {
    return NextResponse.json("error");
  }
};
