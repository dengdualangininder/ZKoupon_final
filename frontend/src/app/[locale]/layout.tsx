import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Theme from "@/contexts/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], display: "swap" }); // inter is variable font so no "weight" needed, recommended

export const metadata: Metadata = {
  title: "Crypto payments with 0% fees",
  description: "With a true peer-2-peer payments design, Flash is an easy-to-use and near-zero cost platform to help small businesses set up crypto payments. Set up in 1 minute.",
  icons: "/logoBlackBgNoText.svg",
};

// inter.className to inter.variable
export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale} className={inter.className} style={{ fontSize: locale == "zh-TW" ? "20px" : "16px" }}>
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
