import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="font-display text-4xl gold-text">Admin Console</h1>
        <p className="mt-2 text-zinc-300">Operational controls for orders, assets, and customer support workflow.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Metrics API</p>
            <p className="mt-2 text-sm text-zinc-200">Use <span className="font-semibold">GET /api/admin/overview</span> for aggregated operational counts.</p>
          </article>
          <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Scope</p>
            <p className="mt-2 text-sm text-zinc-200">Admin can view and govern customer operational data, but cannot elevate global roles.</p>
          </article>
          <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Access</p>
            <p className="mt-2 text-sm text-zinc-200">Allowed roles: <span className="font-semibold">admin, superadmin</span>.</p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-[#ffcc00] px-6 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-black">
            Back to Dashboard
          </Link>
          <Link href="/superadmin" className="rounded-full border border-[#ffcc00]/45 px-6 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ffcc00]">
            Superadmin Console
          </Link>
        </div>
      </div>
    </div>
  );
}
