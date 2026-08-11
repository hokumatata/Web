---
name: testing-local-newsroom
description: How to stand up The Forex Republic (Next.js 14 + Prisma/Postgres) locally with seeded data and admin logins so admin/editorial and public-site flows can be tested end-to-end without touching production.
---

# Local test environment for The Forex Republic

## Never point at production
`PROD_DATABASE_URL` is a live production database. Do not use it for testing; run a
throwaway Postgres instead.

## Bring up a database
No local Postgres is installed on the standard box, but Docker is:

```bash
docker run -d --name tfrpg -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=forex_republic \
  -p 5433:5432 postgres:16
```

## `.env` for local runs
`.env` is gitignored and does not exist by default; create it (never commit real secrets):

```
DATABASE_URL="postgresql://postgres:devpass@localhost:5433/forex_republic"
JWT_SECRET="<any long random string>"
NEXT_PUBLIC_SITE_NAME="The Forex Republic"
SEED_ADMIN_PASSWORD=...
SEED_EDITOR_PASSWORD=...
SEED_AUTHOR_PASSWORD=...
```

`prisma/seed.ts` rejects weak seed passwords: each must be >= 16 chars with upper/lowercase,
a digit and a special character. OPENAI/BLOB/FMP keys are not needed unless testing AI or
image generation (image generation is known-broken in prod due to an invalid
`BLOB_READ_WRITE_TOKEN`).

## Install, migrate, seed, run
```bash
npm install && npx prisma generate
npx prisma db push
npm run db:seed        # 20 articles, 7 categories, 12 tags, 3 users
npm run dev            # http://localhost:3000
```

Seeded logins (passwords = the `SEED_*_PASSWORD` values you chose):
- ADMIN  `masteruser@theforexrepublic.com`
- EDITOR `editorial@theforexrepublic.com`
- AUTHOR `writer@theforexrepublic.com`

Log in at `/login` (email + password form). `/admin/**` requires EDITOR+
(`src/app/admin/layout.tsx` redirects to `/login` otherwise).

## Creating fixtures instead of running the AI cron
Never run `/api/cron/draft-from-feeds` or `/api/cron/breaking` just to get test data — they
spend OpenAI credits. Instead insert rows with a throwaway script **inside the repo**
(`scripts/tmp-*.ts`, then delete it) so `@prisma/client` resolves, and run `npx tsx scripts/tmp-x.ts`.
A script placed in `/tmp` fails with `Cannot find module '@prisma/client'`.

Useful fixtures:
- Review-queue draft: `prisma.article.create({ data: { status: "REVIEW", ..., dueDiligence: JSON.stringify({score,verdict,flags,notes}) } })`
  — `verdict: "pass"` renders the green PASS badge on `/admin/articles/review`.
- Breaking-badge window: the header badge (`src/components/site/TopHeader.tsx`) counts
  PUBLISHED + isBreaking articles with `publishedAt` in the last 12h, so to test it, update
  an existing breaking article's `publishedAt` (e.g. 20h ago = badge off, 3h ago = badge on)
  and hard-reload.

Model-free pipeline dry runs (safe): `npx tsx scripts/newsroom-dry-run.ts`,
`npx tsx scripts/breaking-dry-run.ts`.

## Editorial routes worth knowing
- `/admin/articles/review` — queue of `status: "REVIEW"`; Preview → `/admin/articles/<id>/preview`
  (reads by id, any status), Approve & publish → `POST /api/articles/<id>/publish`,
  Keep as draft → `PUT /api/articles/<id> {status:"DRAFT"}`, Reject → `DELETE /api/articles/<id>`.
  Approve and Reject show a native `window.confirm` dialog that must be accepted.
- `/article/<slug>` is PUBLISHED-only, so unpublished slugs correctly 404 there.

## Gotchas
- Typing a URL into Chrome's omnibox occasionally does not navigate on this box; if the page
  doesn't change, re-focus the omnibox, `ctrl+a`, retype and press Return separately, or click
  an in-page link instead.
- The system clock on the box may be set far in the future (e.g. 2026); relative-time
  assertions should be computed from `Date.now()`, not hard-coded dates.

## Devin Secrets Needed
- None for the core local flow. Optional: `OPENAI_API_KEY` (AI drafting),
  `BLOB_READ_WRITE_TOKEN` (image upload), `FMP_API_KEY` (economic calendar).
  Never `PROD_DATABASE_URL`.
