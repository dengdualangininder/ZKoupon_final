import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("request.nextUrl", request.nextUrl);

  const supportedLocales = ["en", "it", "fr", "zh-TW"];
  const defaultLocale = "en";
  const headers = { "accept-language": request.headers.get("accept-language") || "en-US,en;q=0.5" };
  const userLocales = new Negotiator({ headers }).languages();
  const locale = match(userLocales, supportedLocales, defaultLocale); // determine the appropriate locale
  console.log("locale:", locale);
  const { pathname } = request.nextUrl;

  // if default locale is in the pathname, remove it
  if (pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`) {
    return NextResponse.redirect(new URL(pathname.replace(`/${defaultLocale}`, pathname === `/${defaultLocale}` ? "/" : ""), request.url));
  }

  // if locale is in pathname, then exit middleware (no changes)
  const pathnameHasLocale = supportedLocales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);
  if (pathnameHasLocale) return;

  // if no locale is not in pathname, proceed to "if" statement:
  // if locale == defualtLocale, then rewrite the URL with "en" inserted into pathname; else, redirect with locale inserted into pathname
  request.nextUrl.pathname = `/${locale}${pathname}`;
  if (locale.startsWith("en")) {
    return NextResponse.rewrite(request.nextUrl);
  } else {
    return NextResponse.redirect(request.nextUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*|images).*)"], // need to optimize
};
