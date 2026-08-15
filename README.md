# The Forex Republic

A Bloomberg/CoinDesk-inspired financial news and market data platform built with Next.js 14, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- **Bloomberg-style UI** — Professional light/dark theme with monospaced data displays, accent-colored indicators, and data-dense layouts
- **Live market data** — Real-time crypto prices from CoinGecko and forex rates from exchangerate.host
- **Scrolling ticker tape** — Continuous market data strip across the top of every page
- **Full CMS** — Create, edit, publish articles with rich text editor, image uploads, categories, tags
- **AI-assisted drafting** — Paste raw sources (tweets, official releases, chart notes, reference text/URLs, key ideas) and generate a structured, house-style article draft via OpenAI, prefilled into the CMS editor for human review (always saved as DRAFT first)
- **Admin dashboard** — Article management, user & author management, comment moderation, newsletter, audit log
- **Economic Calendar** — one continuous timeline of macro releases (recent history above, today highlighted, upcoming below) with impact ratings, consensus forecasts and previous readings, from a live feed
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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for manual image uploads | Production |
| `PUBLISH_API_KEY` | Shared secret for the `/api/publish` and `/api/publish/generate` automation endpoints | For automation |
| `CRON_SECRET` | Secret Vercel Cron sends as `Authorization: Bearer …` to the scheduled feed-drafting job | For scheduled drafting |
| `SOURCE_DRAFTS_PER_RUN` | Max drafts created per scheduled run (default `3`, capped at `10`) | No |
| `SOURCE_AUTHOR_EMAIL` | Author the scheduled drafts are attributed to (default `masteruser@theforexrepublic.com`) | No |
| `SOURCE_RSS_FEEDS` | Override source feeds, comma-separated `Name\|url` or `Name\|url\|beat` (default: see `src/lib/sources.ts`) | No |
| `BREAKING_AUTOPUBLISH` | Allow the breaking wire to publish confirmed briefs live (opt-in; default off / review-only unless set to `true`) | No |
| `BREAKING_PER_RUN` | Max briefs per breaking run (default `2`, capped at `5`) | No |
| `BREAKING_MAX_AGE_MINUTES` | How recent an item must be to count as breaking (default `90`) | No |
| `BREAKING_MIN_SCORE` | Newsworthiness needed to publish unreviewed (default `70`) | No |
| `BREAKING_DD_MIN_SCORE` | Due-diligence score needed to publish unreviewed (default `80`) | No |
| `SLACK_WEBHOOK_URL` | Optional Slack Incoming Webhook to notify reviewers when new agent drafts await review | No |

## AI-Assisted Article Drafting

Editors can generate a full article draft from raw source material instead of writing from scratch:

1. Set `OPENAI_API_KEY` in your environment.
2. In the admin dashboard, go to **Articles → AI Compose** (`/admin/articles/ai`).
3. Paste any combination of sources: key ideas/angle, tweet text, official releases, chart notes, reference article text, and reference URLs.
4. Click **Generate draft**. The model returns a title, excerpt, markdown body, a suggested category, and suggested tags. Pasted sources stay as **inputs only** — they are not copied into the saved article body.
5. The draft is loaded into the standard article editor for review and is saved as **DRAFT** — a human always reviews before publishing.

> **Note on charts:** Live TradingView (or other) chart URLs cannot be fetched or read by the model. Describe the chart in words in the *Chart notes* field, and/or upload a chart image via the cover/media upload (Vercel Blob) and reference it in the body.

### Images & thumbnails

Articles have two separate images:

- **Cover image** — the large hero shown at the top of the article page.
- **Thumbnail** — the smaller image shown on listing/section cards. If left empty, cards fall back to the cover image.

Upload covers and thumbnails manually (drag-and-drop or URL) via the article editor; files are stored in Vercel Blob (`BLOB_READ_WRITE_TOKEN` in production). **AI image generation has been removed** — there is no Generate-with-AI button and `/api/ai/image` is gone.

### Automation endpoint

