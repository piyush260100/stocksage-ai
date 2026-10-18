import type { Trend } from "@stock-advisor/shared";
import type { MarketDataProvider, ProviderQuote, ProviderCandle, ProviderDetail } from "./types.js";
import { bySymbol } from "../universe.js";

/**
 * Finnhub provider (finnhub.io). A real, officially-supported market-data API
 * with a free tier. Activated only when FINNHUB_API_KEY is set.
 *
 * Notes on tiers (verified from Finnhub docs/community):
 *  - /quote and /stock/profile2 are available on the free tier.
 *  - Indian (NSE/BSE) real-time coverage and /stock/candle history generally
 *    require a paid plan. So this provider serves quotes + profile; history is
 *    left to Yahoo via the service fallback. If a given symbol/tier returns no
 *    data, the registry falls back to Yahoo automatically.
 *
 * Finnhub Indian symbols use the same suffixes as Yahoo: ".NS" (NSE), ".BO" (BSE).
 */

const BASE = "https://finnhub.io/api/v1";
const KEY = process.env.FINNHUB_API_KEY ?? "";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

async function finnhubGet(path: string): Promise<any | null> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await withTimeout(fetch(`${BASE}${path}${sep}token=${KEY}`), 8000);
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  return res.json();
}

function trendOf(changePercent: number): Trend {
  if (changePercent > 0.05) return "up";
  if (changePercent < -0.05) return "down";
  return "flat";
}

export const finnhubProvider: MarketDataProvider = {
  id: "finnhub",

  nativeSymbol(appSymbol: string): string {
    // Finnhub uses the same Yahoo-style suffixes for Indian equities.
    const entry = bySymbol.get(appSymbol);
    return entry ? entry.yahoo : `${appSymbol}.NS`;
  },

  async isAvailable(): Promise<boolean> {
    if (!KEY) return false;
    try {
      const q = await finnhubGet(`/quote?symbol=${encodeURIComponent("RELIANCE.NS")}`);
      // A real quote has a non-zero current price `c`.
      return typeof q?.c === "number" && q.c > 0;
    } catch {
      return false;
    }
  },

  async fetchQuotes(nativeSymbols: string[]): Promise<Map<string, ProviderQuote>> {
    const result = new Map<string, ProviderQuote>();
    if (!KEY) return result;
    // Finnhub's /quote is per-symbol; fan out with bounded concurrency.
    const CONCURRENCY = 5;
    for (let i = 0; i < nativeSymbols.length; i += CONCURRENCY) {
      const batch = nativeSymbols.slice(i, i + CONCURRENCY);
      const settled = await Promise.allSettled(
        batch.map(async (sym) => {
          const q = await finnhubGet(`/quote?symbol=${encodeURIComponent(sym)}`);
          return { sym, q };
        }),
      );
      for (const outcome of settled) {
        if (outcome.status !== "fulfilled") continue;
        const { sym, q } = outcome.value;
        if (typeof q?.c !== "number" || q.c <= 0) continue;
        const changePercent = Number(q.dp ?? 0);
        result.set(sym, {
          symbol: sym,
          price: Number(q.c),
          change: Number(q.d ?? 0),
          changePercent,
          marketCap: 0,
          volume: 0,
          trend: trendOf(changePercent),
        });
      }
    }
    return result;
  },

  async fetchHistory(_nativeSymbol: string, _days: number): Promise<ProviderCandle[]> {
    // Candle history is paid-tier on Finnhub; Yahoo serves history in the service.
    return [];
  },

  async fetchDetail(nativeSymbol: string): Promise<ProviderDetail | null> {
    if (!KEY) return null;
    try {
      const [q, profile] = await Promise.all([
        finnhubGet(`/quote?symbol=${encodeURIComponent(nativeSymbol)}`),
        finnhubGet(`/stock/profile2?symbol=${encodeURIComponent(nativeSymbol)}`).catch(() => null),
      ]);
      if (typeof q?.c !== "number" || q.c <= 0) return null;
      return {
        longName: profile?.name ?? null,
        currency: profile?.currency ?? "INR",
        exchange: profile?.exchange ?? null,
        price: Number(q.c),
        previousClose: q.pc != null ? Number(q.pc) : null,
        dayHigh: q.h != null ? Number(q.h) : null,
        dayLow: q.l != null ? Number(q.l) : null,
        high52w: null,
        low52w: null,
        volume: null,
        history: [],
      };
    } catch {
      return null;
    }
  },
};
