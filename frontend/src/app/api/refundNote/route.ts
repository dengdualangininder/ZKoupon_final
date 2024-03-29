import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";

export const POST = async (request: Request) => {
  console.log("refundNote api");

  const { merchantEvmAddress, txnHash, refundNote } = await request.json();
  console.log("merchantEvmAddress:", merchantEvmAddress, "| txnHash:", txnHash, "| refundNote:", refundNote);

  await dbConnect();

  try {
    await UserModel.findOneAndUpdate(
      { "paymentSettings.merchantEvmAddress": merchantEvmAddress, "transactions.txnHash": txnHash },
      { $set: { "transactions.$.refundNote": !refundNote } }
    );
    console.log("saved");
    return Response.json("saved");
  } catch (e) {
    console.log(e);
    return Response.json({ status: "error", message: "failed to update db" });
  }
};
