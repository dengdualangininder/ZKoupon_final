import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import * as jose from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: Request) => {
  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log("getUserDoc api", time);

  const { idToken, publicKey, employeeJwt } = await request.json(); // request body

  const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars

  if (!employeeJwt) {
    // verify
    const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
    const publicKeyCompressed = prefix + publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
    const jwks = await jose.createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ["ES256"] });
    if ((jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() != publicKeyCompressed.toLowerCase()) {
      return Response.json({ status: "error", message: "failed to verify" });
    }
  } else {
    // verify employeeJwt
    const notVerified = true;
    if (notVerified) {
      return Response.json({ status: "error", message: "failed to verify" });
    }
  }

  // if verified (return not executed yet), then fetch and return data
  try {
    await dbConnect();
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress }, { paymentSettings: 1, cashoutSettings: 1 });
    if (doc) {
      // time
      const date2 = new Date();
      const time2 = date2.toLocaleTimeString("en-US", { hour12: false }) + `.${date2.getMilliseconds()}`;
      console.log("user doc fetched", time2);
      return Response.json({ status: "success", data: { paymentSettings: doc.paymentSettings, cashoutSettings: doc.cashoutSettings } });
    } else {
      return Response.json("create new user");
    }
  } catch (err) {
    console.log(err);
    return Response.json({ status: "error", message: "failed to get user doc" });
  }
};
