import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  // get pathname without locale
  let pathname = request.nextUrl.pathname; // returns /app or /zh-TW/app
  const segments = pathname.split("/");
  if (["en", "fr", "it", "zh-TW"].includes(segments[1])) pathname = `/${segments.slice(2).join("/")}`;
  console.log("middleware.ts, pathname:", pathname);

  // redirect for these specific conditions
  if (pathname === "/app") {
    const hasUserJwt = request.cookies.has("userJwt");
    if (!hasUserJwt) {
      console.log("middleware.ts, no userJwt, redirected to /login");
      const newUrl = new URL(`/login`, request.url); // request.url returns http://localhost:3000/app
      return NextResponse.redirect(newUrl);
    }
  } else if (pathname === "/login") {
    const hasUserJwt = request.cookies.has("userJwt");
    if (hasUserJwt) {
      console.log("middleware.ts, userJwt exists, pushed to /app");
      const newUrl = new URL(`/app`, request.url);
      return NextResponse.redirect(newUrl);
    }
  }

  const handleI18nRouting = createMiddleware(routing);

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"], // matcher: ["/", "/(en|fr|it|zh-TW)/:path*"] seems to give error
};
