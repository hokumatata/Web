import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "crypto", name: "Crypto", description: "Bitcoin, Ethereum, altcoins, on-chain.", order: 1 },
  { slug: "forex", name: "Forex", description: "Currencies and central banks.", order: 2 },
  { slug: "stocks", name: "Stocks", description: "Equities, indices, earnings.", order: 3 },
  { slug: "macro", name: "Macro", description: "Global economy and policy.", order: 4 },
  { slug: "analysis", name: "Analysis", description: "Technical and fundamental research.", order: 5 },
  { slug: "opinion", name: "Opinion", description: "Editorials and commentary.", order: 6 },
];

const TAGS = [
  "bitcoin", "ethereum", "solana", "defi", "nft", "regulation", "fed", "ecb",
  "yields", "inflation", "earnings", "s&p500", "nasdaq", "oil", "gold",
  "etf", "futures", "options", "stablecoins", "ai", "layer-2", "macro",
  "central-banks", "geopolitics", "elections",
];

const TICKERS = [
  { symbol: "BTC", label: "Bitcoin", type: "CRYPTO", order: 1 },
  { symbol: "ETH", label: "Ethereum", type: "CRYPTO", order: 2 },
  { symbol: "SOL", label: "Solana", type: "CRYPTO", order: 3 },
  { symbol: "BNB", label: "BNB", type: "CRYPTO", order: 4 },
  { symbol: "XRP", label: "XRP", type: "CRYPTO", order: 5 },
  { symbol: "EURUSD", label: "EUR/USD", type: "FX", order: 6 },
  { symbol: "GBPUSD", label: "GBP/USD", type: "FX", order: 7 },
  { symbol: "USDJPY", label: "USD/JPY", type: "FX", order: 8 },
];

