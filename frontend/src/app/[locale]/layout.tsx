import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Theme from "@/app/provider/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], display: "swap" }); // inter is variable font so no "weight" needed, recommended

export const metadata: Metadata = {
  title: "Flash Pay",
  description: "Zero Fee Payments",
  icons: "/logoBlackBgNoText.svg",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // userScalable: false,
};

// inter.className to inter.variable
// root layout must contain <html> and <body> tags
export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  console.log("layout lang:", locale);
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
