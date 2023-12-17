import { Inter } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }); // inter is variable font so no "weight" needed, recommended
// import local font (requires "npm i @next/font")
// import localFont from "@next/font/local";
// const myFont = localFont({ src: "./my-font.woff2" });

export const metadata: Metadata = {
  title: "tutorial",
  description: "nextjs tutorial",
};

// inter.className to inter.variable
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Navbar />
        <main className="relative overflow-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
