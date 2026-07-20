# The Forex Republic

A Bloomberg/CoinDesk-inspired financial news and market data platform built with Next.js 14, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- **Bloomberg-style UI** — Professional light/dark theme with monospaced data displays, accent-colored indicators, and data-dense layouts
- **Live market data** — Real-time crypto prices from CoinGecko and forex rates from exchangerate.host
- **Scrolling ticker tape** — Continuous market data strip across the top of every page
- **Full CMS** — Create, edit, publish articles with rich text editor, image uploads, categories, tags
- **AI-assisted drafting** — Paste raw sources (tweets, official releases, chart notes, reference text/URLs, key ideas) and generate a structured, house-style article draft via OpenAI, prefilled into the CMS editor for human review (always saved as DRAFT first)
- **Admin dashboard** — Article management, user & author management, comment moderation, newsletter, audit log
- **Economic Calendar** — 5-day view of major economic events with impact ratings
- **User accounts** — JWT-based auth with role-based access (Admin, Editor, Author, Reader)
- **User dashboard** — Saved articles, watchlist, preferences
- **Search** — Full-text search across articles
- **Newsletter** — Email subscription system
- **Edge caching** — ISR with `unstable_cache` and on-demand revalidation via cache tags
- **Responsive** — Mobile-first design across all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Prisma ORM + PostgreSQL (Vercel Postgres / Neon recommended)
- **Image Storage**: Vercel Blob (CDN-backed)
- **Auth**: JWT sessions via jose + bcryptjs
- **Icons**: Lucide React
- **Fonts**: Inter, Playfair Display, JetBrains Mono

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted via [Neon](https://neon.tech), [Vercel Postgres](https://vercel.com/storage/postgres), or [Supabase](https://supabase.com))

### Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and set your PostgreSQL DATABASE_URL

# Run database migrations
npx prisma migrate dev

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Random string, ≥32 chars (`openssl rand -hex 32`) | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site name displayed in UI | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI article drafting ([create one](https://platform.openai.com/api-keys)) | For AI drafting |
| `OPENAI_MODEL` | Override the OpenAI model used for drafting (default `gpt-4o-mini`) | No |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image uploads | Production |
| `PUBLISH_API_KEY` | Shared secret for the `/api/publish` and `/api/publish/generate` automation endpoints | For automation |

## AI-Assisted Article Drafting

Editors can generate a full article draft from raw source material instead of writing from scratch:

1. Set `OPENAI_API_KEY` in your environment.
2. In the admin dashboard, go to **Articles → AI Compose** (`/admin/articles/ai`).
3. Paste any combination of sources: key ideas/angle, tweet text, official releases, chart notes, reference article text, and reference URLs.
4. Click **Generate draft**. The model returns a title, excerpt, markdown body (in the house structure: Key Pointers, Introduction, Market Context, Analysis, Technical Analysis, Market Takeaway), a suggested category, and suggested tags.
5. The draft is loaded into the standard article editor for review and is saved as **DRAFT** — a human always reviews before publishing.

> **Note on charts:** Live TradingView (or other) chart URLs cannot be fetched or read by the model. Describe the chart in words in the *Chart notes* field, and/or upload a chart image via the cover/media upload (Vercel Blob) and reference it in the body.

### Automation endpoint

`POST /api/publish/generate` (secured by the `PUBLISH_API_KEY` header `x-api-key`) accepts raw `sources` and generates + drafts (or publishes) an article in one call — useful for external automation. It defaults to `DRAFT` status; pass `"status": "PUBLISHED"` to publish immediately.

## Seeded Accounts

`npm run db:seed` creates the following accounts. Their passwords are read from
environment variables (`SEED_ADMIN_PASSWORD`, `SEED_EDITOR_PASSWORD`,
`SEED_AUTHOR_PASSWORD`) — set these before seeding. No default passwords are
committed to the repo; local dev falls back to obvious `*-change-me`
placeholders that must not be used anywhere real.

| Role   | Email                          |
| ------ | ------------------------------ |
| Admin  | admin@theforexrepublic.com     |
| Editor | editor@theforexrepublic.com    |
| Author | author@theforexrepublic.com    |

## Deploying to Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Add a PostgreSQL database (Vercel Postgres or Neon) from the Storage tab
3. Add a Blob store from the Storage tab (for image uploads)
4. Set `JWT_SECRET` and `NEXT_PUBLIC_SITE_NAME` in Environment Variables
5. Deploy — migrations run automatically during build
6. Run `npm run db:seed` against production DB to populate sample data

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── article/[slug]/     # Article detail pages
│   ├── category/[slug]/    # Category listing pages
│   ├── dashboard/          # User dashboard
│   ├── economic-calendar/  # Economic calendar page
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
prisma/
├── migrations/             # PostgreSQL migrations
├── schema.prisma           # Database schema
└── seed.ts                 # Sample data
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (generates client, runs migrations, builds Next.js) |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm run db:migrate` | Create new migration |
| `npm run db:seed` | Seed sample data |
| `npm run db:reset` | Reset database and re-run migrations |

## Design Inspiration

- **Bloomberg Terminal**: Dark theme, data-dense layouts, monospaced numbers, professional color scheme
- **CoinDesk**: Editorial article layout, hero sections, category navigation, breaking news indicators
