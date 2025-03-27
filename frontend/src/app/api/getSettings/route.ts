import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  console.log("entered /api/getSettings");
  const { web3AuthInfo, nullaInfo } = await request.json();

  try {
    // 1. verify
    let verified = false;
    if (nullaInfo.userType === "owner") {
      const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(web3AuthInfo.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
      const publicKeyCompressed = prefix + web3AuthInfo.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
      var merchantEvmAddress = getAddress("0x" + keccak256(("0x" + web3AuthInfo.publicKey.substring(2)) as `0x${string}`).slice(-40)); // slice(-40) keeps last 40 chars
      const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
      const jwtDecoded = await jwtVerify(web3AuthInfo.idToken, jwks, { algorithms: ["ES256"] });
      verified = (jwtDecoded.payload as any).wallets[2].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
    } else if (nullaInfo.userType === "employee") {
      const employeeJwt = request.cookies.get("userJwt")?.value ?? "";
      const secret = new TextEncoder().encode(process.env.JWT_KEY!); // format secret
      var {
        payload: { merchantEvmAddress },
      }: { payload: { merchantEvmAddress: `0x${string}` } } = await jwtVerify(employeeJwt, secret, {}); // verify token
      verified = merchantEvmAddress ? true : false;
    } else {
      return Response.json("not verified");
    }
    if (!verified) {
      return Response.json("not verified");
    }

    // 2. connect to db
    await dbConnect();

    // 3. fetch doc
    const projection = nullaInfo.userType === "owner" ? { paymentSettings: 1, cashoutSettings: 1 } : { paymentSettings: 1, cashoutSettings: 1 };
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress }, projection);

    // 4. return response
    if (doc) {
      const date2 = new Date();
      const time2 = date2.toLocaleTimeString("en-US", { hour12: false }) + `.${date2.getMilliseconds()}`;
      console.log(time2, "/api/getSettings, doc fetched");
      return NextResponse.json({ status: "success", data: { paymentSettings: doc.paymentSettings, cashoutSettings: doc.cashoutSettings ?? "" } });
    }

    // 5. if no records, create new user
    if (doc === null) {
      return NextResponse.json("create new user");
    }

    console.log("/api/getSettings error");
    return NextResponse.json("error");
  } catch (e) {
    console.log("/api/getSettings error");
    return NextResponse.json("error");
  }
};
