import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: Request) => {
  const { userInfo, flashInfo } = await request.json();

  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log("/api/getPayments", time, "userInfo:", userInfo ? userInfo.idToken.slice(0, 5) : undefined, "flashInfo:", flashInfo);

  // request body

  if (flashInfo.userType === "merchant") {
    // compute publicKeyCompressed
    const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(userInfo.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
    const publicKeyCompressed = prefix + userInfo.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
    // time
    const date2 = new Date();
    const time2 = date2.toLocaleTimeString("en-US", { hour12: false }) + `.${date2.getMilliseconds()}`;
    console.log(time2);
    // verify
    const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
    const jwtDecoded = await jwtVerify(userInfo.idToken, jwks, { algorithms: ["ES256"] });
    var verified = (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
    var merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(userInfo.publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
  } else {
    // verify
    const secret = new TextEncoder().encode(process.env.JWT_KEY!); // format secret
    var { payload: merchantEvmAddress }: { payload: `0x${string}` } = await jwtVerify(flashInfo.flashToken, secret, {}); // verify token
    var verified = merchantEvmAddress ? true : false;
  }

  // if logic gets here without return, means user is verified
  if (verified) {
    console.log("/api/getPayments verified");
    await dbConnect();
    try {
      const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress }, { transactions: 1 });
      if (doc) {
        console.log("/api/getPayments, successfully fetched transactions");
        return Response.json({ status: "success", data: doc.transactions.slice(0, 2) }); // need status: "success" to determine if response is returning "doc"
      } else {
        return Response.json("create new user");
      }
    } catch (e) {
      return Response.json({ status: "success", message: "failed to get user doc" });
    }
  } else {
    return Response.json({ status: "success", message: "failed to verify" });
  }
};
