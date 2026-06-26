import { HOW_IT_WORKS } from "@/lib/content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            A marketing team that works while you work
          </h2>
          <p className="mt-4 text-ink-600">
            No stress. No guesswork. Just real growth — set up in minutes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <s.icon size={20} />
              </span>
              <span className="absolute right-6 top-6 text-3xl font-black text-ink-100">{s.step}</span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
