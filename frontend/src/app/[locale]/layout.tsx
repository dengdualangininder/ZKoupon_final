import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Theme from "@/contexts/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], display: "swap" }); // inter is variable font so no "weight" needed, recommended

export const metadata: Metadata = {
  title: "Flash | Crypto payments with 0% fees",
  description: "With a true peer-2-peer payments design, Flash is an easy-to-use and near-zero cost platform to help small businesses set up crypto payments. Set up in 1 minute.",
  keywords: ["crypto payments", "blockchain payments", "stablecoin payments", "cryptocurrency payments"],
  metadataBase: new URL("https://www.flashpayments.xyz"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      "zh-TW": "/zh-TW",
    },
  },
  openGraph: {
    url: "https://www.flashpayments.xyz",
    title: "Flash Payments | Crypto payments with 0% fees",
    description:
      "With a true peer-2-peer payments design, Flash Payments is an easy-to-use and near-zero cost platform to help small businesses set up crypto payments. Set up in 1 minute.",
    images: [
      {
        url: "/logo.png",
        width: 1030,
        height: 451,
        alt: "Flash Payments",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  applicationName: "Flash Payments",
  manifest: "https://www.flashpayments.xyz/manifest.json",
  icons: "/logoBlackBgNoText.svg",
};

// inter.className to inter.variable
export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale} className={inter.className} style={{ fontSize: locale == "zh-TW" ? "18px" : "16px" }}>
      <head>
        <script src="/maze.js"></script>
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Theme>{children}</Theme>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
