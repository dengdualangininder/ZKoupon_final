import axios from "axios";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";

export const POST = async (request: Request) => {
  console.log("entered getCbBalance endpoint");

  const { cbAccessToken, cbRefreshToken } = await request.json();
  console.log("cbAccessToken=", cbAccessToken, "cbRefreshToken=", cbRefreshToken);

  // await dbConnect();

  // 1. If cbAccessToken exists, then get balance
  // 2. If no cbAccessToken, get cbRefreshToken from localStorage/db and call Coinbase's API to get new access&refresh tokens. Get balance and store new refresh token to db.
  // 3. If no cbRefreshToken, then return "no cbRefreshToken"
  if (cbAccessToken) {
    console.log("cbAccessToken exists, getting balance...");
    const balance = await getCbBalance(cbAccessToken);
    if (balance == "error") {
      const error = { status: "error", message: "invalid cbAccessToken" };
      console.log(error);
      return Response.json(error);
    }
    const success = { status: "success", balance: balance };
    console.log(success);
    return Response.json(success);
  } else {
    // get cbRefreshToken from db
    // const cbRefreshToken = await UserModel.findOne({ _id: _id, web3AuthSessionId: web3AuthSessionId }).select("cbRefreshToken");
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
        // store new cbRefreshToken to MongoDB
        // await UserModel.findOneAndUpdate({ _id: _id, web3AuthSessionId: web3AuthSessionId }, { cbRefreshToken: newCbRefreshToken });
        const balance = await getCbBalance(res.data.access_token);
        if (balance == "error") {
          return Response.json({ status: "error", message: "invalid cbAccessToken" });
        }
        return Response.json({ status: "success", balance: balance, cbAccessToken: res.data.access_token, cbRefreshToken: res.data.refresh_token });
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

const getCbBalance = async (cbAccessToken: string) => {
  console.log("getCbBalance function, cbAccessToken", cbAccessToken);
  try {
    const res = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    const accounts = res.data.data; // accounts = array of accounts
    const usdcAccount = accounts.find((i: any) => i.name === "USDC Wallet");
    var usdcBalance = usdcAccount.balance.amount; // returns string with 6 decimals
    return usdcBalance;
  } catch (err: any) {
    console.log("getCbBalance function error", err.response.status, err.response.statusText);
    return "error";
  }
};
