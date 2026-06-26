import type { Metadata } from "next";
import { Check, MessageCircle } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: `Pricing | ${BRAND.name}`,
  description: `Simple, transparent pricing for ${BRAND.name} — the all-in-one AI marketing team for small businesses.`,
};

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    tagline: "The GBP Booster, on us.",
    cta: "Start on WhatsApp",
    highlight: false,
    features: [
      "GBP Booster WhatsApp AI Agent",
      "SEO keyword suggestions",
      "Optimised profile content",
      "1 Google post per week",
    ],
  },
  {
    name: "Growth",
    price: "₹4,999",
    period: "/mo",
    tagline: "Your full AI marketing team.",
    cta: "Book Free Demo",
    highlight: true,
    features: [
      "Everything in Starter",
      "GBP Growth Agent (auto posts & reviews)",
      "WhatsApp Chat Agent (24/7 replies)",
      "WhatsApp Marketing Agent",
      "Data Intelligence Engine dashboard",
      "Priority WhatsApp support",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    tagline: "For multi-location brands.",
    cta: "Talk to Sales",
    highlight: false,
    features: [
      "Everything in Growth",
      "Multiple locations & profiles",
      "Custom AI training",
      "Dedicated success manager",
      "API & integrations",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-brand-radial">
        <div className="container-page py-16 text-center lg:py-20">
          <span className="eyebrow">Pricing</span>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            Simple pricing that pays for itself
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-600">
            Start free with the GBP Booster. Upgrade when you&apos;re ready for the full AI marketing team.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-3xl border p-7 shadow-card ${
                plan.highlight ? "border-brand-300 bg-white ring-2 ring-brand-200" : "border-ink-100 bg-white"
              }`}
            >
              {plan.highlight && (
                <span className="mb-3 inline-block w-fit rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-ink-900">{plan.price}</span>
                <span className="pb-1 text-sm text-ink-500">{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-teal-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink(`Hi ${BRAND.shortName}, I'm interested in the ${plan.name} plan.`)}
                className={`mt-7 ${plan.highlight ? "btn-primary" : "btn-outline"}`}
              >
                <MessageCircle size={16} /> {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
