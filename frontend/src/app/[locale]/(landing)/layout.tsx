import Observer from "./_components/Observer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Observer>{children}</Observer>;
}
