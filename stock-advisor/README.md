# StockSage AI

Smart AI predictions and portfolio tools for Indian markets (NSE/BSE). A
TypeScript monorepo with a shared domain layer, an Express data-proxy server,
and a React web app. The architecture is designed so an Expo mobile app can
reuse all the business logic.

## Highlights

- Live NSE/BSE market data via a pluggable provider layer (Finnhub → NSE → Yahoo → mock).
- AI short- & long-term price predictions and buy/hold/sell recommendations.
- Full stock detail with technical indicators (SMA, RSI, volatility, 52-week range).
- **Shadow Portfolio** (signature feature): backtest mirroring a legendary Indian
  investor and compare against the NIFTY 50.
- Top Investors leaderboard with real, publicly-sourced names and holdings.
- Watchlist, price alerts, global search, an in-app help bot, and light/dark themes.

## Structure

```
stock-advisor/
  packages/
    shared/       # types, ApiClient contract, mock + HTTP clients, all domain logic
  apps/
    server/       # Express proxy: pluggable market-data providers + REST API
    web/          # React + TS + Vite + MUI + TanStack Query + Zustand + Recharts + Framer Motion
    mobile/       # Expo (planned — reuses packages/shared)
```

The frontend talks only to the `ApiClient` interface in `packages/shared`. Two
implementations satisfy it: a `mockClient` (standalone demo data) and an
`httpClient` (live data via the Express proxy). The web app picks one based on
`VITE_API_URL` — no UI code changes either way. All domain logic (portfolio
math, recommender, predictor, technical indicators, trader valuation, shadow
backtest, help-bot knowledge) lives in `packages/shared` so it is reusable by
web and mobile.

## Features

### Market & analysis
- **Dashboard** — live NIFTY 50 / SENSEX / NIFTY BANK, top gainers/losers,
  trending, and an interactive price chart. Real-time via Server-Sent Events
  with a `LIVE • <source>` badge and last-updated time.
- **Stock detail** — click any symbol anywhere to open a 1-year chart, key stats
  (day/52-week range, volume), and computed technical indicators (SMA 20/50,
  RSI 14, annualized volatility, a bullish/bearish/neutral signal).
- **AI Predictions** — search any NSE/BSE stock for short-term (1–3 months) and
  long-term (1–3 years) forecasts with target price, expected return, confidence
  and rationale.
- **Recommendations** — stocks ranked Buy/Hold/Sell by risk tolerance and
  momentum, with confidence and reasoning.

### Portfolio & investors
- **Portfolio** — holdings valued with live prices: total value, P&L, cash,
  sector-allocation pie, holdings table.
- **Top Investors** — India's prominent public-market investors (Radhakishan
  Damani, Rekha Jhunjhunwala, Mukul Agrawal, …) ranked by publicly-reported net
  worth, with notable disclosed holdings valued live. Sourced from public
  disclosures; clearly labeled as such.
- **Shadow Portfolio** (signature feature) — pick an investor, an amount, and a
  start date; backtest how you'd have performed mirroring them, with total
  return, CAGR, and **alpha vs NIFTY 50**, a value-over-time chart, and
  best/worst holdings.

### Productivity & UX
- **Watchlist** — star any stock; auto-refreshing live prices.
- **Price Alerts** — set above/below targets; a background watcher checks the
  live stream and raises a toast when crossed.
- **Global search** in the top bar — jump to any stock from anywhere.
- **Help bot ("Sage")** — a rule-based in-app guide that explains features and
  deep-links to the right page (no API key / LLM required).
- **Light & dark themes** — toggle in the top bar; persisted, defaults to the OS
  preference. Charts are theme-aware.
- **Auth** — signup + login with validation and JWT-style session (currently a
  client-side mock store; see Roadmap).

## Live market data (pluggable providers)

The `apps/server` proxy fetches market data through a **pluggable provider
layer** (`apps/server/src/providers`). Each provider implements a common
`MarketDataProvider` interface, and a registry picks the best available source
in priority order, falling back gracefully:

- **Finnhub (`finnhub.io`)** — a real, officially-supported API. Used first for
  quotes when `FINNHUB_API_KEY` is set and reachable. Copy
  `apps/server/.env.example` to `apps/server/.env` and add your key. Note: the
  free tier is primarily US-focused, so Indian (NSE/BSE) real-time quotes may
  need a paid plan; if Finnhub returns no data the server falls back to Yahoo.
- **NSE (`nseindia.com`)** — attempted next. NSE's data-rich endpoints are
  protected (cookie session + browser headers) and frequently return 403 from
  servers/data-center IPs, so this provider does a best-effort handshake and
  reports unavailable when blocked.
- **Yahoo Finance** — the reliable default/fallback. Serves the full Nifty
  universe (`.NS`/`.BO`) without a key.
- **Mock** — indicative data when every live source fails; the dashboard then
  shows a "DEMO DATA" badge.

Hit `GET /api/providers` to see which sources are reachable and which is active.
Adding a new source (BSE, Alpha Vantage, a paid/broker feed) means implementing
one interface and registering it — no route or UI changes.

The tradable universe spans ~60 large/mid-cap NSE names (Nifty 50 + Next 50 +
superinvestor holdings). Quotes are cached ~10s; history ~5m. Data is delayed
(~15 min) and only moves during market hours (09:15–15:30 IST, Mon–Fri).

## API (server)

Base URL defaults to `http://localhost:4000`.

