"use client";

import Link from "next/link";
import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function FeaturedToolBar() {
  const [show, setShow] = useState(true);
  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl sm:inset-x-auto sm:right-5">
      <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3 shadow-card-lg">
        <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
          Free
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">
            AI Google Business Profile Booster{" "}
            <Link href="/gbp-booster" className="text-brand-600 underline">
              Details
            </Link>
          </p>
          <p className="truncate text-xs text-ink-500">Get more leads &amp; customers from Google</p>
        </div>
        <a href={whatsappLink()} className="btn-whatsapp shrink-0 px-3 py-2 text-xs">
          <MessageCircle size={14} /> Try on WhatsApp
        </a>
        <button
          onClick={() => setShow(false)}
          aria-label="Dismiss"
          className="rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
