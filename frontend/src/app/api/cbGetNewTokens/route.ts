import axios from "axios";
import { FaCropSimple } from "react-icons/fa6";

export async function POST(request: Request) {
  console.log("/api/cbGetNewTokens");
  const { code } = await request.json();

  try {
    const res = await axios.post("https://api.coinbase.com/oauth/token", {
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
      client_secret: process.env.COINBASE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/cbAuth`,
    });
    const { refresh_token, access_token } = res.data;
    return Response.json({ status: "success", data: { cbRefreshToken: refresh_token, cbAccessToken: access_token } });
  } catch (e) {
    console.log("erorr in linking Coinbase", e);
  }
  return Response.json({ staus: "failed", message: "failed to get tokens" });
}
