import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const GET = async (request: Request) => {
  console.log("getEmployeeData api");
  // read cookies
  const cookieStore = cookies();
  const jwt = cookieStore.get("jwt")?.value ?? "";

  try {
    // verify
    const secret = new TextEncoder().encode(process.env.JWT_KEY!); // format secret
    const { payload } = await jwtVerify(jwt, secret, {}); // verify token
    // fetch doc and return transactions
    await dbConnect();
    try {
      const doc = await UserModel.findOne({ "paymentSettings.merchantEmail": payload.merchantEmail });
      console.log("found doc and return transactions");
      return Response.json({ status: "success", paymentSettings: doc.paymentSettings, transactions: doc.transactions });
    } catch (error) {
      console.log(error);
      return Response.json({ status: "error", message: "could not fetch doc" });
    }
  } catch (error) {
    console.log("Token is invalid");
    return Response.json({ status: "error", message: "token is invalid" });
  }
};
