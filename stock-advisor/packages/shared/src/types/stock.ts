export type Trend = "up" | "down" | "flat";

/** Indian exchanges supported by the platform. */
export type Exchange = "NSE" | "BSE";

/** A single tradable instrument with its latest quote. Prices are in INR. */
export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  /** Exchange the stock is listed/quoted on. */
  exchange: Exchange;
  /** Price in Indian Rupees (INR). */
  price: number;
  /** Absolute change for the day in INR. */
  change: number;
  /** Percentage change for the day, e.g. 1.24 means +1.24%. */
  changePercent: number;
  /** Market capitalization in INR. */
  marketCap: number;
  volume: number;
  trend: Trend;
}

/** A broad market index (e.g. Nifty 50, Sensex) shown on the dashboard. */
export interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: Trend;
}

/** One point in a time series used for charts. */
export interface PricePoint {
  /** ISO date string. */
  date: string;
  price: number;
}

/** Snapshot of overall market state for the dashboard header. */
export interface MarketOverview {
  indices: MarketIndex[];
  topGainers: Stock[];
  topLosers: Stock[];
  trending: Stock[];
  /** True when quotes came from the live data source rather than fallback. */
  live?: boolean;
  /** ISO timestamp of when the server produced this snapshot. */
  asOf?: string;
  /** Which data source served the quotes, e.g. "nse", "yahoo", "mock". */
  source?: string;
}
