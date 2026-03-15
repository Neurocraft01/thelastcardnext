"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const PALETTE = {
  camel: "#C79356",
  taupe: "#3C3329",
  carbonBlack: "#1A1A1A",
  onyx: "#0E0E0E",
  silver: "#C3BFB1",
} as const;

export default function PreviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PreviewData>(defaultData);

  useEffect(() => {
    let merged: PreviewData = { ...defaultData };

    try {
      const raw = window.localStorage.getItem("tlc-preview");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PreviewData>;
        merged = { ...merged, ...parsed };
      }
    } catch {
      // Ignore malformed local data.
    }

    const params = new URLSearchParams(window.location.search);

    const fromQuery: Partial<PreviewData> = {
      fullName: params.get("name") ?? params.get("fullName") ?? "",
      designation: params.get("designation") ?? "",
      company: params.get("company") ?? "",
      email: params.get("email") ?? "",
      phone: params.get("phone") ?? "",
    };

    merged = {
      ...merged,
      ...Object.fromEntries(Object.entries(fromQuery).filter(([, value]) => Boolean(value))),
    };

    setFormData(merged);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tlc-preview", JSON.stringify(formData));
  }, [formData]);

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
    router.push("/order");
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">
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
      </div>
    </div>
  );
}
