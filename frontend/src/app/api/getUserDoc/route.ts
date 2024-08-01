import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import * as jose from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: Request) => {
  console.log("entered verify & fetch doc api");

  // request body
  const { idToken, publicKey } = await request.json();

  // compute publicKeyCompressed and merchantEvmAddress from publicKey
  const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
  const publicKeyCompressed = prefix + publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
  const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars

  // verify
  const jwks = await jose.createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ["ES256"] });
  if ((jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() != publicKeyCompressed.toLowerCase()) {
    return Response.json({ status: "error", message: "failed to verify" });
  }

  // return doc of existing user or create new user
  await dbConnect();
  try {
    console.log("merchantEvmAddress:", merchantEvmAddress);
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    if (doc) {
      console.log("verified & fetched doc");
      return Response.json({ status: "success", doc: doc }); // need status: "success" to determine if response is returning "doc"
    } else {
      return Response.json("create new user");
    }
  } catch (err) {
    console.log(err);
    return Response.json({ status: "error", message: "failed to get user doc" });
  }
};
