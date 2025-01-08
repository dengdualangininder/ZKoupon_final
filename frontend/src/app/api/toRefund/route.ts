import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";

export const POST = async (request: Request) => {
  console.log("entered /api/toRefund");
  const { txnHash, toRefund, w3Info, flashInfo } = await request.json();

  if (w3Info) {
    // verify merchant
    const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(w3Info.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
    const publicKeyCompressed = prefix + w3Info.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
    var merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(w3Info.publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
    const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
    const jwtDecoded = await jwtVerify(w3Info.idToken, jwks, { algorithms: ["ES256"] });
    var verified = (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
  } else {
    // verify employee
    const secret = new TextEncoder().encode(process.env.JWT_KEY!); // format secret
    var { payload: merchantEvmAddress }: { payload: `0x${string}` } = await jwtVerify(flashInfo.userJwt, secret, {}); // verify token
    var verified = merchantEvmAddress ? true : false;
  }

  // if not verified
  if (!verified) return Response.json("not verified");

  try {
    await dbConnect();
    await UserModel.findOneAndUpdate({ "paymentSettings.merchantEvmAddress": merchantEvmAddress, "transactions.txnHash": txnHash }, { "transactions.$.toRefund": !toRefund });
    return Response.json("saved");
  } catch (e) {
    return Response.json("error");
  }
};
