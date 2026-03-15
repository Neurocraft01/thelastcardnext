export default function DashboardAnalyticsPage() {
  return (
    <div>
      <h1 className="font-display text-4xl gold-text">Analytics</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Total Taps", "2,481"],
          ["Unique Visitors", "1,942"],
          ["Contact Saves", "38.4%"],
          ["Avg. Engagement", "1m 42s"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-[#ffcc00]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
