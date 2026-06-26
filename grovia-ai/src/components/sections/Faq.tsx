"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/content";
import { cn } from "@/lib/cn";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section">
      <div className="container-page max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Common questions from business owners
          </h2>
        </div>

        <div className="mt-10 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-card">
          {FAQS.map((f, idx) => {
            const isOpen = open === idx;
            return (
              <div key={f.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-ink-900">{f.q}</span>
                  <ChevronDown
                    size={18}
                    className={cn("shrink-0 text-ink-400 transition", isOpen && "rotate-180 text-brand-600")}
                  />
                </button>
                <div className={cn("grid transition-all", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-ink-600">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
