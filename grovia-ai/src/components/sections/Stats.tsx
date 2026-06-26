import { STATS } from "@/lib/content";

export function Stats() {
  return (
    <section className="border-y border-ink-100 bg-ink-50">
      <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-extrabold tracking-tight text-brand-700 sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
