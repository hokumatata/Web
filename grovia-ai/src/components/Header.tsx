"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_LINKS, BRAND, whatsappLink } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 transition hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <a href={whatsappLink(`Hi ${BRAND.shortName}, I'd like to book a free demo.`)} className="btn-primary">
            <MessageCircle size={16} /> Book Free Demo
          </a>
        </div>

        <button
          className="md:hidden rounded-lg p-2 text-ink-700 hover:bg-ink-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={whatsappLink(`Hi ${BRAND.shortName}, I'd like to book a free demo.`)}
              className="btn-primary mt-2"
            >
              <MessageCircle size={16} /> Book Free Demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
