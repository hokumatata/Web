import Link from "next/link";
import { BRAND } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2.5c-1.6 3.1-4 4.7-7 5.2 0 6.4 3 10.3 7 13.8 4-3.5 7-7.4 7-13.8-3-.5-5.4-2.1-7-5.2Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path d="M9 11.5l2.2 2.2L15.5 9" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink-900"}`}>
        {BRAND.shortName}
        <span className="text-brand-500"> AI</span>
      </span>
    </Link>
  );
}
