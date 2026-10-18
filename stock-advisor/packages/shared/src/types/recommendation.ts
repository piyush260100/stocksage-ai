import type { Stock } from "./stock.js";

export type RecommendationAction = "buy" | "hold" | "sell";
export type RiskLevel = "low" | "medium" | "high";

/**
 * A single AI-generated recommendation. The `rationale` and `score` come from
 * the recommendation engine; the frontend treats this as opaque guidance.
 */
export interface Recommendation {
  id: string;
  stock: Stock;
  action: RecommendationAction;
  /** Confidence score, 0..1. */
  score: number;
  riskLevel: RiskLevel;
  /** Target price the engine projects. */
  targetPrice: number;
  /** Human-readable reasons the engine surfaced this stock. */
  rationale: string[];
  /** Whether the user already holds this symbol. */
  alreadyHeld: boolean;
}

export interface RecommendationResponse {
  generatedAt: string;
  /** Overall risk posture the engine assumed for this user. */
  assumedRisk: RiskLevel;
  recommendations: Recommendation[];
}
