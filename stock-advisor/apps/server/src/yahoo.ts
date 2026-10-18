import type { Trend } from "@stock-advisor/shared";

/**
 * Minimal Yahoo Finance client. Yahoo's public endpoints are unofficial and may
 * rate-limit or change shape, so every call is wrapped with a timeout and the
 * caller is expected to handle failures (we fall back to cached/mock data).
 */

const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA = "Mozilla/5.0 (compatible; StockSageAI/0.1)";

export interface YahooQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  trend: Trend;
}

export interface YahooCandle {
  date: string;
  price: number;
}

async function fetchJson(url: string, timeoutMs = 5000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Yahoo responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function trendOf(changePercent: number): Trend {
  if (changePercent > 0.05) return "up";
  if (changePercent < -0.05) return "down";
  return "flat";
}

/**
 * Fetch a single quote via the v8 chart endpoint's metadata.
 *
 * Yahoo's v7 quote endpoint now requires an authenticated crumb (returns 401),
 * so we derive the quote from the chart meta instead, which remains open. The
 * daily change is computed against `chartPreviousClose`.
 */
async function fetchQuote(yahooSymbol: string): Promise<YahooQuote | null> {
  const url = `${CHART_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
  const data = await fetchJson(url);
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== "number") return null;

  const price = Number(meta.regularMarketPrice);
  const prevClose = Number(meta.chartPreviousClose ?? meta.previousClose ?? price);
  const change = price - prevClose;
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;

  return {
    symbol: yahooSymbol,
    price,
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    // Chart meta doesn't carry market cap; left 0 and backfilled from mock upstream.
    marketCap: 0,
    volume: Number(meta.regularMarketVolume ?? 0),
    trend: trendOf(changePercent),
  };
}

/**
 * Fetch quotes for several Yahoo symbols with BOUNDED concurrency. The chart
 * endpoint is per-symbol; firing all ~60 at once trips Yahoo's rate limiting
 * and makes slow responses pile up (seen as multi-second stalls). Batching
 * keeps latency predictable and skips any symbol that fails individually.
 */
const QUOTE_CONCURRENCY = 8;

export async function fetchQuotes(yahooSymbols: string[]): Promise<Map<string, YahooQuote>> {
  const result = new Map<string, YahooQuote>();
  if (yahooSymbols.length === 0) return result;

  for (let i = 0; i < yahooSymbols.length; i += QUOTE_CONCURRENCY) {
    const batch = yahooSymbols.slice(i, i + QUOTE_CONCURRENCY);
    const settled = await Promise.allSettled(batch.map((s) => fetchQuote(s)));
    settled.forEach((outcome, j) => {
      if (outcome.status === "fulfilled" && outcome.value) {
        result.set(batch[j]!, outcome.value);
      }
    });
  }
  return result;
}

export interface YahooDetail {
  longName: string | null;
  currency: string | null;
  exchange: string | null;
  price: number;
  previousClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  high52w: number | null;
  low52w: number | null;
  volume: number | null;
  history: YahooCandle[];
}

/**
 * Fetch rich detail (chart meta + 1y history) for a symbol in one call. The
 * v8 chart meta carries 52-week range, day range, and the company long name
 * without requiring an auth crumb.
 */
export async function fetchDetail(yahooSymbol: string): Promise<YahooDetail | null> {
  const url = `${CHART_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1y`;
  const data = await fetchJson(url);
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta || typeof meta.regularMarketPrice !== "number") return null;

  const timestamps: number[] = result?.timestamp ?? [];
  const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
  const history: YahooCandle[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null) continue;
    history.push({
      date: new Date(timestamps[i]! * 1000).toISOString().slice(0, 10),
      price: Number(close.toFixed(2)),
    });
  }

  return {
    longName: meta.longName ?? meta.shortName ?? null,
    currency: meta.currency ?? null,
    exchange: meta.fullExchangeName ?? meta.exchangeName ?? null,
    price: Number(meta.regularMarketPrice),
    previousClose: meta.chartPreviousClose != null ? Number(meta.chartPreviousClose) : null,
    dayHigh: meta.regularMarketDayHigh != null ? Number(meta.regularMarketDayHigh) : null,
    dayLow: meta.regularMarketDayLow != null ? Number(meta.regularMarketDayLow) : null,
    high52w: meta.fiftyTwoWeekHigh != null ? Number(meta.fiftyTwoWeekHigh) : null,
    low52w: meta.fiftyTwoWeekLow != null ? Number(meta.fiftyTwoWeekLow) : null,
    volume: meta.regularMarketVolume != null ? Number(meta.regularMarketVolume) : null,
    history,
  };
}

/** Fetch a daily price history for a Yahoo symbol over the given range. */
export async function fetchHistory(yahooSymbol: string, days: number): Promise<YahooCandle[]> {
  const range = days <= 7 ? "5d" : days <= 31 ? "1mo" : days <= 93 ? "3mo" : days <= 186 ? "6mo" : "1y";
  const url = `${CHART_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=${range}`;
  const data = await fetchJson(url);
  const res = data?.chart?.result?.[0];
  const timestamps: number[] = res?.timestamp ?? [];
  const closes: (number | null)[] = res?.indicators?.quote?.[0]?.close ?? [];

  const candles: YahooCandle[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null) continue;
    candles.push({
      date: new Date(timestamps[i]! * 1000).toISOString().slice(0, 10),
      price: Number(close.toFixed(2)),
    });
  }
  return candles;
}
