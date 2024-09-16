import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["en", "fr", "it", "zh-TW"];
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales });
