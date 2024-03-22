import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  console.log("intro api");

  const { merchantEvmAddress } = await request.json();
  console.log(merchantEvmAddress);

  await dbConnect();

  try {
    const doc = await UserModel.findOneAndUpdate(
      { "paymentSettings.merchantEvmAddress": merchantEvmAddress },
      {
        intro: false,
      }
    );
    return NextResponse.json("saved");
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message });
  }
};
