# The Forex Republic — Future Roadmap & CMS Planning

## Part 1: Future Moves to Push the Website Forward

### Priority 1: Content Management System (CMS) Integration
**Status:** Critical — the site is infrastructure-complete but content-empty without a CMS
- Replace the current Prisma/PostgreSQL seed-based content with a headless CMS
- Enable non-technical editors to publish articles, manage categories, upload media
- Set up editorial workflows: Draft → Review → Publish
- Automated SEO metadata generation at publish time

### Priority 2: Real Author Profiles & Editorial Team
- Create real author bio pages with photo, social links, publication history
- Set up author-specific dashboards for tracking their article performance
- Implement byline attribution with linked author cards on articles

### Priority 3: Content Pipeline & Automation
- **RSS/API ingestion:** Pull headlines from wire services (Reuters, AP) or curated feeds
- **AI-assisted drafting:** Use GPT-4/Claude API to draft article summaries from raw market data
- **Scheduled publishing:** Queue articles for optimal publication times
- **Auto-tagging:** NLP-based category/tag assignment on publish
- **Social distribution:** Auto-post to Twitter/X, LinkedIn on publish via webhooks

### Priority 4: Monetization Infrastructure
- **Newsletter tiers:** Free daily brief vs. premium in-depth analysis
- **Paywall logic:** Metered access (e.g., 5 free articles/month) with Stripe integration
- **Ad placements:** Define ad slots in article body, sidebar, and between category sections
- **Sponsored content:** Labeled "Partner Content" article type with separate workflow

### Priority 5: Real-Time Data Enhancements
- **WebSocket price feeds:** Replace 15s polling with persistent connections for <1s updates
- **Alert system:** Users set price alerts (BTC > $100K) → push notifications
- **Portfolio tracker:** Logged-in users add watchlist assets, see P&L
- **Live economic calendar:** Pull from Investing.com/FXStreet API for real event data instead of templates

### Priority 6: User Engagement & Community
- **Comments/Discussion:** Per-article comment threads (moderated)
- **Upvote/Bookmark:** Let users save and upvote articles
- **User preferences:** Follow categories, customize homepage feed
- **Push notifications:** Breaking news alerts via web push (FCM)

### Priority 7: Performance & SEO
- **Image CDN:** Cloudinary/imgix for automatic resizing, WebP conversion, lazy loading
- **Edge caching:** Move from ISR to full edge runtime for sub-100ms TTFB
- **Core Web Vitals:** Optimize LCP (hero images), CLS (font loading), INP (interactions)
- **AMP pages:** For Google News inclusion and mobile speed
- **Structured data expansion:** Add LiveBlogPosting schema for breaking events

### Priority 8: Analytics & Business Intelligence
- **Plausible/PostHog:** Privacy-first analytics tracking
- **Content performance dashboard:** Views, read time, scroll depth, shares per article
- **A/B testing:** Headline variants, layout experiments
- **Audience segmentation:** Track which categories drive return visits

### Priority 9: Mobile App (Phase 2)
- React Native app sharing the same headless CMS + API layer
- Push notifications for breaking news
- Offline reading (cached articles)
- Native charts with react-native-charts-wrapper

---

## Part 2: Content Management — Deep Planning

### Recommendation: Sanity CMS

After evaluating the top headless CMS platforms for a financial news operation, **Sanity** is the recommended choice for The Forex Republic.

#### Why Sanity over alternatives:

| Factor | Sanity | Strapi | Contentful |
|--------|--------|--------|------------|
| **Free tier** | 20 seats, 10K documents, 500K API requests/mo | Self-host free (infra cost) | 5 users, 25K records |
| **Real-time collaboration** | Native (Google Docs-like) | No | Limited |
| **Custom editorial workflow** | Fully customizable | Basic | Rigid |
| **AI features** | AI Assist built-in | None | Add-on |
| **News/publishing focus** | Purpose-built newsroom features | Generic | Generic |
| **Next.js integration** | First-class (live preview, visual editing) | Good | Good |
| **Pricing at scale** | $15/seat/mo (Growth) | $99/mo (Cloud) | $300/mo+ |
| **Content modeling** | Schema-as-code (TypeScript) | GUI-based | GUI-based |
| **Structured content** | Best-in-class | Good | Good |

#### Why NOT the others:
- **Strapi:** Good for smaller teams, but lacks real-time collab, AI tools, and has higher maintenance burden (self-hosted). No native live preview.
- **Contentful:** Excellent enterprise tool but expensive ($300+/mo for teams), rigid content modeling, and overkill for a startup newsroom.
- **WordPress (Headless):** Legacy baggage, security concerns, not built for structured content.

---

### Sanity Implementation Plan

#### Phase A: Schema Design (Week 1)

