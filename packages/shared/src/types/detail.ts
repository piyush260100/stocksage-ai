import type { Stock, PricePoint } from "./stock.js";

/** Technical indicators computed from the price history. */
export interface TechnicalIndicators {
  /** Simple moving averages. */
  sma20: number | null;
  sma50: number | null;
  /** 14-period Relative Strength Index, 0..100. */
  rsi14: number | null;
  /** Annualized volatility as a percentage, from daily returns. */
  volatilityPercent: number | null;
  /** 52-week high / low from the series. */
  high52w: number;
  low52w: number;
  /** Where the current price sits in the 52w range, 0..1. */
  positionIn52wRange: number;
  /** Simple signal derived from price vs moving averages and RSI. */
  signal: "bullish" | "bearish" | "neutral";
}

/** Key statistics / fundamentals shown on the detail page. */
export interface KeyStats {
  dayHigh: number | null;
  dayLow: number | null;
  previousClose: number | null;
  volume: number | null;
  marketCap: number | null;
  high52w: number | null;
  low52w: number | null;
}

/** Short company profile. */
export interface CompanyProfile {
  longName: string;
  sector: string;
  exchange: string;
  currency: string;
  summary: string;
}

/** Full detail payload for a single stock. */
export interface StockDetail {
  stock: Stock;
  profile: CompanyProfile;
  stats: KeyStats;
  technicals: TechnicalIndicators;
  history: PricePoint[];
  live: boolean;
  asOf: string;
}
