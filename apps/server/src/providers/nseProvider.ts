import type { Trend } from "@stock-advisor/shared";
import type { MarketDataProvider, ProviderQuote, ProviderCandle, ProviderDetail } from "./types.js";
import { bySymbol } from "../universe.js";

/**
 * NSE India provider (nseindia.com unofficial JSON API).
 *
 * NSE aggressively protects these endpoints: they require a primed cookie
 * session and full browser-like headers, and frequently return 403 from
 * server/data-center IPs. This provider does a best-effort cookie handshake and
 * reports `isAvailable() === false` when NSE blocks it, so the service cleanly
 * falls back to Yahoo. When it IS reachable it pulls many quotes at once from
 * the index-constituents endpoint, which is richer than per-symbol calls.
 */

const BASE = "https://www.nseindia.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const browserHeaders = (referer: string): Record<string, string> => ({
  "User-Agent": UA,
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: referer,
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
});

let cookie: string | null = null;
let cookieFetchedAt = 0;
const COOKIE_TTL = 5 * 60_000;

/** Prime (or reuse) the NSE session cookie by hitting the homepage. */
async function getCookie(): Promise<string | null> {
  if (cookie && Date.now() - cookieFetchedAt < COOKIE_TTL) return cookie;
  try {
    const res = await withTimeout(
      fetch(BASE + "/", { headers: { "User-Agent": UA, Accept: "text/html" } }),
      8000,
    );
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      cookie = setCookie.split(",").map((c) => c.split(";")[0]).join("; ");
      cookieFetchedAt = Date.now();
      return cookie;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

async function nseGet(path: string, referer: string): Promise<any | null> {
  const ck = await getCookie();
  const headers = browserHeaders(referer);
  if (ck) headers.Cookie = ck;
  const res = await withTimeout(fetch(BASE + path, { headers }), 9000);
  if (!res.ok) throw new Error(`NSE ${res.status}`);
  return res.json();
}

function trendOf(changePercent: number): Trend {
  if (changePercent > 0.05) return "up";
  if (changePercent < -0.05) return "down";
  return "flat";
}

export const nseProvider: MarketDataProvider = {
  id: "nse",

  nativeSymbol(appSymbol: string): string {
    // NSE uses the bare trading symbol.
    return appSymbol;
  },

  async isAvailable(): Promise<boolean> {
    try {
      // marketStatus is the lightest endpoint and usually passes when NSE is reachable.
      const data = await nseGet("/api/marketStatus", BASE + "/");
      return Array.isArray(data?.marketState);
    } catch {
      return false;
    }
  },

  async fetchQuotes(nativeSymbols: string[]): Promise<Map<string, ProviderQuote>> {
    const result = new Map<string, ProviderQuote>();
    const wanted = new Set(nativeSymbols);
    // Pull the whole NIFTY 50 + Next 50 constituent lists in two calls, which
    // covers most of our universe far more cheaply than per-symbol requests.
    const indexes = ["NIFTY 50", "NIFTY NEXT 50"];
    for (const index of indexes) {
      try {
        const data = await nseGet(
          `/api/equity-stockIndices?index=${encodeURIComponent(index)}`,
          BASE + "/market-data/live-equity-market",
        );
        for (const row of data?.data ?? []) {
          const symbol: string = row.symbol;
          if (!symbol || symbol === index || !wanted.has(symbol)) continue;
          const changePercent = Number(row.pChange ?? 0);
          result.set(symbol, {
            symbol,
            price: Number(row.lastPrice ?? 0),
            change: Number(row.change ?? 0),
            changePercent,
            marketCap: 0,
            volume: Number(row.totalTradedVolume ?? 0),
            trend: trendOf(changePercent),
          });
        }
      } catch {
        /* skip this index; caller falls back if nothing resolves */
      }
    }
    return result;
  },

  async fetchHistory(nativeSymbol: string, days: number): Promise<ProviderCandle[]> {
    // NSE's historical endpoint is especially heavily protected; we don't rely
    // on it. History is served by Yahoo via the service fallback.
    void nativeSymbol;
    void days;
    return [];
  },

  async fetchDetail(nativeSymbol: string): Promise<ProviderDetail | null> {
    try {
      const data = await nseGet(
        `/api/quote-equity?symbol=${encodeURIComponent(nativeSymbol)}`,
        BASE + "/get-quotes/equity?symbol=" + encodeURIComponent(nativeSymbol),
      );
      const info = data?.priceInfo;
      if (!info || typeof info.lastPrice !== "number") return null;
      const entry = bySymbol.get(nativeSymbol);
      return {
        longName: data?.info?.companyName ?? entry?.name ?? null,
        currency: "INR",
        exchange: "NSE",
        price: Number(info.lastPrice),
        previousClose: info.previousClose != null ? Number(info.previousClose) : null,
        dayHigh: info.intraDayHighLow?.max != null ? Number(info.intraDayHighLow.max) : null,
        dayLow: info.intraDayHighLow?.min != null ? Number(info.intraDayHighLow.min) : null,
        high52w: info.weekHighLow?.max != null ? Number(info.weekHighLow.max) : null,
        low52w: info.weekHighLow?.min != null ? Number(info.weekHighLow.min) : null,
        volume: null,
        history: [],
      };
    } catch {
      return null;
    }
  },
};
