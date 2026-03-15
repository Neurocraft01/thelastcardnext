import { requirePageUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

function formatAmount(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "INR 0";
  }
  return `INR ${amount.toLocaleString("en-IN")}`;
}

export default async function OrdersPage() {
  const auth = await requirePageUser(["customer", "admin", "superadmin"]);
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("orders")
    .select("order_id, amount, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (auth.role === "customer") {
    query = query.eq("user_id", auth.user.id);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const orders = data ?? [];

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="font-display text-4xl gold-text">Orders</h1>
        <div className="mt-6 space-y-3">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.order_id} className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                <div>
                  <p className="font-semibold">{order.order_id}</p>
                  <p className="text-sm text-zinc-300">{formatAmount(order.amount)}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#ffcc00]">{order.payment_status}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-sm text-zinc-300">No orders found yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
