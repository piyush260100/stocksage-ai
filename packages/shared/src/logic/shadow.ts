import type { PricePoint } from "../types/stock.js";
import type { Trader } from "../types/trader.js";
import type {
  ShadowBacktest,
  ShadowHolding,
  ShadowValuePoint,
} from "../types/shadow.js";

/** Find the price on or immediately after the given ISO date. */
function priceOnOrAfter(history: PricePoint[], isoDate: string): PricePoint | null {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  for (const p of sorted) {
    if (p.date >= isoDate) return p;
  }
  return sorted.length ? sorted[sorted.length - 1]! : null;
}

/** Build a quick date -> price lookup from a history series. */
function toMap(history: PricePoint[]): Map<string, number> {
  return new Map(history.map((p) => [p.date, p.price]));
}

/** Compute weights for a trader's holdings from their market values. */
function computeWeights(
  trader: Trader,
  priceBySymbol: Map<string, number>,
): { symbol: string; name: string; weight: number }[] {
  const valued = trader.holdings.map((h) => {
    const price = priceBySymbol.get(h.symbol) ?? h.currentPrice;
    return { symbol: h.symbol, name: h.name, value: h.quantity * price };
  });
  const total = valued.reduce((sum, v) => sum + v.value, 0);
  if (total <= 0) {
    const even = 1 / Math.max(1, valued.length);
    return valued.map((v) => ({ symbol: v.symbol, name: v.name, weight: even }));
  }
  return valued.map((v) => ({ symbol: v.symbol, name: v.name, weight: v.value / total }));
}

export interface BacktestInput {
  trader: Trader;
  invested: number;
  startDate: string; // ISO yyyy-mm-dd
  /** Live price per symbol, used to derive current weights. */
  priceBySymbol: Map<string, number>;
  /** Historical daily series per symbol (symbol -> points). */
  historyBySymbol: Map<string, PricePoint[]>;
  /** Benchmark (e.g. NIFTY 50) daily series. */
  benchmark: PricePoint[];
  live: boolean;
}

/**
 * Backtest "mirroring" a trader's portfolio: allocate `invested` across their
 * holdings by current disclosed weights, hold from `startDate` to today, and
 * compare against a benchmark index rebased to the same capital.
 *
 * Simplification: current weights are held constant over the whole window,
 * since exact historical per-quarter weights aren't available for free.
 */
export function backtestShadowPortfolio(input: BacktestInput): ShadowBacktest {
  const { trader, invested, startDate, priceBySymbol, historyBySymbol, benchmark, live } = input;
  const weights = computeWeights(trader, priceBySymbol);

  // Only mirror holdings for which we have a usable history series.
  const usable = weights.filter((w) => (historyBySymbol.get(w.symbol)?.length ?? 0) > 1);
  const weightSum = usable.reduce((s, w) => s + w.weight, 0) || 1;

  const holdings: ShadowHolding[] = [];
  // Collect the union of dates across all series for the value curve.
  const dateSet = new Set<string>();

  for (const w of usable) {
    const history = historyBySymbol.get(w.symbol)!;
    const start = priceOnOrAfter(history, startDate);
    if (!start) continue;
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const endPrice = sorted[sorted.length - 1]!.price;
    const normWeight = w.weight / weightSum;
    const allocated = invested * normWeight;
    const units = start.price > 0 ? allocated / start.price : 0;
    const currentValue = units * endPrice;
    holdings.push({
      symbol: w.symbol,
      name: w.name,
      weight: normWeight,
      allocated: Number(allocated.toFixed(2)),
      startPrice: start.price,
      endPrice,
      currentValue: Number(currentValue.toFixed(2)),
      returnPercent: start.price > 0 ? Number((((endPrice - start.price) / start.price) * 100).toFixed(2)) : 0,
    });
    for (const p of sorted) {
      if (p.date >= startDate) dateSet.add(p.date);
    }
  }

  // Precompute units per holding for the value curve.
  const unitsBySymbol = new Map<string, number>();
  for (const h of holdings) {
    unitsBySymbol.set(h.symbol, h.startPrice > 0 ? h.allocated / h.startPrice : 0);
  }

  // Benchmark rebasing.
  const benchSorted = [...benchmark].sort((a, b) => a.date.localeCompare(b.date));
  const benchStart = priceOnOrAfter(benchSorted, startDate);
  const benchMap = toMap(benchSorted);

  const dates = [...dateSet].sort((a, b) => a.localeCompare(b));
  const seriesMaps = new Map<string, Map<string, number>>();
  for (const h of holdings) seriesMaps.set(h.symbol, toMap(historyBySymbol.get(h.symbol)!));

  const series: ShadowValuePoint[] = [];
  let lastBench = invested;
  for (const date of dates) {
    let value = 0;
    for (const h of holdings) {
      const price = seriesMaps.get(h.symbol)!.get(date);
      if (price != null) value += (unitsBySymbol.get(h.symbol) ?? 0) * price;
    }
    // Benchmark value rebased to the invested capital.
    let benchValue = lastBench;
    if (benchStart && benchStart.price > 0) {
      const bp = benchMap.get(date);
      if (bp != null) benchValue = invested * (bp / benchStart.price);
    }
    lastBench = benchValue;
    series.push({
      date,
      value: Number(value.toFixed(2)),
      benchmark: Number(benchValue.toFixed(2)),
    });
  }

  const currentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const profit = currentValue - invested;
  const returnPercent = invested > 0 ? (profit / invested) * 100 : 0;

  const benchEnd = benchSorted.length ? benchSorted[benchSorted.length - 1]!.price : 0;
  const benchmarkReturnPercent =
    benchStart && benchStart.price > 0 ? ((benchEnd - benchStart.price) / benchStart.price) * 100 : 0;

  // CAGR from start to end.
  const start = new Date(startDate).getTime();
  const years = Math.max(0.0027, (Date.now() - start) / (365.25 * 24 * 3600 * 1000));
  const cagr = invested > 0 && currentValue > 0 ? (Math.pow(currentValue / invested, 1 / years) - 1) * 100 : 0;

  const sortedByReturn = [...holdings].sort((a, b) => b.returnPercent - a.returnPercent);

  return {
    traderId: trader.id,
    traderName: trader.name,
    invested,
    startDate,
    endDate: new Date().toISOString().slice(0, 10),
    currentValue: Number(currentValue.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    returnPercent: Number(returnPercent.toFixed(2)),
    benchmarkReturnPercent: Number(benchmarkReturnPercent.toFixed(2)),
    alphaPercent: Number((returnPercent - benchmarkReturnPercent).toFixed(2)),
    cagrPercent: Number(cagr.toFixed(2)),
    holdings,
    series,
    bestHolding: sortedByReturn[0] ?? null,
    worstHolding: sortedByReturn.length ? sortedByReturn[sortedByReturn.length - 1]! : null,
    live,
    note:
      "Mirrors the investor's current disclosed holdings held constant from the start date. Prices are real; exact historical weights are simplified. Not investment advice.",
  };
}
