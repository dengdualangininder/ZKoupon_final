import axios from "axios";

export const POST = async (request: Request) => {
  console.log("cdOrder api");

  const { clientOrderId, cbAccessToken } = await request.json();
  console.log(clientOrderId, cbAccessToken);

  try {
    const res = await axios.post(
      "https://api.coinbase.com/api/v3/brokerage/orders",
      { client_order_id: clientOrderId, product_id: "USD-USDC", side: "BUY", order_configuration: { market_market_ioc: { base_size: "10" } } },
      { headers: { Authorization: `Bearer ${cbAccessToken}` } }
    );
    console.log(res.data);
    return Response.json("order made");
  } catch (err) {
    console.log(err);
    return Response.json("order not made");
  }
};