`POST /api/publish/generate` (secured by the `PUBLISH_API_KEY` header `x-api-key`) accepts raw `sources` and generates + drafts (or publishes) an article in one call — useful for external automation. It defaults to `DRAFT` status; pass `"status": "PUBLISHED"` to publish immediately.

### Scheduled drafting from news feeds

`GET /api/cron/draft-from-feeds` runs on a schedule (Vercel Cron, see `vercel.json` — daily) and drafts original, in-depth, house-style articles from public news feeds. It reads only the **public RSS/Atom headlines and short summaries** of the configured publications — never their full article text — and uses them as *signals* to write original pieces. Covers are left empty for editors to upload manually; scheduled AI cover generation has been removed.

**The pipeline, per run:**

1. **Fetch** every configured feed (`src/lib/sources.ts`): analyst commentary (ActionForex, ForexLive), markets news (Investing.com, CNBC, Yahoo Finance), crypto (CoinGape, Cointelegraph) and **primary central-bank releases** (Fed, ECB, BoE). Primary sources matter: quoting an ECB statement directly is reporting, not a rewrite of a rival's article.
2. **Cluster** related items so two to four outlets covering the same event become **one synthesised story** rather than N near-duplicate rewrites (`src/lib/cluster.ts`). Clustering is on headline-token overlap, and items older than 48h are dropped so feed archives don't resurface.
3. **Score newsworthiness** locally and for free: topical weight (Fed/policy, inflation, labour data, FX, metals, crypto, rates), a bonus for multi-outlet corroboration and quantified headlines, and penalties for listicles, rankings, how-tos, commerce, hype and thin single-source blurbs. Only clusters at or above `SOURCE_MIN_SCORE` (default 45) reach a model call, so off-topic items cost nothing.
4. **Route by story type** (`src/lib/house-style.ts`). One fixed outline for every article is what makes generated copy feel generated, so the type — data release, data preview, central bank, price forecast, market move, earnings, regulation, week-ahead, general — selects the outline. Critically, a **technical-levels section is opt-in**: chart-led forecasts get one, a CPI report or central-bank story never does.
5. **Compute technical levels in code** for chart-led stories (`src/lib/technicals.ts`): last price, 20/50/200-day EMAs, RSI(14), prior-session high/low/close and swing supports/resistances, all from real Yahoo OHLC data. The model receives them as an authoritative list and may cite nothing else. After writing, `findUnsupportedLevels()` re-checks every price-like number in the body against that list and flags anything that doesn't trace back — fabricated levels are caught arithmetically, not by asking the model to behave.
6. **Due diligence**, then save as `REVIEW`.

**Voice.** `src/lib/house-style.ts` holds the shared voice contract, derived from a study of live FXStreet coverage (see `NEWSROOM_STYLE.md`). It bans the tells rather than prescribing a template: no essay-label headings (`Introduction`, `Market Context`, `Analysis`, `Market Takeaway`), a banned-phrase list, varied sentence and paragraph rhythm, inline wire-style attribution, and depth via mechanism, actual/consensus/prior, a named instrument, a falsifier, and a short close — not a headline restatement plus a watchlist of site CTAs. `findStyleViolations()` checks these deterministically on every draft (banned phrases, template/watchlist headings, lede-as-headline, CTA watchlists, stub length under 800 words) and the breaches show up as review flags. Drafts that fail that floor get one bounded follow-up call to develop the analysis.

**Due diligence + approval workflow:** every generated article is saved with status **`REVIEW`** (not `DRAFT`/`PUBLISHED`) and runs through an automated due-diligence pass that compares the draft against its source material — checking for fabricated figures/quotes, unhedged claims, and missing attribution — and stores a score (0–100), a verdict (`pass`/`review`/`flag`), and specific flags. These land in **Admin → Review Queue**, where a human sees the due-diligence assessment alongside the draft and clicks **Approve & publish**, **Keep as draft** (to edit first), or **Reject**. Nothing is ever auto-published. Set an optional `SLACK_WEBHOOK_URL` to get pinged when new drafts await review.

