import type { MarketDataProvider } from "./types.js";
import { yahooProvider } from "./yahooProvider.js";
import { nseProvider } from "./nseProvider.js";
import { finnhubProvider } from "./finnhubProvider.js";

export type { MarketDataProvider, ProviderQuote, ProviderCandle, ProviderDetail } from "./types.js";
export { yahooProvider } from "./yahooProvider.js";
export { nseProvider } from "./nseProvider.js";
export { finnhubProvider } from "./finnhubProvider.js";

/**
 * Resolves which provider to use for quotes, in priority order:
 *   1. Finnhub  — official API, used when FINNHUB_API_KEY is set and reachable.
 *   2. NSE      — native/fresh, when its endpoints are reachable (often blocked).
 *   3. Yahoo    — reliable default/fallback.
 * Availability is cached briefly so we don't probe on every request. History
 * and detail always use Yahoo, since NSE/Finnhub free tiers don't serve them.
 */
class ProviderRegistry {
  private quoteProvider: MarketDataProvider = yahooProvider;
  private checkedAt = 0;
  private readonly TTL = 2 * 60_000;

  /** The provider used for intraday quotes (Finnhub > NSE > Yahoo). */
  async quotes(): Promise<MarketDataProvider> {
    if (Date.now() - this.checkedAt < this.TTL) return this.quoteProvider;
    this.checkedAt = Date.now();
    try {
      if (await finnhubProvider.isAvailable()) {
        this.quoteProvider = finnhubProvider;
      } else if (await nseProvider.isAvailable()) {
        this.quoteProvider = nseProvider;
      } else {
        this.quoteProvider = yahooProvider;
      }
    } catch {
      this.quoteProvider = yahooProvider;
    }
    return this.quoteProvider;
  }

  /** The provider used for history (always Yahoo — reliable, open). */
  history(): MarketDataProvider {
    return yahooProvider;
  }

  /** The provider used for rich detail (Yahoo; NSE attempted opportunistically). */
  detail(): MarketDataProvider {
    return yahooProvider;
  }

  /** The id of the active quote provider, surfaced in API responses. */
  activeQuoteSource(): string {
    return this.quoteProvider.id;
  }
}

export const providers = new ProviderRegistry();
