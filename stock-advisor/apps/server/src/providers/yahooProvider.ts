import type { MarketDataProvider, ProviderQuote, ProviderCandle, ProviderDetail } from "./types.js";
import { fetchQuotes, fetchHistory, fetchDetail } from "../yahoo.js";
import { bySymbol } from "../universe.js";

/**
 * Yahoo Finance provider. Reliable for Indian (.NS/.BO) symbols without an API
 * key, serving the full Nifty universe. Used as the default/fallback source.
 */
export const yahooProvider: MarketDataProvider = {
  id: "yahoo",

  nativeSymbol(appSymbol: string): string {
    const entry = bySymbol.get(appSymbol);
    return entry ? entry.yahoo : `${appSymbol}.NS`;
  },

  async isAvailable(): Promise<boolean> {
    try {
      // The RELIANCE chart endpoint is a cheap liveness probe.
      const q = await fetchQuotes(["RELIANCE.NS"]);
      return q.size > 0;
    } catch {
      return false;
    }
  },

  fetchQuotes(nativeSymbols: string[]): Promise<Map<string, ProviderQuote>> {
    return fetchQuotes(nativeSymbols);
  },

  fetchHistory(nativeSymbol: string, days: number): Promise<ProviderCandle[]> {
    return fetchHistory(nativeSymbol, days);
  },

  fetchDetail(nativeSymbol: string): Promise<ProviderDetail | null> {
    return fetchDetail(nativeSymbol);
  },
};
