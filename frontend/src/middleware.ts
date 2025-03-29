import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  // get pathname without locale
  let pathname = request.nextUrl.pathname; // returns /app or /zh-TW/app
  const segments = pathname.split("/");
  if (["en", "fr", "it", "zh-TW"].includes(segments[1])) pathname = `/${segments.slice(2).join("/")}`;
  console.log("middleware.ts, pathname:", pathname);

  const hasUserJwt = request.cookies.has("userJwt");
  const hasIntro = request.cookies.has("isIntro");

  // redirect for these specific conditions
  if (pathname === "/app") {
    if (!hasUserJwt) {
      console.log("middleware.ts, no userJwt, redirected to /login");
      const newUrl = new URL(`/login`, request.url);
      return NextResponse.redirect(newUrl);
    }
    if (hasIntro) {
      const newUrl = new URL(`/intro`, request.url);
      return NextResponse.redirect(newUrl);
    }
  } else if (pathname === "/login") {
    if (hasUserJwt) {
      console.log("has userJwt, pushed to /app");
      const newUrl = new URL(`/app`, request.url);
      return NextResponse.redirect(newUrl); // if hasIntro, will later redirect to /intro
    }
  } else if (pathname === "/intro") {
    if (!hasIntro || !hasUserJwt) {
      const newUrl = new URL(`/app`, request.url);
      return NextResponse.redirect(newUrl); // if no userJwt, will later redirect to /login
    }
  }

  const handleI18nRouting = createMiddleware(routing);

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"], // matcher: ["/", "/(en|fr|it|zh-TW)/:path*"] seems to give error
};
