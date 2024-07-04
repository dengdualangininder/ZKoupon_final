import axios from "axios";

export const POST = async (request: Request) => {
  console.log("entered cbGetBankInfo api");
  const { cbAccessToken, cbRefreshToken } = await request.json();

  // 1. If cbAccessToken exists, then getBankInfo
  // 2. If no cbAccessToken, call Coinbase's API to get new tokens. Withdraw and return new tokens to client.
  // 3. If no cbRefreshToken, then return "no cbRefreshToken"
  if (cbAccessToken) {
    console.log("cbAccessToken exists, getting bank info...");
    const cbBankAccountName = await getCbBankInfo(cbAccessToken);
    if (cbBankAccountName) {
      return Response.json({ status: "success", cbBankAccountName: cbBankAccountName });
    } else {
      return Response.json({ status: "error", message: "Could not get list of payment methods" });
    }
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
        const cbBankAccountName = await getCbBankInfo(res.data.access_token);
        if (cbBankAccountName) {
          return Response.json({ status: "success", cbBankAccountName: cbBankAccountName });
        } else {
          return Response.json({ status: "error", message: "Could not get list of payment methods" });
        }
      } catch (err) {
        return Response.json({ status: "error", message: "failed to get new tokens from Coinbase" });
      }
    } else {
      return Response.json({ status: "error", message: "no cbAccessTokens or cbRefreshTokens" });
    }
  }
};

const getCbBankInfo = async (cbAccessToken: string): Promise<any> => {
  try {
    const res = await axios.get(`https://api.coinbase.com/api/v3/brokerage/payment_methods`, {
      headers: { Authorization: `Bearer ${cbAccessToken}` },
    });
    const paymentMethods = res.data.payment_methods; // array of payment methods
    const paymentMethod = paymentMethods.find((i: any) => i.type === "ACH"); // find payment method where type is ACH
    const cbBankAccountName = paymentMethod.name;
    return cbBankAccountName;
  } catch (err) {
    console.log("error", err);
    return;
  }
};
