import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/70 bg-black/70 backdrop-blur-md">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/assets/img/navbarlogo.png" alt="The Last Card" width={42} height={42} />
          <span className="font-display text-lg font-bold uppercase tracking-[0.16em] gold-text">The Last Card</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 transition hover:text-[#ffcc00]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="rounded-full border border-[#ffcc00]/45 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ffcc00]">
            Login
          </Link>
          <Link href="/preview" className="rounded-full bg-[#ffcc00] px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-black">
            Get Free Preview
          </Link>
        </div>
      </nav>
    </header>
  );
}
