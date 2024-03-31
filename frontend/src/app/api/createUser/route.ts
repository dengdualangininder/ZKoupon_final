import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  console.log("createUser api");

  // request body
  const { merchantEvmAddress, merchantEmail, merchantCountry, merchantCurrency, cex } = await request.json();
  console.log(merchantEvmAddress, merchantEmail, merchantCountry, merchantCurrency, cex);

  // connect db
  await dbConnect();

  // return doc of existing user or create new user
  try {
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    if (doc) {
      console.log("merchantEvmAddress already exists");
    } else {
      const doc = await UserModel.create({
        "paymentSettings.merchantEvmAddress": merchantEvmAddress,
        "paymentSettings.merchantEmail": merchantEmail,
        "paymentSettings.merchantName": "",
        "paymentSettings.merchantCountry": merchantCountry,
        "paymentSettings.merchantCurrency": merchantCurrency,
        "paymentSettings.merchantPaymentType": "inperson",
        "paymentSettings.merchantWebsite": "",
        "paymentSettings.merchantBusinessType": "",
        "paymentSettings.merchantFields": [],
        "paymentSettings.merchantGoogleId": "",
        "paymentSettings.employeePass": "",
        "cashoutSettings.cex": cex,
        "cashoutSettings.cexEvmAddress": "",
        "cashoutSettings.cexApiKey": "",
        "cashoutSettings.cexApiSecret": "",
        "cashoutSettings.cexAccountName": "",
        transactions: [],
        intro: true,
      });
      return NextResponse.json(doc);
    }
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message });
  }
};