**Attribution.** Published articles credit outlets **inline in the prose** where a fact needs it, with no Sources appendix and no outbound link to the source article. Source URLs are kept for the editor: the Review Queue lists every item that fed each story, linked, and they stay in the `SourceItem` table as an audit trail.

**Source availability:** all ten default feeds were verified server-fetchable. **FXStreet** sits behind a Cloudflare bot challenge (returns 403 to servers) and **Bloomberg** has no free feed and is paywalled, so neither can be fetched automatically. For those, paste the occasional headline/blurb via **AI Compose** or `/api/publish/generate`.

### Economic calendar data

`src/lib/econ-calendar.ts` reads the **ForexFactory public weekly calendar feed** (no API key) and exposes it as typed events: release time, affected currency, expected-volatility rating, consensus forecast and previous reading. All times render in **UTC** and the page revalidates hourly.

The page is a **single continuous timeline** — no day tabs. Recent history sits above a `Coming up` divider, today is highlighted and scrolled to on load, and everything scheduled ahead follows below. Past rows are de-emphasised.

Two constraints are deliberate and load-bearing:

- **No figure is ever invented.** The feed does not carry the *actual* print for any event, so `actual` is always `null` and the column shows `—`. It is never inferred, estimated or back-filled. (This replaced a set of hardcoded weekday templates that shipped fabricated prints such as "Non-Farm Payrolls actual 206K" on rotation.)
- **The feed only exposes the current week.** `lastweek`, `nextweek` and the month variants all 404, so history cannot come from the feed. Instead every sync upserts the week into the `EconomicEvent` table (`src/lib/econ-calendar-store.ts`) and the timeline reads its past section from that archive — so history is shallow at first and deepens by a week each week. `HISTORY_DAYS` (default 30) caps how far back the timeline renders.

The archive is written by `syncEconCalendar()`, which the 3-hourly drafting cron calls on every run (reported as `calendarSync` in its response); run it by hand with `npx tsx scripts/calendar-sync.ts`. Reads degrade gracefully in both directions: if the database is unreachable the page falls back to the live feed, and if the feed is unreachable (it returns HTTP 429 under frequent polling) the archive carries the page and the footnote says so.

`upcomingHighImpact()` is the hook for forward-looking coverage: a scheduled release with a published consensus and previous reading is enough to write a preview from without waiting for an outlet.

Check it with `npx tsx scripts/calendar-dry-run.ts`, which prints the week's events, per-day and per-impact counts, the archive/live timeline split, the writeable previews in the next 36h, and asserts that no event carries an actual.

### Coverage

The feed set spans every desk, not just forex: forex (ActionForex, ForexLive, FX Empire), crypto (Cointelegraph, Decrypt, The Block, CoinGape), commodities and gold (Investing.com Commodities, OilPrice), equities (CNBC, MarketWatch, Seeking Alpha, Yahoo Finance) and macro, including **primary** releases straight from the Fed, ECB, BoE, BoJ, RBA, Bank of Canada, BLS and BEA. Each feed declares its beat, clusters inherit the dominant one, and `selectDiverseQueue()` caps how many stories one beat may take from a single run — so a busy macro morning cannot crowd crypto and equities off the front page. A first-party item also scores higher than a secondary report of the same event, and is what lets the breaking wire treat it as self-confirming.

### Breaking wire

`/api/cron/breaking` (hourly, `.github/workflows/breaking-cron.yml`) is the **only** path that publishes without a human. It exists because a rate decision or a CPI print is a fact rather than an interpretation, and its value to a reader decays in minutes.

A story reaches the model only if `src/lib/breaking.ts` clears every gate: it is a data release or central-bank decision; timestamped inside `BREAKING_MAX_AGE_MINUTES`; worded as something that has happened, not a preview, forecast or scenario; carrying a figure or an explicit policy decision; and either first-party or corroborated by two independent outlets. The brief it writes is 130–220 words with no technical analysis and no interpretation, and must then pass due diligence at `BREAKING_DD_MIN_SCORE`, contain no figure absent from the source material, and still look like a brief. **Any failure files it as `REVIEW`** — the gates fail closed, never open. Published briefs are flagged `isBreaking`, carry a standing "developing" note, and are expected to be expanded by an editor; the confirmation and hold reasons are recorded on the row so "why was this live before an editor saw it?" is always answerable. Consensus and prior figures come from the archived calendar entry, never from the model.

