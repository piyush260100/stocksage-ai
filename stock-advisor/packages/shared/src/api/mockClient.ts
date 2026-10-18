import type { ApiClient } from "./client.js";
import type { MarketOverview, Stock, PricePoint } from "../types/stock.js";
import type { Portfolio } from "../types/portfolio.js";
import type { RecommendationResponse } from "../types/recommendation.js";
import type { AuthSession, LoginRequest, SignupRequest } from "../types/auth.js";
import type { StockPrediction } from "../types/prediction.js";
import type { StockDetail } from "../types/detail.js";
import {
  mockStocks,
  mockIndices,
  mockPortfolio,
  mockUser,
  mockPriceHistory,
} from "../mocks/data.js";
import type { TraderWithPortfolio } from "../types/trader.js";
import type { ShadowBacktest } from "../types/shadow.js";
import { recommendStocks } from "../logic/recommender.js";
import { predictStock } from "../logic/predictor.js";
import { validateSignup } from "../logic/validation.js";
import { computeTechnicals } from "../logic/technicals.js";
import { valueTrader, rankTraders } from "../logic/traders.js";
import { backtestShadowPortfolio } from "../logic/shadow.js";
import { mockTraders } from "../mocks/traders.js";
import { accountStore } from "./accountStore.js";

const COMPANY_SUMMARIES: Record<string, string> = {
  RELIANCE:
    "Reliance Industries is a diversified conglomerate with interests spanning energy, petrochemicals, retail, and digital services (Jio).",
  TCS: "Tata Consultancy Services is a global IT services, consulting, and business solutions leader and part of the Tata Group.",
  HDFCBANK: "HDFC Bank is one of India's largest private-sector banks, offering retail and wholesale banking services.",
  INFY: "Infosys is a global leader in next-generation digital services and consulting headquartered in Bengaluru.",
};

/** Issues mock JWT-shaped tokens for a given user id. */
const issueTokens = (userId: string) => ({
  accessToken: `mock-access-${userId}`,
  refreshToken: `mock-refresh-${userId}`,
});

/** Apply a tiny random walk to a price so mock streams visibly move. */
const jitter = (value: number, pct = 0.0015) =>
  Number((value * (1 + (Math.random() - 0.5) * 2 * pct)).toFixed(2));

/** Build a market overview from mock data with light per-tick jitter. */
function buildMockOverview(): MarketOverview {
  const stocks = mockStocks.map((s) => {
    const price = jitter(s.price);
    const change = Number((price - (s.price - s.change)).toFixed(2));
    const prevClose = s.price - s.change;
    const changePercent = prevClose ? Number(((change / prevClose) * 100).toFixed(2)) : s.changePercent;
    return { ...s, price, change, changePercent };
  });
  const indices = mockIndices.map((i) => {
    const value = jitter(i.value);
    const change = Number((value - (i.value - i.change)).toFixed(2));
    const prevClose = i.value - i.change;
    const changePercent = prevClose ? Number(((change / prevClose) * 100).toFixed(2)) : i.changePercent;
    return { ...i, value, change, changePercent };
  });
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  return {
    indices,
    topGainers: sorted.filter((s) => s.changePercent > 0).slice(0, 4),
    topLosers: [...sorted].reverse().filter((s) => s.changePercent < 0).slice(0, 4),
    trending: [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5),
    live: false,
    asOf: new Date().toISOString(),
  };
}

