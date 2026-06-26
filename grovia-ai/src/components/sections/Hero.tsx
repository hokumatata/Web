import { Sparkles, MessageCircle, Star, Search, Megaphone, Brain } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-radial">
      <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="eyebrow">
            <Sparkles size={14} /> Marketing Platform
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            {BRAND.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-600">
            A team of AI agents that get you more leads from Google, chat with customers on WhatsApp 24/7,
            and drive repeat sales — so you can focus on your craft.
          </p>
          <p className="mt-6 text-sm font-medium text-ink-500">
            Trusted by more than <span className="font-bold text-ink-900">{BRAND.trustedCount}</span> business owners
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={whatsappLink()} className="btn-whatsapp">
              <MessageCircle size={16} /> Free AI Google Profile Booster
            </a>
            <a href={whatsappLink(`Hi ${BRAND.shortName}, I'd like to book a free demo.`)} className="btn-outline">
              Book Free Demo
            </a>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <HeroGraphic />
        </div>
      </div>
    </section>
  );
}

function HeroGraphic() {
  return (
    <div className="relative mx-auto max-w-md">
      <FloatingCard className="ml-auto" icon={<Search size={18} />} color="from-blue-500 to-indigo-500" title="Google Business Profile" subtitle="Bring new potential customers" tag="AI Agent" />
      <FloatingCard className="mt-4 mr-auto [animation-delay:600ms]" icon={<MessageCircle size={18} />} color="from-emerald-500 to-teal-500" title="WhatsApp Chat" subtitle="Realtime customer interaction" tag="AI Agent" />
      <FloatingCard className="mt-4 ml-6 [animation-delay:1200ms]" icon={<Megaphone size={18} />} color="from-fuchsia-500 to-purple-500" title="WhatsApp Marketing" subtitle="Promote to existing customers" tag="AI Agent" />

      <div className="mt-6 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl border border-brand-200 bg-white px-4 py-3 shadow-card">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white">
            <Brain size={18} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Data Intelligence Engine</p>
            <p className="text-xs text-ink-500">The shared brain of all agents</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingCard({
  icon,
  color,
  title,
  subtitle,
  tag,
  className = "",
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  tag: string;
  className?: string;
}) {
  return (
    <div className={`w-64 animate-float rounded-2xl border border-ink-100 bg-white p-3.5 shadow-card-lg ${className}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white`}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-ink-900">{title}</p>
            <Star size={11} className="text-amber-400" fill="currentColor" />
          </div>
          <p className="truncate text-xs text-ink-500">{subtitle}</p>
        </div>
      </div>
      <span className="mt-2 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
        {tag}
      </span>
    </div>
  );
}
