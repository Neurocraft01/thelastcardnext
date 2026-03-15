import Link from "next/link";
import { MarketingPage } from "@/components/marketing-page";

export default function PricingPage() {
  return (
    <MarketingPage title="Pricing" subtitle="One-time card purchase with scalable enterprise plans.">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="price-card">
          <h3>Eco Classic</h3>
          <p className="price">INR 449</p>
          <p>PVC card with NFC + QR profile.</p>
        </div>
        <div className="price-card price-card-featured">
          <h3>Midnight Matte</h3>
          <p className="price">INR 649</p>
          <p>Most popular for personal brand builders.</p>
        </div>
        <div className="price-card">
          <h3>Imperial Metal</h3>
          <p className="price">INR 1299</p>
          <p>Premium metal finish with engraving.</p>
        </div>
      </div>
      <Link
        href="/preview"
        className="mt-8 inline-block rounded-full bg-[#ffcc00] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-black"
      >
        Start Free Preview
      </Link>
    </MarketingPage>
  );
}
