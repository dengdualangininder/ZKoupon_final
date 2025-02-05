import Web3AuthProvider from "./Web3AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log(time, "(app)/layout.tsx");

  return <Web3AuthProvider>{children}</Web3AuthProvider>;
}
