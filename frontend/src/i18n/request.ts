import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound(); // validate if incoming `locale` parameter is valid

  return {
    messages: (await import(`./messages/${locale}.json`)).default, // import() will dynamically load the needed
  };
});
