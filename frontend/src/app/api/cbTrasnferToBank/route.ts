import axios from "axios";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { keccak256, getAddress } from "viem";
import * as jose from "jose";

export const POST = async (request: Request) => {
  console.log("entered getCbBalance endpoint");

  const { cbAccessToken, cbRefreshToken } = await request.json();
  console.log("cbAccessToken=", cbAccessToken, "cbRefreshToken=", cbRefreshToken);

  // 1. If cbAccessToken exists, then withdraw
  // 2. If no cbAccessToken, call Coinbase's API to get new tokens. Withdraw and return new tokens to client.
  // 3. If no cbRefreshToken, then return "no cbRefreshToken"
  if (cbAccessToken) {
    console.log("cbAccessToken exists, getting balance...");
    const { balance, cexEvmAddress } = await getCbBalance(cbAccessToken);
    if (balance == "error") {
      console.log({ status: "error", message: "failed to get balance, likely invalid cbAccessToken" });
      return Response.json({ status: "error", message: "failed to get balance, likely invalid cbAccessToken" });
    }
    // save to db
    const isSaved = await saveToDb(publicKey, idToken, cexEvmAddress);
    console.log("isSaved", isSaved);
    // return success
    console.log({ status: "success", balance: balance, cexEvmAddress: cexEvmAddress });
    return Response.json({ status: "success", balance: balance, cexEvmAddress: cexEvmAddress });
  } else {
    if (cbRefreshToken) {
      console.log("no cbAccessToken, but cbRefreshToken exists. Getting new tokens from Coinbase...");
      try {
        const res = await axios.post("https://api.coinbase.com/oauth/token", {
          grant_type: "refresh_token",
          client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
          client_secret: process.env.COINBASE_CLIENT_SECRET,
          refresh_token: cbRefreshToken,
        });
        console.log(res.data);
        const { balance, cexEvmAddress } = await getCbBalance(res.data.access_token);
        if (balance == "error") {
          console.log({ status: "error", message: "failed to get balance, likely invalid cbAccessToken" });
          return Response.json({ status: "error", message: "failed to get balance, likely invalid cbAccessToken" });
        }
        // save to db
        const isSaved = saveToDb(publicKey, idToken, cexEvmAddress);
        console.log("isSaved", isSaved);
        // return success
        console.log({ status: "success", balance: balance });
        return Response.json({
          status: "success",
          balance: balance,
          cexEvmAddress: cexEvmAddress,
          cbAccessToken: res.data.access_token,
          cbRefreshToken: res.data.refresh_token,
        });
      } catch (err) {
        const error = { status: "error", message: "failed to get new tokens from Coinbase" };
        console.log(error, err);
        return Response.json(error);
      }
    } else {
      const error = { status: "error", message: "no cbAccessTokens or cbRefreshTokens" };
      console.log(error);
      return Response.json(error);
    }
  }
};

const cbWithdraw = async (cbAccessToken: string) => {
  console.log("getCbBalance function, cbAccessToken", cbAccessToken);
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

    return { balance, cexEvmAddress };
  } catch (err: any) {
    console.log("getCbBalance function error", err.response.status, err.response.statusText);
    return { balance: "error", cexEvmAddress: "error" };
  }
};
