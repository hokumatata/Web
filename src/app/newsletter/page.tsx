import { NewsletterInline } from "@/components/site/NewsletterInline";

export const metadata = { title: "Newsletter" };

export default function NewsletterPage() {
  return (
    <div className="container-tw py-12 animate-fade-in">
      <div className="max-w-md mx-auto text-center">
        <span className="kicker">Newsletter</span>
        <h1 className="font-serif text-3xl font-bold text-white mt-2 mb-4">Daily Market Briefing</h1>
        <p className="text-ink-300 mb-8">
          Get the most important market-moving stories delivered to your inbox every morning. Crypto, forex, equities, and macro — all in one concise email.
        </p>
        <NewsletterInline />
      </div>
    </div>
  );
}
