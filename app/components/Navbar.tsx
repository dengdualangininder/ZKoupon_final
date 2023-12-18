import Link from "next/link";
// import { NAV } from "../../constants/constants.js";

const Navbar = () => {
  const NAV = [
    { href: "/", key: "home", label: "Search" },
    { href: "/how-it-works", key: "how", label: "How It Works" },
    { href: "/pricing", key: "pricing ", label: "Pricing " },
    { href: "/contact", key: "contact", label: "Contact Us" },
  ];

  return (
    <nav className="space-x-3">
      {NAV.map((i) => (
        <Link href={i.href}>{i.label}</Link>
      ))}
    </nav>
  );
};

export default Navbar;
