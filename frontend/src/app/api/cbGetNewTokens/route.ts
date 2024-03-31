import axios from "axios";

export const POST = async (request: Request) => {
  console.log("cbGetNewTokens api");

  const { code } = await request.json();
  console.log(code);

  try {
    const res = await axios.post("https://api.coinbase.com/oauth/token", {
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
      client_secret: process.env.COINBASE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/app/cbAuth`,
    });
    console.log("cbGetNewTokens api, res.data=", res.data);
    const { refresh_token, access_token } = res.data;
    return Response.json({ cbRefreshToken: refresh_token, cbAccessToken: access_token });
  } catch (err) {
    console.log("cbGetNewTokens api, error=", err);
    return Response.json("error");
  }
};
