import Link from "next/link";

const links = [
  { href: "/dashboard", label: "My Cards" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/orders", label: "Orders" },
  { href: "/admin", label: "Admin" },
  { href: "/superadmin", label: "Superadmin" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 lg:block">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffcc00]">Dashboard</p>
          <nav className="mt-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-[#ffcc00]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">{children}</section>
      </div>
    </div>
  );
}
