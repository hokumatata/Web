# TradeWave

A Bloomberg/CoinDesk-inspired financial news and market data platform built with Next.js 14, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- **Bloomberg-style UI** — Professional light/dark theme with monospaced data displays, accent-colored indicators, and data-dense layouts
- **Live market data** — Real-time crypto prices from CoinGecko and forex rates from exchangerate.host
- **Scrolling ticker tape** — Continuous market data strip across the top of every page
- **Full CMS** — Create, edit, publish articles with rich text editor, image uploads, categories, tags
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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image uploads | Production |

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
