// Central brand + content config. Change BRAND here to rebrand the entire site.

export const BRAND = {
  name: "Grovia AI",
  shortName: "Grovia",
  tagline: "Your All-in-One AI Marketing Team that Delivers Real Revenue",
  description:
    "Grovia AI is a marketing platform for small businesses. A team of AI agents that get you more leads from Google, chat with customers on WhatsApp 24/7, and drive repeat sales — so you can focus on your craft.",
  // Replace with your real WhatsApp business number (international format, digits only).
  whatsappNumber: "910000000000",
  whatsappMessage: "Hi! I want to boost my Google Business Profile with the free GBP Booster.",
  demoUrl: "#book-demo",
  email: "hello@grovia.ai",
  phone: "+91 00000 00000",
  address: "WeWork, BKC, Mumbai, Maharashtra 400051",
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
  trustedCount: "60,000+",
} as const;

export function whatsappLink(message: string = BRAND.whatsappMessage): string {
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const NAV_LINKS = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "AI Agents", href: "/#ai-team" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about" },
] as const;
