"use server";
import { cookies } from "next/headers";

export async function setCookieCurrency(currency: string) {
  cookies().set("currency", currency);
}
