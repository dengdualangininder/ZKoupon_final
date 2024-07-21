import { LocalePrefix } from "next-intl/routing";

// supported locales
export const locales = ["en", "fr", "it", "zh-TW"] as const;

// don't use a locale prefix for the default locale
export const localePrefix = "as-needed" satisfies LocalePrefix;