| Method & path | Purpose |
| --- | --- |
| `GET /health` | Liveness probe |
| `GET /api/providers` | Which data sources are reachable / active |
| `GET /api/market/overview` | Indices, gainers/losers, trending |
| `GET /api/market/stream` | Server-Sent Events live market stream |
| `GET /api/stocks/search?q=` | Search the universe |
| `GET /api/stocks/:symbol` | Single live quote |
| `GET /api/stocks/:symbol/history?days=` | Daily price history |
| `GET /api/stocks/:symbol/detail` | Quote + stats + technical indicators |
| `GET /api/portfolio` | Demo portfolio repriced with live quotes |
| `GET /api/recommendations` | Ranked AI recommendations |
| `GET /api/predict/:symbol` | Short/long-term AI forecasts |
| `GET /api/traders` | Top investors leaderboard |
| `GET /api/traders/:id` | A single investor + live-valued holdings |
| `GET /api/traders/:id/shadow?invested=&startDate=` | Shadow-portfolio backtest |

The server is production-hardened: `helmet` security headers, `compression`
(gzip), `morgan` request logging, `express-rate-limit` (120 req/min/IP, SSE
exempt), JSON body-size limits, a central error handler, and graceful shutdown.

## Tech stack

- **Web**: React 18, TypeScript, Vite, MUI, TanStack Query, Zustand, Recharts,
  Framer Motion, React Router.
- **Server**: Node + Express + TypeScript, helmet/compression/morgan/rate-limit.
- **Shared**: framework-agnostic TypeScript domain logic + the `ApiClient` contract.
- **Testing**: Vitest + Testing Library.

## Getting started

```bash
npm install           # from the repo root (installs all workspaces)

# Run the live-data server and the web app in two terminals:
npm run server        # Express proxy at http://localhost:4000
npm run web           # web dev server at http://localhost:5173

npm run web:test      # run web unit tests (Vitest)
npm run web:build     # type-check + production build
npm run server:build  # compile the server
```

Config:
- `apps/web/.env` → `VITE_API_URL=http://localhost:4000` selects live data.
  Remove it (or stop the server) to run on mock data only.
- `apps/server/.env` → optional `FINNHUB_API_KEY` to enable the Finnhub provider.

Demo credentials are pre-filled on the login screen, or create an account via Sign Up.

## Performance

The web bundle is route- and vendor-split: lazy-loaded pages each become a small
chunk (~2–7 KB), vendor libraries (MUI, Recharts, Framer Motion, React Query)
are isolated into cacheable chunks, and the initial entry is ~54 KB (~20 KB
gzipped).

## SEO

Public entry points carry full metadata (the app is a client-rendered SPA, so
in-app pages behind auth are intentionally not crawled):

- Rich meta tags in `apps/web/index.html`: title, description, keywords,
  canonical, `theme-color`, Open Graph + Twitter cards, and schema.org
  `WebApplication` JSON-LD.
- `apps/web/public/robots.txt` — allows public routes, disallows app routes,
  points to the sitemap.
- `apps/web/public/sitemap.xml` — public URLs (`/`, `/login`, `/signup`).
- `apps/web/public/site.webmanifest` + `favicon.svg` + `og-image.svg`.
- Dynamic per-route `document.title` via `useDocumentTitle` (good for history,
  bookmarks, and share previews).

Replace `https://stocksage.ai` with your real domain in the meta tags, sitemap,
and robots before deploying.

## Kiro steering & MCP

This repo is set up for the Kiro agent:

- **Steering files** (`.kiro/steering/`) provide always-on project context:
  - `product.md` — what the app is and its non-negotiable principles.
  - `structure.md` — monorepo layout and the "golden rules" (ApiClient contract,
    shared domain logic, provider layer, feature-first web).
  - `tech.md` — stack, commands, environment, and external-data realities.
  - `mcp-and-tools.md` — how/when to use the configured MCP tools.
  - `keep-docs-updated.md` — the documentation policy below.
- **MCP** (`.kiro/settings/mcp.json`) configures a `fetch` server
  (`mcp-server-fetch`) for clean web-content retrieval during research. It runs
  via `uvx`, so it requires **uv** (`pip install uv` or the astral.sh installer).
  The app does not depend on MCP; if `uv` is absent the server simply won't
  start.

## Documentation policy

A steering rule (`.kiro/steering/keep-docs-updated.md`) requires this README and
related docs (env examples, SEO assets) to be updated in the same change that
alters features, API endpoints, architecture, dependencies, or setup. Treat
stale docs as a bug.

## Testing

```bash
npm run web:test
```

Unit tests cover the pure domain logic and client stores: portfolio math,
recommender, predictor, technical indicators, shadow backtest, signup
validation + mock auth flow, help-bot intent routing, watchlist, and alert
evaluation.

## Roadmap

1. **Real backend auth + MongoDB** so accounts, watchlist, alerts and portfolio
   become per-user and server-persisted (currently client-side via Zustand).
2. **Server-side alert evaluation** with email/push notifications.
3. **Expo mobile app** under `apps/mobile`, reusing `@stock-advisor/shared`.
4. Replace the stub recommender/predictor with model-backed services.
5. Add a licensed/broker data provider for true real-time NSE/BSE ticks.
6. CI pipeline + Dockerfile for deployment.

## Disclaimer

StockSage AI is for information and education only and is **not investment
advice**. Predictions, recommendations, and technical signals are
model-generated estimates. Investor data is from public disclosures and may be
simplified. Market data is delayed. Always do your own research.
