import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      <main>
        <section className="bg-[#09090b] pb-8 pt-24 sm:pb-12 sm:pt-32">
          <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="font-display mb-4 text-3xl leading-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
              Get in <span className="text-[#fbad05]">Touch</span>
            </h1>
            <p className="mx-auto max-w-xl px-4 text-base text-zinc-400 sm:text-lg md:text-xl">
              Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>
        </section>

        <section className="bg-[#09090b] pb-24 pt-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-3xl sm:p-8">
                <h2 className="mb-4 text-xl font-bold text-white sm:mb-6 sm:text-2xl">Send a Message</h2>
                <form className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all focus:border-[#ffcc00] focus:ring-2 focus:ring-[#ffcc00]/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all focus:border-[#ffcc00] focus:ring-2 focus:ring-[#ffcc00]/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Subject</label>
                    <select className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition-all focus:border-[#ffcc00] focus:ring-2 focus:ring-[#ffcc00]/50">
                      <option>General Inquiry</option>
                      <option>Order Support</option>
                      <option>Technical Support</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Message</label>
                    <textarea
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all focus:border-[#ffcc00] focus:ring-2 focus:ring-[#ffcc00]/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffcc00] py-4 font-bold text-black transition-all hover:brightness-110"
                  >
                    Send Message <span>→</span>
                  </button>
                </form>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="mb-4 text-xl font-bold text-white sm:mb-6 sm:text-2xl">Other Ways to Reach Us</h2>
                  <p className="mb-6 text-sm text-zinc-400 sm:mb-8 sm:text-base">
                    We&apos;re here to help and answer any question you might have. We look forward to hearing from you.
                  </p>
                </div>

                <div className="space-y-4">
                  <a
                    href="https://wa.me/919096928961?text=Hi!%20I%27m%20interested%20in%20The%20Last%20Card"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-[#25D366] hover:bg-[#25D366]/5"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 transition-all group-hover:bg-[#25D366]/20">
                      <svg className="h-6 w-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-white transition-colors group-hover:text-[#25D366]">WhatsApp</h3>
                      <p className="text-zinc-400">+91 9096928961</p>
                      <p className="mt-1 text-xs text-zinc-500">Click to chat instantly</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffcc00]/10 text-[#ffcc00]">@</div>
                    <div>
                      <h3 className="mb-1 font-semibold text-white">Email</h3>
                      <p className="text-zinc-400">support@thelastcard.com</p>
                      <p className="text-zinc-400">sales@thelastcard.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffcc00]/10 text-[#ffcc00]">⏱</div>
                    <div>
                      <h3 className="mb-1 font-semibold text-white">Response Time</h3>
                      <p className="text-zinc-400">We typically respond within 24 hours during business days.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffcc00]/10 text-[#ffcc00]">#</div>
                    <div>
                      <h3 className="mb-1 font-semibold text-white">Social Media</h3>
                      <div className="mt-2 flex gap-3">
                        {[
                          { label: "WA", href: "https://wa.me/919096928961" },
                          { label: "IG", href: "#" },
                          { label: "IN", href: "#" },
                        ].map((item) => (
                          <a
                            key={item.label}
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-400 transition-colors hover:bg-[#ffcc00]/10 hover:text-[#ffcc00]"
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
