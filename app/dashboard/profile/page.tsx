import Link from "next/link";

export default function DashboardProfilePage() {
  return (
    <div>
      <h1 className="font-display text-4xl gold-text">Profile</h1>
      <p className="mt-2 text-zinc-300">Update your identity card content and social links.</p>
      <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
        <p className="text-sm text-zinc-300">Use the profile editor for full customization and media uploads.</p>
        <Link href="/editor" className="mt-4 inline-block rounded-full bg-[#ffcc00] px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-black">
          Open Editor
        </Link>
      </div>
    </div>
  );
}
