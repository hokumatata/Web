import { NewsletterInline } from "@/components/site/NewsletterInline";

export const metadata = { title: "Newsletter" };

export default function NewsletterPage() {
  return (
    <div className="container-mp py-12">
      <div className="mx-auto max-w-2xl text-center">
        <span className="kicker">Daily briefing</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">
          One email. Markets, clear.
        </h1>
        <p className="mt-4 text-ink-200">
          A concise morning brief covering crypto, FX, equities and macro. Built for professionals
          who skim, then read what matters.
        </p>
        <div className="mt-8 text-left">
          <NewsletterInline />
        </div>
      </div>
    </div>
  );
}
