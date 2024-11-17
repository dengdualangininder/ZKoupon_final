import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: Request) => {
  const { userInfo } = await request.json();

  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log("/api/getSettings", time, "userInfo:", userInfo ? userInfo.idToken.slice(0, 5) : undefined);

  // verify
  const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(userInfo.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
  const publicKeyCompressed = prefix + userInfo.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
  const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jwtVerify(userInfo.idToken, jwks, { algorithms: ["ES256"] });
  const verified = (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();

  if (verified) {
    console.log("/api/getSettings verified");
    try {
      await dbConnect();
      const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(userInfo.publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
      const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress }, { paymentSettings: 1, cashoutSettings: 1 });
      if (doc) {
        console.log("/api/getSettings, successfully fetched user settings");
        return Response.json({ status: "success", data: { paymentSettings: doc.paymentSettings, cashoutSettings: doc.cashoutSettings } });
      } else {
        console.log("create new user");
        return Response.json("create new user");
      }
    } catch (e) {
      return Response.json({ status: "error", message: "failed to get user doc" });
    }
  } else {
    return Response.json({ status: "error", message: "failed to verify" });
  }
};
