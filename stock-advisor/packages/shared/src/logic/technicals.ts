import type { PricePoint } from "../types/stock.js";
import type { TechnicalIndicators } from "../types/detail.js";

/** Simple moving average of the last `period` closes. */
export function sma(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return Number((slice.reduce((a, b) => a + b, 0) / period).toFixed(2));
}

/**
 * Wilder's RSI over `period` days. Returns 0..100, or null if not enough data.
 */
export function rsi(prices: number[], period = 14): number | null {
  if (prices.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i]! - prices[i - 1]!;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - 100 / (1 + rs)).toFixed(2));
}

/** Annualized volatility (%) from daily log-ish returns. */
export function annualizedVolatility(prices: number[]): number | null {
  if (prices.length < 2) return null;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1]!;
    if (prev > 0) returns.push((prices[i]! - prev) / prev);
  }
  if (returns.length < 2) return null;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
  const daily = Math.sqrt(variance);
  return Number((daily * Math.sqrt(252) * 100).toFixed(2));
}

/**
 * Compute the full technical indicator set from a price history. `high52w` and
 * `low52w` can be supplied from the data source; otherwise derived from series.
 */
export function computeTechnicals(
  history: PricePoint[],
  currentPrice: number,
  opts: { high52w?: number; low52w?: number } = {},
): TechnicalIndicators {
  const prices = history.map((p) => p.price).filter((p) => p > 0);
  const seriesHigh = prices.length ? Math.max(...prices) : currentPrice;
  const seriesLow = prices.length ? Math.min(...prices) : currentPrice;
  const high52w = opts.high52w ?? seriesHigh;
  const low52w = opts.low52w ?? seriesLow;

  const range = high52w - low52w;
  const positionIn52wRange = range > 0 ? Number(((currentPrice - low52w) / range).toFixed(3)) : 0.5;

  const sma20 = sma(prices, 20);
  const sma50 = sma(prices, 50);
  const rsi14 = rsi(prices, 14);

  // Signal: price above both SMAs and RSI not overbought -> bullish, etc.
  let signal: TechnicalIndicators["signal"] = "neutral";
  if (sma20 != null && sma50 != null) {
    const aboveTrend = currentPrice > sma20 && sma20 > sma50;
    const belowTrend = currentPrice < sma20 && sma20 < sma50;
    const overbought = rsi14 != null && rsi14 > 70;
    const oversold = rsi14 != null && rsi14 < 30;
    if (aboveTrend && !overbought) signal = "bullish";
    else if (belowTrend && !oversold) signal = "bearish";
  }

  return {
    sma20,
    sma50,
    rsi14,
    volatilityPercent: annualizedVolatility(prices),
    high52w: Number(high52w.toFixed(2)),
    low52w: Number(low52w.toFixed(2)),
    positionIn52wRange,
    signal,
  };
}
