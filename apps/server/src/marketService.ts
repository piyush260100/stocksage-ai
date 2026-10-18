import type {
  Stock,
  MarketIndex,
  MarketOverview,
  PricePoint,
  StockDetail,
} from "@stock-advisor/shared";
import { mockStocks, mockIndices, mockPriceHistory, computeTechnicals } from "@stock-advisor/shared";
import { UNIVERSE, INDICES, bySymbol } from "./universe.js";
import { fetchQuotes, fetchHistory, fetchDetail } from "./yahoo.js";
import { providers } from "./providers/index.js";

/** Tiny TTL cache so we don't hammer Yahoo (and survive rate limits). */
class TtlCache<T> {
  private store = new Map<string, { value: T; expires: number }>();
  constructor(private ttlMs: number) {}
  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expires) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }
  set(key: string, value: T): void {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}

const quoteCache = new TtlCache<Stock[]>(10_000); // 10s for quotes
const historyCache = new TtlCache<PricePoint[]>(5 * 60_000); // 5m for history
const indexCache = new TtlCache<MarketIndex[]>(10_000);

/**
 * Returns live quotes for the whole universe via the active provider (NSE if
 * reachable, else Yahoo), falling back to Yahoo and then mock on failure.
 */
export async function getStocks(): Promise<{ stocks: Stock[]; live: boolean; source: string }> {
  const cached = quoteCache.get("all");
  if (cached) return { stocks: cached, live: true, source: providers.activeQuoteSource() };

  try {
    const provider = await providers.quotes();
    // Each provider uses its own native symbol scheme.
    const nativeFor = new Map(UNIVERSE.map((u) => [u.symbol, provider.nativeSymbol(u.symbol)]));
    let quotes = await provider.fetchQuotes([...nativeFor.values()]);

    // If the preferred provider returned nothing, fall back to Yahoo directly.
    let source = provider.id;
    if (quotes.size === 0 && provider.id !== "yahoo") {
      quotes = await fetchQuotes(UNIVERSE.map((u) => u.yahoo));
      nativeFor.clear();
      for (const u of UNIVERSE) nativeFor.set(u.symbol, u.yahoo);
      source = "yahoo";
    }

    const stocks: Stock[] = UNIVERSE.map((u) => {
      const q = quotes.get(nativeFor.get(u.symbol)!);
      const fallback = mockStocks.find((m) => m.symbol === u.symbol);
      return {
        symbol: u.symbol,
        name: u.name,
        sector: u.sector,
        exchange: u.exchange,
        price: q?.price ?? fallback?.price ?? 0,
        change: q?.change ?? fallback?.change ?? 0,
        changePercent: q?.changePercent ?? fallback?.changePercent ?? 0,
        // Quote feeds lack market cap; keep the indicative mock value when known.
        marketCap: fallback?.marketCap ?? 0,
        volume: q?.volume || fallback?.volume || 0,
        trend: q?.trend ?? fallback?.trend ?? "flat",
      };
    });
    const live = quotes.size > 0;
    if (live) quoteCache.set("all", stocks);
    return { stocks: live ? stocks : mockStocks, live, source: live ? source : "mock" };
  } catch {
    return { stocks: mockStocks, live: false, source: "mock" };
  }
}

export async function getIndices(): Promise<{ indices: MarketIndex[]; live: boolean }> {
  const cached = indexCache.get("all");
  if (cached) return { indices: cached, live: true };

  try {
    const quotes = await fetchQuotes(INDICES.map((i) => i.yahoo));
    const indices: MarketIndex[] = INDICES.map((i) => {
      const q = quotes.get(i.yahoo);
      const fallback = mockIndices.find((m) => m.id === i.id);
      const changePercent = q?.changePercent ?? fallback?.changePercent ?? 0;
      return {
        id: i.id,
        name: i.name,
        value: q?.price ?? fallback?.value ?? 0,
        change: q?.change ?? fallback?.change ?? 0,
        changePercent,
        trend: q?.trend ?? fallback?.trend ?? "flat",
      };
    });
    // Live if the fetch returned at least one real index quote.
    const live = quotes.size > 0;
    if (live) indexCache.set("all", indices);
    return { indices: live ? indices : mockIndices, live };
  } catch {
    return { indices: mockIndices, live: false };
  }
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const [{ stocks, live: s, source }, { indices, live: i }] = await Promise.all([
    getStocks(),
    getIndices(),
  ]);
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  return {
    indices,
    topGainers: sorted.filter((x) => x.changePercent > 0).slice(0, 4),
    topLosers: [...sorted].reverse().filter((x) => x.changePercent < 0).slice(0, 4),
    trending: [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5),
    live: s || i,
    source,
    asOf: new Date().toISOString(),
  };
}

