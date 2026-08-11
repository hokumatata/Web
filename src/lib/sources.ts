/**
 * Lightweight, dependency-free RSS/Atom ingestion for the scheduled
 * article-drafting automation.
 *
 * Publications (CoinGape, FXStreet, Yahoo Finance, ...) are used only as
 * *signals / inspiration*: we read their public feed headlines and short
 * summaries — never full article bodies — and hand those to the model as
 * source material to write an ORIGINAL, house-style piece with attribution.
 * Everything the automation produces is saved as DRAFT for human review.
 *
 * Feeds are configurable via the SOURCE_RSS_FEEDS env var, as a comma-separated
 * list of `Source|url` or `Source|url|beat` entries:
 *   SOURCE_RSS_FEEDS="CoinGape|https://coingape.com/feed/|crypto,Kitco|https://…|commodities"
 * When unset, DEFAULT_FEEDS below are used. Overrides cannot declare a feed
 * primary: first-party status is a property of the publisher, not of config.
 */

/** Coverage area, used to spread each run's output across the site. */
export const BEATS = ["forex", "crypto", "commodities", "equities", "macro"] as const;

export type Beat = (typeof BEATS)[number];

export interface Feed {
  source: string;
  url: string;
  /** Which beat this feed mostly serves. Defaults to "macro" when unset. */
  beat?: Beat;
  /**
   * The publisher IS the newsmaker (a central bank, a statistical agency), so
   * its items are first-party statements rather than second-hand reporting.
   */
  primary?: boolean;
}

export interface FeedItem {
  source: string;
  title: string;
  link: string;
  summary: string;
  publishedAt: Date | null;
  beat: Beat;
  /** True when the publisher is the newsmaker — see Feed.primary. */
  primary: boolean;
}

/**
 * Public RSS/Atom feeds usable by a server-side fetch. Every URL here was
 * verified to return a parseable feed to a server-side request.
 *
 * The mix is deliberate. Two kinds of source matter beyond plain headlines:
 *  - **Analyst commentary** (ActionForex republishes bank research notes) gives
 *    the writer institutional views to cite, which is what separates a
 *    professional markets piece from a paraphrased headline.
 *  - **Primary sources** (Fed/ECB/BoE press releases) are authoritative and
 *    carry no attribution debt to another publication.
 *
 * Breadth also matters for clustering: several outlets covering one event lets
 * src/lib/cluster.ts merge them into a single synthesised story, so more feeds
 * means better articles rather than more articles.
 *
 * Note: FXStreet and Bloomberg are intentionally absent — FXStreet's feed is
 * behind a Cloudflare bot challenge (403 to servers, re-verified) and Bloomberg
 * has no free feed. Override the whole set with SOURCE_RSS_FEEDS.
 */
