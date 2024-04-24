import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/models/UserModel";
import Pusher from "pusher";
import { ethers } from "ethers";
import { rpcUrls } from "@/utils/web3Constants";

export const POST = async (request: Request) => {
  console.log("payInperson api");
  const { txn } = await request.json();

  // verify txn
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrls["Polygon"]);
    const txResponse = await provider.getTransaction(txn.txnHash);
    const currentBlock = await provider.getBlockNumber();
    const txResponseTokenAmount = ethers.formatUnits("0x" + txResponse!.data.slice(-64), 6);
    var txResponseMerchantEvmAddress = ethers.getAddress(txResponse!.data.substring(34, 74));
    if (
      currentBlock &&
      txResponse &&
      txResponseMerchantEvmAddress == txn.merchantEvmAddress &&
      Number(txResponseTokenAmount) == txn.tokenAmount &&
      currentBlock - txResponse.blockNumber! < 20
    ) {
      console.log("payment verified");
    } else {
      return Response.json("not verified");
    }
  } catch (error) {
    return Response.json("not verified");
  }

  // save to db
  try {
    await dbConnect();
    await UserModel.findOneAndUpdate(
      { "paymentSettings.merchantEvmAddress": txResponseMerchantEvmAddress },
      {
        $push: {
          transactions: txn,
        },
      }
    );
    console.log("saved");
  } catch (error) {
    return Response.json("not saved");
  }

  // pusher
  try {
    const pusher = new Pusher({
      appId: process.env.PUSHER_ID ?? "",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
      secret: process.env.PUSHER_SECRET ?? "",
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
      useTLS: true,
    });
    pusher.trigger(txResponseMerchantEvmAddress!, "payment", { txn: txn });
    return Response.json("success");
  } catch (error) {
    console.log(error);
    return Response.json("not pushed");
  }
};
