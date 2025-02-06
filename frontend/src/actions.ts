"use server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { createSecretKey } from "crypto";
import { keccak256, getAddress } from "viem";

export async function setCurrencyCookieAction(currency: string) {
  cookies().set("currency", currency);
}

export async function setFlashCookies(userType: string, merchantEvmAddress: string) {
  console.log("server action: setFlashInfoAction()");
  const secretKey = createSecretKey(process.env.JWT_KEY!, "utf-8");

  if (userType === "owner") {
    var token = await new SignJWT({ merchantEvmAddress: merchantEvmAddress }) // details to  encode in the token
      .setProtectedHeader({ alg: "HS256" }) // algorithm
      .setExpirationTime("5 days") // token expiration time, e.g., "1 day"
      .sign(secretKey); // secretKey generated from previous step
    cookies().set("userType", userType); //  httpOnly: true, path: "/"
    cookies().set("userJwt", token); //  httpOnly: true, path: "/"
  } else if (userType === "employee") {
    var token = await new SignJWT({ merchantEvmAddress: merchantEvmAddress }) // details to  encode in the token
      .setProtectedHeader({ alg: "HS256" }) // algorithm
      .setExpirationTime("8 hours") // token expiration time, e.g., "1 day"
      .sign(secretKey); // secretKey generated from previous step
    cookies().set("userType", userType); //  httpOnly: true, path: "/"
    cookies().set("userJwt", token); //  httpOnly: true, path: "/"
  } else {
    return;
  }
}

export async function deleteUserJwtCookie() {
  cookies().delete("userJwt");
}
