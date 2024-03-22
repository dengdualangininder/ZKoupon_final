import axios from "axios";
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";

const getCbBalance = async (cbAccessToken: string) => {
  // call coinbase api
};

export const POST = async (request: Request) => {
  console.log("entered getCbBalance endpoint");

  const { cbAccessToken, web3AuthSessionId, _id } = await request.json();
  console.log("cbAccessToken=", cbAccessToken);

  await dbConnect();

  // authenticate with web3AuthSessionId and _id
  const web3AuthSessionIdFromDb = await UserModel.findById(_id).select("web3AuthSessionId");
  if (web3AuthSessionId != web3AuthSessionIdFromDb) {
    return Response.json("sessionId does not match");
  }

  // 1. Check if cbAccessToken exists. If it does, then get balance.
  // 2. If no cbAccessToken, get cbRefreshToken from db and call Coinbase's API to get new access&refresh tokens. Get balance and store new refresh token to db.
  // 3. If no cbRefreshToken, then return "no cbRefreshToken"
  if (cbAccessToken) {
    var balance = await getCbBalance(cbAccessToken);
    Response.json({ balance, cbAccessToken });
  } else {
    // get cbRefreshToken from db
    const cbRefreshToken = await UserModel.findOne({ _id: _id, web3AuthSessionId: web3AuthSessionId }).select("cbRefreshToken");
    if (cbRefreshToken) {
      // get access token from Coinbase
      const res = await axios.post("https://api.coinbase.com/oauth/token", {
        grant_type: "refresh_token",
        client_id: process.env.COINBASE_CLIENT_ID,
        client_secret: process.env.COINBASE_CLIENT_SECRET,
        refresh_token: cbRefreshToken,
      });
      const newCbAccessToken = res.data.access_token;
      const newCbRefreshToken = res.data.refresh_token;

      // if successful
      if (newCbAccessToken && newCbRefreshToken) {
        // store new cbRefreshToken to MongoDB
        await UserModel.findOneAndUpdate({ _id: _id, web3AuthSessionId: web3AuthSessionId }, { cbRefreshToken: newCbRefreshToken });
        // get balance
        var balance = await getCbBalance(newCbAccessToken);
        return Response.json({ balance, newCbAccessToken });
      } else {
        return Response.json("error: failed to get new cbAccessToken or cbRefreshToken from Coinbase");
      }
    } else {
      return Response.json("error: no cbRefreshToken");
    }
  }
};
