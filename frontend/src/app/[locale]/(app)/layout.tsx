import Web3AuthProvider from "./_contexts/Web3AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Web3AuthProvider>{children}</Web3AuthProvider>;
}
