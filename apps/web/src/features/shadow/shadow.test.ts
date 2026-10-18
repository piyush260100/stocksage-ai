import { describe, it, expect } from "vitest";
import {
  backtestShadowPortfolio,
  type Trader,
  type PricePoint,
} from "@stock-advisor/shared";

const trader: Trader = {
  id: "t1",
  name: "Test Investor",
  firm: "Test Fund",
  bio: "",
  tags: [],
  riskProfile: "medium",
  netWorthCr: 1000,
  holdingsCount: 2,
  asOfQuarter: "Sep 2025",
  source: "test",
  holdings: [
    { symbol: "AAA", name: "A", sector: "Tech", quantity: 10, avgCost: 100, currentPrice: 200 },
    { symbol: "BBB", name: "B", sector: "Energy", quantity: 10, avgCost: 100, currentPrice: 200 },
  ],
};

// Simple histories: AAA doubles, BBB flat.
const series = (start: number, end: number): PricePoint[] => [
  { date: "2024-01-01", price: start },
  { date: "2024-06-01", price: (start + end) / 2 },
  { date: "2025-01-01", price: end },
];

const historyBySymbol = new Map<string, PricePoint[]>([
  ["AAA", series(100, 200)],
  ["BBB", series(100, 100)],
]);
const priceBySymbol = new Map<string, number>([
  ["AAA", 200],
  ["BBB", 100],
]);
const benchmark = series(1000, 1100); // +10%

describe("backtestShadowPortfolio", () => {
  const result = backtestShadowPortfolio({
    trader,
    invested: 100000,
    startDate: "2024-01-01",
    priceBySymbol,
    historyBySymbol,
    benchmark,
    live: false,
  });

  it("allocates by current weights (AAA 2x value of BBB -> 2:1)", () => {
    const aaa = result.holdings.find((h) => h.symbol === "AAA")!;
    const bbb = result.holdings.find((h) => h.symbol === "BBB")!;
    // AAA current value 10*200=2000, BBB 10*100=1000 -> weights 2/3 and 1/3
    expect(aaa.weight).toBeCloseTo(2 / 3, 2);
    expect(bbb.weight).toBeCloseTo(1 / 3, 2);
  });

  it("computes a blended return (AAA +100%, BBB 0% at 2:1 ≈ +66.7%)", () => {
    expect(result.returnPercent).toBeCloseTo(66.67, 0);
    expect(result.currentValue).toBeCloseTo(166666, -2);
  });

  it("computes alpha vs the benchmark", () => {
    expect(result.benchmarkReturnPercent).toBeCloseTo(10, 1);
    expect(result.alphaPercent).toBeCloseTo(result.returnPercent - 10, 1);
  });

  it("identifies best and worst holdings", () => {
    expect(result.bestHolding?.symbol).toBe("AAA");
    expect(result.worstHolding?.symbol).toBe("BBB");
  });

  it("produces a value series with mirror and benchmark", () => {
    expect(result.series.length).toBeGreaterThan(0);
    const last = result.series[result.series.length - 1]!;
    expect(last.value).toBeGreaterThan(0);
    expect(last.benchmark).toBeGreaterThan(0);
  });
});
