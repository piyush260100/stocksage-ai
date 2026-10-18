import type { Stock } from "./stock.js";
import type { PricePoint } from "./stock.js";

export type Horizon = "short" | "long";
export type Direction = "bullish" | "bearish" | "neutral";

/**
 * A forecast for a single time horizon produced by the AI agent. The frontend
 * treats the numeric fields as opaque model output and only renders them.
 */
export interface HorizonForecast {
  horizon: Horizon;
  /** Human label, e.g. "1-3 months" or "1-3 years". */
  label: string;
  direction: Direction;
  /** Projected price in INR at the end of the horizon. */
  targetPrice: number;
  /** Expected return vs current price, as a percentage. */
  expectedReturnPercent: number;
  /** Model confidence, 0..1. */
  confidence: number;
  /** Projected price path for charting. */
  projectedPath: PricePoint[];
  /** Natural-language reasoning the agent surfaced. */
  rationale: string[];
}

/** Full prediction response for a searched stock. */
export interface StockPrediction {
  stock: Stock;
  generatedAt: string;
  shortTerm: HorizonForecast;
  longTerm: HorizonForecast;
  /** Standard disclaimer; forecasts are not financial advice. */
  disclaimer: string;
}
