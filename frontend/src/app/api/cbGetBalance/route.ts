import axios from "axios";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { keccak256, getAddress } from "viem";
import * as jose from "jose";

export const POST = async (request: Request) => {
  console.log(Date.now());
  console.log("entered getCbBalance endpoint");
  const { cbAccessToken, cbRefreshToken, idToken, publicKey } = await request.json();

  // if cbAccessToken exists, get balance
  if (cbAccessToken) {
    var { balance, cexEvmAddress, cexAccountName } = await getCbBalance(cbAccessToken);
  }
  console.log(Date.now());
  if (balance) {
    // success
    console.log(Date.now());
    console.log("balance:", balance, "cexEvmAddress:", cexEvmAddress, "cexAccountName:", cexAccountName);
    saveToDb(publicKey, idToken, cexEvmAddress, cexAccountName);
    return Response.json({ status: "success", balance: balance, cexEvmAddress: cexEvmAddress, cexAccountName: cexAccountName });
  } else {
    // if no balance, then get new tokens and get balance
    const { newRefreshToken, newAccessToken } = await getNewTokens(cbRefreshToken);
    const { balance, cexEvmAddress, cexAccountName } = await getCbBalance(newAccessToken);
    if (balance) {
      saveToDb(publicKey, idToken, cexEvmAddress, cexAccountName);
      return Response.json({
        status: "success",
        balance: balance,
        cexEvmAddress: cexEvmAddress,
        cexAccountName: cexAccountName,
        newRefreshToken: newRefreshToken,
        newAccessToken: newAccessToken,
      });
    } else {
      return Response.json({ status: "error", message: "Failed to get balance with new tokens." });
    }
  }
};

const getCbBalance = async (cbAccessToken: string) => {
  console.log(Date.now());
  console.log("getCbBalance function, cbAccessToken:", cbAccessToken);
  try {
    // get balance
    const res = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    const accounts = res.data.data; // accounts = array of accounts
    const usdcAccount = accounts.find((i: any) => i.name === "USDC Wallet");
    const balance = usdcAccount.balance.amount; // returns string with 6 decimals
    //get cexEvmAddress
    const usdcAccountId = usdcAccount.id;
    const resCexAddresses = await axios.get(`https://api.coinbase.com/v2/accounts/${usdcAccountId}/addresses`, {
      headers: { Authorization: `Bearer ${cbAccessToken}` },
    });
    const cexAddressObjects = resCexAddresses.data.data; // returns Solana and Ethereum address objects
    const usdcAddressObject = cexAddressObjects.find((i: any) => i.network === "ethereum"); // find the Ethereum account
    const cexEvmAddress = usdcAddressObject.address; // get address
    // get cexAccountName
    const resCexAccountName = await axios.get(`https://api.coinbase.com/v2/user`, {
      headers: { Authorization: `Bearer ${cbAccessToken}` },
    });
    const cexAccountName = resCexAccountName.data.data.name;
    // return
    console.log(Date.now());
    console.log("balance:", balance, "cexEvmAddress:", cexEvmAddress, "cexAccountName:", cexAccountName);
    return { balance, cexEvmAddress, cexAccountName };
  } catch (err: any) {
    return { balance: undefined };
  }
};

const saveToDb = async (publicKey: string, idToken: string, cexEvmAddress: string, cexAccountName: string): Promise<boolean> => {
  try {
    await dbConnect; // connect to db
    // compute publicKeyCompressed and merchantEvmAddress from publicKey
    const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
    const publicKeyCompressed = prefix + publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
    const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
    // verify
    const jwks = jose.createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ["ES256"] });
    const verified = (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() == publicKeyCompressed.toLowerCase();
    // update db
    if (verified) {
      await UserModel.findOneAndUpdate(
        { "paymentSettings.merchantEvmAddress": merchantEvmAddress },
        { "cashoutSettings.cexEvmAddress": cexEvmAddress, "cashoutSettings.cexAccountName": cexAccountName }
      );
      console.log(Date.now());
      console.log("cexEvmAddress and cexAccountName saved to db");
      return true;
    } else {
      console.log("not verified");
      return false;
    }
  } catch (e: any) {
    console.log("error when saving to db");
    return false;
  }
};

const getNewTokens = async (cbRefreshToken: string) => {
  console.log("getting new tokens...");
  const res = await axios.post("https://api.coinbase.com/oauth/token", {
    grant_type: "refresh_token",
    client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
    client_secret: process.env.COINBASE_CLIENT_SECRET,
    refresh_token: cbRefreshToken,
  });
  return { newRefreshToken: res.data.refresh_token, newAccessToken: res.data.access_token };
};
