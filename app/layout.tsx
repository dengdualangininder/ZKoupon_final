import { Inter, Nunito_Sans } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }); // inter is variable font so no "weight" needed, recommended
const nunito = Nunito_Sans({ weight: ["300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"] }); // inter is variable font so no "weight" needed, recommended

// import local font (requires "npm i @next/font")
// import localFont from "@next/font/local";
// const myFont = localFont({ src: "./my-font.woff2" });

export const metadata: Metadata = {
  title: "Ling Pay",
  description: "Zero Fee Payments",
};

// inter.className to inter.variable
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito}`}>
        <main className="relative overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
