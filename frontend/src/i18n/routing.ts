import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr", "it", "zh-TW"],
  defaultLocale: "en", // used when no locale matches
  localePrefix: "as-needed", // don't use locale prefix for default locale
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
