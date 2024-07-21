import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "./localeConfig";

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales });
