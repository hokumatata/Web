import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const editorHash = await bcrypt.hash("editor123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@tradewave.io" },
    update: {},
    create: {
      email: "admin@tradewave.io",
      passwordHash: adminHash,
      name: "Sarah Chen",
      role: "ADMIN",
      authorProfile: {
        create: {
          slug: "sarah-chen",
          bio: "Editor-in-chief covering global macro and digital assets.",
          twitter: "@sarahchen",
        },
      },
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@tradewave.io" },
    update: {},
    create: {
      email: "editor@tradewave.io",
      passwordHash: editorHash,
      name: "Marcus Webb",
      role: "EDITOR",
      authorProfile: {
        create: {
          slug: "marcus-webb",
          bio: "Senior markets reporter with a focus on crypto and DeFi.",
          twitter: "@marcuswebb",
        },
      },
    },
  });

  const author1Hash = await bcrypt.hash("author123", 10);
  const author1 = await prisma.user.upsert({
    where: { email: "alex@tradewave.io" },
    update: {},
    create: {
      email: "alex@tradewave.io",
      passwordHash: author1Hash,
      name: "Alex Rivera",
      role: "AUTHOR",
      authorProfile: {
        create: {
          slug: "alex-rivera",
          bio: "FX and rates analyst covering G10 and emerging markets.",
        },
      },
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "crypto" }, update: {}, create: { slug: "crypto", name: "Crypto", description: "Digital assets, DeFi, and blockchain", order: 1 } }),
    prisma.category.upsert({ where: { slug: "forex" }, update: {}, create: { slug: "forex", name: "Forex", description: "Currency markets and central bank policy", order: 2 } }),
    prisma.category.upsert({ where: { slug: "stocks" }, update: {}, create: { slug: "stocks", name: "Stocks", description: "Equities, IPOs, and corporate earnings", order: 3 } }),
    prisma.category.upsert({ where: { slug: "macro" }, update: {}, create: { slug: "macro", name: "Macro", description: "Global economics, rates, and fiscal policy", order: 4 } }),
    prisma.category.upsert({ where: { slug: "analysis" }, update: {}, create: { slug: "analysis", name: "Analysis", description: "Deep dives and research notes", order: 5 } }),
    prisma.category.upsert({ where: { slug: "opinion" }, update: {}, create: { slug: "opinion", name: "Opinion", description: "Commentary and editorials", order: 6 } }),
  ]);

  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: "bitcoin" }, update: {}, create: { slug: "bitcoin", name: "Bitcoin" } }),
    prisma.tag.upsert({ where: { slug: "ethereum" }, update: {}, create: { slug: "ethereum", name: "Ethereum" } }),
    prisma.tag.upsert({ where: { slug: "defi" }, update: {}, create: { slug: "defi", name: "DeFi" } }),
    prisma.tag.upsert({ where: { slug: "fed" }, update: {}, create: { slug: "fed", name: "Federal Reserve" } }),
    prisma.tag.upsert({ where: { slug: "regulation" }, update: {}, create: { slug: "regulation", name: "Regulation" } }),
    prisma.tag.upsert({ where: { slug: "earnings" }, update: {}, create: { slug: "earnings", name: "Earnings" } }),
    prisma.tag.upsert({ where: { slug: "ai" }, update: {}, create: { slug: "ai", name: "AI" } }),
    prisma.tag.upsert({ where: { slug: "inflation" }, update: {}, create: { slug: "inflation", name: "Inflation" } }),
  ]);

  const [crypto, forex, stocks, macro, analysis, opinion] = categories;

  const articles = [
    {
      slug: "bitcoin-surges-past-70k-institutional-demand",
      title: "Bitcoin Surges Past $70K as Institutional Demand Hits Record",
      excerpt: "The world's largest cryptocurrency broke through the $70,000 barrier for the first time since March, driven by unprecedented ETF inflows and growing institutional adoption.",
      body: `# Bitcoin Surges Past $70K as Institutional Demand Hits Record

Bitcoin crossed the $70,000 mark on Tuesday, marking a significant milestone as institutional investors continue to pour capital into spot Bitcoin ETFs.

## Key Drivers

The rally was fueled by several factors:

- **ETF Inflows**: Spot Bitcoin ETFs saw over $900 million in net inflows on Monday alone, the highest single-day figure since launch
- **Halving Anticipation**: With the next halving event approaching, supply dynamics are tightening
- **Macro Tailwinds**: Expectations of Federal Reserve rate cuts are supporting risk assets broadly

## Market Impact

The move higher has pushed Bitcoin's market capitalization above $1.4 trillion, making it the 8th largest asset globally by market cap.

> "We're seeing a structural shift in how institutional allocators view Bitcoin," said a senior portfolio manager at a major asset management firm. "This isn't speculative froth — it's portfolio construction."

## Technical Outlook

From a technical standpoint, Bitcoin has broken above a key resistance level that had capped gains since March. The next major resistance sits at the all-time high of $73,800.

Trading volumes across major exchanges surged 45% compared to the 30-day average, suggesting strong conviction behind the move.

## What's Next

Analysts are watching several catalysts that could sustain the rally:

1. Upcoming Federal Reserve meeting and potential dovish pivot
2. Continued ETF demand from wealth management platforms
3. The Bitcoin halving, expected in April
4. Growing adoption in emerging markets`,
      coverImageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      isFeatured: true,
      isBreaking: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 30),
      authorId: admin.id,
      categoryId: crypto.id,
    },
    {
      slug: "fed-holds-rates-steady-signals-june-cut",
      title: "Fed Holds Rates Steady, Signals Potential June Cut as Inflation Cools",
      excerpt: "The Federal Reserve kept interest rates unchanged at its latest meeting but signaled growing confidence that inflation is moving sustainably toward 2%, opening the door for rate cuts.",
      body: `# Fed Holds Rates Steady, Signals Potential June Cut

The Federal Open Market Committee voted unanimously to maintain the federal funds rate at 5.25-5.50% on Wednesday, while updating its forward guidance to reflect progress on inflation.

## Key Takeaways

Chair Jerome Powell struck a notably dovish tone in his press conference:

- Inflation has made "considerable further progress" toward the 2% target
- The labor market remains strong but is coming into better balance
- The committee sees risks as "roughly balanced" between doing too much and too little

## Market Reaction

Markets rallied sharply following the announcement:

- **S&P 500**: +1.2% to close at 5,180
- **10Y Treasury**: Yield fell 8bp to 4.22%
- **Dollar Index**: Dropped 0.4% to 103.8
- **Gold**: Rose $22 to $2,065/oz

## Economic Projections

The updated Summary of Economic Projections showed:

1. Core PCE forecast lowered to 2.4% for 2024 (from 2.6%)
2. GDP growth estimate raised to 2.1% (from 1.8%)
3. Unemployment rate projection unchanged at 4.0%
4. Median dot plot still shows three rate cuts in 2024

> "The data has been encouraging," Powell said. "We want to see more good data, but we're not looking for great data."`,
      coverImageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      authorId: editor.id,
      categoryId: macro.id,
    },
    {
      slug: "ethereum-layer-2-scaling-milestone",
      title: "Ethereum Layer 2s Hit $40B TVL as Scaling Solutions Mature",
      excerpt: "Combined total value locked across Ethereum L2 networks has surpassed $40 billion, driven by Arbitrum, Optimism, and Base leading the charge in DeFi adoption.",
      body: `# Ethereum Layer 2s Hit $40B TVL

The Ethereum scaling ecosystem reached a significant milestone as combined TVL across Layer 2 networks surpassed $40 billion for the first time.

## L2 Landscape

The top networks by TVL:

- **Arbitrum**: $15.2B (+12% MoM)
- **Optimism**: $8.7B (+18% MoM)
- **Base**: $7.1B (+45% MoM)
- **zkSync Era**: $3.8B (+22% MoM)
- **Starknet**: $2.1B (+35% MoM)

## Growth Drivers

Several factors are contributing to the L2 boom:

1. **EIP-4844 (Proto-Danksharding)**: Transaction costs on L2s have dropped 90%+ since the Dencun upgrade
2. **DeFi Migration**: Major protocols are deploying on L2s, bringing liquidity with them
3. **User Experience**: Improved bridging and wallet support have lowered friction
4. **Incentive Programs**: Networks like Arbitrum and Optimism continue to distribute grants

## Impact on Ethereum

The growth of L2s is having a profound effect on the Ethereum ecosystem:

- Gas fees on L1 have stabilized at lower levels
- Ethereum's value proposition as a settlement layer is strengthening
- New applications that weren't viable on L1 are emerging on L2s

> "We're entering the era of abundant blockspace," noted a leading DeFi researcher.`,
      coverImageUrl: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      authorId: admin.id,
      categoryId: crypto.id,
    },
    {
      slug: "dollar-weakens-on-dovish-fed",
      title: "Dollar Index Falls to 3-Month Low on Dovish Fed Expectations",
      excerpt: "The U.S. dollar dropped against all G10 currencies as traders price in a more aggressive rate-cutting cycle from the Federal Reserve in 2024.",
      body: `# Dollar Index Falls to 3-Month Low

The DXY dollar index slid 0.8% to 103.2 on Thursday, its lowest level since January, as markets increasingly bet on Federal Reserve rate cuts.

## Currency Moves

Major pairs saw significant moves:

- **EUR/USD**: Rose to 1.0920, highest since February
- **GBP/USD**: Advanced to 1.2780, up 0.6%
- **USD/JPY**: Dropped to 148.50 as rate differential narrows
- **AUD/USD**: Climbed to 0.6620 on risk-on sentiment

## Positioning Data

CFTC data shows that speculative positioning in the dollar has shifted:

- Net long positions have been cut by 40% over the past month
- Leveraged funds are now net short EUR/USD for the first time since September
- Carry trade flows are rotating out of dollar-funded positions

## Outlook

Most major banks have revised their dollar forecasts lower for the rest of 2024, with the consensus pointing to further weakness as the Fed begins its easing cycle.`,
      coverImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      authorId: author1.id,
      categoryId: forex.id,
    },
    {
      slug: "nvidia-earnings-beat-ai-demand",
      title: "Nvidia Smashes Earnings Estimates as AI Chip Demand Outpaces Supply",
      excerpt: "Nvidia reported quarterly revenue of $22.1 billion, crushing Wall Street estimates by 15%, as demand for AI training hardware continues to accelerate across industries.",
      body: `# Nvidia Smashes Earnings Estimates

Nvidia reported fiscal Q4 results that exceeded even the most bullish expectations, with data center revenue more than tripling year-over-year.

## Headline Numbers

- **Revenue**: $22.1B vs. $20.4B expected (+265% YoY)
- **EPS**: $5.16 vs. $4.60 expected
- **Data Center**: $18.4B (+409% YoY)
- **Gross Margin**: 76.7%, up from 66.1% a year ago

## Key Highlights

CEO Jensen Huang called the quarter a "tipping point" for generative AI:

1. Every major cloud provider is expanding Nvidia GPU capacity
2. Enterprise adoption is accelerating beyond hyperscalers
3. The new Blackwell architecture is seeing "incredible" pre-order demand
4. Sovereign AI initiatives are driving demand from national governments

## Stock Reaction

Shares surged 12% in after-hours trading, adding roughly $250 billion in market capitalization and pushing Nvidia's valuation above $2 trillion.

## Analyst Takes

Wall Street analysts raised their price targets:

- Morgan Stanley: $850 → $1,000
- Goldman Sachs: $800 → $950
- JPMorgan: $750 → $900

> "Nvidia is not just a chip company anymore — it's the infrastructure backbone of the AI revolution," noted a senior tech analyst.`,
      coverImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      authorId: editor.id,
      categoryId: stocks.id,
    },
    {
      slug: "defi-total-value-locked-rebounds",
      title: "DeFi TVL Rebounds to $120B as Yield Farming Renaissance Begins",
      excerpt: "Decentralized finance protocols have seen a resurgence in activity, with total value locked climbing back above $120 billion as new yield opportunities emerge.",
      body: `# DeFi TVL Rebounds to $120B

The decentralized finance ecosystem is experiencing a renaissance, with TVL surging past $120 billion as innovative yield strategies attract capital back to on-chain protocols.

## Top Protocols

Leading the charge:

- **Lido**: $32.5B (liquid staking)
- **Aave**: $14.2B (lending)
- **MakerDAO**: $10.8B (stablecoin)
- **Uniswap**: $6.5B (DEX)
- **Eigen Layer**: $5.2B (restaking)

## New Trends

The current DeFi wave is characterized by:

1. **Restaking**: EigenLayer and similar protocols offer yields on already-staked assets
2. **Real World Assets**: Tokenized treasuries and private credit are bridging TradFi and DeFi
3. **Intent-Based Trading**: New DEX designs that optimize execution for traders
4. **Points Programs**: Protocols are incentivizing early adoption with points/airdrops

> "DeFi 2.0 is more mature, more institutional, and more connected to real-world financial flows," observed a DeFi analyst.`,
      coverImageUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
      authorId: admin.id,
      categoryId: crypto.id,
    },
    {
      slug: "global-inflation-slowing-central-banks",
      title: "Global Inflation Continues to Slow, Opening Door for Central Bank Pivots",
      excerpt: "Inflation readings across major economies are trending lower, with the ECB, Bank of England, and Bank of Canada all signaling potential rate cuts in the coming months.",
      body: `# Global Inflation Continues to Slow

The global disinflationary trend is gaining momentum, with multiple central banks now preparing to ease monetary policy after the most aggressive tightening cycle in decades.

## Regional Snapshot

- **Eurozone**: CPI fell to 2.4% YoY, approaching the ECB's 2% target
- **UK**: Headline CPI dropped to 3.2%, down from 4.0% in January
- **Canada**: Inflation at 2.8%, within the BoC's target range
- **Japan**: Core CPI at 2.8%, still above the BoJ's target

## Central Bank Signals

- **ECB**: President Lagarde said the bank is "data-dependent but confident"
- **Bank of England**: Two MPC members voted for a cut in March
- **Bank of Canada**: Governor Macklem said a June cut is "within the realm of discussion"
- **Fed**: Signaling potential June cut pending more data

## Implications for Markets

The synchronized easing cycle has significant implications:

1. Bond yields are likely to decline further
2. Risk assets should benefit from lower rates
3. Currency markets may see increased volatility
4. Emerging markets could see capital inflows`,
      coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      authorId: author1.id,
      categoryId: macro.id,
    },
    {
      slug: "sec-crypto-regulation-framework",
      title: "SEC Unveils Comprehensive Crypto Regulatory Framework",
      excerpt: "The Securities and Exchange Commission has proposed a new regulatory framework that would provide clearer guidelines for digital asset classification and exchange registration.",
      body: `# SEC Unveils Comprehensive Crypto Regulatory Framework

The SEC released a 200-page proposal on Monday outlining a comprehensive regulatory framework for digital assets, marking the most significant step toward crypto regulation in U.S. history.

## Key Provisions

The framework introduces several notable elements:

1. **Token Classification**: A new test for determining whether a digital asset is a security, commodity, or utility token
2. **Exchange Registration**: Streamlined registration process for crypto exchanges
3. **Custody Standards**: Clear custody requirements for institutions holding digital assets
4. **Stablecoin Rules**: New reserve and audit requirements for stablecoin issuers

## Industry Reaction

The crypto industry response has been cautiously optimistic:

> "This is what we've been asking for — clear rules of the road," said a leading crypto exchange CEO. "While we need to review the details, the direction is positive."

## Market Impact

- Bitcoin rose 3% on the announcement
- Coinbase stock jumped 8%
- Total crypto market cap increased by $50 billion

## Timeline

The SEC has opened a 90-day public comment period, with final rules expected by year-end.`,
      coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
      authorId: editor.id,
      categoryId: crypto.id,
    },
    {
      slug: "yen-carry-trade-unwind-risks",
      title: "Yen Carry Trade Faces Unwinding Risk as BOJ Hints at Rate Hikes",
      excerpt: "The Bank of Japan's shifting stance on negative interest rates is creating concerns about a potential unwinding of the massive yen carry trade.",
      body: `# Yen Carry Trade Faces Unwinding Risk

The Bank of Japan's increasingly hawkish signals are raising alarms about the potential for a disorderly unwinding of the yen carry trade, one of the largest leveraged positions in global markets.

## The Scale of the Trade

- Estimated $4-5 trillion in yen-funded carry positions globally
- Hedge funds and institutional investors have been short yen for years
- The trade has been profitable due to Japan's ultra-low rates

## BOJ Signals

Governor Ueda has indicated that conditions for ending negative rates are "gradually being fulfilled":

- Wage growth has hit 5.3%, the strongest in 30 years
- Core inflation has been above 2% for 22 consecutive months
- The output gap has turned positive

## Risk Scenarios

A rapid yen appreciation could trigger:

1. Forced unwinding of carry positions
2. Volatility spillover to equity and credit markets
3. Stress in emerging market currencies
4. Risk-off cascading across asset classes

> "The yen carry trade unwind is the single biggest risk in global markets right now," warned a macro strategist.`,
      coverImageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 16),
      authorId: author1.id,
      categoryId: forex.id,
    },
    {
      slug: "ai-stocks-bubble-or-revolution",
      title: "AI Stocks: Bubble or Revolution? The Case for Both Sides",
      excerpt: "As AI-related stocks continue their meteoric rise, analysts are divided on whether current valuations are justified by fundamentals or driven by speculative excess.",
      body: `# AI Stocks: Bubble or Revolution?

The AI trade has been the dominant theme in equity markets, with the "Magnificent Seven" tech stocks adding trillions in market cap. But is it justified?

## The Bull Case

Proponents argue this is a genuine technological revolution:

- AI is already generating measurable revenue and productivity gains
- Enterprise adoption is in early innings
- Total addressable market for AI infrastructure is estimated at $1 trillion+
- Historical parallels to early internet suggest we're still early

## The Bear Case

Skeptics point to concerning parallels with previous bubbles:

- Many AI stocks trade at 30-50x forward earnings
- Revenue growth expectations may be overly optimistic
- Concentration risk — the top 7 stocks represent 30% of the S&P 500
- History shows that most early leaders in new technologies don't maintain dominance

## The Data

Looking at fundamentals:

| Company | P/E (Forward) | Revenue Growth | AI Revenue % |
|---------|--------------|----------------|-------------|
| NVDA | 35x | +265% | 85% |
| MSFT | 32x | +18% | 15% |
| GOOGL | 24x | +13% | 20% |
| META | 22x | +25% | 30% |

## Verdict

The truth likely lies somewhere in between. AI is a genuine paradigm shift, but some individual stock valuations have gotten ahead of fundamentals.`,
      coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
      authorId: editor.id,
      categoryId: analysis.id,
    },
    {
      slug: "emerging-markets-outlook-2024",
      title: "Emerging Markets Set for Breakout Year as Dollar Weakens",
      excerpt: "A weaker dollar, falling global rates, and improving fundamentals are creating ideal conditions for emerging market assets to outperform in 2024.",
      body: `# Emerging Markets Set for Breakout Year

After years of underperformance, emerging market assets are poised for a significant recovery driven by macro tailwinds.

## Favorable Conditions

Several factors are aligning:

1. **Dollar Weakness**: A declining DXY typically boosts EM assets
2. **Rate Cuts**: Global easing cycle benefits EM bonds and currencies
3. **Commodity Prices**: Elevated commodities support EM exporters
4. **Valuations**: EM equities trade at a 40% discount to developed markets

## Regional Picks

- **India**: Structural growth story with 7%+ GDP growth
- **Brazil**: Rate cuts underway, Bovespa at all-time highs
- **Mexico**: Nearshoring boom driving FDI and manufacturing
- **Indonesia**: Commodity exports and demographic dividend

## Risks to Watch

- Geopolitical tensions (China-Taiwan, Middle East)
- US election uncertainty
- China property sector contagion
- Commodity price volatility`,
      coverImageUrl: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      authorId: author1.id,
      categoryId: analysis.id,
    },
    {
      slug: "crypto-regulation-will-define-next-cycle",
      title: "Opinion: Regulatory Clarity Will Define the Next Crypto Cycle",
      excerpt: "The industry's maturation depends less on price action and more on the regulatory frameworks being built today. Here's why that matters for every investor.",
      body: `# Regulatory Clarity Will Define the Next Crypto Cycle

The crypto industry stands at an inflection point. While much of the conversation focuses on price, the real story is the regulatory infrastructure being built worldwide.

## The Shift

We've moved from a period of regulatory ambiguity to one of active framework development:

- The EU's MiCA regulation is now in effect
- The US is moving toward comprehensive crypto legislation
- Singapore and Hong Kong are competing to be Asia's crypto hub
- The UAE has established a dedicated virtual asset regulatory authority

## Why It Matters

Clear regulations will:

1. Unlock institutional capital currently sitting on the sidelines
2. Reduce the risk premium on digital assets
3. Enable new financial products (ETFs, structured products)
4. Create a level playing field for compliant operators

## The Risk

The danger lies in fragmented regulation. If major jurisdictions take divergent approaches, we could see regulatory arbitrage that undermines the goal of investor protection.

## My Take

The next bull cycle will be built on institutional adoption, and institutional adoption requires regulatory clarity. The projects and jurisdictions that get this right will be the winners of the next decade.`,
      coverImageUrl: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 22),
      authorId: admin.id,
      categoryId: opinion.id,
    },
    {
      slug: "apple-record-buyback-dividend",
      title: "Apple Announces Record $110B Buyback, Raises Dividend 4%",
      excerpt: "Apple unveiled its largest-ever share repurchase program alongside an earnings beat, signaling confidence in its long-term AI strategy despite a decline in China sales.",
      body: `# Apple Announces Record $110B Buyback

Apple reported fiscal Q2 results that topped expectations and announced a record $110 billion share buyback program, the largest in corporate history.

## Results Highlights

- **Revenue**: $90.8B vs. $90.0B expected (-4% YoY)
- **EPS**: $1.53 vs. $1.50 expected
- **iPhone**: $45.9B (-10% YoY, China weakness)
- **Services**: $23.9B (+14% YoY, record)
- **Mac**: $7.5B (+4% YoY)

## Capital Return

- $110 billion share repurchase authorization (record)
- Quarterly dividend raised 4% to $0.26/share
- The company has returned over $700B to shareholders since 2012

## AI Strategy

CEO Tim Cook provided the most detailed AI roadmap yet:

1. On-device AI processing with custom silicon
2. Generative AI features coming to iOS 18
3. Partnership with a major AI lab for cloud capabilities
4. Focus on privacy-preserving AI

> "We believe we have advantages that will differentiate us in AI," Cook said on the earnings call.`,
      coverImageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      authorId: editor.id,
      categoryId: stocks.id,
    },
    {
      slug: "solana-meme-coin-trading-volumes",
      title: "Solana Meme Coin Mania Drives Record DEX Volumes",
      excerpt: "Solana-based decentralized exchanges are processing over $3 billion in daily volume as a new wave of meme coin trading captures retail attention.",
      body: `# Solana Meme Coin Mania Drives Record DEX Volumes

Solana's DEX ecosystem is experiencing unprecedented activity as meme coin trading volumes have surged, pushing the network's decentralized exchanges to new highs.

## By the Numbers

- **Daily DEX Volume**: $3.2B (surpassing Ethereum for 5 consecutive days)
- **Raydium Volume**: $1.8B daily
- **Jupiter Aggregator**: Processing 2M+ transactions daily
- **New Token Launches**: 500+ per day on pump.fun

## The Meme Coin Phenomenon

The current wave is different from previous meme coin cycles:

1. **Lower barriers**: Token launch platforms make creation trivial
2. **Social media integration**: TikTok and Twitter are driving discovery
3. **Community-first**: Projects build communities before products
4. **Speed**: Solana's fast finality enables rapid trading

## Network Impact

The surge in activity has had mixed effects on Solana:

- SOL price has benefited from increased network usage
- Transaction fees have spiked periodically
- Some congestion issues during peak activity
- Validator revenue has increased significantly

## Risks

- Most meme coins will go to zero
- Regulatory scrutiny is increasing
- Network congestion could worsen
- Rug pulls remain a significant risk`,
      coverImageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=630&fit=crop",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
      authorId: admin.id,
      categoryId: crypto.id,
    },
  ];

  for (const data of articles) {
    const existing = await prisma.article.findUnique({ where: { slug: data.slug } });
    if (!existing) {
      await prisma.article.create({ data });
    }
  }

  const tagMap: Record<string, string[]> = {
    "bitcoin-surges-past-70k-institutional-demand": ["bitcoin"],
    "ethereum-layer-2-scaling-milestone": ["ethereum", "defi"],
    "fed-holds-rates-steady-signals-june-cut": ["fed", "inflation"],
    "sec-crypto-regulation-framework": ["regulation", "bitcoin"],
    "nvidia-earnings-beat-ai-demand": ["earnings", "ai"],
    "defi-total-value-locked-rebounds": ["defi", "ethereum"],
    "ai-stocks-bubble-or-revolution": ["ai", "earnings"],
    "solana-meme-coin-trading-volumes": ["defi"],
  };

  for (const [articleSlug, tagSlugs] of Object.entries(tagMap)) {
    const article = await prisma.article.findUnique({ where: { slug: articleSlug } });
    if (!article) continue;
    for (const tagSlug of tagSlugs) {
      const tag = tags.find((t) => t.slug === tagSlug);
      if (!tag) continue;
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
        update: {},
        create: { articleId: article.id, tagId: tag.id },
      });
    }
  }

  console.log("Seed completed successfully!");
  console.log(`Created ${articles.length} articles, ${categories.length} categories, ${tags.length} tags`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
