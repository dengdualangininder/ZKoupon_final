"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { createSecretKey } from "crypto";

export async function setCookieAction(key: string, value: string) {
  cookies().set(key, value);
}

export async function deleteCookieAction(key: string) {
  cookies().delete(key);
}

export async function initIntroAction() {
  cookies().set("isIntro", "true");
  redirect("/intro");
}

export async function endIntroAction() {
  cookies().delete("isIntro");
  redirect("/app");
}

// only used for owner login
export async function setNullaCookiesAction(merchantEvmAddress: string, pathname: string) {
  const secretKey = createSecretKey(process.env.JWT_KEY!, "utf-8");
  var token = await new SignJWT({ merchantEvmAddress }) // payload
    .setProtectedHeader({ alg: "HS256" }) // algorithm
    .setExpirationTime("5 days") // token expiration time, e.g., "1 day"
    .sign(secretKey);

  cookies().set("userType", "owner"); //  TODO: httpOnly: true, path: "/"
  cookies().set("userJwt", token); //  TODO: httpOnly: true, path: "/"

  // catch isIntro flag; needed because middelware.ts won't change navbar path when the redirect is from a SA
  const isIntro = cookies().get("isIntro")?.value;
  if (isIntro) redirect("/intro");

  if (pathname !== "app") redirect("/app");
}
