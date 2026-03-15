import { MarketingPage } from "@/components/marketing-page";

export default function PrivacyPage() {
  return (
    <MarketingPage title="Privacy Policy" subtitle="How we collect, store, and protect your profile and order data.">
      <p>
        We process profile and order data strictly for service delivery. Media files are stored in Cloudinary, and order
        records are stored in Supabase with controlled service-role access from server APIs.
      </p>
    </MarketingPage>
  );
}
