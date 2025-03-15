import Observer from "./_components/Observer";

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log("(landing)/layout.tsx");

  return <Observer>{children}</Observer>;
}
