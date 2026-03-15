import Link from "next/link";

type SuccessProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: SuccessProps) {
  const params = await searchParams;
  const orderId = params.orderId ?? "NA";

  return (
    <div className="grid min-h-screen place-items-center bg-[#09090b] px-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-[#ffcc00]/35 bg-zinc-950/80 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#ffcc00]">Order Confirmed</p>
        <h1 className="mt-3 font-display text-4xl gold-text">Thank You for Your Order</h1>
        <p className="mt-4 text-zinc-300">
          Your order has been placed successfully. A secure onboarding link has been sent to your registered email.
        </p>
        <p className="mt-3 text-sm text-zinc-400">Order ID: {orderId}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-[#ffcc00] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.17em] text-black">
            Go to Home
          </Link>
          <Link href="/preview" className="rounded-full border border-[#ffcc00]/45 px-7 py-3 text-xs font-bold uppercase tracking-[0.17em] text-[#ffcc00]">
            New Preview
          </Link>
        </div>
      </div>
    </div>
  );
}
