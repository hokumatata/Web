/**
 * Deterministic technical analysis, computed in code from real market data.
 *
 * The model is never asked to work out a moving average or invent a support
 * level. We fetch real daily candles, compute the indicators here, and hand the
 * result to the prompt as a closed list of facts with an instruction that no
 * other number may appear in the technical section. That makes fabricated
 * support/resistance structurally impossible rather than merely discouraged,
 * which is the precondition for running a daily price-forecast series unattended.
 *
 * Data source is the same keyless Yahoo Finance chart endpoint already used by
 * src/lib/markets.ts, so this adds no new credentials or vendors.
 */

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Instrument {
  /** Our slug, used in article requests and the series config. */
  slug: string;
  /** Display name used in headlines and prose. */
  label: string;
  /** Yahoo Finance symbol. */
  ySymbol: string;
  /** Decimal places when formatting levels. */
  precision: number;
  /** Default category for articles about this instrument. */
  categorySlug: string;
}

/** Instruments the newsroom can run a chart-led piece on. */
export const INSTRUMENTS: Instrument[] = [
  { slug: "eurusd", label: "EUR/USD", ySymbol: "EURUSD=X", precision: 4, categorySlug: "forex" },
  { slug: "gbpusd", label: "GBP/USD", ySymbol: "GBPUSD=X", precision: 4, categorySlug: "forex" },
  { slug: "usdjpy", label: "USD/JPY", ySymbol: "USDJPY=X", precision: 2, categorySlug: "forex" },
  { slug: "audusd", label: "AUD/USD", ySymbol: "AUDUSD=X", precision: 4, categorySlug: "forex" },
  { slug: "usdcad", label: "USD/CAD", ySymbol: "USDCAD=X", precision: 4, categorySlug: "forex" },
  { slug: "dxy", label: "US Dollar Index", ySymbol: "DX-Y.NYB", precision: 2, categorySlug: "forex" },
  { slug: "xauusd", label: "Gold", ySymbol: "GC=F", precision: 2, categorySlug: "gold" },
  { slug: "xagusd", label: "Silver", ySymbol: "SI=F", precision: 2, categorySlug: "gold" },
  { slug: "wti", label: "WTI Crude Oil", ySymbol: "CL=F", precision: 2, categorySlug: "macro" },
  { slug: "btcusd", label: "Bitcoin", ySymbol: "BTC-USD", precision: 0, categorySlug: "crypto" },
  { slug: "ethusd", label: "Ethereum", ySymbol: "ETH-USD", precision: 0, categorySlug: "crypto" },
  { slug: "solusd", label: "Solana", ySymbol: "SOL-USD", precision: 2, categorySlug: "crypto" },
  { slug: "spx", label: "S&P 500", ySymbol: "^GSPC", precision: 2, categorySlug: "stocks" },
  { slug: "ndx", label: "Nasdaq Composite", ySymbol: "^IXIC", precision: 2, categorySlug: "stocks" },
];

export function findInstrument(slug: string): Instrument | undefined {
  const needle = slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return INSTRUMENTS.find((i) => i.slug === needle);
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
        }>;
      };
    }>;
  };
}

/**
 * Fetch daily candles for an instrument. Returns oldest-first, with incomplete
 * rows (Yahoo pads gaps with nulls) dropped.
 */
