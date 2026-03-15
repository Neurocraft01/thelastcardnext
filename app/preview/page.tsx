"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type PreviewData = {
  fullName: string;
  designation: string;
  company: string;
  email: string;
  phone: string;
};

const defaultData: PreviewData = {
  fullName: "",
  designation: "",
  company: "",
  email: "",
  phone: "",
};

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<PreviewData>(defaultData);
  const [mounted, setMounted] = useState(false);

  const normalizeToPreview = (value: unknown): Partial<PreviewData> => {
    if (!value || typeof value !== "object") {
      return {};
    }

    const source = value as Record<string, unknown>;

    return {
      fullName: typeof source.fullName === "string" ? source.fullName : typeof source.name === "string" ? source.name : "",
      designation: typeof source.designation === "string" ? source.designation : "",
      company: typeof source.company === "string" ? source.company : "",
      email: typeof source.email === "string" ? source.email : "",
      phone: typeof source.phone === "string" ? source.phone : "",
    };
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    let merged: PreviewData = { ...defaultData };

    try {
      const raw = window.localStorage.getItem("tlc-preview");
      if (raw) {
        const parsed = normalizeToPreview(JSON.parse(raw));
        merged = { ...merged, ...parsed };
      }

      const rawDraft = window.localStorage.getItem("tlc-home-preview-draft");
      if (rawDraft) {
        const parsedDraft = normalizeToPreview(JSON.parse(rawDraft));
        merged = { ...merged, ...parsedDraft };
      }
    } catch {
      // Ignore malformed local data.
    }

    const fromQuery: Partial<PreviewData> = {
      fullName: searchParams.get("name") ?? searchParams.get("fullName") ?? "",
      designation: searchParams.get("designation") ?? "",
      company: searchParams.get("company") ?? "",
      email: searchParams.get("email") ?? "",
      phone: searchParams.get("phone") ?? "",
    };

    merged = {
      ...merged,
      ...Object.fromEntries(Object.entries(fromQuery).filter(([, value]) => Boolean(value))),
    };

    setFormData(merged);
    return () => clearTimeout(t);
  }, [searchParams]);

  useEffect(() => {
    if (mounted) {
      window.localStorage.setItem("tlc-preview", JSON.stringify(formData));
      window.localStorage.setItem(
        "tlc-home-preview-draft",
        JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
        }),
      );
    }
  }, [formData, mounted]);

  const previewCardTitle = useMemo(() => {
    if (!formData.fullName.trim()) {
      return "Your Name";
    }
    return formData.fullName.trim();
  }, [formData.fullName]);

  const previewDesignation = useMemo(() => {
    return formData.designation.trim() || "Founder";
  }, [formData.designation]);

  const previewPhone = useMemo(() => {
    return formData.phone.trim() || "+91 90000 00000";
  }, [formData.phone]);

  const previewEmail = useMemo(() => {
    return formData.email.trim() || "you@example.com";
  }, [formData.email]);

  const previewCompany = useMemo(() => {
    return formData.company.trim() || "www.thelastcard.in";
  }, [formData.company]);

  const onChange = (field: keyof PreviewData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onContinue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.designation || !formData.email || !formData.phone) {
      window.alert("Please fill Full Name, Designation, Email, and Phone before continuing.");
      return;
    }

    localStorage.setItem("tlc-preview", JSON.stringify(formData));
    localStorage.setItem(
      "tlc-home-preview-draft",
      JSON.stringify({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
      }),
    );
    router.push("/order");
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[#C79356]">
        Loading preview...
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-xs uppercase tracking-[0.18em] text-zinc-300 hover:text-[#C79356]">
            Back to Home
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C79356]">Step 1 of 2 | Free Preview</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#3C3329] bg-[#1A1A1A]/80 p-6">
            <h1 className="font-display text-4xl gold-text">Get a Free Preview</h1>
            <p className="mt-3 text-zinc-300">Fill in details and see your card design instantly before ordering.</p>

            <form className="mt-8 space-y-4" onSubmit={onContinue}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="James Sterling" value={formData.fullName} onChange={(e) => onChange("fullName", e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Designation</label>
                  <input className="input" placeholder="Founder" value={formData.designation} onChange={(e) => onChange("designation", e.target.value)} />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" placeholder="The Last Card" value={formData.company} onChange={(e) => onChange("company", e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="you@example.com" value={formData.email} onChange={(e) => onChange("email", e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 90000 00000" value={formData.phone} onChange={(e) => onChange("phone", e.target.value)} />
                </div>
              </div>

              <button type="submit" className="mt-2 w-full rounded-full bg-[#C79356] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.17em] text-black transition hover:brightness-110">
                Continue to Order
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-[#C79356]/25 bg-[#1A1A1A]/70 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Live Design Preview</p>
            <div className="mt-4 rounded-2xl border border-[#3C3329] bg-[#C3BFB1] p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div
                  className="relative aspect-[0.63/1] overflow-hidden rounded-[1.3rem] border border-[#3C3329]/55 bg-[#3C3329] shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
                  style={{
                    backgroundColor: "#3C3329",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-8"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)",
                    }}
                  />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center px-7 text-center">
                    <Image src="/assets/img/navbarlogo.png" alt="The Last Card Logo" width={98} height={98} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
                    <p className="mt-8 text-2xl font-semibold tracking-[0.03em] text-[#C79356] sm:text-3xl">THE LAST CARD</p>
                    <div className="mt-3 h-px w-36 bg-[#C79356]/60" />
                    <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#C79356] sm:text-[10px]">SMART . TAP. CONNECT</p>
                  </div>
                </div>

                <div
                  className="relative aspect-[0.63/1] overflow-hidden rounded-[1.3rem] border border-[#3C3329]/55 bg-[#3C3329] shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
                  style={{
                    backgroundColor: "#3C3329",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-8"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)",
                    }}
                  />

                  <div className="relative z-10 px-6 py-7">
                    <p className="text-lg font-semibold text-[#C79356] sm:text-xl">{previewCardTitle}</p>
                    <p className="mt-1 text-xs text-[#C79356] sm:text-sm">{previewDesignation}</p>
                    <div className="mt-2 h-px w-full bg-[#C79356]/70" />

                    <div className="mt-4 space-y-1.5 text-[10px] leading-relaxed text-[#C79356] sm:text-[11px]">
                      <p className="truncate">☎ {previewPhone}</p>
                      <p className="truncate">✉ {previewEmail}</p>
                      <p className="truncate">◎ {previewCompany}</p>
                    </div>

                    <div className="mx-auto mt-5 w-[62%] rounded-sm border-4 border-[#C79356] bg-[#C3BFB1] p-1.5 sm:mt-6">
                      <div
                        className="aspect-square w-full"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg, #2a2a2a 12%, transparent 12%, transparent 24%, #2a2a2a 24%, #2a2a2a 36%, transparent 36%, transparent 48%, #2a2a2a 48%, #2a2a2a 60%, transparent 60%, transparent 72%, #2a2a2a 72%, #2a2a2a 84%, transparent 84%), linear-gradient(#2a2a2a 12%, transparent 12%, transparent 24%, #2a2a2a 24%, #2a2a2a 36%, transparent 36%, transparent 48%, #2a2a2a 48%, #2a2a2a 60%, transparent 60%, transparent 72%, #2a2a2a 72%, #2a2a2a 84%, transparent 84%)",
                          backgroundSize: "16px 16px",
                          backgroundColor: "#3C3329",
                        }}
                      />
                    </div>

                    <p className="mt-2 text-center text-[9px] font-medium tracking-[0.12em] text-[#C79356]">SCAN TO CONNECT</p>
                    <div className="mt-3 h-px w-full bg-[#C79356]/70" />
                  </div>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
              <li>Name, designation, company, email, and phone update live in the card preview.</li>
              <li>The card style now follows the attached front and back reference design.</li>
              <li>Submitted details move to checkout in the next step.</li>
            </ul>
          </section>
        </div>
      </>
  );
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-[#C79356]">Loading preview...</div>}>
          <PreviewContent />
        </Suspense>
      </div>
    </div>
  );
}
