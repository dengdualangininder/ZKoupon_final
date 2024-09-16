import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n/routing";

export default createMiddleware({
  locales: locales,
  defaultLocale: "en", // used when no locale matches
  localePrefix: "as-needed", // don't use locale prefix for default locale
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|images|.*\\..*).*)"], // matcher: ["/", "/(en|fr|it|zh-TW)/:path*"] seems to give error
};
