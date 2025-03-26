import Web3AuthProvider from "./Web3AuthProvider";
import { ThemeProvider } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log("/(app)/layout.tsx");

  return (
    <Web3AuthProvider>
      <ThemeProvider attribute="class" enableSystem={false}>
        {children}
      </ThemeProvider>
    </Web3AuthProvider>
  );
}
