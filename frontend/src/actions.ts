"use server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { createSecretKey } from "crypto";
import { keccak256, getAddress } from "viem";

export async function setCookieCurrency(currency: string) {
  cookies().set("currency", currency);
}

export async function setFlashInfoCookie(userType: string, publicKey: string) {
  console.log("server action: setFlashTokenCookie");
  const merchantEvmAddress = getAddress("0x" + keccak256(Buffer.from(publicKey.substring(2), "hex")).slice(-40)); // slice(-40) keeps last 40 chars
  const secretKey = createSecretKey(process.env.JWT_KEY!, "utf-8");

  if (userType === "merchant") {
    var token = await new SignJWT({ merchantEvmAddress: merchantEvmAddress }) // details to  encode in the token
      .setProtectedHeader({ alg: "HS256" }) // algorithm
      .setExpirationTime("5 days") // token expiration time, e.g., "1 day"
      .sign(secretKey); // secretKey generated from previous step
    cookies().set("userType", "merchant"); //  httpOnly: true, path: "/"
    cookies().set("flashToken", token); //  httpOnly: true, path: "/"
  } else if (userType === "employee") {
    var token = await new SignJWT({ merchantEvmAddress: merchantEvmAddress }) // details to  encode in the token
      .setProtectedHeader({ alg: "HS256" }) // algorithm
      .setExpirationTime("8 hours") // token expiration time, e.g., "1 day"
      .sign(secretKey); // secretKey generated from previous step
    cookies().set("userType", "employee"); //  httpOnly: true, path: "/"
    cookies().set("flashToken", token); //  httpOnly: true, path: "/"
  } else {
    return;
  }
}
