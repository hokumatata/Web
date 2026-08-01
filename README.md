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
| `OPENAI_IMAGE_MODEL` | Override the OpenAI image model for cover/thumbnail generation (default `gpt-image-1`) | No |
| `OPENAI_IMAGE_QUALITY` | Image quality: `low` (default), `medium`, `high` — kept low to minimize cost | No |
| `OPENAI_IMAGE_SIZE` | Generated image size (default `1024x1024`) | No |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image uploads | Production |
| `PUBLISH_API_KEY` | Shared secret for the `/api/publish` and `/api/publish/generate` automation endpoints | For automation |
| `CRON_SECRET` | Secret Vercel Cron sends as `Authorization: Bearer …` to the scheduled feed-drafting job | For scheduled drafting |
| `SOURCE_DRAFTS_PER_RUN` | Max drafts created per scheduled run (default `3`, capped at `10`) | No |
| `SOURCE_AUTHOR_EMAIL` | Author the scheduled drafts are attributed to (default `masteruser@theforexrepublic.com`) | No |
| `SOURCE_RSS_FEEDS` | Override source feeds, comma-separated `Name\|url` (default CoinGape, ForexLive, Yahoo Finance) | No |

## AI-Assisted Article Drafting

Editors can generate a full article draft from raw source material instead of writing from scratch:

1. Set `OPENAI_API_KEY` in your environment.
2. In the admin dashboard, go to **Articles → AI Compose** (`/admin/articles/ai`).
3. Paste any combination of sources: key ideas/angle, tweet text, official releases, chart notes, reference article text, and reference URLs.
4. Click **Generate draft**. The model returns a title, excerpt, markdown body (in the house structure: Key Pointers, Introduction, Market Context, Analysis, Technical Analysis, Market Takeaway), a suggested category, and suggested tags.
5. The draft is loaded into the standard article editor for review and is saved as **DRAFT** — a human always reviews before publishing.

> **Note on charts:** Live TradingView (or other) chart URLs cannot be fetched or read by the model. Describe the chart in words in the *Chart notes* field, and/or upload a chart image via the cover/media upload (Vercel Blob) and reference it in the body.

### Images & thumbnails

Articles have two separate images:

- **Cover image** — the large hero shown at the top of the article page.
- **Thumbnail** — the smaller image shown on listing/section cards. If left empty, cards fall back to the cover image.

Both can be uploaded (drag-and-drop or URL, stored in Vercel Blob) or **generated with AI**. In the article editor, click **Generate cover with AI** / **Generate thumbnail with AI** to create an image from the article's title/excerpt/category via `POST /api/ai/image`. Image generation is **opt-in per article** and uses the cheapest configured OpenAI image model (`gpt-image-1` at `low` quality by default) to avoid overspending.

> **Required env vars:** AI image generation needs `OPENAI_API_KEY` (optionally overridden by `OPENAI_IMAGE_MODEL`, `OPENAI_IMAGE_QUALITY`, and `OPENAI_IMAGE_SIZE`), and storing the resulting image in production needs `BLOB_READ_WRITE_TOKEN` (Vercel Blob). If either is missing, the "Generate … with AI" action fails — set both in your Vercel project's environment. See the [environment variables](#environment-variables) table for details.

### Automation endpoint

`POST /api/publish/generate` (secured by the `PUBLISH_API_KEY` header `x-api-key`) accepts raw `sources` and generates + drafts (or publishes) an article in one call — useful for external automation. It defaults to `DRAFT` status; pass `"status": "PUBLISHED"` to publish immediately.

### Scheduled drafting from news feeds

`GET /api/cron/draft-from-feeds` runs on a schedule (Vercel Cron, see `vercel.json` — daily by default) and drafts original, house-style articles inspired by public news feeds. It reads only the **public RSS/Atom headlines and short summaries** of the configured publications — never their full article text — and uses them as *signals* to write original pieces with attribution.

**Source availability:** CoinGape and Yahoo Finance expose server-fetchable feeds. **FXStreet** sits behind a Cloudflare bot challenge (returns 403 to servers) and **Bloomberg** has no free feed and is paywalled, so neither can be fetched automatically — the forex slot defaults to **ForexLive** instead. For FXStreet/Bloomberg specifically, paste the occasional headline/blurb via **AI Compose** or `/api/publish/generate`.

- Every result is saved as **DRAFT** — a human always reviews and publishes.
- Cost is bounded: at most `SOURCE_DRAFTS_PER_RUN` drafts per run (one cheap `gpt-4o-mini` call each, no images). Remaining new items are recorded as seen so they aren't reprocessed.
- Dedup is tracked in the `SourceItem` table (keyed by source link).
- Set `CRON_SECRET` in the environment; Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`. You can trigger a run manually with the `x-api-key: <PUBLISH_API_KEY>` header. Adjust the cadence by editing the `schedule` in `vercel.json`.

## Seeded Accounts

`npm run db:seed` creates the following accounts. Their passwords are read from
environment variables (`SEED_ADMIN_PASSWORD`, `SEED_EDITOR_PASSWORD`,
`SEED_AUTHOR_PASSWORD`) — set unique strong values before seeding. Each
password must be at least 16 characters and include uppercase and lowercase
letters, a number, and a special character. The seed script refuses to run
without valid password values.

| Role   | Email                          |
| ------ | ------------------------------ |
| Admin  | masteruser@theforexrepublic.com |
| Editor | editorial@theforexrepublic.com  |
| Author | writer@theforexrepublic.com     |

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
