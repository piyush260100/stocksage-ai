import type { PricePoint } from "./stock.js";

/** One holding's contribution to a shadow (mirrored) portfolio backtest. */
export interface ShadowHolding {
  symbol: string;
  name: string;
  /** Target weight of the investment allocated to this symbol, 0..1. */
  weight: number;
  /** Amount of capital allocated to this symbol at the start. */
  allocated: number;
  /** Price at the start date (first available on/after it). */
  startPrice: number;
  /** Latest price. */
  endPrice: number;
  /** Current value of this slice. */
  currentValue: number;
  /** Return percentage for this slice over the period. */
  returnPercent: number;
}

/** A point on the shadow portfolio's value-over-time curve. */
export interface ShadowValuePoint {
  date: string;
  /** Mirrored portfolio value on this date. */
  value: number;
  /** Benchmark (index) value, rebased to the same starting capital. */
  benchmark: number;
}

/** Result of backtesting a mirrored investor portfolio. */
export interface ShadowBacktest {
  traderId: string;
  traderName: string;
  /** Capital the user chose to invest. */
  invested: number;
  startDate: string;
  endDate: string;
  /** Current total value of the mirrored portfolio. */
  currentValue: number;
  /** Absolute profit/loss. */
  profit: number;
  /** Total return percentage over the period. */
  returnPercent: number;
  /** Benchmark (e.g. NIFTY 50) return percentage over the same period. */
  benchmarkReturnPercent: number;
  /** How much the mirror beat (or lagged) the benchmark, in percentage points. */
  alphaPercent: number;
  /** Annualized return percentage (CAGR). */
  cagrPercent: number;
  holdings: ShadowHolding[];
  /** Value curve for charting (mirror vs benchmark). */
  series: ShadowValuePoint[];
  /** Best and worst performing holdings over the period. */
  bestHolding: ShadowHolding | null;
  worstHolding: ShadowHolding | null;
  /** True when computed from live/historical data vs. indicative fallback. */
  live: boolean;
  /** Explanatory note about the backtest's assumptions. */
  note: string;
}

/** A named benchmark series used in the backtest. */
export interface BenchmarkSeries {
  id: string;
  name: string;
  history: PricePoint[];
}