export const DEFAULT_FEEDS: Feed[] = [
  // Analyst / desk commentary
  { source: "ActionForex", url: "https://www.actionforex.com/feed/", beat: "forex" },
  { source: "ForexLive", url: "https://www.forexlive.com/feed/", beat: "forex" },
  { source: "FX Empire", url: "https://www.fxempire.com/api/v1/en/articles/rss/news", beat: "forex" },
  { source: "Investing.com Forex", url: "https://www.investing.com/rss/news_1.rss", beat: "forex" },
  // Commodities — gold, silver, oil
  { source: "Investing.com Commodities", url: "https://www.investing.com/rss/news_11.rss", beat: "commodities" },
  { source: "OilPrice", url: "https://oilprice.com/rss/main", beat: "commodities" },
  // Equities
  { source: "Investing.com Stocks", url: "https://www.investing.com/rss/news_25.rss", beat: "equities" },
  { source: "CNBC Markets", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", beat: "equities" },
  { source: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", beat: "equities" },
  { source: "Seeking Alpha", url: "https://seekingalpha.com/market_currents.xml", beat: "equities" },
  { source: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", beat: "equities" },
  // Crypto
  { source: "CoinGape", url: "https://coingape.com/feed/", beat: "crypto" },
  { source: "Cointelegraph", url: "https://cointelegraph.com/rss", beat: "crypto" },
  { source: "Decrypt", url: "https://decrypt.co/feed", beat: "crypto" },
  { source: "The Block", url: "https://www.theblock.co/rss.xml", beat: "crypto" },
  // Macro news
  { source: "Investing.com Economy", url: "https://www.investing.com/rss/news_14.rss", beat: "macro" },
  { source: "CNBC Economy", url: "https://www.cnbc.com/id/20910258/device/rss/rss.html", beat: "macro" },
  // Primary sources — central banks and statistical agencies
  { source: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml", beat: "macro", primary: true },
  { source: "ECB", url: "https://www.ecb.europa.eu/rss/press.html", beat: "macro", primary: true },
  { source: "Bank of England", url: "https://www.bankofengland.co.uk/rss/news", beat: "macro", primary: true },
  { source: "Bank of Japan", url: "https://www.boj.or.jp/en/rss/whatsnew.xml", beat: "macro", primary: true },
  { source: "RBA", url: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml", beat: "macro", primary: true },
  { source: "Bank of Canada", url: "https://www.bankofcanada.ca/content_type/press-releases/feed/", beat: "macro", primary: true },
  { source: "BLS", url: "https://www.bls.gov/feed/bls_latest.rss", beat: "macro", primary: true },
  { source: "BEA", url: "https://apps.bea.gov/rss/rss.xml", beat: "macro", primary: true },
];

/** Outlets whose items are first-party statements rather than reporting. */
const PRIMARY_SOURCES = new Set(
  DEFAULT_FEEDS.filter((f) => f.primary).map((f) => f.source.toLowerCase())
);

/**
 * True when an item comes straight from the institution that made the news —
 * a central bank statement or a statistical agency release. Such an item is
 * self-confirming: there is no more authoritative account of it to wait for.
 */
export function isPrimarySource(source: string): boolean {
  return PRIMARY_SOURCES.has(source.toLowerCase());
}

export function getConfiguredFeeds(): Feed[] {
  const raw = process.env.SOURCE_RSS_FEEDS?.trim();
  if (!raw) return DEFAULT_FEEDS;

  const feeds = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry): Feed => {
      const [source, url, beat] = entry.split("|").map((s) => s.trim());
      return {
        source,
        url,
        beat: BEATS.includes(beat as Beat) ? (beat as Beat) : undefined,
      };
    })
    .filter((f) => Boolean(f.source && f.url && /^https?:\/\//.test(f.url)));

  return feeds.length > 0 ? feeds : DEFAULT_FEEDS;
}

function decodeEntities(input: string): string {
  return input
    // Numeric character references: &#8220; and &#x201C;
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeFromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeFromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function safeFromCodePoint(code: number): string {
  try {
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  } catch {
    return "";
  }
}

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, " ");
}

/** Extract, un-CDATA, strip HTML, decode entities, and collapse whitespace. */
function clean(raw: string | null | undefined): string {
  if (!raw) return "";
  const uncdata = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  return decodeEntities(stripTags(uncdata)).replace(/\s+/g, " ").trim();
}

function firstMatch(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : null;
}

function extractLink(block: string): string {
  // RSS: <link>https://...</link>
  const rss = firstMatch(block, "link");
  if (rss && rss.trim()) return clean(rss);
  // Atom: <link href="https://..." /> (prefer rel="alternate" or no rel)
  const atom =
    block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) ??
    block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return atom ? atom[1].trim() : "";
}

function parseDate(block: string): Date | null {
  // dc:date covers RSS 1.0/RDF feeds (the RBA and Bank of Canada publish those);
  // without it their items arrive undated and get judged on other signals only,
  // which matters because the breaking lane refuses to touch an undated item.
  const raw =
    firstMatch(block, "pubDate") ??
    firstMatch(block, "published") ??
    firstMatch(block, "dc:date") ??
    firstMatch(block, "updated");
  if (!raw) return null;
  const d = new Date(clean(raw));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Parse an RSS 2.0, RSS 1.0 or Atom feed document into normalized items. */
export function parseFeed(xml: string, feed: Feed): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const items: FeedItem[] = [];

  for (const block of blocks) {
    const title = clean(firstMatch(block, "title"));
    const link = extractLink(block);
    const summary = clean(
      firstMatch(block, "description") ?? firstMatch(block, "summary") ?? firstMatch(block, "content")
    );
    if (!title || !link) continue;
    items.push({
      source: feed.source,
      title,
      link,
      summary,
      publishedAt: parseDate(block),
      beat: feed.beat ?? "macro",
      primary: feed.primary === true,
    });
  }

  return items;
}

/** Fetch and parse a single feed. Returns [] on any network/parse failure. */
export async function fetchFeedItems(feed: Feed, timeoutMs = 10_000): Promise<FeedItem[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "User-Agent": "TheForexRepublic-Bot/1.0 (+https://theforexrepublic.com)" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeed(xml, feed);
  } catch {
    return [];
  }
}