```typescript
// sanity/schemas/article.ts
export default {
  name: 'article',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'excerpt', type: 'text', rows: 3 },
    { name: 'body', type: 'portableText' },  // Rich text with embeds
    { name: 'coverImage', type: 'image', options: { hotspot: true } },
    { name: 'category', type: 'reference', to: [{ type: 'category' }] },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'isBreaking', type: 'boolean', initialValue: false },
    { name: 'isFeatured', type: 'boolean', initialValue: false },
    { name: 'seoTitle', type: 'string' },
    { name: 'seoDescription', type: 'text' },
    { name: 'status', type: 'string', options: {
      list: ['draft', 'in_review', 'scheduled', 'published', 'archived']
    }},
  ],
}
```

#### Phase B: Migration from PostgreSQL (Week 2)

1. Export existing articles from Neon DB → JSON
2. Transform to Sanity document format
3. Import via `@sanity/client` bulk import
4. Update Next.js data layer: replace `prisma.article.findMany()` → `sanityClient.fetch(GROQ_QUERY)`
5. Remove Prisma dependency for content (keep for user accounts/auth)

#### Phase C: Editorial Studio Setup (Week 2-3)

1. Deploy Sanity Studio (free hosted or embed at `/studio`)
2. Configure roles:
   - **Admin:** Full access, publish, delete, manage users
   - **Editor:** Write, edit any article, publish
   - **Author:** Write own articles, submit for review
3. Set up editorial workflow:
   - Author creates Draft → Editor reviews → Editor publishes
   - Breaking news: Author can self-publish with "Breaking" flag
4. Configure AI Assist for:
   - Auto-generating SEO titles/descriptions
   - Suggesting tags based on content
   - Drafting excerpts from body text

#### Phase D: Frontend Integration (Week 3-4)

```typescript
// src/lib/sanity.ts
import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // edge-cached reads
})

// GROQ query for homepage
export const homepageQuery = groq`{
  "featured": *[_type == "article" && isFeatured && status == "published"] | order(publishedAt desc)[0...5] {
    title, slug, excerpt, coverImage, publishedAt, isBreaking,
    category->{name, slug},
    author->{name, slug, avatar}
  },
  "latest": *[_type == "article" && status == "published"] | order(publishedAt desc)[0...20] { ... },
  "crypto": *[_type == "article" && category->slug == "crypto" && status == "published"] | order(publishedAt desc)[0...5] { ... },
  "forex": *[_type == "article" && category->slug == "forex" && status == "published"] | order(publishedAt desc)[0...5] { ... },
}`
```

#### Phase E: Webhooks & Revalidation (Week 4)

- Sanity webhook → Next.js `/api/revalidate` → on-demand ISR cache bust
- When an article is published/updated, the affected pages regenerate in <2s
- Newsletter webhook: new article with "Breaking" → triggers Resend email to subscribers

---

### Content Strategy Framework

#### Daily Publishing Cadence

| Time (UTC) | Content Type | Source |
|------------|-------------|--------|
| 06:00 | Asian session wrap-up | AI-assisted from market data |
| 08:00 | European open preview | Editor-written |
| 12:00 | Mid-day macro briefing | Curated wire + editorial |
| 14:00 | US session open analysis | Editor-written |
| 18:00 | Daily market close summary | AI-assisted |
| 20:00 | Breaking/events as they happen | Real-time |

#### Content Types to Build in CMS

1. **Standard Article** — 800-1500 words, traditional news piece
2. **Market Brief** — 200-400 words, quick data-driven update
3. **Deep Dive / Analysis** — 2000+ words, research piece
4. **Live Blog** — Real-time updates during events (FOMC, NFP)
5. **Data Story** — Chart-heavy, embedded TradingView widgets
6. **Newsletter Issue** — Formatted for email delivery
7. **Opinion/Editorial** — Clearly labeled perspective pieces

---

### Cost Projection

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Sanity Free tier | $0 | 20 seats, 10K docs — sufficient to start |
| Vercel Pro | $20 | Current hosting |
| Neon PostgreSQL | $0 | Free tier for auth/user data |
| Resend (email) | $0 | 3K emails/mo free |
| Cloudinary (images) | $0 | 25K transforms/mo free |
| **Total (launch)** | **$20/mo** | |
| Sanity Growth (when needed) | $15/seat | When you need AI Assist, scheduling, comments |
| Resend Pro | $20/mo | When newsletter exceeds 3K subscribers |

---

### Implementation Timeline

| Week | Milestone |
|------|-----------|
| 1 | Sanity project setup, schema design, Studio config |
| 2 | Migrate existing seed articles, set up GROQ queries |
| 3 | Replace Prisma content layer with Sanity client, live preview |
| 4 | Editorial workflows, webhooks, revalidation |
| 5 | Author onboarding, first real content published |
| 6 | Newsletter automation, social distribution |

---

### Next Immediate Steps (This Week)

1. **Create Sanity project** at sanity.io (free)
2. **Design content schema** (article, author, category, tag)
3. **Set up Sanity Studio** with custom branding
4. **Migrate existing 22 seed articles** into Sanity
5. **Wire up Next.js** to read from Sanity instead of PostgreSQL
6. **Test editorial flow** — create article in Studio, see it live on site

Would you like me to start implementing the Sanity integration?
