import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

function formatAmount(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "INR 0";
  }
  return `INR ${amount.toLocaleString("en-IN")}`;
}

export default async function DashboardPage() {
  const auth = await requirePageUser(["customer", "admin", "superadmin"]);
  const supabase = getSupabaseAdmin();
  const userScoped = auth.role === "customer";

  const ordersQuery = supabase
    .from("orders")
    .select("order_id, amount, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  const assetsQuery = supabase
    .from("assets")
    .select("asset_type, secure_url, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  const [ordersResult, assetsResult, ordersCountResult, assetsCountResult] = await Promise.all([
    userScoped ? ordersQuery.eq("user_id", auth.user.id) : ordersQuery,
    userScoped ? assetsQuery.eq("user_id", auth.user.id) : assetsQuery,
    userScoped
      ? supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id)
      : supabase.from("orders").select("id", { count: "exact", head: true }),
    userScoped
      ? supabase.from("assets").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id)
      : supabase.from("assets").select("id", { count: "exact", head: true }),
  ]);

  if (ordersResult.error) {
    throw ordersResult.error;
  }
  if (assetsResult.error) {
    throw assetsResult.error;
  }
  if (ordersCountResult.error) {
    throw ordersCountResult.error;
  }
  if (assetsCountResult.error) {
    throw assetsCountResult.error;
  }

  const orders = ordersResult.data ?? [];
  const assets = assetsResult.data ?? [];

  return (
    <div>
      <h1 className="font-display text-4xl gold-text">Dashboard</h1>
      <p className="mt-2 text-zinc-300">Live account insights from orders, assets, and payment activity.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Orders</p>
          <h2 className="mt-1 text-3xl font-bold">{ordersCountResult.count ?? 0}</h2>
          <p className="mt-2 text-sm text-zinc-300">Total processed orders in scope.</p>
        </article>

        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Assets</p>
          <h2 className="mt-1 text-3xl font-bold">{assetsCountResult.count ?? 0}</h2>
          <p className="mt-2 text-sm text-zinc-300">Uploaded profile, cover, or QR assets.</p>
        </article>

        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Actions</p>
          <h2 className="mt-1 text-xl font-bold">Quick Access</h2>
          <Link href="/orders" className="mt-3 block text-sm font-semibold text-[#ffcc00] hover:underline">
            View Orders
          </Link>
          <Link href="/editor" className="mt-2 block text-sm font-semibold text-[#ffcc00] hover:underline">
            Edit Profile
          </Link>
        </article>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {orders.length ? (
              orders.map((order) => (
                <div key={order.order_id} className="rounded-xl border border-zinc-700/70 bg-zinc-950/60 p-3">
                  <p className="font-medium">{order.order_id}</p>
                  <p className="text-sm text-zinc-300">
                    {formatAmount(order.amount)} · {order.payment_status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No orders available yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <h2 className="text-lg font-semibold">Recent Uploads</h2>
          <div className="mt-4 space-y-3">
            {assets.length ? (
              assets.map((asset) => (
                <div key={asset.secure_url} className="rounded-xl border border-zinc-700/70 bg-zinc-950/60 p-3">
                  <p className="font-medium capitalize">{asset.asset_type}</p>
                  <a href={asset.secure_url} target="_blank" rel="noreferrer" className="text-sm text-[#ffcc00] hover:underline">
                    Open asset
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No uploads available yet.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
