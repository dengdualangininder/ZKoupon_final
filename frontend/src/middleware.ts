import createMiddleware from "next-intl/middleware";
import { locales, localePrefix } from "./localeConfig";

export default createMiddleware({
  locales: locales,
  defaultLocale: "en", // Used when no locale matches
  localePrefix,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!api|_next|_vercel|images|.*\\..*).*)"],
};
