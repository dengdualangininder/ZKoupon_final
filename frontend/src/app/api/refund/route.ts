import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";

export const POST = async (request: Request) => {
  console.log("refund api");

  const { merchantEvmAddress, txnHash, refundHash } = await request.json();
  console.log("merchantEvmAddress", merchantEvmAddress);
  console.log("refundHash", refundHash);
  console.log("txnHash", txnHash);

  await dbConnect();

  try {
    var doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
  } catch (e: any) {
    return Response.json({ status: "error", message: "failed to fetch doc" });
  }

  // if can't find tx
  const txIndex = doc.transactions.findIndex((i: any) => i.txnHash === txnHash);
  console.log("txIndex", txIndex);
  if (!txIndex) {
    return Response.json({ status: "error", message: "could not find transaction" });
  }

  // if refund already true
  if (doc.transactions[txIndex].refund == true) {
    return Response.json({ status: "error", message: "refund already processed" });
  }

  // if all conditions are met
  if (txIndex && doc.transactions[txIndex].refund == false) {
    try {
      await UserModel.findOneAndUpdate({ "paymentSettings.merchantEvmAddress": merchantEvmAddress, "transactions.txnHash": txnHash }, { $set: { "transactions.$.refund": true } });
      console.log("saved");
      return Response.json("saved");
    } catch (err) {
      console.log(err);
      return Response.json({ status: "error", message: "failed to update db" });
    }
  }
};
