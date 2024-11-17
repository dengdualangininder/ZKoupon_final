import Web3AuthProvider from "./web3auth-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;

  console.log("web3auth layout.tsx", time);
  return <Web3AuthProvider>{children}</Web3AuthProvider>;
}