const ARTICLE_TEMPLATES: Array<{
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  category: string;
  tags: string[];
  isFeatured?: boolean;
  isBreaking?: boolean;
}> = [
  {
    title: "Bitcoin Reclaims $68K as ETF Inflows Cross $1.2B for the Week",
    excerpt:
      "Spot bitcoin ETFs pulled in fresh capital despite tightening liquidity, with institutional desks reporting steady demand from RIAs.",
    body: `## Inflows accelerate

Spot bitcoin ETFs absorbed **$1.2 billion** in net inflows last week, the largest five-day haul since late February. BlackRock's IBIT and Fidelity's FBTC accounted for roughly two-thirds of flows, while Grayscale's GBTC outflows continued at a moderated pace.

> "We are seeing measurable demand from RIAs that finished their suitability reviews in Q1," noted a head of digital assets at a top-10 broker-dealer.

## Macro tailwinds

A softer US dollar and easing 10-year yields supported the move higher. Traders are positioning into the next FOMC decision with **futures pricing two cuts** by year-end.

### Technical picture

- Resistance: $69,200, then the all-time high near $73,800
- Support: $64,800 reclaim level
- Funding rates remain elevated but below cycle highs

Watch for liquidity around weekend gaps as the spot premium widens.`,
    cover:
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=1600&q=80",
    category: "crypto",
    tags: ["bitcoin", "etf", "macro"],
    isFeatured: true,
    isBreaking: true,
  },
  {
    title: "Ethereum Layer-2 Activity Hits Record as Fees Drop to Multi-Month Lows",
    excerpt:
      "Base and Arbitrum lead a surge in L2 transactions, while Ethereum mainnet gas slips to its lowest since November.",
    body: `## L2 throughput keeps climbing

Daily transactions across the leading Ethereum layer-2s set a new all-time high this week. **Base** processed more than 6 million transactions in a single day, with **Arbitrum** and **Optimism** rounding out the top three.

## What's driving it

1. Cheaper blob space after the Dencun upgrade
2. New consumer apps with frictionless onboarding
3. Active points programs and incentives

Mainnet gas, meanwhile, fell into single-digit gwei for extended periods, the lowest since November of last year.`,
    cover:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1600&q=80",
    category: "crypto",
    tags: ["ethereum", "layer-2", "defi"],
    isFeatured: true,
  },
  {
    title: "Dollar Index Slips Below 105 as Traders Reprice Fed Path",
    excerpt:
      "Soft retail sales and cooling services inflation pushed the DXY lower, with cable bouncing above 1.27.",
    body: `## Greenback gives back gains

The US Dollar Index closed below the 105 handle for the first time in three weeks, weighed by softer-than-expected retail sales and continued moderation in services inflation. Two-year yields slipped six basis points.

## FX winners

- **EUR/USD**: reclaimed 1.085, eyeing 1.090
- **GBP/USD**: above 1.27 with hawkish BoE rhetoric still supportive
- **USD/JPY**: drifting toward 154.00 as intervention risk persists

The market now prices a higher probability of a September rate cut.`,
    cover:
      "https://images.unsplash.com/photo-1526324319811-b3b34c7d23d7?auto=format&fit=crop&w=1600&q=80",
    category: "forex",
    tags: ["fed", "yields", "central-banks"],
  },
  {
    title: "ECB Holds Rates Steady but Signals Cuts as Disinflation Continues",
    excerpt:
      "President Lagarde reiterated data-dependence but markets read the press conference as a green light for a June move.",
    body: `## The decision

The European Central Bank kept its main refinancing rate at **4.50%** and the deposit facility at **4.00%**, in line with expectations. Headline inflation in the euro area continues to ease, with services prints showing welcome softening.

## Reading between the lines

President Lagarde emphasized that cuts will be data-dependent, but acknowledged that **wage growth has begun to moderate**. Markets reacted by trimming euro long positions modestly.

### Market reaction

EUR/USD oscillated in a 40-pip range during the press conference before settling slightly lower. European bonds rallied across the curve.`,
    cover:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    category: "forex",
    tags: ["ecb", "central-banks", "inflation"],
  },
  {
    title: "S&P 500 Notches Fresh Record on Cooling CPI Print",
    excerpt:
      "Mega-cap tech led the advance with breadth improving as small caps participated alongside the index.",
    body: `## Risk-on across the curve

The S&P 500 closed at a new all-time high, lifted by a softer-than-expected consumer price index report. Communication services and technology led, while utilities lagged. Notably, **market breadth improved** with the Russell 2000 outpacing the headline index.

## Earnings on deck

Several megacaps report next week. Implied moves in options markets are above 30-day averages, suggesting elevated event risk into earnings.

> "We are tactically neutral but constructive into year-end. Disinflation plus AI capex is a powerful combination," wrote one strategist.`,
    cover:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
    category: "stocks",
    tags: ["s&p500", "earnings", "inflation"],
    isFeatured: true,
  },
  {
    title: "Nasdaq AI Trade Broadens as Software Names Catch a Bid",
    excerpt:
      "After months of semiconductor leadership, traders are rotating into application-layer software companies with AI revenue narratives.",
    body: `## Rotation under the hood

While semiconductor leaders have powered the AI narrative, a noticeable rotation is occurring into the application layer. Software names with clear AI monetization stories outperformed the index by an average of 280 bps last week.

## Watchlist names

- Enterprise observability platforms
- Cybersecurity vendors with copilots
- Vertical SaaS with workflow AI

Earnings revisions remain positive across the cohort.`,
    cover:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=80",
    category: "stocks",
    tags: ["nasdaq", "ai", "earnings"],
  },
  {
    title: "Oil Climbs as Middle East Tensions Threaten Supply Routes",
    excerpt:
      "Brent crude pushed above $88 as shipping rerouting and OPEC+ extension talk lift the strip.",
    body: `## Risk premium returns

Brent crude futures climbed above **$88 per barrel** as geopolitical risk reasserted itself across the energy complex. Shipping rates for clean tankers spiked, and several refiners flagged delays in cargo arrivals.

## OPEC+ in focus

Reports suggest the alliance is leaning toward extending current production cuts into the third quarter. Saudi voluntary cuts of one million bpd remain in place.

### What to watch

- Diesel cracks and product margins
- Backwardation in the front of the curve
- US shale supply response`,
    cover:
      "https://images.unsplash.com/photo-1582486225644-7be9b54c47b1?auto=format&fit=crop&w=1600&q=80",
    category: "macro",
    tags: ["oil", "geopolitics", "macro"],
  },
  {
    title: "Gold Pushes Past $2,400 on Central Bank Buying",
    excerpt:
      "Persistent reserve diversification by official institutions plus disinflation expectations propelled the metal to fresh highs.",
    body: `## Gold's structural bid

The yellow metal continued its march higher, breaking above **$2,400 per ounce** for the first time. The move is supported by persistent **central bank buying**, particularly from emerging markets diversifying reserves away from the dollar.

## Real yields and DXY

Despite the recent rebound in real yields, gold has decoupled from its traditional correlation. Some attribute this to physical demand from official institutions and Asian retail.

> "When real yields go up and gold also goes up, you know the buyer is structural, not tactical," observed one veteran metals trader.`,
    cover:
      "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1600&q=80",
    category: "macro",
    tags: ["gold", "central-banks", "macro"],
  },
  {
    title: "Technical: BTC Forms Bull Flag on Daily Chart, Targets $74K",
    excerpt:
      "A multi-week consolidation pattern is breaking out to the upside, with measured-move targets near the prior all-time high.",
    body: `## Setup

Bitcoin has been carving out a textbook **bull flag** on the daily timeframe following the impulse leg in February. The pattern broke out on volume yesterday, with the measured move pointing toward **$74,000**.

## Key levels

- Breakout: $69,200
- Flag low: $61,500
- Measured move: $74,000–$74,800

Invalidation comes on a daily close back inside the flag at $65,500.`,
    cover:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1600&q=80",
    category: "analysis",
    tags: ["bitcoin", "analysis"],
  },
  {
    title: "Opinion: Stablecoins Are the Quiet Killer App of Crypto",
    excerpt:
      "Beyond the noise of speculation, dollar-denominated stablecoins are quietly winning in payments, remittances, and FX.",
    body: `## The under-reported story

While headlines obsess over price action, the most important development in crypto over the past two years has been the explosive growth of **stablecoins**. Monthly transfer volumes now rival major card networks, and corridor pricing for international remittances has compressed dramatically.

## Why it matters

1. Dollar liquidity in regions where banking is broken
2. Programmable settlement for B2B flows
3. A bridge between TradFi and DeFi

Regulation is the open question. Clearer rules will accelerate enterprise adoption.`,
    cover:
      "https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=1600&q=80",
    category: "opinion",
    tags: ["stablecoins", "regulation"],
  },
  {
    title: "Solana Network Activity Hits New Highs as Memecoin Volume Spikes",
    excerpt:
      "Daily active addresses on Solana set a fresh record, with memecoin-driven trading volume dominating DEX activity.",
    body: `## Activity surge

Solana logged its highest-ever daily active addresses, propelled in part by a memecoin trading frenzy. DEX volume on the network briefly exceeded all Ethereum L2s combined.

## Validator economics

Network fees and priority fees are translating into real validator revenue, with stake yields edging up. The network has so far handled the load without major degradation.`,
    cover:
      "https://images.unsplash.com/photo-1639152201720-5e536d254d81?auto=format&fit=crop&w=1600&q=80",
    category: "crypto",
    tags: ["solana", "defi"],
  },
  {
    title: "BoJ Holds Rates, but Yen Bears Refuse to Back Off",
    excerpt:
      "Despite mounting intervention chatter, USD/JPY continues to grind higher as the rate differential remains punishing.",
    body: `## The setup

The Bank of Japan kept policy unchanged, with Governor Ueda striking a cautious tone on the timing of further normalization. USD/JPY responded by extending higher, retesting cycle highs.

## Intervention risk

Currency officials in Tokyo have signaled discomfort. Traders are watching for verbal escalation followed by potentially intervention if the pair pushes meaningfully through key psychological levels.

### Levels in focus

- 154.50: short-term resistance
- 155.00: psychological level + options pin risk
- 152.00: invalidation for short-term longs`,
    cover:
      "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1600&q=80",
    category: "forex",
    tags: ["central-banks", "yields"],
  },
  {
    title: "Earnings: Mega-Cap Tech Beats Expectations Across the Board",
    excerpt:
      "Cloud growth reaccelerated and AI capex guidance was raised, sending after-hours futures higher.",
    body: `## The print

Several mega-cap tech companies reported earnings this week, with **revenue and earnings beats** broad-based. Critically, **cloud growth reaccelerated** for the second straight quarter, and AI capex was raised guidance was raised.

## What it means for the market

The data validates the AI capex cycle thesis and supports continued earnings revisions higher across the sector. Index-level multiples have expanded but earnings growth is doing the heavy lifting.`,
    cover:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80",
    category: "stocks",
    tags: ["earnings", "ai", "nasdaq"],
  },
  {
    title: "Treasury Yields Pull Back as Auctions Find Solid Demand",
    excerpt:
      "The 10-year yield slipped below 4.40% after a well-bid 30-year auction tailed by less than a basis point.",
    body: `## A reassuring auction

The 30-year Treasury auction came in with a strong indirect bid, helping the entire curve rally. The 10-year yield slipped below **4.40%** for the first time in two weeks.

## Implications

- Mortgage rates may follow lower
- Risk assets benefit from lower discount rates
- Dollar pulled back modestly

Refunding announcements next quarter will be a key catalyst.`,
    cover:
      "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1600&q=80",
    category: "macro",
    tags: ["yields", "fed", "macro"],
  },
  {
    title: "Regulation Tracker: SEC Drops Investigation into Major Exchange",
    excerpt:
      "The agency closed a years-long probe without enforcement action, marking a meaningful shift in tone for the industry.",
    body: `## Closed without charges

The Securities and Exchange Commission notified a major US-based exchange that it has closed its investigation **without recommending enforcement action**. The notice marks one of the more significant tone shifts from the agency in recent memory.

## Industry takeaways

- Greater willingness to engage with registrants
- Possible signal on ETF-related staking questions
- More US-domiciled product launches likely`,
    cover:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80",
    category: "crypto",
    tags: ["regulation", "etf"],
  },
  {
    title: "Macro Outlook: Disinflation Resumes but Sticky Services Remain",
    excerpt:
      "Goods deflation is largely complete; the next leg of disinflation depends on rents and labor-intensive services.",
    body: `## The setup

Headline and core CPI both ticked lower this month, with **goods deflation** intact and **services moderation** finally showing through. The question is whether the latter is durable.

## Three drivers to watch

1. Owners' equivalent rent: structurally lagged but turning
2. Wage growth: cooling without breaking
3. Healthcare and insurance: the new sticky components

A return to the Fed's 2% target by mid next year remains plausible but not assured.`,
    cover:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    category: "macro",
    tags: ["inflation", "fed", "macro"],
  },
  {
    title: "DeFi TVL Climbs Back Above $100B as Restaking Narrative Persists",
    excerpt:
      "Restaking protocols and re-deposits into liquid staking tokens drove the total value locked figure to a multi-quarter high.",
    body: `## TVL reclaims six figures

DeFi total value locked climbed back above **$100 billion**, the highest reading since late 2022. The increase was driven primarily by restaking protocols and renewed deposits into liquid staking tokens.

## Risks to watch

- Smart contract risk in nested protocols
- Slashing exposure from restaked operators
- Concentration in a few dominant LSTs`,
    cover:
      "https://images.unsplash.com/photo-1639725895015-67a2b1a98042?auto=format&fit=crop&w=1600&q=80",
    category: "crypto",
    tags: ["defi", "ethereum"],
  },
  {
    title: "Technical: EUR/USD Coils Below 1.0900 With Bullish Bias",
    excerpt:
      "Price action shows successive higher lows since the recent base. A daily close above the 1.0905 swing high opens 1.0950.",
    body: `## Setup

EUR/USD has carved out a clean series of higher lows since basing earlier this month. The pair now coils just below the **1.0900** swing high, with momentum oscillators turning constructive.

## Trade plan

- Bias: bullish above 1.0820
- Trigger: daily close above 1.0905
- Target 1: 1.0950
- Target 2: 1.1015
- Invalidation: 1.0800`,
    cover:
      "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=1600&q=80",
    category: "analysis",
    tags: ["analysis", "central-banks"],
  },
  {
    title: "Opinion: The ETF Wave Is Just Getting Started",
    excerpt:
      "Spot bitcoin ETFs were a watershed moment. The next products in the pipeline will reshape allocations far beyond crypto.",
    body: `## Beyond bitcoin

Spot bitcoin ETFs accomplished the unimaginable: they made crypto allocations a routine line item in model portfolios. The next wave of products — covering staking, indexed exposure, and structured payoffs — will deepen that integration.

## What this means

For traditional asset managers, the question is no longer *if* but *how much*. The earlier you build infrastructure, the better positioned you are when allocations move from "alternatives" to "core."`,
    cover:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=80",
    category: "opinion",
    tags: ["etf", "bitcoin"],
  },
  {
    title: "Geopolitics: Election Cycles Set Up a Volatile Second Half",
    excerpt:
      "A historically dense calendar of consequential elections introduces a regime of policy uncertainty across major economies.",
    body: `## Crowded calendar

More than half the world's population lives in countries holding elections this year. Markets are bracing for **policy uncertainty** — fiscal, trade, and regulatory — to dominate narratives in the second half.

## Asset class implications

- FX: heightened intra-day volatility around event risk
- Rates: term premiums could rise modestly
- Equities: defensive sectors with pricing power preferred`,
    cover:
      "https://images.unsplash.com/photo-1593696954577-ab3d39317b97?auto=format&fit=crop&w=1600&q=80",
    category: "macro",
    tags: ["elections", "geopolitics", "macro"],
  },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function main() {
  console.log("Resetting data...");
  await prisma.auditLog.deleteMany();
  await prisma.savedArticle.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tickerConfig.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.authorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@marketpulse.local",
      name: "Alex Morgan",
      role: "ADMIN",
      passwordHash,
      authorProfile: {
        create: {
          slug: "alex-morgan",
          bio: "Editor-in-chief covering markets, macro, and crypto.",
          avatarUrl: "https://i.pravatar.cc/200?u=alex",
          twitter: "alexmorgan",
        },
      },
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: "editor@marketpulse.local",
      name: "Priya Shah",
      role: "EDITOR",
      passwordHash,
      authorProfile: {
        create: {
          slug: "priya-shah",
          bio: "Senior editor for forex and macro coverage.",
          avatarUrl: "https://i.pravatar.cc/200?u=priya",
          twitter: "priyashah",
        },
      },
    },
  });

  const author = await prisma.user.create({
    data: {
      email: "author@marketpulse.local",
      name: "Marcus Chen",
      role: "AUTHOR",
      passwordHash,
      authorProfile: {
        create: {
          slug: "marcus-chen",
          bio: "Reporter focused on crypto markets and DeFi.",
          avatarUrl: "https://i.pravatar.cc/200?u=marcus",
          twitter: "marcuschen",
        },
      },
    },
  });

  const reader = await prisma.user.create({
    data: {
      email: "reader@marketpulse.local",
      name: "Jamie Carter",
      role: "READER",
      passwordHash,
      preferences: {
        create: { topicsJson: JSON.stringify(["crypto", "macro"]), emailDigest: true, theme: "dark" },
      },
    },
  });

  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const created = await prisma.category.create({ data: c });
    categoryMap.set(c.slug, created.id);
  }

  console.log("Seeding tags...");
  const tagMap = new Map<string, string>();
  for (const t of TAGS) {
    const slug = slugify(t);
    const created = await prisma.tag.create({ data: { slug, name: t } });
    tagMap.set(slug, created.id);
  }

  console.log("Seeding tickers...");
  for (const t of TICKERS) {
    await prisma.tickerConfig.create({ data: t });
  }

  console.log("Seeding articles...");
  const authors = [admin.id, editor.id, author.id];
  for (let i = 0; i < ARTICLE_TEMPLATES.length; i++) {
    const a = ARTICLE_TEMPLATES[i];
    const slug = slugify(a.title);
    const authorId = authors[i % authors.length];
    const publishedAt = new Date(Date.now() - i * 6 * 60 * 60 * 1000);
    const article = await prisma.article.create({
      data: {
        slug,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        coverImageUrl: a.cover,
        status: "PUBLISHED",
        publishedAt,
        isFeatured: a.isFeatured ?? false,
        isBreaking: a.isBreaking ?? false,
        authorId,
        categoryId: categoryMap.get(a.category)!,
        views: Math.floor(Math.random() * 8000) + 200,
      },
    });
    for (const tagName of a.tags) {
      const slug = slugify(tagName);
      const tagId = tagMap.get(slug);
      if (tagId) {
        await prisma.articleTag.create({ data: { articleId: article.id, tagId } });
      }
    }
  }

  console.log("Seeding starter watchlist + saved...");
  await prisma.watchlist.createMany({
    data: [
      { userId: reader.id, symbol: "BTC", type: "CRYPTO" },
      { userId: reader.id, symbol: "ETH", type: "CRYPTO" },
      { userId: reader.id, symbol: "EURUSD", type: "FX" },
    ],
  });

  const firstArticle = await prisma.article.findFirst({ where: { status: "PUBLISHED" } });
  if (firstArticle) {
    await prisma.savedArticle.create({
      data: { userId: reader.id, articleId: firstArticle.id },
    });
  }

  console.log("Seeding newsletter subs + comments...");
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "demo1@example.com", confirmedAt: new Date() },
      { email: "demo2@example.com" },
    ],
  });

  if (firstArticle) {
    await prisma.comment.create({
      data: {
        articleId: firstArticle.id,
        userId: reader.id,
        body: "Great analysis — looking forward to follow-up coverage on flows.",
        status: "APPROVED",
      },
    });
    await prisma.comment.create({
      data: {
        articleId: firstArticle.id,
        userId: reader.id,
        body: "Curious what the desk is hearing about RIA suitability work.",
        status: "PENDING",
      },
    });
  }

  console.log("Done seeding.");
  console.log("Credentials (password = 'password123'):");
  console.log("  admin@marketpulse.local");
  console.log("  editor@marketpulse.local");
  console.log("  author@marketpulse.local");
  console.log("  reader@marketpulse.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
