import { Inter, Nunito_Sans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }); // inter is variable font so no "weight" needed, recommended
// const nunito = Nunito_Sans({ weight: ["300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"] }); // inter is variable font so no "weight" needed, recommended

// import local font (requires "npm i @next/font")
// import localFont from "@next/font/local";
// const myFont = localFont({ src: "./my-font.woff2" });

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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="relative overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
