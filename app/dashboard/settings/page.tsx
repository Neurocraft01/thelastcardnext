export default function DashboardSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-4xl gold-text">Settings</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Security</p>
          <p className="mt-2 text-sm text-zinc-200">Change password, enable 2FA, and review active sessions.</p>
        </section>
        <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Notifications</p>
          <p className="mt-2 text-sm text-zinc-200">Email alerts for leads, scans, and order updates.</p>
        </section>
      </div>
    </div>
  );
}
