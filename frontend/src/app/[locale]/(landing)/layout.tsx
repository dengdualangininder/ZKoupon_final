import Observer from "./_components/Observer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log(time, "(landing)/layout.tsx");

  return <Observer>{children}</Observer>;
}
