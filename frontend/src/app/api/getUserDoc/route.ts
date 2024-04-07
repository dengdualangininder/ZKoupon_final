import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import * as jose from "jose";

export const POST = async (request: Request) => {
  console.log("verify api");

  // request body
  const { merchantEvmAddress, idToken, publicKey } = await request.json();

  // verify
  const jwks = jose.createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
  const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ["ES256"] });
  if ((jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() != publicKey.toLowerCase()) {
    return Response.json({ status: "error", message: "failed to verify" });
  }
  console.log("verified, publicKey:", (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase());

  // connect db
  await dbConnect();

  // return doc of existing user or create new user
  try {
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    if (doc) {
      return Response.json({ status: "success", doc: doc }); // need status: "success" to determine if response is returning "doc"
    } else {
      return Response.json("create new user");
    }
  } catch (err) {
    console.log(err);
    return Response.json({ status: "error", message: "failed to get user doc" });
  }
};
