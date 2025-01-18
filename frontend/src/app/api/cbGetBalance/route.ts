import axios from "axios";

export const POST = async (request: Request) => {
  console.log("/api/cbGetBalance");
  const { cbAccessToken, cbRefreshToken } = await request.json();

  // if cbAccessToken exists, get balance
  if (cbAccessToken) var balance = await getCbBalance(cbAccessToken);

  if (balance) {
    return Response.json({ status: "success", data: { balance } });
  } else {
    // 1. get new tokens
    const {
      data: { refresh_token: newCbRefreshToken },
      data: { access_token: newCbAccessToken },
    } = await axios.post("https://api.coinbase.com/oauth/token", {
      grant_type: "refresh_token",
      client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
      client_secret: process.env.COINBASE_CLIENT_SECRET,
      refresh_token: cbRefreshToken,
    });
    // 2. get balance
    const balance = await getCbBalance(newCbAccessToken);
    if (balance) {
      return Response.json({ status: "success", data: { balance, newCbRefreshToken, newCbAccessToken } });
    } else {
      return Response.json({ status: "error", message: "Failed to get balance" });
    }
  }
};

async function getCbBalance(accessToken: string) {
  console.log("getCbBalance function");
  try {
    const res = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${accessToken}` } });
    const usdcAccount = res.data.data.find((i: any) => i.name === "USDC Wallet"); // res.data.data = array of accounts
    return usdcAccount.balance.amount; // returns string with 6 decimals
  } catch (e) {
    return undefined;
  }
}
