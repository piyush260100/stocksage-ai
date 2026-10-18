import type { Trend } from "@stock-advisor/shared";

/** A normalized quote returned by any market-data provider. */
export interface ProviderQuote {
  /** Provider-native symbol (e.g. Yahoo "RELIANCE.NS"). */
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  trend: Trend;
}

export interface ProviderCandle {
  date: string;
  price: number;
}

/** Extra per-symbol detail some providers can supply. */
export interface ProviderDetail {
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
  history: ProviderCandle[];
}

/**
 * A pluggable market-data source. The market service can swap or chain these
 * (e.g. prefer NSE, fall back to Yahoo, then mock) without touching routes.
 */
export interface MarketDataProvider {
  /** Human-readable id, surfaced in the API so the UI can show the source. */
  readonly id: string;
  /** Map an app symbol (e.g. "RELIANCE") to this provider's native symbol. */
  nativeSymbol(appSymbol: string): string;
  /** Quick health check; providers that can't serve data should return false. */
  isAvailable(): Promise<boolean>;
  /** Batch quotes for the given provider-native symbols. */
  fetchQuotes(nativeSymbols: string[]): Promise<Map<string, ProviderQuote>>;
  /** Daily history for a native symbol. */
  fetchHistory(nativeSymbol: string, days: number): Promise<ProviderCandle[]>;
  /** Rich detail for a native symbol (optional richer fields). */
  fetchDetail(nativeSymbol: string): Promise<ProviderDetail | null>;
}
