import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/pay"],
    },
    sitemap: ["https://www.nullapay.com/sitemap.xml"],
  };
}
