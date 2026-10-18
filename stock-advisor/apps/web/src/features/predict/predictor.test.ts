import { describe, it, expect } from "vitest";
import { predictStock, type Stock } from "@stock-advisor/shared";

const stock: Stock = {
  symbol: "RELIANCE",
  name: "Reliance Industries Ltd.",
  sector: "Energy",
  exchange: "NSE",
  price: 1400,
  change: 15,
  changePercent: 1.1,
  marketCap: 1,
  volume: 1,
  trend: "up",
};

describe("predictStock", () => {
  it("returns both short-term and long-term forecasts", () => {
    const p = predictStock(stock);
    expect(p.shortTerm.horizon).toBe("short");
    expect(p.longTerm.horizon).toBe("long");
    expect(p.stock.symbol).toBe("RELIANCE");
  });

  it("produces a non-empty projected path for each horizon", () => {
    const p = predictStock(stock);
    expect(p.shortTerm.projectedPath.length).toBeGreaterThan(0);
    expect(p.longTerm.projectedPath.length).toBeGreaterThan(0);
  });

  it("keeps confidence within 0..1 and classifies a valid direction", () => {
    const p = predictStock(stock);
    for (const f of [p.shortTerm, p.longTerm]) {
      expect(f.confidence).toBeGreaterThanOrEqual(0);
      expect(f.confidence).toBeLessThanOrEqual(1);
      expect(["bullish", "bearish", "neutral"]).toContain(f.direction);
    }
  });

  it("is deterministic for the same input", () => {
    const a = predictStock(stock);
    const b = predictStock(stock);
    expect(a.shortTerm.targetPrice).toBe(b.shortTerm.targetPrice);
    expect(a.longTerm.targetPrice).toBe(b.longTerm.targetPrice);
  });
});
