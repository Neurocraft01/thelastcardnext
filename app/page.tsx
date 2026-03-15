"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const featureData = {
  contact: {
    title: "Contact & Identity",
    desc: "Everything needed to connect instantly.",
    items: [
      "Name & Profile Photo",
      "Designation",
      "Company Name",
      "Phone and WhatsApp",
      "Email",
      "Save Contact",
      "Location",
    ],
  },
  social: {
    title: "Social Media Presence",
    desc: "Build credibility and personal brand.",
    items: ["LinkedIn", "Instagram", "Facebook", "X (Twitter)", "YouTube", "Telegram", "Custom links"],
  },
  website: {
    title: "Website & Portfolio",
    desc: "Showcase your work professionally.",
    items: ["Personal Website", "Company Website", "Portfolio", "Brochure", "Case Studies"],
  },
  media: {
    title: "Media & Brand Showcase",
    desc: "Turn your card into a mini website.",
    items: ["Image Gallery", "Product Showcase", "Video Intro", "Testimonials", "Client Logos"],
  },
  business: {
    title: "Business Tools & Payments",
    desc: "Turn networking into action.",
    items: ["UPI Links", "Razorpay and Stripe", "Google Reviews", "Meeting Booking", "Quote Requests"],
  },
  lead: {
    title: "Lead Capture & Forms",
    desc: "Collect opportunities directly.",
    items: ["Contact Form", "Inquiry Form", "Appointment Request", "Newsletter Signup"],
  },
} as const;

type FeatureKey = keyof typeof featureData;
type FinishKey = "matte" | "gloss" | "metal";

const finishPricing: Record<FinishKey, { original: number; discounted: number; label: string }> = {
  matte: { original: 713, discounted: 499, label: "Matte" },
  gloss: { original: 713, discounted: 499, label: "Gloss" },
  metal: { original: 1427, discounted: 999, label: "Metal" },
};

