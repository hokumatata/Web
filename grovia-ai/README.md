# Grovia AI — All-in-One AI Marketing Team

A marketing website for **Grovia AI**, an all-in-one AI marketing platform for small
businesses (modeled on the Grexa AI business). It showcases a team of AI agents that
get more leads from Google, chat with customers on WhatsApp 24/7, and drive repeat
sales — with a **featured free tool: GBP Booster – WhatsApp AI Agent**.

> This is a standalone Next.js app living in the `grovia-ai/` subfolder of the repo.
> It does not depend on or affect the root TradeWave app.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- lucide-react icons

## Pages

- `/` — Landing page (hero, AI agents team + Data Intelligence Engine, industries, testimonials, FAQ, CTAs)
- `/gbp-booster` — Featured tool: GBP Booster – WhatsApp AI Agent
- `/pricing` — Plans
- `/about` — About

## Develop

```bash
cd grovia-ai
npm install
npm run dev     # http://localhost:3000
```

## Build / checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy on Vercel

This app lives in a subfolder, so it deploys as its **own Vercel project** (separate from
the root TradeWave app). When creating the project in Vercel:

1. Import the repo, then set **Root Directory = `grovia-ai`** (Project → Settings → General).
2. Leave Framework Preset as **Next.js** — build/install commands are pinned in
   [`vercel.json`](vercel.json), so no env vars or database are required.

`vercel.json` config:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "outputDirectory": ".next"
}
```

## Rebranding

All brand strings (name, tagline, WhatsApp number, contact, socials) live in
[`src/lib/site.ts`](src/lib/site.ts). Marketing copy (agents, industries,
testimonials, FAQs) lives in [`src/lib/content.ts`](src/lib/content.ts).
Change `BRAND.whatsappNumber` to your real number to make every WhatsApp CTA live.
