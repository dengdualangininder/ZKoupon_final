import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const GET = async (request: Request) => {
  console.log("/api/getEmployeeData api");

  // get userJwt
  const cookieStore = cookies();
  const userJwt = cookieStore.get("userJwt")?.value ?? "";
  if (!userJwt) Response.json({ status: "error", message: "no userJwt" });

  // verify
  try {
    const secret = new TextEncoder().encode(process.env.JWT_KEY!); // convert to Uint8Array
    var { payload } = await jwtVerify(userJwt, secret, {}); // throws error if not verified
  } catch (e) {
    console.log("Token is invalid");
    return Response.json({ status: "error", message: "token is invalid" });
  }

  // fetch data
  try {
    await dbConnect();
    const doc = await UserModel.findOne({ "paymentSettings.merchantEmail": payload.merchantEmail });
    return Response.json({ status: "success", paymentSettings: doc.paymentSettings, transactions: doc.transactions });
  } catch (e) {
    console.log(e);
    return Response.json({ status: "error", message: "could not fetch doc" });
  }
};
