# MarketPulse

A CoinTelegraph / FXStreet-inspired finance and crypto news site with a Bloomberg-clean aesthetic. Full-stack Next.js app — public site, admin panel, visitor dashboard, REST API, and live market data.

> Working name. Easy to rebrand via `NEXT_PUBLIC_SITE_NAME`.

## What's inside

- **Public site** — Bloomberg-style dense layout with serif headlines, scrolling ticker, hero + category rails.
- **Live markets** — Crypto via [CoinGecko](https://www.coingecko.com/) and FX via [exchangerate.host](https://exchangerate.host/), cached server-side. No API keys required.
- **Visitor dashboard** — Saved articles, watchlist with live quotes, preferences.
- **Admin panel** — KPIs, full CRUD for articles / categories / tags, comment moderation, newsletter subscribers, ticker configuration, user role management, audit log.
- **Auth** — Email + password, JWT in `httpOnly` cookie, roles: `ADMIN` / `EDITOR` / `AUTHOR` / `READER`.
- **DB** — Prisma + SQLite for zero-config dev; flip `DATABASE_URL` to Postgres for prod.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS, Lucide icons |
| DB | Prisma ORM + SQLite (dev) / Postgres-ready |
| Auth | `jose` (JWT) + `bcryptjs` + httpOnly cookies |
| Validation | Zod |
| Markets | CoinGecko + exchangerate.host (no keys) |

## Local development

```bash
# 1. Install
npm install

# 2. Configure env (defaults work for SQLite + dev)
cp .env.example .env

# 3. Create the DB and seed sample data
npm run db:push
npm run db:seed

# 4. Start the dev server
npm run dev
# open http://localhost:3000
```

### Demo accounts

All accounts use password `password123`.

| Email | Role |
| --- | --- |
| `admin@marketpulse.local` | ADMIN |
| `editor@marketpulse.local` | EDITOR |
| `author@marketpulse.local` | AUTHOR |
| `reader@marketpulse.local` | READER |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Prisma generate + Next build |
| `npm run start` | Run the prod build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Apply Prisma schema to the DB |
| `npm run db:seed` | Seed sample data (idempotent — wipes & reseeds) |
| `npm run db:reset` | Drop SQLite file + push + seed |

## Project structure

```
prisma/
  schema.prisma         # all models (SQLite, Postgres-compatible enums-as-strings)
  seed.ts               # demo users + categories + tags + ~20 articles + tickers

src/
  app/
    layout.tsx          # site shell (header + ticker + footer)
    page.tsx            # home — hero + grid + category rails
    news/               # all news list (paginated, ?breaking=1 filter)
    category/[slug]/    # category page with lead + grid
    article/[slug]/     # article view + comments + related
    markets/            # live crypto + FX tables
    search/             # server-rendered search
    newsletter/         # subscribe landing
    login/ register/    # auth
    dashboard/          # visitor area (watchlist / saved / preferences)
    admin/              # admin panel (CRUD + moderation + audit)
    api/                # REST endpoints

  components/
    site/               # header, ticker tape, footer, market snapshot, newsletter
    news/               # article cards (hero / default / image-left / compact)
    auth/                # login + register + logout
    dashboard/          # watchlist + preferences UI
    admin/               # CRUD UIs

  lib/
    db.ts               # Prisma singleton
    auth.ts             # JWT session + RBAC (requireRole)
    types.ts            # Role + status enums-as-string-unions
    markdown.ts         # dependency-free safe markdown renderer
    markets.ts          # CoinGecko + FX with 60s in-memory cache + fallback
    utils.ts            # date / number / slug helpers
    audit.ts            # audit log helper
    api.ts              # JSON response helpers
```

## API surface (selected)

```
Auth         POST /api/auth/login          {email, password}
             POST /api/auth/register       {name, email, password}
             POST /api/auth/logout
             GET  /api/auth/me

Articles     GET    /api/articles          ?category= &tag= &q= &page= &limit= &status=
             POST   /api/articles          AUTHOR+
             GET    /api/articles/[id]
             PATCH  /api/articles/[id]     EDITOR+ (or author of post)
             DELETE /api/articles/[id]     ADMIN
             POST   /api/articles/[id]/publish

Engagement   GET/POST /api/articles/[id]/comments
             PATCH/DELETE /api/comments/[id]      moderation
             POST   /api/newsletter        public subscribe
             GET    /api/newsletter        ADMIN
             DELETE /api/newsletter/[id]   ADMIN

Visitor      GET/POST/DELETE /api/me/saved
             GET/POST/DELETE /api/me/watchlist
             GET/PATCH       /api/me/preferences

Markets      GET /api/markets/crypto       proxied + cached
             GET /api/markets/fx           proxied + cached

Admin        GET /api/admin/stats          KPIs for the dashboard
             PATCH/DELETE /api/admin/users/[id]
             POST/GET /api/admin/tickers
             DELETE /api/admin/tickers/[id]

Taxonomy     GET/POST /api/categories
             PATCH/DELETE /api/categories/[id]
             GET/POST /api/tags
             DELETE /api/tags/[id]
```

## Notes / known limitations

- Email sending for newsletter confirm is stubbed — subscribers are stored but no email goes out.
- Cover images use external URLs (Unsplash). Image upload is out of scope for this MVP.
- Markets module ships realistic fallback quotes if the upstream API rate-limits.
- Light theme is exposed in preferences but the production UI is dark-first.

## License

MIT. See repo.
