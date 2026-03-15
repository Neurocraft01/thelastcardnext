import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />

      <main>
        <section className="bg-[linear-gradient(to_bottom,#09090b,#18181b)] pb-12 pt-24 sm:pb-20 sm:pt-32">
          <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="font-display mb-4 text-3xl leading-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
              About <span className="text-[#fbad05]">Us</span>
            </h1>
            <p className="mx-auto mb-6 max-w-3xl px-4 text-base text-zinc-400 sm:mb-8 sm:text-lg md:text-xl">
              Every year, over <span className="font-semibold text-white">10 billion</span> paper business cards are printed worldwide.
              Nearly <span className="font-semibold text-white">88%</span> of them are thrown away within a week.
            </p>
            <p className="mx-auto mb-6 max-w-2xl px-4 text-base text-zinc-400 sm:mb-8 sm:text-lg md:text-xl">
              That&apos;s millions of trees, endless reprints, and unnecessary waste. We believed there had to be a smarter way.
            </p>
            <div className="mx-auto h-1 w-16 bg-[#ffcc00] sm:w-24" />
          </div>
        </section>

        <section className="bg-[#09090b] py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-4 uppercase tracking-[0.25em] text-[#ffcc00]">Our Mission</p>
                <h2 className="font-display mb-6 text-3xl text-white sm:text-4xl">
                  One Smart Card. <span className="text-[#fbad05]">Zero Waste.</span>
                </h2>
                <p className="mb-6 text-lg leading-relaxed text-zinc-400">
                  THELASTCARD was created to replace disposable paper cards with one premium, durable smart card that lasts for years.
                  Update your details anytime. Share your complete profile in one tap. No reprinting. No waste.
                </p>
                <p className="mb-6 text-lg leading-relaxed text-zinc-400">
                  When you choose THELASTCARD, you&apos;re not just upgrading your networking. You&apos;re choosing a more responsible way to connect.
                </p>
                <p className="text-lg leading-relaxed text-zinc-400">
                  One smart card can replace <span className="font-semibold text-white">hundreds, even thousands</span> of paper cards over its lifetime.
                </p>

                <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8">
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-[#fbad05] sm:text-3xl md:text-4xl">10B+</p>
                    <p className="text-xs text-zinc-500 sm:text-sm">Paper Cards Printed Yearly</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-[#fbad05] sm:text-3xl md:text-4xl">88%</p>
                    <p className="text-xs text-zinc-500 sm:text-sm">Thrown Away in a Week</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-[#fbad05] sm:text-3xl md:text-4xl">1</p>
                    <p className="text-xs text-zinc-500 sm:text-sm">Card Is All You Need</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-3xl border border-[#ffcc00]/30 bg-zinc-900 p-8">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffcc00]/20 to-transparent">
                    <div className="px-6 text-center">
                      <Image
                        src="/assets/img/logo.png"
                        alt="The Last Card logo"
                        width={280}
                        height={280}
                        className="mx-auto w-full max-w-[280px] object-contain drop-shadow-[0_12px_40px_rgba(251,173,5,0.18)]"
                      />
                      <p className="mt-4 text-xs uppercase tracking-[0.35em] text-zinc-400 sm:text-sm">Est. 2024</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#ffcc00]/20 blur-3xl" />
                <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-[#ffcc00]/10 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <h2 className="font-display mb-3 px-4 text-2xl text-white sm:mb-4 sm:text-3xl md:text-4xl">
                Why <span className="text-[#fbad05]">THELASTCARD</span>
              </h2>
              <div className="mx-auto h-1 w-16 bg-[#ffcc00] sm:w-24" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
              {[
                {
                  title: "Zero Waste",
                  desc: "One premium card replaces hundreds, even thousands, of paper cards. No reprinting. No waste. A more responsible way to connect.",
                  icon: "E",
                },
                {
                  title: "Always Up to Date",
                  desc: "Update your details anytime from your phone. Your card never goes out of date and shares your complete profile in one tap.",
                  icon: "U",
                },
                {
                  title: "Premium and Durable",
                  desc: "Built to last for years with luxury materials and cutting-edge NFC technology. One card is all you will ever need.",
                  icon: "P",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center sm:p-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffcc00]/10 text-xl font-bold text-[#ffcc00] sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-white sm:mb-4 sm:text-xl">{item.title}</h3>
                  <p className="text-sm text-zinc-400 sm:text-base">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#09090b] py-16 sm:py-24">
          <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mx-auto mb-8 max-w-2xl px-4 text-base italic text-zinc-400 sm:mb-10 sm:text-lg md:text-xl">
              Because the future of networking should not cost our earth.
            </p>
            <h2 className="font-display mb-4 px-4 text-2xl leading-tight text-white sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl">
              One Card. <span className="text-[#fbad05]">Zero Waste.</span> Infinite Connections.
            </h2>
            <div className="mx-auto mb-8 h-1 w-16 bg-[#ffcc00] sm:mb-10 sm:w-24" />
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#ffcc00] px-8 py-3 text-base font-extrabold text-black shadow-lg shadow-[#ffcc00]/20 transition-transform hover:scale-105 sm:px-10 sm:py-4 sm:text-lg"
            >
              Get Started <span className="text-xl">→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
