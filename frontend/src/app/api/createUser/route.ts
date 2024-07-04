import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  console.log("entered createUser api");
  const { merchantEvmAddress, merchantEmail, merchantCountry, merchantCurrency, cex } = await request.json();

  // connect db
  await dbConnect();

  // return doc of existing user or create new user
  try {
    const doc = await UserModel.findOne({ "paymentSettings.merchantEvmAddress": merchantEvmAddress });
    if (doc) {
      return NextResponse.json("user already exists"); // existence of merchantEvmAddress already checked in getUserDoc API, but still have this in case
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
        "cashoutSettings.isEmployeePass": false,
        "cashoutSettings.cex": cex,
        "cashoutSettings.cexEvmAddress": "",
        "cashoutSettings.cexAccountName": "",
        "cashoutSettings.cashoutIntro": true,
        transactions: [],
      });
      return NextResponse.json(doc);
    }
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message });
  }
};