/** Simulate network latency so loading states are exercised in the UI. */
const delay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function createMockApiClient(): ApiClient {
  return {
    async login(req: LoginRequest): Promise<AuthSession> {
      if (!req.email || !req.password) {
        throw new Error("Email and password are required.");
      }
      const user = accountStore.verify(req.email, req.password);
      if (!user) {
        throw new Error("Invalid email or password.");
      }
      return delay({ user, tokens: issueTokens(user.id) });
    },

    async signup(req: SignupRequest): Promise<AuthSession> {
      const errors = validateSignup(req);
      const firstError = Object.values(errors)[0];
      if (firstError) throw new Error(firstError);
      // accountStore.create throws on duplicate email.
      const user = accountStore.create(req);
      return delay({ user, tokens: issueTokens(user.id) }, 450);
    },

    async getMarketOverview(): Promise<MarketOverview> {
      return delay(buildMockOverview());
    },

    subscribeMarket(onData: (overview: MarketOverview) => void): () => void {
      // Simulate live ticks so the UI animates even without a backend.
      onData(buildMockOverview());
      const timer = setInterval(() => onData(buildMockOverview()), 5_000);
      return () => clearInterval(timer);
    },

    async getStock(symbol: string): Promise<Stock> {
      const stock = mockStocks.find((s) => s.symbol === symbol);
      if (!stock) throw new Error(`Unknown symbol: ${symbol}`);
      return delay(stock);
    },

    async getStockHistory(symbol: string, days = 90): Promise<PricePoint[]> {
      return delay(mockPriceHistory(symbol, days));
    },

    async getPortfolio(): Promise<Portfolio> {
      return delay(mockPortfolio);
    },

    async getRecommendations(): Promise<RecommendationResponse> {
      return delay(recommendStocks(mockStocks, mockPortfolio, mockUser.riskTolerance), 600);
    },

    async searchStocks(query: string): Promise<Stock[]> {
      const q = query.trim().toLowerCase();
      if (!q) return delay([], 150);
      const matches = mockStocks.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
      );
      return delay(matches, 200);
    },

    async predictStock(symbol: string): Promise<StockPrediction> {
      const stock = mockStocks.find((s) => s.symbol === symbol);
      if (!stock) throw new Error(`Unknown symbol: ${symbol}`);
      return delay(predictStock(stock), 700);
    },

    async getStockDetail(symbol: string): Promise<StockDetail> {
      const stock = mockStocks.find((s) => s.symbol === symbol);
      if (!stock) throw new Error(`Unknown symbol: ${symbol}`);
      const history = mockPriceHistory(symbol, 365);
      const technicals = computeTechnicals(history, stock.price);
      const prevClose = stock.price - stock.change;
      return delay({
        stock,
        profile: {
          longName: stock.name,
          sector: stock.sector,
          exchange: stock.exchange,
          currency: "INR",
          summary:
            COMPANY_SUMMARIES[symbol] ??
            `${stock.name} is a ${stock.exchange}-listed company in the ${stock.sector} sector.`,
        },
        stats: {
          dayHigh: Number((stock.price * 1.012).toFixed(2)),
          dayLow: Number((stock.price * 0.988).toFixed(2)),
          previousClose: Number(prevClose.toFixed(2)),
          volume: stock.volume,
          marketCap: stock.marketCap,
          high52w: technicals.high52w,
          low52w: technicals.low52w,
        },
        technicals,
        history,
        live: false,
        asOf: new Date().toISOString(),
      });
    },

    async getTopTraders(): Promise<TraderWithPortfolio[]> {
      const priceBySymbol = new Map(mockStocks.map((s) => [s.symbol, s.price]));
      const valued = mockTraders.map((t) => valueTrader(t, priceBySymbol));
      return delay(rankTraders(valued), 400);
    },

    async getTrader(id: string): Promise<TraderWithPortfolio> {
      const trader = mockTraders.find((t) => t.id === id);
      if (!trader) throw new Error(`Unknown trader: ${id}`);
      const priceBySymbol = new Map(mockStocks.map((s) => [s.symbol, s.price]));
      return delay(valueTrader(trader, priceBySymbol));
    },

    async getShadowBacktest(params): Promise<ShadowBacktest> {
      const trader = mockTraders.find((t) => t.id === params.traderId);
      if (!trader) throw new Error(`Unknown trader: ${params.traderId}`);

      const priceBySymbol = new Map(mockStocks.map((s) => [s.symbol, s.price]));
      // Build ~2y of mock history per held symbol and a mock NIFTY series.
      const historyBySymbol = new Map(
        trader.holdings.map((h) => [h.symbol, mockPriceHistory(h.symbol, 730)]),
      );
      const benchmark = mockPriceHistory("NIFTY50", 730);

      return delay(
        backtestShadowPortfolio({
          trader,
          invested: params.invested,
          startDate: params.startDate,
          priceBySymbol,
          historyBySymbol,
          benchmark,
          live: false,
        }),
        600,
      );
    },
  };
}
