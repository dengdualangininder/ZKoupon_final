import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: Request) => {
  console.log("refund api");

  const { userInfo, txnHash, refundHash } = await request.json();

  // verify
  const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(userInfo.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
  const publicKeyCompressed = prefix + userInfo.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
  const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jwtVerify(userInfo.idToken, jwks, { algorithms: ["ES256"] });
  const verified = (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();

  if (verified) {
    const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(userInfo.publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars

    await dbConnect();

    try {
      var doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    } catch (e: any) {
      return Response.json({ status: "error", message: "failed to fetch doc" });
    }

    // if can't find tx
    const txIndex = doc.transactions.findIndex((i: any) => i.txnHash === txnHash);
    console.log("txIndex", txIndex);
    if (!txIndex) {
      return Response.json("cannot find tx");
    }

    // if refund already true
    if (doc.transactions[txIndex].refund == true) {
      return Response.json("already refunded");
    }

    // if all conditions are met
    if (txIndex && doc.transactions[txIndex].refund == false) {
      try {
        await UserModel.findOneAndUpdate(
          { "paymentSettings.merchantEvmAddress": merchantEvmAddress, "transactions.txnHash": txnHash },
          { $set: { "transactions.$.refund": true } }
        );
        return Response.json("saved");
      } catch (e) {
        return Response.json("failed to save to db");
      }
    }
  } else {
    return Response.json("failed to verify");
  }
};
