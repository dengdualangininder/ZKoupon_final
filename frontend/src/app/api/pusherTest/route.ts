import Pusher from "pusher";

export const POST = async (request: Request) => {
  console.log("pusherTest api");
  const { message } = await request.json();

  const merchantEvmAddress = "0x2AdFb165770e7A504dfEACF24352f059b688De75";

  const pusher = new Pusher({
    appId: process.env.PUSHER_ID ?? "",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
    secret: process.env.PUSHER_SECRET ?? "",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
    useTLS: true,
  });
  const txn = {
    date: "2024-04-01T19:33:20.403Z",
    customerAddress: "0xA206df5844dA81470C82d07AE1b797d139bE58C2",
    currencyAmount: 0.1,
    merchantCurrency: "EUR",
    tokenAmount: 0.11,
    token: "USDC",
    network: "Polygon",
    blockRate: 0.932,
    cashRate: 0.931,
    savings: "0.1%",
    merchantEvmAddress: "0x2AdFb165770e7A504dfEACF24352f059b688De75",
    refund: false,
    archive: false,
    txnHash: "0x7cd4ee94a309dafcb1d95aff46d078dc5fba97caae5ec9a017488a282abefc6f",
    _id: "660b0c097b1b90a71bafa64c",
  };

  pusher.trigger(merchantEvmAddress, "payment", { txn: txn });
  return Response.json("saved and pushed");
};
