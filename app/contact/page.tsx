import { MarketingPage } from "@/components/marketing-page";

export default function ContactPage() {
  return (
    <MarketingPage title="Contact" subtitle="Talk to our team for personal, team, or bulk NFC deployments.">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-zinc-400">Support</p>
          <p className="mt-1">support@thelastcard.com</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-zinc-400">Sales</p>
          <p className="mt-1">sales@thelastcard.com</p>
        </div>
      </div>
    </MarketingPage>
  );
}
