import Link from "next/link";

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="font-display text-4xl gold-text">Superadmin Console</h1>
        <p className="mt-2 text-zinc-300">Platform governance controls for role assignment and top-level policy management.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Users API</p>
            <p className="mt-2 text-sm text-zinc-200">Use <span className="font-semibold">GET /api/superadmin/users</span> for role-aware user list.</p>
          </article>
          <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Role API</p>
            <p className="mt-2 text-sm text-zinc-200">Use <span className="font-semibold">POST /api/superadmin/roles</span> to set <span className="font-semibold">customer/admin/superadmin</span>.</p>
          </article>
          <article className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Access</p>
            <p className="mt-2 text-sm text-zinc-200">Allowed role: <span className="font-semibold">superadmin</span> only.</p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admin" className="rounded-full bg-[#ffcc00] px-6 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-black">
            Open Admin Console
          </Link>
          <Link href="/dashboard" className="rounded-full border border-[#ffcc00]/45 px-6 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ffcc00]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
