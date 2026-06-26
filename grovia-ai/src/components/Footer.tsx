import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { BRAND, whatsappLink } from "@/lib/site";
import { INDUSTRIES } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-600">
              Marketing AI platform for small businesses that delivers real revenue.
            </p>
            <div className="mt-5 flex gap-3">
              <SocialIcon href={BRAND.social.facebook} label="Facebook"><Facebook size={16} /></SocialIcon>
              <SocialIcon href={BRAND.social.instagram} label="Instagram"><Instagram size={16} /></SocialIcon>
              <SocialIcon href={BRAND.social.linkedin} label="LinkedIn"><Linkedin size={16} /></SocialIcon>
            </div>
          </div>

          <FooterCol title={`${BRAND.shortName} For`}>
            {INDUSTRIES.slice(0, 6).map((i) => (
              <li key={i.name}>
                <Link href={i.href} className="hover:text-ink-900">{i.name}</Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Featured Tool">
            <li>
              <Link href="/gbp-booster" className="font-semibold text-brand-700 hover:text-brand-800">
                GBP Booster — WhatsApp AI Agent
              </Link>
            </li>
            <li className="pt-2 text-xs uppercase tracking-wide text-ink-400">Company</li>
            <li><Link href="/about" className="hover:text-ink-900">About us</Link></li>
            <li><Link href="/pricing" className="hover:text-ink-900">Pricing</Link></li>
          </FooterCol>

          <FooterCol title="Contact Us">
            <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> {BRAND.address}</li>
            <li className="flex items-center gap-2"><Phone size={15} /> {BRAND.phone}</li>
            <li className="flex items-center gap-2"><Mail size={15} /> <a href={`mailto:${BRAND.email}`} className="hover:text-ink-900">{BRAND.email}</a></li>
            <li className="pt-1">
              <a href={whatsappLink()} className="btn-whatsapp">Try on WhatsApp</a>
            </li>
          </FooterCol>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-ink-900">Terms</Link>
            <Link href="#" className="hover:text-ink-900">Privacy</Link>
            <Link href="#" className="hover:text-ink-900">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-ink-400">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-ink-600">{children}</ul>
    </div>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
    >
      {children}
    </a>
  );
}
