import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  console.log("entered /api/getSettings");
  const { web3AuthInfo, nullaInfo } = await request.json();

  try {
    // verify
    let verified = false;
    if (nullaInfo.userType === "owner") {
      const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(web3AuthInfo.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
      const publicKeyCompressed = prefix + web3AuthInfo.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
      var merchantEvmAddress = getAddress("0x" + keccak256(("0x" + web3AuthInfo.publicKey.substring(2)) as `0x${string}`).slice(-40)); // slice(-40) keeps last 40 chars
      const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
      const jwtDecoded = await jwtVerify(web3AuthInfo.idToken, jwks, { algorithms: ["ES256"] });
      verified = (jwtDecoded.payload as any).wallets[2].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
    } else {
      const employeeJwt = request.cookies.get("userJwt")?.value ?? "";
      const secret = new TextEncoder().encode(process.env.JWT_KEY!); // format secret
      var {
        payload: { merchantEvmAddress },
      }: { payload: { merchantEvmAddress: `0x${string}` } } = await jwtVerify(employeeJwt, secret, {}); // verify token
      verified = merchantEvmAddress ? true : false;
    }
    if (!verified) return Response.json("not verified");

    // fetch doc
    await dbConnect();
    const projection = nullaInfo.userType === "owner" ? { paymentSettings: 1, cashoutSettings: 1 } : { paymentSettings: 1 };
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress }, projection);
    if (doc) {
      return NextResponse.json({ status: "success", data: { paymentSettings: doc.paymentSettings, cashoutSettings: doc.cashoutSettings ?? "" } });
    }

    // if no records, create new user
    if (nullaInfo.userType === "owner" && doc === null) {
      const doc = await UserModel.create({
        hashedEmployeePass: "",
        "paymentSettings.merchantEvmAddress": merchantEvmAddress,
        "paymentSettings.merchantEmail": web3AuthInfo.email,
        "paymentSettings.merchantName": "",
        "paymentSettings.merchantCountry": "",
        "paymentSettings.merchantCurrency": "",
        "paymentSettings.merchantPaymentType": "inperson",
        "paymentSettings.merchantGoogleId": "",
        "paymentSettings.qrCodeUrl": "",
        "paymentSettings.hasEmployeePass": false,
        "cashoutSettings.cex": "",
        "cashoutSettings.cexEvmAddress": "",
        transactions: [],
      });
      return NextResponse.json({ status: "new user", data: { paymentSettings: doc.paymentSettings, cashoutSettings: doc.cashoutSettings } });
    }
  } catch (e) {}
  console.log("/api/getSettings error");
  return NextResponse.json("error");
};