export async function fetchDailyCandles(
  instrument: Instrument,
  range = "6mo",
  timeoutMs = 10_000
): Promise<Candle[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      instrument.ySymbol
    )}?range=${range}&interval=1d`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`yahoo ${res.status}`);
    const json = (await res.json()) as YahooChartResponse;
    const result = json.chart?.result?.[0];
    const q = result?.indicators?.quote?.[0];
    const times = result?.timestamp;
    if (!q || !times) throw new Error("yahoo: no candle data");

    const candles: Candle[] = [];
    for (let i = 0; i < times.length; i++) {
      const open = q.open?.[i];
      const high = q.high?.[i];
      const low = q.low?.[i];
      const close = q.close?.[i];
      if (
        typeof open !== "number" ||
        typeof high !== "number" ||
        typeof low !== "number" ||
        typeof close !== "number"
      ) {
        continue;
      }
      candles.push({ time: times[i] * 1000, open, high, low, close });
    }
    if (candles.length < 30) throw new Error("yahoo: not enough candles");
    return candles;
  } finally {
    clearTimeout(timer);
  }
}

/** Exponential moving average of the final value in the series. */
export function ema(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  // Seed with the SMA of the first `period` values, then walk forward.
  let acc = values.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (let i = period; i < values.length; i++) {
    acc = values[i] * k + acc * (1 - k);
  }
  return acc;
}

/** Wilder-smoothed RSI of the final value in the series. */
export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null;

  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** A named price level the article is permitted to cite. */
export interface Level {
  label: string;
  value: number;
}

export interface TechnicalSnapshot {
  instrument: Instrument;
  /** Latest close. */
  price: number;
  /** Percent change versus the prior daily close. */
  changePct: number;
  asOf: Date;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  rsi14: number | null;
  priorDayHigh: number;
  priorDayLow: number;
  priorDayClose: number;
  /** Levels below the current price, nearest first. */
  supports: Level[];
  /** Levels above the current price, nearest first. */
  resistances: Level[];
  /** Plain-language trend read derived from price versus the moving averages. */
  trend: string;
}

function swing(candles: Candle[], lookback: number, kind: "high" | "low"): Level | null {
  const window = candles.slice(-lookback);
  if (window.length === 0) return null;
  const value =
    kind === "high"
      ? Math.max(...window.map((c) => c.high))
      : Math.min(...window.map((c) => c.low));
  return { label: `${lookback}-day ${kind}`, value };
}

/**
 * Compute the full indicator set for an instrument from real candles. Every
 * value returned is derived arithmetically from market data — nothing here is
 * estimated or model-generated.
 */
export async function computeTechnicals(instrument: Instrument): Promise<TechnicalSnapshot> {
  const candles = await fetchDailyCandles(instrument);
  const closes = candles.map((c) => c.close);

  const last = candles[candles.length - 1];
  const prior = candles[candles.length - 2];
  const price = last.close;

  const e20 = ema(closes, 20);
  const e50 = ema(closes, 50);
  const e200 = ema(closes, 200);
  const r14 = rsi(closes, 14);

  const candidates: Level[] = [
    { label: "prior daily low", value: prior.low },
    { label: "prior daily high", value: prior.high },
    { label: "prior daily close", value: prior.close },
  ];
  if (e20 !== null) candidates.push({ label: "20-day EMA", value: e20 });
  if (e50 !== null) candidates.push({ label: "50-day EMA", value: e50 });
  if (e200 !== null) candidates.push({ label: "200-day EMA", value: e200 });
  for (const lookback of [20, 60, 120]) {
    const hi = swing(candles, lookback, "high");
    const lo = swing(candles, lookback, "low");
    if (hi) candidates.push(hi);
    if (lo) candidates.push(lo);
  }

  // Split around spot and order by distance, so the article can walk outwards.
  const supports = candidates
    .filter((l) => l.value < price)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
  const resistances = candidates
    .filter((l) => l.value > price)
    .sort((a, b) => a.value - b.value)
    .slice(0, 4);

  const above20 = e20 !== null && price > e20;
  const above50 = e50 !== null && price > e50;
  let trend: string;
  if (above20 && above50) trend = "constructive — price is above both the 20- and 50-day EMAs";
  else if (!above20 && !above50) trend = "bearish — price is below both the 20- and 50-day EMAs";
  else if (above20) trend = "recovering — price has reclaimed the 20-day EMA but is still below the 50-day";
  else trend = "corrective — price has slipped under the 20-day EMA while holding above the 50-day";

  return {
    instrument,
    price,
    changePct: prior.close ? ((price - prior.close) / prior.close) * 100 : 0,
    asOf: new Date(last.time),
    ema20: e20,
    ema50: e50,
    ema200: e200,
    rsi14: r14,
    priorDayHigh: prior.high,
    priorDayLow: prior.low,
    priorDayClose: prior.close,
    supports,
    resistances,
    trend,
  };
}

function fmt(value: number, precision: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

/**
 * Render a snapshot as the closed fact block handed to the model. The wording is
 * deliberately emphatic about the constraint: this list is the only source of
 * numbers the technical section may use.
 */
export function formatTechnicalBlock(snap: TechnicalSnapshot): string {
  const p = snap.instrument.precision;
  const lines: string[] = [
    `Instrument: ${snap.instrument.label}`,
    `Last price: ${fmt(snap.price, p)}`,
    `Change vs prior close: ${snap.changePct >= 0 ? "+" : ""}${snap.changePct.toFixed(2)}%`,
    `Data as of: ${snap.asOf.toISOString().slice(0, 10)} daily close`,
    `Trend read: ${snap.trend}`,
  ];

  if (snap.rsi14 !== null) lines.push(`RSI (14, daily): ${snap.rsi14.toFixed(1)}`);
  if (snap.ema20 !== null) lines.push(`20-day EMA: ${fmt(snap.ema20, p)}`);
  if (snap.ema50 !== null) lines.push(`50-day EMA: ${fmt(snap.ema50, p)}`);
  if (snap.ema200 !== null) lines.push(`200-day EMA: ${fmt(snap.ema200, p)}`);

  lines.push(
    `Prior session — high ${fmt(snap.priorDayHigh, p)}, low ${fmt(snap.priorDayLow, p)}, close ${fmt(snap.priorDayClose, p)}`
  );

  if (snap.supports.length > 0) {
    lines.push(
      `Support levels below spot (nearest first): ${snap.supports
        .map((l) => `${fmt(l.value, p)} (${l.label})`)
        .join(", ")}`
    );
  }
  if (snap.resistances.length > 0) {
    lines.push(
      `Resistance levels above spot (nearest first): ${snap.resistances
        .map((l) => `${fmt(l.value, p)} (${l.label})`)
        .join(", ")}`
    );
  }

  return `COMPUTED TECHNICAL DATA (authoritative — these figures were calculated from real market data)\n${lines
    .map((l) => `- ${l}`)
    .join("\n")}\n\nYou may cite ONLY the numbers listed above in the technical section. Do not round them differently, do not interpolate between them, and do not introduce any other price level.`;
}

/**
 * Verify that every price level quoted in the article actually came from the
 * computed snapshot. Catches the one failure mode that matters most in a
 * chart-led piece: a plausible-looking support level the model made up.
 *
 * Deliberately conservative — it only inspects numbers in the plausible price
 * range for the instrument and ignores percentages, so it reports few false
 * positives and is safe to surface directly to a human reviewer.
 */
export function findUnsupportedLevels(body: string, snap: TechnicalSnapshot): string[] {
  const allowed = allowedNumbers(snap);
  const lo = snap.price * 0.5;
  const hi = snap.price * 2;
  const unsupported = new Set<string>();

  // Number, capturing any immediately-following percent sign so we can skip it.
  const numberPattern = /(\d[\d,]*(?:\.\d+)?)\s*(%?)/g;
  let match = numberPattern.exec(body);
  while (match !== null) {
    const raw = match[1];
    const isPercent = match[2] === "%";
    const value = Number(raw.replace(/,/g, ""));

    if (!isPercent && Number.isFinite(value) && value >= lo && value <= hi) {
      // Tolerance covers legitimate rounding of a computed level in prose.
      const supported = allowed.some((a) => Math.abs(a - value) <= Math.abs(a) * 0.001 + 1e-9);
      if (!supported) unsupported.add(raw);
    }
    match = numberPattern.exec(body);
  }

  return Array.from(unsupported).map(
    (n) => `Unverified price level "${n}" — not in the computed technical data`
  );
}

/** Every numeric string the model is allowed to use, for post-hoc verification. */
export function allowedNumbers(snap: TechnicalSnapshot): number[] {
  const nums: number[] = [
    snap.price,
    snap.priorDayHigh,
    snap.priorDayLow,
    snap.priorDayClose,
    ...snap.supports.map((l) => l.value),
    ...snap.resistances.map((l) => l.value),
  ];
  for (const v of [snap.ema20, snap.ema50, snap.ema200, snap.rsi14]) {
    if (v !== null) nums.push(v);
  }
  return nums;
}
