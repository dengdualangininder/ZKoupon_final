import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.nullapay.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: "https://www.nullapay.com/en",
          "zh-TW": "https://www.nullapay.com/zh-TW",
        },
      },
    },
    {
      url: "https://www.nullapay.com/app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          en: "https://www.nullapay.com/en/app",
          "zh-TW": "https://www.nullapay.com/zh-TW/app",
        },
      },
    },
    {
      url: "https://www.nullapay.com/pay",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          en: "https://www.nullapay.com/en/pay",
          "zh-TW": "https://www.nullapay.com/zh-TW/pay",
        },
      },
    },
  ];
}
