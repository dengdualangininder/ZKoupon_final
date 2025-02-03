import { ThemeProvider } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log(time, "(app)/app/layout.tsx");

  return (
    <ThemeProvider attribute="class" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