const faqs = [
  {
    q: "Is there a monthly subscription fee?",
    a: "No. The price is one-time for the physical card, and your digital profile stays active with no recurring fee.",
  },
  {
    q: "Can I update details after purchase?",
    a: "Yes. You can update profile data anytime without buying a new card.",
  },
  {
    q: "Do recipients need an app?",
    a: "No app needed. Your profile opens in the browser after tap or QR scan.",
  },
  {
    q: "Will this work on all phones?",
    a: "Yes. NFC-enabled phones can tap, and all phones can use the QR fallback.",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const [isHoverDevice, setIsHoverDevice] = useState(false);
  const [finish, setFinish] = useState<FinishKey>("matte");
  const [design, setDesign] = useState<number>(4);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showFloatingVideo, setShowFloatingVideo] = useState(true);
  const [previewDraft, setPreviewDraft] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const price = useMemo(() => finishPricing[finish], [finish]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("tlc-home-preview-draft");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<typeof previewDraft>;
      setPreviewDraft((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore malformed drafts.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tlc-home-preview-draft", JSON.stringify(previewDraft));
  }, [previewDraft]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateHoverMode = () => {
      setIsHoverDevice(mediaQuery.matches);
      setActiveFeature(null);
    };

    updateHoverMode();
    mediaQuery.addEventListener("change", updateHoverMode);
    return () => mediaQuery.removeEventListener("change", updateHoverMode);
  }, []);

  const onFreePreviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (previewDraft.name.trim()) params.set("name", previewDraft.name.trim());
    if (previewDraft.email.trim()) params.set("email", previewDraft.email.trim());
    if (previewDraft.phone.trim()) params.set("phone", previewDraft.phone.trim());
    if (previewDraft.company.trim()) params.set("company", previewDraft.company.trim());
    router.push(`/preview?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/70 bg-black/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/assets/img/navbarlogo.png" alt="The Last Card" width={44} height={44} priority />
            <span className="font-display text-sm font-bold uppercase tracking-[0.16em] text-[#ffcc00] sm:text-base">The Last Card</span>
          </div>
          <div className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 md:flex">
            <a href="#free-preview" className="transition hover:text-[#ffcc00]">
              Free Preview
            </a>
            <a href="#how-it-works" className="transition hover:text-[#ffcc00]">
              Process
            </a>
            <a href="#pricing" className="transition hover:text-[#ffcc00]">
              Pricing
            </a>
            <a href="#faqs" className="transition hover:text-[#ffcc00]">
              FAQs
            </a>
          </div>
          <Link
            href="/preview"
            className="rounded-full bg-[#ffcc00] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black transition hover:brightness-110 sm:px-6 sm:py-3 sm:text-xs"
          >
            Get Preview
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,195,50,0.16),transparent_60%),linear-gradient(to_bottom_right,#18181b,#000,#09090b)] opacity-95" />
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:items-start">
            <div className="w-full lg:w-1/2">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-7xl">
                The <span className="text-[#ffcc00]">Last Business Card</span> You&apos;ll Ever Need.
              </h1>
              <p className="mt-4 text-base text-zinc-300 sm:text-lg">Smart | Tap | Connect</p>
              <p className="mt-4 max-w-xl text-sm text-zinc-400 sm:text-base">
                Share your contact info, social media, website, and portfolio in a single tap using THELASTCARD.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/preview"
                  className="inline-flex items-center justify-center rounded-full bg-[#ffcc00] px-7 py-3 text-sm font-extrabold text-black transition hover:scale-[1.02]"
                >
                  Get Your Card
                </Link>
                <a
                  href="#free-preview"
                  className="inline-flex items-center justify-center rounded-full border border-[#ffcc00]/35 px-7 py-3 text-sm font-bold text-[#ffcc00] transition hover:bg-[#ffcc00]/10"
                >
                  Get Free Preview
                </a>
              </div>
              <p className="mt-8 text-xs text-zinc-500 sm:text-sm">Trusted by 10,000+ professionals</p>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl border border-[#ffcc00]/20 bg-zinc-900/75 p-4 shadow-[0_14px_50px_rgba(0,0,0,0.55)]">
                <div className="overflow-hidden rounded-xl border border-zinc-700">
                  <video src="/assets/video/home2.mp4" autoPlay muted loop playsInline className="h-full w-full object-cover" />
                </div>
                <div
                  className="mt-4 grid grid-cols-2 gap-2 sm:gap-3"
                  onMouseLeave={() => {
                    if (isHoverDevice) {
                      setActiveFeature(null);
                    }
                  }}
                >
                  {(Object.keys(featureData) as FeatureKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onMouseEnter={() => {
                        if (isHoverDevice) {
                          setActiveFeature(key);
                        }
                      }}
                      onClick={() => {
                        if (!isHoverDevice) {
                          setActiveFeature((prev) => (prev === key ? null : key));
                        }
                      }}
                      className={`rounded-xl border px-2 py-2 text-left text-[11px] transition sm:px-3 sm:text-xs ${
                        activeFeature === key
                          ? "border-[#ffcc00]/45 bg-[#ffcc00]/15 text-[#ffcc00]"
                          : "border-[#ffcc00]/15 bg-[#ffcc00]/5 text-zinc-200 hover:bg-[#ffcc00]/10"
                      }`}
                    >
                      {featureData[key].title}
                    </button>
                  ))}
                </div>

                {activeFeature && (
                  <div className="mt-4 rounded-xl border border-[#ffcc00]/25 bg-zinc-950/80 p-4">
                    <h3 className="text-sm font-bold text-white sm:text-base">{featureData[activeFeature].title}</h3>
                    <p className="mt-1 text-xs text-zinc-400">{featureData[activeFeature].desc}</p>
                    <div className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-zinc-300 sm:text-xs">
                      {featureData[activeFeature].items.map((item) => (
                        <div key={item} className="rounded-md bg-zinc-900/80 px-2 py-1">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="free-preview" className="bg-zinc-950 py-20">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-[#ffcc00]/20 bg-[#ffcc00]/10 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ffcc00]">
                Free Preview
              </span>
              <h2 className="font-display mt-6 text-3xl uppercase text-[#ffcc00] sm:text-5xl">Get Free Preview of Your Card</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Enter your details to see how your digital business card will look. No payment required.</p>
            </div>
            <form className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-10" onSubmit={onFreePreviewSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="name"
                  placeholder="Full Name"
                  className="input"
                  value={previewDraft.name}
                  onChange={(e) => setPreviewDraft((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="input"
                  value={previewDraft.email}
                  onChange={(e) => setPreviewDraft((prev) => ({ ...prev, email: e.target.value }))}
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  className="input"
                  value={previewDraft.phone}
                  onChange={(e) => setPreviewDraft((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <input
                  name="company"
                  placeholder="Company / Title"
                  className="input"
                  value={previewDraft.company}
                  onChange={(e) => setPreviewDraft((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <button className="mt-5 w-full rounded-xl bg-[#ffcc00] py-4 text-base font-extrabold text-black transition hover:brightness-110" type="submit">
                Generate Free Preview
              </button>
            </form>
          </div>
        </section>

        <section id="how-it-works" className="bg-zinc-900 py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-[#ffcc00]/20 bg-[#ffcc00]/10 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ffcc00]">
                Process
              </span>
              <h2 className="font-display mt-6 text-3xl uppercase text-[#ffcc00] sm:text-5xl">The 3-Step Success</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { step: "1", title: "Tap", desc: "Tap your card on any modern smartphone. No app needed for your client." },
                { step: "2", title: "Share", desc: "Instantly share your profile with contacts, socials, and media." },
                { step: "3", title: "Save", desc: "Recipient saves your details directly and reaches you anytime." },
              ].map((item) => (
                <article key={item.step} className="rounded-3xl border border-zinc-700 bg-zinc-800/60 p-7 text-center transition hover:-translate-y-1 hover:border-[#ffcc00]/40">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ffcc00]/10 font-extrabold text-[#ffcc00]">{item.step}</div>
                  <h3 className="text-xl font-bold uppercase tracking-[0.08em] text-white">{item.title}</h3>
                  <p className="mt-3 text-sm text-zinc-400">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="relative overflow-hidden bg-[linear-gradient(180deg,#09090b_0%,#0c0a14_50%,#09090b_100%)] py-20">
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_top_left,rgba(255,195,50,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,195,50,0.1),transparent_50%)]" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="font-display text-4xl uppercase text-[#ffcc00] sm:text-6xl">Pick Your Style</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">7 designs. One-time payment. No subscriptions ever.</p>
            </div>

            <div className="mt-12 flex flex-col gap-10 lg:flex-row">
              <div className="w-full lg:w-[45%]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#ffcc00]/20 bg-zinc-900 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffcc00]">Front</p>
                    <div className="relative aspect-[0.63/1] overflow-hidden rounded-xl">
                      <Image src={`/assets/img/card_design/design${design} - front.jpeg`} alt="Front side" fill className="object-cover" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-zinc-900 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">Back</p>
                    <div className="relative aspect-[0.63/1] overflow-hidden rounded-xl">
                      <Image src={`/assets/img/card_design/design${design} - back.jpeg`} alt="Back side" fill className="object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[55%]">
                <div>
                  <h3 className="mb-4 text-lg font-bold uppercase tracking-[0.1em] text-white">Choose Design</h3>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
                    {Array.from({ length: 7 }, (_, idx) => idx + 1).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDesign(item)}
                        className={`relative overflow-hidden rounded-xl border-2 transition hover:scale-[1.03] ${
                          design === item ? "border-[#ffcc00] shadow-[0_0_20px_rgba(255,195,50,0.25)]" : "border-white/10"
                        }`}
                        style={{ aspectRatio: "0.63 / 1" }}
                        aria-label={`Design ${item}`}
                      >
                        <Image src={`/assets/img/card_design/design${item} - front.jpeg`} alt={`Design ${item}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-bold uppercase tracking-[0.1em] text-white">Choose Finish</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(Object.keys(finishPricing) as FinishKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFinish(key)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          finish === key ? "border-[#ffcc00]/45 bg-[#ffcc00]/10" : "border-white/10 bg-white/[0.02]"
                        }`}
                      >
                        <p className={`text-base font-bold ${finish === key ? "text-[#ffcc00]" : "text-white"}`}>{finishPricing[key].label}</p>
                        <p className="mt-1 text-xs text-zinc-500">{key === "metal" ? "Premium stainless steel" : key === "gloss" ? "High-shine surface" : "Soft-touch matte finish"}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-[#ffcc00]/20 bg-[linear-gradient(160deg,rgba(255,195,50,0.06)_0%,rgba(255,195,50,0.02)_100%)] p-6 sm:p-8">
                  <p className="text-sm text-zinc-400">
                    <span className="font-semibold text-white">{price.label}</span> • <span className="font-semibold text-white">Design {design}</span>
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <p className="text-5xl font-black text-[#ffcc00]">Rs {price.discounted}</p>
                    <p className="mb-1 text-xl text-zinc-600 line-through">Rs {price.original}</p>
                  </div>
                  <p className="mt-2 text-sm text-emerald-400">You save Rs {price.original - price.discounted}</p>

                  <Link
                    href={`/preview?finish=${finish}&design=${design}`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFC332,#e6a800)] px-6 py-4 text-base font-extrabold text-black transition hover:brightness-110"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faqs" className="bg-zinc-950 py-20">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-[#ffcc00]/20 bg-[#ffcc00]/10 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ffcc00]">
                FAQs
              </span>
              <h2 className="font-display mt-6 text-3xl text-[#ffcc00] sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="mt-8 space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-white sm:text-base">{faq.q}</h3>
                    <span className={`text-zinc-500 transition ${activeFaq === idx ? "rotate-180" : ""}`}>⌄</span>
                  </div>
                  {activeFaq === idx && <p className="pt-3 text-sm text-zinc-400">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-zinc-900 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl leading-tight text-white sm:text-5xl">
              Ready to Make Your <span className="text-[#ffcc00]">First and Last</span> Impression?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-zinc-400">Join thousands of professionals who upgraded their networking with luxury NFC business cards.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/preview" className="inline-flex items-center justify-center rounded-full bg-[#ffcc00] px-9 py-4 font-extrabold text-black transition hover:scale-[1.02]">
                Get Your Card Now
              </Link>
              <a href="#pricing" className="inline-flex items-center justify-center rounded-full border border-[#ffcc00]/35 px-9 py-4 font-bold text-[#ffcc00] transition hover:bg-[#ffcc00]/10">
                Design For Free
              </a>
            </div>
          </div>
        </section>
      </main>

      {showFloatingVideo && (
        <div className="fixed bottom-3 left-3 z-[100] w-[130px] overflow-hidden rounded-xl bg-black shadow-[0_12px_36px_rgba(0,0,0,0.55)] sm:bottom-4 sm:left-4 sm:w-[160px]">
          <button
            type="button"
            onClick={() => setShowFloatingVideo(false)}
            className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/50 bg-black/55 text-sm text-white"
            aria-label="Close video"
          >
            x
          </button>
          <video src="/assets/video/home1.mp4" autoPlay loop playsInline className="block w-full object-cover" style={{ aspectRatio: "9 / 16" }} />
        </div>
      )}
    </div>
  );
}
