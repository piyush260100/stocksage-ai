import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import {
  recommendStocks,
  predictStock,
  mockPortfolio,
  mockUser,
  mockTraders,
  valueTrader,
  rankTraders,
  backtestShadowPortfolio,
  type PricePoint,
} from "@stock-advisor/shared";
import {
  getMarketOverview,
  getStock,
  getStockHistory,
  getStockDetail,
  getStocks,
  getIndexHistory,
  searchStocks,
} from "./marketService.js";
import { providers, nseProvider, yahooProvider, finnhubProvider } from "./providers/index.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

// --- Production middleware ---------------------------------------------------
app.disable("x-powered-by");
app.use(helmet()); // secure HTTP headers
app.use(compression()); // gzip responses
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")); // request logs

// Basic rate limiting to protect the proxy and upstream providers.
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    max: 120, // 120 requests/min/IP
    standardHeaders: true,
    legacyHeaders: false,
    // The SSE stream holds a long-lived connection; don't rate-limit it.
    skip: (req) => req.path === "/market/stream",
  }),
);

/** Wraps an async handler so thrown errors become 500s instead of crashing. */
const asyncHandler =
  (fn: (req: express.Request, res: express.Response) => Promise<void>) =>
  (req: express.Request, res: express.Response) => {
    fn(req, res).catch((err) => {
      console.error(err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
    });
  };

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Diagnostic: which data providers are reachable right now.
app.get(
  "/api/providers",
  asyncHandler(async (_req, res) => {
    const [finnhub, nse, yahoo] = await Promise.all([
      finnhubProvider.isAvailable(),
      nseProvider.isAvailable(),
      yahooProvider.isAvailable(),
    ]);
    res.json({
      active: providers.activeQuoteSource(),
      finnhubKeyConfigured: Boolean(process.env.FINNHUB_API_KEY),
      available: { finnhub, nse, yahoo },
    });
  }),
);

app.get(
  "/api/market/overview",
  asyncHandler(async (_req, res) => {
    const overview = await getMarketOverview();
    res.json(overview);
  }),
);

/**
 * Server-Sent Events stream of the market overview. Pushes an initial snapshot
 * immediately, then a fresh one every 10s, giving the dashboard a real-time
 * feel without the client polling. The connection cleans up on client close.
 */
app.get("/api/market/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  let closed = false;

  const push = async () => {
    if (closed) return;
    try {
      const overview = await getMarketOverview();
      res.write(`data: ${JSON.stringify(overview)}\n\n`);
    } catch (err) {
      console.error("stream error", err);
    }
  };

  void push();
  const interval = setInterval(push, 10_000);

  req.on("close", () => {
    closed = true;
    clearInterval(interval);
    res.end();
  });
});

app.get(
  "/api/stocks/search",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "");
    res.json(await searchStocks(q));
  }),
);

app.get(
  "/api/stocks/:symbol",
  asyncHandler(async (req, res) => {
    const symbol = req.params.symbol ?? "";
    const stock = await getStock(symbol);
    if (!stock) {
      res.status(404).json({ error: `Unknown symbol: ${symbol}` });
      return;
    }
    res.json(stock);
  }),
);

app.get(
  "/api/stocks/:symbol/history",
  asyncHandler(async (req, res) => {
    const days = req.query.days ? Number(req.query.days) : 90;
    res.json(await getStockHistory(req.params.symbol ?? "", days));
  }),
);

app.get(
  "/api/stocks/:symbol/detail",
  asyncHandler(async (req, res) => {
    const symbol = req.params.symbol ?? "";
    const detail = await getStockDetail(symbol);
    if (!detail) {
      res.status(404).json({ error: `Unknown symbol: ${symbol}` });
      return;
    }
    res.json(detail);
  }),
);

app.get(
  "/api/portfolio",
  asyncHandler(async (_req, res) => {
    // Refresh holding prices with live quotes before returning.
    const { stocks } = await getStocks();
    const priceBySymbol = new Map(stocks.map((s) => [s.symbol, s.price]));
    const holdings = mockPortfolio.holdings.map((h) => ({
      ...h,
      currentPrice: priceBySymbol.get(h.symbol) ?? h.currentPrice,
    }));
    res.json({ ...mockPortfolio, holdings });
  }),
);

app.get(
  "/api/recommendations",
  asyncHandler(async (_req, res) => {
    const { stocks } = await getStocks();
    res.json(recommendStocks(stocks, mockPortfolio, mockUser.riskTolerance));
  }),
);

app.get(
  "/api/predict/:symbol",
  asyncHandler(async (req, res) => {
    const symbol = req.params.symbol ?? "";
    const stock = await getStock(symbol);
    if (!stock) {
      res.status(404).json({ error: `Unknown symbol: ${symbol}` });
      return;
    }
    res.json(predictStock(stock));
  }),
);

app.get(
  "/api/traders",
  asyncHandler(async (_req, res) => {
    const { stocks } = await getStocks();
    const priceBySymbol = new Map(stocks.map((s) => [s.symbol, s.price]));
    const valued = mockTraders.map((t) => valueTrader(t, priceBySymbol));
    res.json(rankTraders(valued));
  }),
);

app.get(
  "/api/traders/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id ?? "";
    const trader = mockTraders.find((t) => t.id === id);
    if (!trader) {
      res.status(404).json({ error: `Unknown trader: ${id}` });
      return;
    }
    const { stocks } = await getStocks();
    const priceBySymbol = new Map(stocks.map((s) => [s.symbol, s.price]));
    res.json(valueTrader(trader, priceBySymbol));
  }),
);

app.get(
  "/api/traders/:id/shadow",
  asyncHandler(async (req, res) => {
    const id = req.params.id ?? "";
    const trader = mockTraders.find((t) => t.id === id);
    if (!trader) {
      res.status(404).json({ error: `Unknown trader: ${id}` });
      return;
    }
    const invested = Math.max(1, Number(req.query.invested ?? 100000));
    const startDate = String(req.query.startDate ?? "2024-01-01");

    const { stocks, live } = await getStocks();
    const priceBySymbol = new Map(stocks.map((s) => [s.symbol, s.price]));

    // Fetch ~2y history for each held symbol plus the NIFTY 50 benchmark.
    const historyBySymbol = new Map<string, PricePoint[]>();
    await Promise.all(
      trader.holdings.map(async (h) => {
        historyBySymbol.set(h.symbol, await getStockHistory(h.symbol, 730));
      }),
    );
    const benchmark = await getIndexHistory("nifty50", 730);

    res.json(
      backtestShadowPortfolio({
        trader,
        invested,
        startDate,
        priceBySymbol,
        historyBySymbol,
        benchmark,
        live,
      }),
    );
  }),
);

// 404 for unknown API routes.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler — ensures a clean JSON error and no stack leaks.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`StockSage AI server listening on http://localhost:${PORT}`);
});

// Graceful shutdown so in-flight requests finish and the port is released.
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
