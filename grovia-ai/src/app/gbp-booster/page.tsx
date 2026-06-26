import type { Metadata } from "next";
import {
  MessageCircle,
  Search,
  FileText,
  Star,
  MapPin,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: `GBP Booster — WhatsApp AI Agent | ${BRAND.name}`,
  description:
    "The free GBP Booster is a WhatsApp AI Agent that optimises your Google Business Profile to bring more leads and customers from Google — right inside WhatsApp.",
};

const STEPS = [
  { title: "Send a WhatsApp", body: "Tap the button and say hi. No app to install, no forms to fill." },
  { title: "Share your business", body: "The agent asks a few quick questions about what you do and where." },
  { title: "Get your boost", body: "Receive SEO keywords, optimised content and posts ready to publish." },
];

const FEATURES = [
  { icon: Search, title: "SEO keyword research", body: "Finds the exact terms customers use to search for businesses like yours." },
  { icon: FileText, title: "Optimised GBP content", body: "Rewrites your description and services to rank higher on Google Maps & Search." },
  { icon: TrendingUp, title: "Auto-publishing posts", body: "Generates SEO-powered Google posts that keep your profile fresh and active." },
  { icon: Star, title: "Smart review replies", body: "Crafts SEO-rich replies to every review and helps you collect new 5-star ratings." },
  { icon: MapPin, title: "Local visibility", body: "Helps you appear in the Google Map Pack for searches near you." },
  { icon: MessageCircle, title: "All inside WhatsApp", body: "No dashboards to learn. Everything happens in a chat you already use." },
];

export default function GbpBoosterPage() {
  const wa = whatsappLink(BRAND.whatsappMessage);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-radial">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
              <Sparkles size={14} /> Featured Tool · Free
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl">
              GBP Booster — <span className="text-brand-600">WhatsApp AI Agent</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-600">
              Get more leads &amp; customers from Google — for free. Our WhatsApp AI Agent optimises your
              Google Business Profile so you rank higher and get found by nearby customers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={wa} className="btn-whatsapp">
                <MessageCircle size={16} /> Try free on WhatsApp
              </a>
              <a href={whatsappLink(`Hi ${BRAND.shortName}, I'd like to book a free demo.`)} className="btn-outline">
                Book Free Demo
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-500">No credit card. No app install. Works inside WhatsApp.</p>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">3 simple steps</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Boost your Google profile in minutes
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-lg font-black text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-ink-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">What it does</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Everything your Google Business Profile needs
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center text-white shadow-glow sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to get found on Google?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Try the GBP Booster free — get your first optimisation report on WhatsApp in minutes.
            </p>
            <a href={wa} className="btn mt-7 bg-white text-brand-700 hover:bg-ink-100">
              <MessageCircle size={16} /> Start free on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-72">
      <div className="rounded-[2.2rem] border-8 border-ink-900 bg-ink-900 shadow-card-lg">
        <div className="overflow-hidden rounded-[1.6rem] bg-[#e5ddd5]">
          <div className="flex items-center gap-2 bg-whatsapp px-4 py-3 text-white">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-xs font-bold">G</span>
            <div>
              <p className="text-sm font-semibold leading-tight">{BRAND.shortName} GBP Booster</p>
              <p className="text-[10px] text-white/80">online</p>
            </div>
          </div>
          <div className="space-y-2 p-3">
            <Bubble side="in">Hi! Want more customers from Google? 🚀 Tell me your business name & city.</Bubble>
            <Bubble side="out">Peacock Salon, Mumbai</Bubble>
            <Bubble side="in">
              Found 12 high-intent keywords ✅ Top: “salon near me”, “bridal makeup Mumbai”. Want me to optimise
              your profile?
            </Bubble>
            <Bubble side="out">Yes please!</Bubble>
            <Bubble side="in">
              Done! 🎉 Rewrote your description, added 6 services & scheduled 4 SEO posts. You&apos;re set to rank
              higher.
            </Bubble>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, children }: { side: "in" | "out"; children: React.ReactNode }) {
  const isOut = side === "out";
  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
          isOut ? "rounded-br-sm bg-[#dcf8c6] text-ink-900" : "rounded-bl-sm bg-white text-ink-800"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
