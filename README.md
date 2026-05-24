# TradeWave

A Bloomberg/CoinDesk-inspired financial news and market data platform built with Next.js 14, Tailwind CSS, Prisma, and SQLite.

## Features

- **Bloomberg-style dark terminal UI** — Professional dark theme with monospaced data displays, accent-colored indicators, and data-dense layouts
- **Live market data** — Real-time crypto prices from CoinGecko and forex rates from exchangerate.host with in-memory caching
- **Scrolling ticker tape** — Continuous market data strip across the top of every page
- **Full CMS** — Create, edit, publish articles with markdown support, categories, tags, and featured/breaking flags
- **Admin dashboard** — Article management, user roles, comment moderation, newsletter subscribers, audit log
- **User accounts** — JWT-based auth with role-based access (Admin, Editor, Author, Reader)
- **User dashboard** — Saved articles, watchlist, preferences
- **Search** — Full-text search across articles
- **Newsletter** — Email subscription system
- **Responsive** — Mobile-first design that works across all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Prisma ORM + SQLite (swap to PostgreSQL for production)
- **Auth**: JWT sessions via jose + bcryptjs
- **Icons**: Lucide React
- **Fonts**: Inter, Source Serif 4, JetBrains Mono

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Push database schema
npx prisma db push

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role   | Email                | Password   |
| ------ | -------------------- | ---------- |
| Admin  | admin@tradewave.io   | admin123   |
| Editor | editor@tradewave.io  | editor123  |
| Author | alex@tradewave.io    | author123  |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── article/[slug]/     # Article detail pages
│   ├── category/[slug]/    # Category listing pages
│   ├── dashboard/          # User dashboard
│   ├── markets/            # Live market data page
│   └── news/               # News listing page
├── components/
│   ├── admin/              # Admin components
│   ├── auth/               # Auth forms
│   ├── dashboard/          # User dashboard components
│   ├── news/               # Article card components
│   └── site/               # Layout components (header, footer, ticker)
├── lib/
│   ├── api.ts              # API response helpers
│   ├── auth.ts             # JWT auth
│   ├── db.ts               # Prisma client
│   ├── markets.ts          # Market data fetching
│   ├── markdown.ts         # Markdown to HTML
│   ├── types.ts            # Role types
│   └── utils.ts            # Utility functions
└── prisma/
    ├── schema.prisma       # Database schema
    └── seed.ts             # Sample data
```

## Design Inspiration

- **Bloomberg Terminal**: Dark theme, data-dense layouts, monospaced numbers, professional color scheme
- **CoinDesk**: Editorial article layout, hero sections, category navigation, breaking news indicators
