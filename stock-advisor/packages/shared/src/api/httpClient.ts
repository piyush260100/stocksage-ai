import type { ApiClient } from "./client.js";
import type { MarketOverview, Stock, PricePoint } from "../types/stock.js";
import type { Portfolio } from "../types/portfolio.js";
import type { RecommendationResponse } from "../types/recommendation.js";
import type { AuthSession, LoginRequest, SignupRequest } from "../types/auth.js";
import type { StockPrediction } from "../types/prediction.js";
import type { StockDetail } from "../types/detail.js";
import type { TraderWithPortfolio } from "../types/trader.js";
import type { ShadowBacktest } from "../types/shadow.js";
import { createMockApiClient } from "./mockClient.js";

/**
 * Real HTTP client that talks to the Node/Express proxy for live market data.
 *
 * Market endpoints hit the server; auth is delegated to the mock client for now
 * (the backend has no user store yet). This keeps the exact same ApiClient
 * contract, so the UI is unchanged whether data is mock or live.
 */
export function createHttpApiClient(baseUrl: string): ApiClient {
  const auth = createMockApiClient();

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
    }
    return (await res.json()) as T;
  }

  return {
    // Auth is handled locally until the backend gains a user store.
    login: (req: LoginRequest): Promise<AuthSession> => auth.login(req),
    signup: (req: SignupRequest): Promise<AuthSession> => auth.signup(req),

    getMarketOverview: (): Promise<MarketOverview> => get("/api/market/overview"),

    subscribeMarket(onData: (overview: MarketOverview) => void): () => void {
      // Prefer SSE for a true push stream; fall back to polling if EventSource
      // is unavailable (e.g. non-browser environments).
      if (typeof EventSource !== "undefined") {
        const es = new EventSource(`${baseUrl}/api/market/stream`);
        es.onmessage = (e) => {
          try {
            onData(JSON.parse(e.data) as MarketOverview);
          } catch {
            /* ignore malformed frame */
          }
        };
        return () => es.close();
      }
      const timer = setInterval(() => {
        void get<MarketOverview>("/api/market/overview").then(onData).catch(() => {});
      }, 10_000);
      return () => clearInterval(timer);
    },
    getStock: (symbol: string): Promise<Stock> => get(`/api/stocks/${encodeURIComponent(symbol)}`),
    getStockHistory: (symbol: string, days = 90): Promise<PricePoint[]> =>
      get(`/api/stocks/${encodeURIComponent(symbol)}/history?days=${days}`),
    getStockDetail: (symbol: string): Promise<StockDetail> =>
      get(`/api/stocks/${encodeURIComponent(symbol)}/detail`),
    getPortfolio: (): Promise<Portfolio> => get("/api/portfolio"),
    getRecommendations: (): Promise<RecommendationResponse> => get("/api/recommendations"),
    searchStocks: (query: string): Promise<Stock[]> =>
      get(`/api/stocks/search?q=${encodeURIComponent(query)}`),
    predictStock: (symbol: string): Promise<StockPrediction> =>
      get(`/api/predict/${encodeURIComponent(symbol)}`),
    getTopTraders: (): Promise<TraderWithPortfolio[]> => get("/api/traders"),
    getTrader: (id: string): Promise<TraderWithPortfolio> =>
      get(`/api/traders/${encodeURIComponent(id)}`),
    getShadowBacktest: (params): Promise<ShadowBacktest> =>
      get(
        `/api/traders/${encodeURIComponent(params.traderId)}/shadow?invested=${params.invested}&startDate=${params.startDate}`,
      ),
  };
}
