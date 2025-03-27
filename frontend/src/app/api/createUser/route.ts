import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { NextResponse, NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: NextRequest) => {
  console.log("/api/createUser");
  const { merchantEmail, merchantCountry, merchantCurrency, cex, web3AuthInfo } = await request.json();

  // verify
  const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(web3AuthInfo.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
  const publicKeyCompressed = prefix + web3AuthInfo.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
  const merchantEvmAddress = getAddress("0x" + keccak256(("0x" + web3AuthInfo.publicKey.substring(2)) as `0x${string}`).slice(-40)); // slice(-40) keeps last 40 chars
  const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jwtVerify(web3AuthInfo.idToken, jwks, { algorithms: ["ES256"] });
  const verified = (jwtDecoded.payload as any).wallets[2].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
  if (!verified) return Response.json("not verified");

  // return doc of existing user or create new user
  try {
    await dbConnect();
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    if (doc) {
      return NextResponse.json("user already exists"); // this should not happen, as merchantEvmAddress already checked in /api/getSettings. But, use this in case.
    } else {
      await UserModel.create({
        hasEmployeePass: false,
        "paymentSettings.merchantEvmAddress": merchantEvmAddress,
        "paymentSettings.merchantEmail": merchantEmail,
        "paymentSettings.merchantName": "",
        "paymentSettings.merchantCountry": merchantCountry,
        "paymentSettings.merchantCurrency": merchantCurrency,
        "paymentSettings.merchantPaymentType": "inperson",
        "paymentSettings.merchantGoogleId": "",
        "paymentSettings.qrCodeUrl": "",
        "cashoutSettings.cex": cex,
        "cashoutSettings.cexEvmAddress": "",
        transactions: [],
      });
      return NextResponse.json("success");
    }
  } catch (e) {
    return NextResponse.json("error");
  }
};
