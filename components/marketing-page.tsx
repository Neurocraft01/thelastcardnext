import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function MarketingPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />
      <main className="px-6 py-12">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#ffcc00]">The Last Card</p>
          <h1 className="mt-2 font-display text-5xl gold-text">{title}</h1>
          <p className="mt-4 text-zinc-300">{subtitle}</p>
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-zinc-200">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
