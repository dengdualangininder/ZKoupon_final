import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";

export const POST = async (request: Request) => {
  console.log("saveSettings api");

  const { merchantEvmAddress, txn } = await request.json();
  console.log(merchantEvmAddress);
  console.log(txn);

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
    return Response.json("saved");
  } catch (e: any) {
    console.log(e);
    return Response.json("error");
  }
};
