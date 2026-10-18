import type { Stock, MarketIndex, PricePoint } from "../types/stock.js";
import type { Portfolio } from "../types/portfolio.js";
import type { User } from "../types/auth.js";

export const mockUser: User = {
  id: "u_1",
  email: "demo@stockadvisor.in",
  name: "Demo Investor",
  riskTolerance: "medium",
};

/**
 * NSE/BSE-listed stocks with indicative INR quotes. Symbols follow NSE
 * convention; BSE-primary names are marked with exchange "BSE".
 */
export const mockStocks: Stock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", sector: "Energy", exchange: "NSE", price: 1402.5, change: 15.3, changePercent: 1.1, marketCap: 18_980_000_000_000, volume: 9_800_000, trend: "up" },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd.", sector: "Information Technology", exchange: "NSE", price: 4087.9, change: -22.4, changePercent: -0.55, marketCap: 14_790_000_000_000, volume: 2_100_000, trend: "down" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Financial Services", exchange: "NSE", price: 1685.25, change: 12.9, changePercent: 0.77, marketCap: 12_850_000_000_000, volume: 11_400_000, trend: "up" },
  { symbol: "INFY", name: "Infosys Ltd.", sector: "Information Technology", exchange: "NSE", price: 1872.6, change: 28.1, changePercent: 1.52, marketCap: 7_770_000_000_000, volume: 6_300_000, trend: "up" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", sector: "Financial Services", exchange: "NSE", price: 1268.4, change: -5.6, changePercent: -0.44, marketCap: 8_940_000_000_000, volume: 10_200_000, trend: "down" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", sector: "Telecommunication", exchange: "NSE", price: 1631.75, change: 19.8, changePercent: 1.23, marketCap: 9_720_000_000_000, volume: 4_900_000, trend: "up" },
  { symbol: "ITC", name: "ITC Ltd.", sector: "FMCG", exchange: "NSE", price: 462.3, change: -1.1, changePercent: -0.24, marketCap: 5_780_000_000_000, volume: 13_600_000, trend: "flat" },
  { symbol: "LT", name: "Larsen & Toubro Ltd.", sector: "Construction", exchange: "NSE", price: 3598.2, change: 41.7, changePercent: 1.17, marketCap: 4_950_000_000_000, volume: 1_700_000, trend: "up" },
  { symbol: "SBIN", name: "State Bank of India", sector: "Financial Services", exchange: "NSE", price: 812.65, change: -8.3, changePercent: -1.01, marketCap: 7_250_000_000_000, volume: 15_800_000, trend: "down" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", sector: "Automobile", exchange: "NSE", price: 792.4, change: 24.6, changePercent: 3.2, marketCap: 2_910_000_000_000, volume: 22_300_000, trend: "up" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd.", sector: "Healthcare", exchange: "NSE", price: 1789.9, change: 6.4, changePercent: 0.36, marketCap: 4_290_000_000_000, volume: 2_600_000, trend: "flat" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", sector: "Financial Services", exchange: "NSE", price: 6895.5, change: -78.2, changePercent: -1.12, marketCap: 4_270_000_000_000, volume: 1_300_000, trend: "down" },
];

export const mockIndices: MarketIndex[] = [
  { id: "nifty50", name: "NIFTY 50", value: 24781.1, change: 112.4, changePercent: 0.46, trend: "up" },
  { id: "sensex", name: "BSE SENSEX", value: 81224.75, change: 361.2, changePercent: 0.45, trend: "up" },
  { id: "banknifty", name: "NIFTY BANK", value: 51338.6, change: -94.3, changePercent: -0.18, trend: "down" },
];

/** Deterministic pseudo-random series so charts look stable across reloads. */
export function mockPriceHistory(symbol: string, days = 90): PricePoint[] {
  const base = mockStocks.find((s) => s.symbol === symbol)?.price ?? 1000;
  let seed = [...symbol].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const points: PricePoint[] = [];
  let price = base * 0.85;
  const start = new Date();
  start.setDate(start.getDate() - days);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    price = Math.max(1, price + (rand() - 0.45) * base * 0.03);
    points.push({ date: d.toISOString().slice(0, 10), price: Number(price.toFixed(2)) });
  }
  // nudge the last point toward the current quote
  if (points.length) points[points.length - 1]!.price = base;
  return points;
}

export const mockPortfolio: Portfolio = {
  id: "p_1",
  userId: "u_1",
  cash: 85_000,
  holdings: [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", sector: "Energy", quantity: 60, avgCost: 1240.0, currentPrice: 1402.5 },
    { symbol: "INFY", name: "Infosys Ltd.", sector: "Information Technology", quantity: 80, avgCost: 1550.0, currentPrice: 1872.6 },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Financial Services", quantity: 50, avgCost: 1620.0, currentPrice: 1685.25 },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", sector: "Automobile", quantity: 120, avgCost: 870.0, currentPrice: 792.4 },
  ],
};
