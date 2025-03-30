import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { keccak256, getAddress } from "viem";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createSecretKey } from "crypto";

export const POST = async (req: Request) => {
  console.log("entered /api/employeeLogin");
  const { merchantEmail, employeePass } = await req.json();

  try {
    await dbConnect();
    var doc = await UserModel.findOne({ "paymentSettings.merchantEmail": merchantEmail }, { "paymentSettings.merchantEvmAddress": 1, hashedEmployeePass: 1 });
    if (doc) {
      const isPasswordCorrect = await bcrypt.compare(employeePass, doc.hashedEmployeePass);
      if (isPasswordCorrect) {
        const secretKey = createSecretKey(process.env.JWT_KEY!, "utf-8");
        const token = await new SignJWT({ merchantEvmAddress: doc.paymentSettings.merchantEvmAddress }) // details to  encode in the token
          .setProtectedHeader({ alg: "HS256" }) // algorithm
          .setExpirationTime("3 days") // token expiration time, e.g., "1 day"
          .sign(secretKey); // secretKey generated from previous step
        cookies().set("userJwt", token);
        cookies().set("userType", "employee");
        return NextResponse.json("success");
      } else {
        return NextResponse.json({ status: "error", message: "Incorrect email or password" });
      }
    } else {
      return NextResponse.json({ status: "error", message: "Incorrect email or password" });
    }
  } catch (e) {}
  return NextResponse.json({ status: "error", message: "Internal server error" });
};
