// TODO: this is weakest link, need to somehow verify the web3AuthSessionId externally with web3Auth
import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  console.log("saveWeb3AuthSessionId api");
  const { merchantEvmAddress, web3AuthSessionId } = await request.json();
  console.log(web3AuthSessionId);

  await dbConnect();

  try {
    await UserModel.findOneAndUpdate(
      { "paymentSettings.merchantEvmAddress": merchantEvmAddress },
      {
        web3AuthSessionId: web3AuthSessionId,
      }
    );
    return NextResponse.json("saved");
  } catch (e) {
    console.log("error in saveWeb3AuthSessionId api", e);
    return NextResponse.json("error");
  }
};
