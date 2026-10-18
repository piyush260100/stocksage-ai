import { describe, it, expect } from "vitest";
import { recommendStocks, type Stock, type Portfolio } from "@stock-advisor/shared";

const universe: Stock[] = [
  { symbol: "UP", name: "Up", sector: "Tech", exchange: "NSE", price: 100, change: 5, changePercent: 5, marketCap: 1, volume: 1, trend: "up" },
  { symbol: "DN", name: "Down", sector: "Tech", exchange: "NSE", price: 100, change: -5, changePercent: -5, marketCap: 1, volume: 1, trend: "down" },
];

const emptyPortfolio: Portfolio = { id: "p", userId: "u", cash: 0, holdings: [] };

describe("recommendStocks", () => {
  it("ranks higher-momentum stocks above lower-momentum ones", () => {
    const res = recommendStocks(universe, emptyPortfolio, "medium");
    expect(res.recommendations[0]!.stock.symbol).toBe("UP");
    expect(res.recommendations[0]!.score).toBeGreaterThan(res.recommendations[1]!.score);
  });

  it("flags stocks already held for diversification", () => {
    const held: Portfolio = {
      ...emptyPortfolio,
      holdings: [{ symbol: "UP", name: "Up", sector: "Tech", quantity: 1, avgCost: 1, currentPrice: 1 }],
    };
    const res = recommendStocks(universe, held, "medium");
    const up = res.recommendations.find((r) => r.stock.symbol === "UP")!;
    expect(up.alreadyHeld).toBe(true);
    expect(up.rationale.some((r) => r.toLowerCase().includes("diversification"))).toBe(true);
  });

  it("produces scores within 0..1 and a valid action", () => {
    const res = recommendStocks(universe, emptyPortfolio, "high");
    for (const r of res.recommendations) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
      expect(["buy", "hold", "sell"]).toContain(r.action);
    }
  });
});
