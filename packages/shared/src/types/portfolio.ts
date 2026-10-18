/** A single position the user holds. */
export interface Holding {
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  /** Average price the user paid per share. */
  avgCost: number;
  /** Latest market price per share. */
  currentPrice: number;
}

/** Derived metrics for a holding, computed from raw position + quote. */
export interface HoldingWithMetrics extends Holding {
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  /** Share of total portfolio value, 0..1. */
  weight: number;
}

/** The user's full portfolio with aggregate metrics. */
export interface Portfolio {
  id: string;
  userId: string;
  cash: number;
  holdings: Holding[];
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  cash: number;
  totalPnl: number;
  totalPnlPercent: number;
  holdings: HoldingWithMetrics[];
  /** Allocation by sector, weight 0..1. */
  allocationBySector: { sector: string; weight: number; value: number }[];
}
