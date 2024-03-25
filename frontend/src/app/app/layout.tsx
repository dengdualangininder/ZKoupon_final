"use client";
import ContextProvider from "@/app/provider/ContextProvider";
export default function Layout({ children }: { children: React.ReactNode }) {
  console.log("/app Layout rendered once");
  return <ContextProvider>{children}</ContextProvider>;
}
