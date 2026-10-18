# StockSage AI

Smart AI predictions for Indian markets (NSE/BSE). Monorepo with a shared domain layer, a React web app, and (next) an Expo mobile app.

## Structure

```
stock-advisor/
  packages/
    shared/       # types, API contract, mock + HTTP client, portfolio/recommender/predictor logic
  apps/
    server/       # Express proxy fetching live NSE/BSE data from Yahoo Finance
    web/          # React + TS + Vite + MUI + TanStack Query + Zustand + Recharts
    mobile/       # Expo (coming next)
```

The frontend talks only to the `ApiClient` interface in `packages/shared`. Two
implementations satisfy it: a `mockClient` (standalone demo data) and an
`httpClient` (live data via the Express proxy). The web app picks one based on
`VITE_API_URL` — no UI code changes either way.

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

The dashboard badge shows which source is live (e.g. `LIVE • YAHOO`). Hit
`GET /api/providers` to see which sources are currently reachable. Adding a new
source (BSE, Alpha Vantage, a paid/broker feed) means implementing one
interface and registering it — no route or UI changes.

The tradable universe spans ~60 large/mid-cap NSE names (Nifty 50 + Next 50 +
superinvestor holdings), so search and the dashboard cover far more than a
handful of stocks. Quotes are cached ~10s; history ~5m.

## Features

- **Dashboard** – market indices, price history chart, top gainers/losers, trending.
- **Portfolio** – summary cards, sector allocation pie, holdings table with P&L.
- **Recommendations** – ranked AI suggestions with action, confidence, target, rationale.
- **Auth** – JWT-style session (mocked), persisted client-side via Zustand.

## Getting started

```bash
npm install           # from the repo root (installs all workspaces)

# Run the live-data server and the web app in two terminals:
npm run server        # Express proxy at http://localhost:4000
npm run web           # web dev server at http://localhost:5173

npm run web:test      # run web unit tests
npm run web:build     # type-check + production build
```

The web app reads `apps/web/.env` → `VITE_API_URL=http://localhost:4000` to use
live data. Comment that line out (or stop the server) to run on mock data only.

Demo credentials are pre-filled on the login screen.

## Next steps

1. Scaffold the Expo mobile app under `apps/mobile`, reusing `@stock-advisor/shared`.
2. Build the Node.js + Express + MongoDB backend (REST), implementing `ApiClient`.
3. Replace the stub recommender in `shared/src/logic/recommender.ts` with a real
   model-backed service.
```
