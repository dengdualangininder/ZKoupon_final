import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import Pusher from "pusher";

export const POST = async (request: Request) => {
  console.log("saveSettings api");

  const { merchantEvmAddress, txn } = await request.json();
  console.log(merchantEvmAddress);
  console.log(txn);

  // verify txn
  try {
    // TODO: get txn data from blockchain, and verify 3 things 1) transferTo = merchantEvmAddress, 2) amount = tokenAmount, and 3) time is within last 1 minute
  } catch (error) {
    console.log(error);
    return Response.json("not verified");
  }

  // save to db
  await dbConnect();
  try {
    await UserModel.findOneAndUpdate(
      { "paymentSettings.merchantEvmAddress": merchantEvmAddress },
      {
        $push: {
          transactions: txn,
        },
      }
    );
    // if saved to db, trigger pusher event
    try {
      const pusher = new Pusher({
        appId: process.env.PUSHER_ID ?? "",
        key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
        secret: process.env.PUSHER_SECRET ?? "",
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
        useTLS: true,
      });
      await pusher.trigger(merchantEvmAddress, "payment-submitted", { currency: txn.merchantCurrency, amount: txn.currencyAmount }); // (channel, event-name, data)
      return Response.json("success");
    } catch (error) {
      console.log(error);
      return Response.json("not triggered");
    }
  } catch (error: any) {
    console.log(error);
    return Response.json("not saved");
  }
};
