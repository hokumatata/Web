import { JsonLd } from "./JsonLd";
import { faqSchema } from "@/lib/seo";

export interface Faq {
  question: string;
  answer: string;
}

export function FaqSection({ title = "Frequently Asked Questions", faqs }: { title?: string; faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="mt-12 max-w-3xl">
      <JsonLd data={faqSchema(faqs)} />
      <h2 className="text-lg font-bold text-ink-50 mb-4">{title}</h2>
      <div className="divide-y divide-ink-800 border-y border-ink-800">
        {faqs.map((f) => (
          <details key={f.question} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-ink-100 hover:text-accent flex items-center justify-between">
              {f.question}
              <span className="text-ink-500 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
            </summary>
            <p className="mt-2 text-sm text-ink-300 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
