import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales } from "./localeConfig";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default, // import() will dynamically load a module so that it is only evaluated when needed
  };
});
