import { ThemeProvider } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log("/app, layout.tsx (ThemeProvider)", time);

  return (
    <ThemeProvider attribute="class" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
