import { Check } from "lucide-react";
import { AGENTS, ENGINE } from "@/lib/content";
import { whatsappLink, BRAND } from "@/lib/site";

export function AiTeam() {
  return (
    <section id="ai-team" className="section bg-ink-900 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-200">
            Meet your team
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Meet your digital marketing AI team
          </h2>
          <p className="mt-4 text-ink-300">
            Three specialised AI agents, one shared brain — working together to deliver real revenue.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:bg-white/[0.07]"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${agent.color} text-white`}>
                <agent.icon size={22} />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-200">{agent.badge}</p>
              <h3 className="mt-1 text-xl font-bold">{agent.name}</h3>
              <p className="mt-1 text-sm text-ink-300">{agent.role}</p>
              <ul className="mt-5 space-y-2.5">
                {agent.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-ink-200">
                    <Check size={16} className="mt-0.5 shrink-0 text-teal-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Shared brain */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-brand-700/40 to-teal-500/20 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-white">
                <ENGINE.icon size={22} />
              </span>
              <h3 className="mt-4 text-2xl font-bold">{ENGINE.name}</h3>
              <p className="mt-2 text-sm text-ink-200">{ENGINE.tagline}</p>
              <a href={whatsappLink(`Hi ${BRAND.shortName}, I'd like to book a free demo.`)} className="btn-whatsapp mt-5">
                Book Free Demo
              </a>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {ENGINE.points.map((p) => (
                <li key={p} className="flex items-start gap-2 rounded-xl bg-white/5 p-3 text-sm text-ink-100">
                  <Check size={16} className="mt-0.5 shrink-0 text-teal-300" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
