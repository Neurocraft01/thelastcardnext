type PublicProfileProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.16em] text-[#ffcc00]">Public Profile</p>
        <h1 className="mt-3 font-display text-4xl gold-text">{slug}</h1>
        <p className="mt-4 text-zinc-300">This is your public NFC card profile page.</p>
        <div className="mt-6 grid gap-2 text-sm text-zinc-200">
          <button className="rounded-xl bg-[#ffcc00] px-4 py-2 font-bold text-black">Save Contact</button>
          <button className="rounded-xl border border-zinc-600 px-4 py-2">Share Profile</button>
        </div>
      </div>
    </div>
  );
}
