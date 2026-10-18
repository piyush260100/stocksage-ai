import type { Portfolio, PortfolioSummary, HoldingWithMetrics } from "../types/portfolio.js";

/**
 * Pure function that turns raw holdings into a fully derived summary.
 * Shared by web and mobile so both show identical numbers.
 */
export function summarizePortfolio(portfolio: Portfolio): PortfolioSummary {
  const holdings: HoldingWithMetrics[] = portfolio.holdings.map((h) => {
    const marketValue = h.quantity * h.currentPrice;
    const costBasis = h.quantity * h.avgCost;
    const unrealizedPnl = marketValue - costBasis;
    return {
      ...h,
      marketValue,
      costBasis,
      unrealizedPnl,
      unrealizedPnlPercent: costBasis === 0 ? 0 : (unrealizedPnl / costBasis) * 100,
      weight: 0, // filled in below once total is known
    };
  });

  const holdingsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalValue = holdingsValue + portfolio.cash;
  const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0) + portfolio.cash;
  const totalPnl = holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);

  for (const h of holdings) {
    h.weight = totalValue === 0 ? 0 : h.marketValue / totalValue;
  }

  const sectorMap = new Map<string, number>();
  for (const h of holdings) {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) ?? 0) + h.marketValue);
  }
  const allocationBySector = [...sectorMap.entries()]
    .map(([sector, value]) => ({ sector, value, weight: totalValue === 0 ? 0 : value / totalValue }))
    .sort((a, b) => b.value - a.value);

  return {
    totalValue,
    totalCost,
    cash: portfolio.cash,
    totalPnl,
    totalPnlPercent: totalCost === 0 ? 0 : (totalPnl / totalCost) * 100,
    holdings,
    allocationBySector,
  };
}
