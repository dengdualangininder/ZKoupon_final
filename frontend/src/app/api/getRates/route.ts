import axios from "axios";

export const POST = async (request: Request) => {
  console.log("entered getRates api");
  const { merchantCurrency } = await request.json();

  const sheetOrder = ["EUR", "GBP"];
  const sheetIndex = sheetOrder.findIndex((i) => i == merchantCurrency);

  try {
    // usdc
    const USDCres = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/1VnZjhKY6QCNYrc9lcSHd3BO1Ws_sXc0jyPNvlwbJhkE/values/coinbase!H4:I4?key=${process.env.GOOGLE_API_KEY}`
    );
    const usdcToLocal = USDCres.data.values[0][sheetIndex];
    // usd
    const USDres = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/1AYtFng--zDWlSJmQuF16dyXwdxvrsM6SItTTYSpVq0s/values/Sheet1!B2:E2?key=${process.env.GOOGLE_API_KEY}`
    );
    const usdToLocal = USDres.data.values[0][sheetIndex * 2];

    return Response.json({ status: "success", usdcToLocal, usdToLocal });
  } catch (e) {
    console.log({ status: "error", message: "Could not get rates" });
    return Response.json({ status: "error", message: "Could not get rates" });
  }
};
