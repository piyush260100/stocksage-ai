import type { Stock, PricePoint } from "../types/stock.js";
import type {
  StockPrediction,
  HorizonForecast,
  Horizon,
  Direction,
} from "../types/prediction.js";

/**
 * Stub AI prediction agent.
 *
 * Stands in for a real forecasting model/LLM agent. It generates deterministic
 * short-term and long-term projections from the stock's current momentum so the
 * UI is fully functional. Swapping this for a model-backed service later
 * requires no UI changes — only the return shape matters.
 */
export function predictStock(stock: Stock): StockPrediction {
  return {
    stock,
    generatedAt: new Date().toISOString(),
    shortTerm: buildForecast(stock, "short"),
    longTerm: buildForecast(stock, "long"),
    disclaimer:
      "AI-generated forecasts are indicative only and not investment advice. Markets are volatile; do your own research.",
  };
}

function buildForecast(stock: Stock, horizon: Horizon): HorizonForecast {
  const isShort = horizon === "short";
  const label = isShort ? "1–3 months" : "1–3 years";
  const steps = isShort ? 12 : 36; // weekly for short, monthly for long

  // Seed a deterministic generator from symbol + horizon.
  let seed = [...`${stock.symbol}:${horizon}`].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const momentum = stock.changePercent / 100;
  // Long term compounds momentum more; short term tracks it closely.
  const drift = isShort ? momentum * 0.6 : momentum * 2.4 + 0.015;
  const volatility = isShort ? 0.02 : 0.05;

  const projectedPath: PricePoint[] = [];
  let price = stock.price;
  const start = new Date();
  for (let i = 1; i <= steps; i++) {
    const d = new Date(start);
    if (isShort) d.setDate(start.getDate() + i * 7);
    else d.setMonth(start.getMonth() + i);
    const shock = (rand() - 0.5) * volatility * price;
    price = Math.max(1, price + (drift / steps) * stock.price + shock);
    projectedPath.push({ date: d.toISOString().slice(0, 10), price: Number(price.toFixed(2)) });
  }

  const targetPrice = Number(price.toFixed(2));
  const expectedReturnPercent = Number((((targetPrice - stock.price) / stock.price) * 100).toFixed(2));

  const direction: Direction =
    expectedReturnPercent > 3 ? "bullish" : expectedReturnPercent < -3 ? "bearish" : "neutral";

  // Confidence is higher short term and when momentum and horizon agree.
  const baseConfidence = isShort ? 0.72 : 0.55;
  const confidence = Number(Math.min(0.95, Math.max(0.3, baseConfidence - Math.abs(momentum) * 1.5 + rand() * 0.1)).toFixed(2));

  const rationale = buildRationale(stock, horizon, direction, expectedReturnPercent);

  return {
    horizon,
    label,
    direction,
    targetPrice,
    expectedReturnPercent,
    confidence,
    projectedPath,
    rationale,
  };
}

function buildRationale(
  stock: Stock,
  horizon: Horizon,
  direction: Direction,
  ret: number,
): string[] {
  const notes: string[] = [];
  const span = horizon === "short" ? "near-term" : "multi-year";
  notes.push(
    `${span} outlook is ${direction} with a projected ${ret >= 0 ? "+" : ""}${ret}% move.`,
  );
  if (stock.trend === "up") notes.push(`${stock.symbol} shows positive price momentum on ${stock.exchange}.`);
  if (stock.trend === "down") notes.push(`${stock.symbol} is under near-term selling pressure on ${stock.exchange}.`);
  notes.push(`Sector context: ${stock.sector}.`);
  if (horizon === "long") {
    notes.push("Long-horizon estimate assumes steady compounding; sensitive to macro and earnings cycles.");
  } else {
    notes.push("Short-horizon estimate is driven by current momentum and recent volatility.");
  }
  return notes;
}
