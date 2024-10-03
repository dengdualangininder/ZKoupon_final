import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";

export const POST = async (request: Request) => {
  console.log("toRefund api");

  const { merchantEvmAddress, txnHash, toRefund } = await request.json();
  console.log("merchantEvmAddress:", merchantEvmAddress, "| txnHash:", txnHash, "| toRefund:", toRefund);

  await dbConnect();

  try {
    await UserModel.findOneAndUpdate(
      { "paymentSettings.merchantEvmAddress": merchantEvmAddress, "transactions.txnHash": txnHash },
      { $set: { "transactions.$.toRefund": !toRefund } }
    );
    console.log("saved");
    return Response.json("saved");
  } catch (e) {
    console.log(e);
    return Response.json({ status: "error", message: "failed to update db" });
  }
};
