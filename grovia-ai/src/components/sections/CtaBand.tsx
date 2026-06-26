import { MessageCircle } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/site";

export function CtaBand() {
  return (
    <section id="book-demo" className="section">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center text-white shadow-glow sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
            Marketing that actually delivers revenue
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">
            No stress. No guesswork. Just real growth. Start with the free GBP Booster or book a demo today.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <a href={whatsappLink()} className="btn bg-white text-brand-700 hover:bg-ink-100">
              <MessageCircle size={16} /> Free AI Google Profile Booster
            </a>
            <a
              href={whatsappLink(`Hi ${BRAND.shortName}, I'd like to book a free demo.`)}
              className="btn border border-white/40 text-white hover:bg-white/10"
            >
              Book Free Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
