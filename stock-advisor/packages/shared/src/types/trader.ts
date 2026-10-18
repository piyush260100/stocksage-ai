import type { Holding, PortfolioSummary } from "./portfolio.js";
import type { RiskLevel } from "./recommendation.js";

/**
 * A real Indian superinvestor / financial figure. All factual fields are drawn
 * from public sources (SEBI shareholding disclosures, Hurun India Rich List,
 * and press reporting). Metrics that are not publicly published for
 * individuals (e.g. win rate, follower counts) are intentionally omitted.
 */
export interface Trader {
  id: string;
  name: string;
  /** Firm / fund the investor is associated with. */
  firm: string;
  /** Short, factual description of their style and background. */
  bio: string;
  /** Investment style tags, e.g. "Value", "Mid-cap". */
  tags: string[];
  riskProfile: RiskLevel;
  /** Publicly reported net worth in ₹ crore (with the source quarter). */
  netWorthCr: number;
  /** Approximate number of disclosed listed holdings (>1% stakes). */
  holdingsCount: number;
  /** The quarter the disclosed holdings reflect, e.g. "Sep 2025". */
  asOfQuarter: string;
  /** Attribution for the net worth / holdings data. */
  source: string;
  /**
   * Notable publicly-disclosed holdings. Symbols present in our universe are
   * valued with live quotes; others are shown for context without live pricing.
   */
  holdings: Holding[];
}

/** A trader with their (partially live-valued) portfolio summary. */
export interface TraderWithPortfolio extends Trader {
  portfolio: PortfolioSummary;
}
