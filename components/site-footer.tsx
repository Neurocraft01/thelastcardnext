import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-black px-6 py-10 text-zinc-400">
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-xl uppercase tracking-[0.16em] gold-text">The Last Card</p>
          <p className="mt-3 max-w-md text-sm text-zinc-400">
            Premium NFC and digital identity platform for professionals, creators, and enterprises.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">Company</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/about" className="block hover:text-[#ffcc00]">About</Link>
            <Link href="/features" className="block hover:text-[#ffcc00]">Features</Link>
            <Link href="/pricing" className="block hover:text-[#ffcc00]">Pricing</Link>
            <Link href="/contact" className="block hover:text-[#ffcc00]">Contact</Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">Policies</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/privacy" className="block hover:text-[#ffcc00]">Privacy</Link>
            <Link href="/terms" className="block hover:text-[#ffcc00]">Terms</Link>
            <Link href="/refund" className="block hover:text-[#ffcc00]">Refund</Link>
            <Link href="/shipping" className="block hover:text-[#ffcc00]">Shipping</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-7xl border-t border-zinc-800 pt-4 text-xs uppercase tracking-[0.15em]">
        2026 The Last Card. All rights reserved.
      </div>
    </footer>
  );
}
