import type { Metadata } from "next";
import { MessageCircle, Target, Heart, Rocket } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/site";
import { STATS } from "@/lib/content";

export const metadata: Metadata = {
  title: `About Us | ${BRAND.name}`,
  description: `${BRAND.name} is on a mission to give every small business an AI marketing team that delivers real revenue.`,
};

const VALUES = [
  { icon: Target, title: "Revenue, not vanity metrics", body: "We measure success by the leads, bookings and repeat sales we create — not likes." },
  { icon: Heart, title: "Built for non-tech owners", body: "If you can use WhatsApp, you can use Grovia. We hide the complexity so you don't have to." },
  { icon: Rocket, title: "AI that does the work", body: "Our agents don't just advise — they publish, reply and follow up on your behalf, 24/7." },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-radial">
        <div className="container-page py-16 text-center lg:py-20">
          <span className="eyebrow">About Us</span>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            An AI marketing team for every small business
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-600">
            {BRAND.name} was built on a simple belief: great local businesses shouldn&apos;t lose customers just
            because they don&apos;t have a marketing department. So we built one — powered by AI, delivered on WhatsApp.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid grid-cols-2 gap-6 rounded-3xl border border-ink-100 bg-white p-8 shadow-card sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-brand-700">{s.value}</p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-8">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <v.icon size={20} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{v.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="rounded-3xl bg-brand-gradient px-6 py-14 text-center text-white shadow-glow sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Let&apos;s grow your business</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Join {BRAND.trustedCount} business owners who trust {BRAND.name} to bring in real revenue.
            </p>
            <a
              href={whatsappLink(`Hi ${BRAND.shortName}, I'd like to book a free demo.`)}
              className="btn mt-7 bg-white text-brand-700 hover:bg-ink-100"
            >
              <MessageCircle size={16} /> Book Free Demo
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
