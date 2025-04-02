import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cbRefreshToken = cookies().get("cbRefreshToken");

  return NextResponse.json({
    isCbLinked: !!cbRefreshToken, // true if present, false if not
  });
}
