import { MarketingPage } from "@/components/marketing-page";

const features = [
  "NFC tap-to-share + dynamic QR",
  "Live profile editing and media uploads",
  "Analytics dashboard for taps and leads",
  "Razorpay checkout integration",
  "Cloudinary powered image/pdf storage",
  "SMTP credential and order email delivery",
];

export default function FeaturesPage() {
  return (
    <MarketingPage title="Features" subtitle="Built for high-trust networking and premium business branding.">
      <ul className="grid gap-3 md:grid-cols-2">
        {features.map((feature) => (
          <li key={feature} className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            {feature}
          </li>
        ))}
      </ul>
    </MarketingPage>
  );
}
