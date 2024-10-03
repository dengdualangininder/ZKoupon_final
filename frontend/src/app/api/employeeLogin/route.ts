import dbConnect from "@/db/dbConnect";
import UserModel from "@/db/UserModel";
import { keccak256, getAddress } from "viem";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createSecretKey } from "crypto";

export const POST = async (request: Request) => {
  console.log("entering employeeLogin api");

  // request body
  const { merchantEmail, employeePass } = await request.json();

  await dbConnect();
  try {
    const doc = await UserModel.findOne({ "paymentSettings.merchantEmail": merchantEmail });
    if (doc) {
      try {
        const isPasswordCorrect = await bcrypt.compare(employeePass, doc.hashedEmployeePass);
        if (isPasswordCorrect) {
          // const token = jwt.sign({ merchantEmail: merchantEmail }, process.env.JWT_KEY, { expiresIn: "7d" });
          const secretKey = createSecretKey(process.env.JWT_KEY!, "utf-8");
          const token = await new SignJWT({ merchantEmail: merchantEmail }) // details to  encode in the token
            .setProtectedHeader({ alg: "HS256" }) // algorithm
            .setExpirationTime("3 days") // token expiration time, e.g., "1 day"
            .sign(secretKey); // secretKey generated from previous step
          console.log("logged in, jwt created:", token);
          const response = NextResponse.json({ status: "success" });
          response.cookies.set("employeeJwt", token);
          return response;
        } else {
          console.log("incorrect password");
          return Response.json({ status: "error", message: "incorrect password" });
        }
      } catch (e) {
        console.log(e);
        return Response.json({ status: "error", message: "Incorrect email or password" });
      }
    } else {
      return Response.json({ status: "error", message: "Incorrect email or password" });
    }
  } catch (err) {
    return Response.json({ status: "error", message: "Error when searching the database" });
  }
};
