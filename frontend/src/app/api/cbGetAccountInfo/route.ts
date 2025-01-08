import axios from "axios";

export const POST = async (request: Request) => {
  console.log("/api/getCbAccountInfo");
  const { cbAccessToken } = await request.json();

  try {
    // get usdcAccount (needed to get cbEvmAddress)
    const resAccounts = await axios.get("https://api.coinbase.com/v2/accounts", { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    const usdcAccount = resAccounts.data.data.find((i: any) => i.name === "USDC Wallet"); // resAccounts.data.data = array of accounts

    //get cbEvmAddress
    const resUsdcAddresses = await axios.get(`https://api.coinbase.com/v2/accounts/${usdcAccount.id}/addresses`, { headers: { Authorization: `Bearer ${cbAccessToken}` } });
    const cbEvmAddress = resUsdcAddresses.data.data.find((i: any) => i.network === "ethereum").address; // resAddresses.data.data = Solana and Ethereum usdc address objects

    // get cexAccountName
    const resCexAccountName = await axios.get(`https://api.coinbase.com/v2/user`, { headers: { Authorization: `Bearer ${cbAccessToken}`, "content-type": "application/json" } });
    const cexAccountName = resCexAccountName.data.data.name;

    return Response.json({ status: "success", data: { cbEvmAddress, cexAccountName } });
  } catch (e) {
    console.log(e);
    return Response.json({ status: "error", message: "failed to get Coinbase account info" });
  }
};
