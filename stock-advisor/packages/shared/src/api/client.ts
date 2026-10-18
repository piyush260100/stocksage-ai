import type { MarketOverview, Stock, PricePoint } from "../types/stock.js";
import type { Portfolio } from "../types/portfolio.js";
import type { RecommendationResponse } from "../types/recommendation.js";
import type { AuthSession, LoginRequest, SignupRequest } from "../types/auth.js";
import type { StockPrediction } from "../types/prediction.js";
import type { StockDetail } from "../types/detail.js";
import type { TraderWithPortfolio } from "../types/trader.js";
import type { ShadowBacktest } from "../types/shadow.js";

/**
 * The single contract every frontend talks to. The mock implementation backs
 * it today; a real HTTP client (hitting the Node/Express REST API) will
 * implement the same interface later with zero UI changes.
 */
export interface ApiClient {
  login(req: LoginRequest): Promise<AuthSession>;
  signup(req: SignupRequest): Promise<AuthSession>;
  getMarketOverview(): Promise<MarketOverview>;
  /**
   * Subscribe to a live stream of market overviews. Calls `onData` on each
   * update and returns an unsubscribe function. Implementations may use SSE
   * (live) or simulated ticks (mock).
   */
  subscribeMarket(onData: (overview: MarketOverview) => void): () => void;
  getStock(symbol: string): Promise<Stock>;
  getStockHistory(symbol: string, days?: number): Promise<PricePoint[]>;
  /** Full technical + fundamental detail for a single stock. */
  getStockDetail(symbol: string): Promise<StockDetail>;
  getPortfolio(): Promise<Portfolio>;
  getRecommendations(): Promise<RecommendationResponse>;
  /** Search NSE/BSE stocks by symbol or company name. */
  searchStocks(query: string): Promise<Stock[]>;
  /** Run the AI agent to produce short- and long-term forecasts for a stock. */
  predictStock(symbol: string): Promise<StockPrediction>;
  /** Leaderboard of top traders with their live-valued portfolios. */
  getTopTraders(): Promise<TraderWithPortfolio[]>;
  /** A single top trader with their live-valued portfolio. */
  getTrader(id: string): Promise<TraderWithPortfolio>;
  /**
   * "Shadow Portfolio" — backtest mirroring a trader's holdings with a given
   * amount since a start date, benchmarked against NIFTY 50.
   */
  getShadowBacktest(params: {
    traderId: string;
    invested: number;
    startDate: string;
  }): Promise<ShadowBacktest>;
}
