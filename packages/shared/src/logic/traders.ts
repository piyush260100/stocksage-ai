import type { Trader, TraderWithPortfolio } from "../types/trader.js";
import { summarizePortfolio } from "./portfolio.js";

/**
 * Values a trader's holdings at the given live prices and attaches a computed
 * portfolio summary. Prices not present in the map keep the holding's stored
 * price (graceful fallback). Shared so web, mobile, and server agree.
 */
export function valueTrader(
  trader: Trader,
  priceBySymbol: Map<string, number>,
): TraderWithPortfolio {
  const holdings = trader.holdings.map((h) => ({
    ...h,
    currentPrice: priceBySymbol.get(h.symbol) ?? h.currentPrice,
  }));
  const portfolio = summarizePortfolio({
    id: trader.id,
    userId: trader.id,
    cash: 0,
    holdings,
  });
  return { ...trader, holdings, portfolio };
}

/** Sort traders by publicly-reported net worth, highest first. */
export function rankTraders(traders: TraderWithPortfolio[]): TraderWithPortfolio[] {
  return [...traders].sort((a, b) => b.netWorthCr - a.netWorthCr);
}
