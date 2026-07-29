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
 * Feeds are configurable via the SOURCE_RSS_FEEDS env var:
 *   SOURCE_RSS_FEEDS="CoinGape|https://coingape.com/feed/,FXStreet|https://www.fxstreet.com/rss/news"
 * When unset, DEFAULT_FEEDS below are used.
 */

export interface Feed {
  source: string;
  url: string;
}

export interface FeedItem {
  source: string;
  title: string;
  link: string;
  summary: string;
  publishedAt: Date | null;
}

/**
 * Public RSS/Atom feeds usable by a server-side fetch.
 *
 * Note: FXStreet and Bloomberg are intentionally absent — FXStreet's feed is
 * behind a Cloudflare bot challenge (403 to servers) and Bloomberg has no free
 * feed and is paywalled. ForexLive is used for the forex slot instead; override
 * with SOURCE_RSS_FEEDS if you have access to other feeds.
 */
export const DEFAULT_FEEDS: Feed[] = [
  { source: "CoinGape", url: "https://coingape.com/feed/" },
  { source: "ForexLive", url: "https://www.forexlive.com/feed/" },
  { source: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex" },
];

export function getConfiguredFeeds(): Feed[] {
  const raw = process.env.SOURCE_RSS_FEEDS?.trim();
  if (!raw) return DEFAULT_FEEDS;

  const feeds = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [source, url] = entry.split("|").map((s) => s.trim());
      return { source, url };
    })
    .filter((f): f is Feed => Boolean(f.source && f.url && /^https?:\/\//.test(f.url)));

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
  const raw = firstMatch(block, "pubDate") ?? firstMatch(block, "published") ?? firstMatch(block, "updated");
  if (!raw) return null;
  const d = new Date(clean(raw));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Parse an RSS 2.0 or Atom feed document into normalized items. */
export function parseFeed(xml: string, source: string): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const items: FeedItem[] = [];

  for (const block of blocks) {
    const title = clean(firstMatch(block, "title"));
    const link = extractLink(block);
    const summary = clean(
      firstMatch(block, "description") ?? firstMatch(block, "summary") ?? firstMatch(block, "content")
    );
    if (!title || !link) continue;
    items.push({ source, title, link, summary, publishedAt: parseDate(block) });
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
    return parseFeed(xml, feed.source);
  } catch {
    return [];
  }
}
