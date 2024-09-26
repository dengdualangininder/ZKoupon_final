import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.flashpayments.xyz",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: "https://www.flashpayments.xyz/en",
          "zh-TW": "https://www.flashpayments.xyz/zh-TW",
        },
      },
    },
    {
      url: "https://www.flashpayments.xyz/app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          en: "https://www.flashpayments.xyz/en/app",
          "zh-TW": "https://www.flashpayments.xyz/zh-TW/app",
        },
      },
    },
    {
      url: "https://www.flashpayments.xyz/pay",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          en: "https://www.flashpayments.xyz/en/pay",
          "zh-TW": "https://www.flashpayments.xyz/zh-TW/pay",
        },
      },
    },
  ];
}
