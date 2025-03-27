import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const { w3Info } = await request.json();
  console.log("entered /api/getPaymentsRange");

  // verify
  const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(w3Info.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
  const publicKeyCompressed = prefix + w3Info.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
  const merchantEvmAddress = getAddress("0x" + keccak256(("0x" + w3Info.publicKey.substring(2)) as `0x${string}`).slice(-40)); // slice(-40) keeps last 40 chars
  const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jwtVerify(w3Info.idToken, jwks, { algorithms: ["ES256"] });
  const verified = (jwtDecoded.payload as any).wallets[2].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
  if (!verified) return Response.json("not verified");

  try {
    await dbConnect();
    var docs = await UserModel.aggregate()
      .match({ "paymentSettings.merchantEvmAddress": merchantEvmAddress })
      .project({
        firstTxn: { $arrayElemAt: ["$transactions", 0] },
        lastTxn: {
          $arrayElemAt: ["$transactions", { $subtract: [{ $size: "$transactions" }, 1] }],
        },
      });
    if (docs) {
      const { firstTxn, lastTxn } = docs[0];
      return Response.json({ status: "success", data: { firstTxn, lastTxn } });
    } else {
      return Response.json("create new user");
    }
  } catch (e) {
    console.log(e);
    return Response.json("error");
  }
};
