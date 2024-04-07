import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";

export const POST = async (request: Request) => {
  console.log("getTransactions api");

  // request body
  const { merchantEvmAddress } = await request.json();
  console.log(merchantEvmAddress);

  // connect db
  await dbConnect();

  // fetch doc and return transactions
  try {
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    return Response.json({ status: "success", transactions: doc.transactions });
  } catch (error) {
    console.log(error);
    return Response.json({ status: "error", message: "could not fetch doc" });
  }
};
