import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|images|.*\\..*).*)"], // matcher: ["/", "/(en|fr|it|zh-TW)/:path*"] seems to give error
};