export async function getStock(symbol: string): Promise<Stock | undefined> {
  const { stocks } = await getStocks();
  return stocks.find((s) => s.symbol === symbol);
}

/** Fetch a benchmark index history (e.g. NIFTY 50) by its id. */
export async function getIndexHistory(indexId: string, days = 730): Promise<PricePoint[]> {
  const idx = INDICES.find((i) => i.id === indexId);
  if (!idx) return mockPriceHistory(indexId, days);
  try {
    const candles = await fetchHistory(idx.yahoo, days);
    return candles.length > 0 ? candles : mockPriceHistory(indexId, days);
  } catch {
    return mockPriceHistory(indexId, days);
  }
}

export async function getStockHistory(symbol: string, days = 90): Promise<PricePoint[]> {
  const key = `${symbol}:${days}`;
  const cached = historyCache.get(key);
  if (cached) return cached;

  const entry = bySymbol.get(symbol);
  if (!entry) return mockPriceHistory(symbol, days);

  try {
    const candles = await fetchHistory(entry.yahoo, days);
    if (candles.length > 0) {
      historyCache.set(key, candles);
      return candles;
    }
    return mockPriceHistory(symbol, days);
  } catch {
    return mockPriceHistory(symbol, days);
  }
}

export async function searchStocks(query: string): Promise<Stock[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { stocks } = await getStocks();
  return stocks.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
  );
}

const detailCache = new TtlCache<StockDetail>(60_000); // 1m for detail

/**
 * Full stock detail: live quote + 1y history + 52w range from Yahoo, with
 * technical indicators computed server-side. Falls back to mock-derived detail
 * if the live fetch fails.
 */
export async function getStockDetail(symbol: string): Promise<StockDetail | undefined> {
  const entry = bySymbol.get(symbol);
  if (!entry) return undefined;

  const cached = detailCache.get(symbol);
  if (cached) return cached;

  const buildMock = (): StockDetail => {
    const stock = mockStocks.find((s) => s.symbol === symbol)!;
    const history = mockPriceHistory(symbol, 365);
    const technicals = computeTechnicals(history, stock.price);
    const prevClose = stock.price - stock.change;
    return {
      stock,
      profile: {
        longName: stock.name,
        sector: stock.sector,
        exchange: stock.exchange,
        currency: "INR",
        summary: `${stock.name} is a ${stock.exchange}-listed company in the ${stock.sector} sector.`,
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
    };
  };

  try {
    const d = await fetchDetail(entry.yahoo);
    if (!d) return buildMock();

    // Daily change: use the prior trading day's close from the series, since the
    // 1y chart's `chartPreviousClose` refers to a year ago, not yesterday.
    const priorClose =
      d.history.length >= 2 ? d.history[d.history.length - 2]!.price : d.previousClose ?? d.price;
    const change = d.price - priorClose;
    const changePercent = priorClose ? (change / priorClose) * 100 : 0;
    const mockFallback = mockStocks.find((s) => s.symbol === symbol);

    const stock: Stock = {
      symbol: entry.symbol,
      name: entry.name,
      sector: entry.sector,
      exchange: entry.exchange,
      price: d.price,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      marketCap: mockFallback?.marketCap ?? 0,
      volume: d.volume ?? mockFallback?.volume ?? 0,
      trend: changePercent > 0.05 ? "up" : changePercent < -0.05 ? "down" : "flat",
    };

    const technicals = computeTechnicals(d.history, d.price, {
      high52w: d.high52w ?? undefined,
      low52w: d.low52w ?? undefined,
    });

    const detail: StockDetail = {
      stock,
      profile: {
        longName: d.longName ?? entry.name,
        sector: entry.sector,
        exchange: d.exchange ?? entry.exchange,
        currency: d.currency ?? "INR",
        summary: `${entry.name} is a ${entry.exchange}-listed company in the ${entry.sector} sector.`,
      },
      stats: {
        dayHigh: d.dayHigh,
        dayLow: d.dayLow,
        previousClose: Number(priorClose.toFixed(2)),
        volume: d.volume,
        marketCap: stock.marketCap,
        high52w: d.high52w,
        low52w: d.low52w,
      },
      technicals,
      history: d.history,
      live: true,
      asOf: new Date().toISOString(),
    };
    detailCache.set(symbol, detail);
    return detail;
  } catch {
    return buildMock();
  }
}