Check the gates with `npx tsx scripts/breaking-dry-run.ts`: a fixture suite of publishable cases and near-misses (previews, uncorroborated single outlets, stale and undated items, scenario pieces), then a live pass over the feeds showing what would have gone out.

**Dry runs.** `npx tsx scripts/newsroom-dry-run.ts` fetches the live feeds and prints per-feed counts, cluster counts, the scored queue with story types and the rejected tail — no model calls, no writes. `npx tsx scripts/newsroom-sample.ts [n]` goes further and actually writes sample articles across story types (needs `OPENAI_API_KEY`), reporting word count, headings, style violations, unverified price levels and the due-diligence verdict for each. Use both after changing prompts or scoring.

- Every result is saved as **`REVIEW`** and awaits explicit human approval in the Review Queue — nothing is ever auto-published.
- Cost is bounded: clustering, scoring and routing are local and free; at most `SOURCE_DRAFTS_PER_RUN` articles per run (a cheap `gpt-4o-mini` draft call plus a due-diligence call), and N outlets on one event cost one article rather than N. Items rejected by the newsworthiness gate are recorded as seen so they aren't reconsidered; items that cleared the gate but didn't fit the run budget stay eligible for the next run.
- Dedup is tracked in the `SourceItem` table (keyed by source link).
- Set `CRON_SECRET` in the environment; Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`. You can trigger a run manually with the `x-api-key: <PUBLISH_API_KEY>` header. Adjust the Vercel cadence by editing the `schedule` in `vercel.json`. Note: Vercel **Hobby** only allows one cron run per day.
- **Running more often than daily (free):** Vercel Hobby caps cron at daily, so `.github/workflows/journalist-cron.yml` runs a GitHub Actions schedule every 3 hours that calls the endpoint with the `x-api-key` header. Add repo secrets `SITE_URL` (your deployed base URL) and `PUBLISH_API_KEY` (matching the Vercel env var). If **Vercel Deployment Protection** is enabled, the endpoint redirects server-to-server calls to a login page (HTTP 302) — enable Vercel → Settings → Deployment Protection → **Protection Bypass for Automation** and add its secret as the repo secret `VERCEL_AUTOMATION_BYPASS_SECRET` (the workflow forwards it as `x-vercel-protection-bypass`), or turn protection off for Production. Scheduled workflows run only from the default branch and can be delayed a few minutes; you can also trigger it manually from the Actions tab. On Hobby the serverless function is capped at ~60s, so keep `SOURCE_DRAFTS_PER_RUN` modest (`1` or `2`) if runs time out.

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
5. Apply schema migrations as a **separate controlled step** (not during the Vercel build):

   ```bash
   DATABASE_URL="<production-connection-string>" npx prisma migrate deploy
   ```

   Do this before or after deploy when the schema changes. The production `build` script only runs `prisma generate` and `next build` so a failed row in `_prisma_migrations` cannot block deploys.
6. Deploy the app on Vercel
7. Run `npm run db:seed` against production DB to populate sample data

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
| `npm run build` | Production build (`prisma generate` + `next build`; does **not** run migrations) |
| `npx prisma migrate deploy` | Apply pending migrations with `DATABASE_URL` (run separately from Vercel build) |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm run db:migrate` | Create new migration |
| `npm run db:seed` | Seed sample data |
| `npm run db:reset` | Reset database and re-run migrations |

## Design Inspiration

- **Bloomberg Terminal**: Dark theme, data-dense layouts, monospaced numbers, professional color scheme
- **CoinDesk**: Editorial article layout, hero sections, category navigation, breaking news indicators
