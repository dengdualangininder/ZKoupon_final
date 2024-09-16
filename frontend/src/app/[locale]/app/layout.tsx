"use client";
import ContextProvider from "@/contexts/ContextProvider";
// import { cookieToInitialState } from "wagmi"; // this is in default wagmi setup

export default function Layout({ children }: { children: React.ReactNode }) {
  // const initialState = cookieToInitialState(config, headers().get("cookie")); // this is in default wagmi set up

  return <ContextProvider>{children}</ContextProvider>; // in docs, initialstate prop is added
}
