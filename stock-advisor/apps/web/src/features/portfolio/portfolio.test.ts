import { describe, it, expect } from "vitest";
import { summarizePortfolio, type Portfolio } from "@stock-advisor/shared";

const portfolio: Portfolio = {
  id: "p",
  userId: "u",
  cash: 1000,
  holdings: [
    { symbol: "AAA", name: "A", sector: "Tech", quantity: 10, avgCost: 100, currentPrice: 120 },
    { symbol: "BBB", name: "B", sector: "Energy", quantity: 5, avgCost: 200, currentPrice: 180 },
  ],
};

describe("summarizePortfolio", () => {
  it("computes market value, cost and P&L per holding", () => {
    const s = summarizePortfolio(portfolio);
    const aaa = s.holdings.find((h) => h.symbol === "AAA")!;
    expect(aaa.marketValue).toBe(1200);
    expect(aaa.costBasis).toBe(1000);
    expect(aaa.unrealizedPnl).toBe(200);
    expect(aaa.unrealizedPnlPercent).toBeCloseTo(20);
  });

  it("includes cash in total value and sums P&L across holdings", () => {
    const s = summarizePortfolio(portfolio);
    // holdings market value: 1200 + 900 = 2100, plus 1000 cash
    expect(s.totalValue).toBe(3100);
    // pnl: +200 (AAA) - 100 (BBB) = +100
    expect(s.totalPnl).toBe(100);
  });

  it("weights sum to 1 across holdings and cash", () => {
    const s = summarizePortfolio(portfolio);
    const holdingsWeight = s.holdings.reduce((sum, h) => sum + h.weight, 0);
    const cashWeight = s.cash / s.totalValue;
    expect(holdingsWeight + cashWeight).toBeCloseTo(1);
  });

  it("groups allocation by sector, largest first", () => {
    const s = summarizePortfolio(portfolio);
    expect(s.allocationBySector[0]!.sector).toBe("Tech");
    expect(s.allocationBySector).toHaveLength(2);
  });
});
