import Link from "next/link";
import { INDUSTRIES } from "@/lib/content";

export function Industries() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Built for local businesses</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Built for small business owners
          </h2>
          <p className="mt-4 text-ink-600">
            You focus on your craft — leave the hassle of growth marketing to us.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {INDUSTRIES.map((i) => (
            <Link
              key={i.name}
              href={i.href}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 text-center shadow-card transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-lg"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-gradient group-hover:text-white">
                <i.icon size={22} />
              </span>
              <span className="text-sm font-semibold text-ink-800">{i.name}</span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-500">…and many more businesses like yours</p>
      </div>
    </section>
  );
}
