import type { Stock } from "../types/stock.js";
import type { Portfolio } from "../types/portfolio.js";
import type {
  Recommendation,
  RecommendationResponse,
  RecommendationAction,
  RiskLevel,
} from "../types/recommendation.js";

/**
 * Stub recommendation engine.
 *
 * This is intentionally a simple heuristic that stands in for a real AI/ML
 * service. The frontend only depends on the shape it returns, so swapping this
 * for a model-backed service later requires no UI changes.
 *
 * Heuristic: score each stock by momentum (daily change) adjusted for the
 * user's risk tolerance, penalize symbols already heavily held (diversification),
 * and map the score to a buy/hold/sell action.
 */
export function recommendStocks(
  universe: Stock[],
  portfolio: Portfolio,
  risk: RiskLevel,
): RecommendationResponse {
  const heldSymbols = new Set(portfolio.holdings.map((h) => h.symbol));
  const riskWeight: Record<RiskLevel, number> = { low: 0.5, medium: 1, high: 1.6 };

  const recommendations: Recommendation[] = universe
    .map((stock) => {
      const momentum = stock.changePercent / 100; // -0.05..0.05 typical
      const volatilityPenalty = stock.trend === "flat" ? 0.1 : 0;
      const held = heldSymbols.has(stock.symbol);
      const diversificationPenalty = held ? 0.15 : 0;

      const raw =
        0.5 + momentum * riskWeight[risk] * 8 - volatilityPenalty - diversificationPenalty;
      const score = Math.min(1, Math.max(0, Number(raw.toFixed(3))));

      const action: RecommendationAction =
        score >= 0.6 ? "buy" : score <= 0.35 ? "sell" : "hold";

      const rationale: string[] = [];
      if (momentum > 0) rationale.push(`Positive daily momentum (${stock.changePercent.toFixed(2)}%).`);
      if (momentum < 0) rationale.push(`Negative daily momentum (${stock.changePercent.toFixed(2)}%).`);
      if (held) rationale.push("Already in your portfolio — weighed for diversification.");
      rationale.push(`Aligned with ${risk} risk tolerance.`);

      return {
        id: `rec_${stock.symbol}`,
        stock,
        action,
        score,
        riskLevel: risk,
        targetPrice: Number((stock.price * (1 + momentum * 4)).toFixed(2)),
        rationale,
        alreadyHeld: held,
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    generatedAt: new Date().toISOString(),
    assumedRisk: risk,
    recommendations,
  };
}
