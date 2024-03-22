import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  console.log("saveSettings api");

  const { paymentSettings, cashoutSettings } = await request.json();
  console.log(paymentSettings);
  console.log(cashoutSettings);

  await dbConnect();

  try {
    const doc = await UserModel.findOneAndUpdate(
      { "paymentSettings.merchantEvmAddress": paymentSettings.merchantEvmAddress },
      {
        paymentSettings: paymentSettings,
        cashoutSettings: cashoutSettings,
      }
    );
    return NextResponse.json("saved");
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message });
  }
};
