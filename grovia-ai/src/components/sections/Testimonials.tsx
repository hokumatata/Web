import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/content";

export function Testimonials() {
  return (
    <section className="section bg-ink-50">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Real stories, real results</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Voices of real business owners
          </h2>
          <p className="mt-4 text-ink-600">
            See how owners like you grew their businesses with an AI marketing team.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <Quote size={24} className="text-brand-300" />
              <blockquote className="mt-4 flex-1 text-ink-700">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.business}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
