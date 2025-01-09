import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { keccak256, getAddress } from "viem";
import { NextRequest } from "next/server";
import { Filter } from "@/utils/types";

export const POST = async (request: NextRequest) => {
  const { w3Info, flashInfo, pageParam, filter } = await request.json();
  console.log("entered /api/getPayments, pageParam:", pageParam, "filter:", filter);

  let verified = false;
  if (flashInfo.userType === "owner") {
    const prefix = ["0", "2", "4", "6", "8", "a", "c", "e"].includes(w3Info.publicKey.slice(-1)) ? "02" : "03"; // if y is even, then prefix is 02
    const publicKeyCompressed = prefix + w3Info.publicKey.substring(2).slice(0, -64); // substring(2) removes first 2 chars, slice(0, -64) removes last 64 chars
    var merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(w3Info.publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
    const jwks = createRemoteJWKSet(new URL("https://api-auth.web3auth.io/jwks")); // for social logins
    const jwtDecoded = await jwtVerify(w3Info.idToken, jwks, { algorithms: ["ES256"] });
    verified = (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() === publicKeyCompressed.toLowerCase();
  } else if (flashInfo.userType === "employee") {
    const employeeJwt = request.cookies.get("userJwt")?.value ?? "";
    const secret = new TextEncoder().encode(process.env.JWT_KEY!); // format secret
    var { payload: merchantEvmAddress }: { payload: `0x${string}` } = await jwtVerify(employeeJwt, secret, {}); // verify token
    verified = merchantEvmAddress ? true : false;
  } else {
    return;
  }
  if (!verified) return Response.json("not verified");

  try {
    await dbConnect();
    if (filter.last4Chars || filter.refunded || filter.toRefund || filter.searchDate.to) {
      // create filter
      let matchFilter: any = {};
      if (filter.last4Chars) matchFilter["transactions.customerAddress"] = { $regex: `(?i)${filter.last4Chars}$` };
      if (filter.toRefund) matchFilter["transactions.toRefund"] = true;
      if (filter.refunded) matchFilter["transactions.refund"] = { $ne: "" };
      if (filter.searchDate.to) matchFilter["transactions.date"] = { $gte: new Date(filter.searchDate.from), $lte: new Date(filter.searchDate.to) };
      // query txn with filter
      var txns = await UserModel.aggregate()
        .match({ "paymentSettings.merchantEvmAddress": merchantEvmAddress })
        .unwind("$transactions")
        .match(matchFilter)
        .sort({ "transactions._id": -1 })
        .skip(pageParam * 10)
        .limit(10)
        .project({ _id: 0, transactions: 1 })
        .replaceRoot("transactions");
    } else {
      // if no filter, query all txns
      var txns = await UserModel.aggregate()
        .match({ "paymentSettings.merchantEvmAddress": merchantEvmAddress })
        .unwind("$transactions")
        .sort({ "transactions._id": -1 })
        .skip(pageParam * 10)
        .limit(10)
        .project({ _id: 0, transactions: 1 })
        .replaceRoot("transactions");
    }
    if (txns) {
      return Response.json({ status: "success", data: txns });
    } else {
      return Response.json("create new user");
    }
  } catch (e) {
    console.log(e);
    return Response.json("error");
  }
};
