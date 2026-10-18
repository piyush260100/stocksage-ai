import { describe, it, expect } from "vitest";
import { sma, rsi, computeTechnicals, type PricePoint } from "@stock-advisor/shared";

describe("sma", () => {
  it("averages the last N values", () => {
    expect(sma([1, 2, 3, 4, 5], 5)).toBe(3);
    expect(sma([2, 4, 6], 2)).toBe(5);
  });
  it("returns null when there isn't enough data", () => {
    expect(sma([1, 2], 5)).toBeNull();
  });
});

describe("rsi", () => {
  it("returns 100 when there are only gains", () => {
    const rising = Array.from({ length: 20 }, (_, i) => 100 + i);
    expect(rsi(rising, 14)).toBe(100);
  });
  it("stays within 0..100", () => {
    const prices = [10, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15, 17, 16, 18, 17];
    const value = rsi(prices, 14);
    expect(value).not.toBeNull();
    expect(value!).toBeGreaterThanOrEqual(0);
    expect(value!).toBeLessThanOrEqual(100);
  });
});

describe("computeTechnicals", () => {
  const history: PricePoint[] = Array.from({ length: 60 }, (_, i) => ({
    date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
    price: 100 + i,
  }));

  it("positions the price within the 52-week range", () => {
    const t = computeTechnicals(history, 159, { high52w: 159, low52w: 100 });
    expect(t.positionIn52wRange).toBeCloseTo(1, 1);
    expect(t.high52w).toBe(159);
    expect(t.low52w).toBe(100);
  });

  it("computes both moving averages when enough data exists", () => {
    const t = computeTechnicals(history, 160);
    expect(t.sma20).not.toBeNull();
    expect(t.sma50).not.toBeNull();
    expect(["bullish", "bearish", "neutral"]).toContain(t.signal);
  });

  it("does not flag an overbought (RSI>70) rising series as bullish", () => {
    // A monotonic rise yields RSI 100, which the signal logic treats as
    // overbought and therefore not a bullish entry.
    const t = computeTechnicals(history, 160);
    expect(t.rsi14).toBe(100);
    expect(t.signal).toBe("neutral");
  });
});
