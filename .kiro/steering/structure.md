---
inclusion: always
---

# Project structure & conventions

Monorepo using npm workspaces. The project lives at the repository root
(the repo IS StockSage — there is no nested project folder).

```
<repo root>/        # StockSage AI
  packages/
    shared/     # @stock-advisor/shared — all framework-agnostic domain logic
      src/
        types/    # domain types (stock, portfolio, prediction, trader, …)
        logic/    # pure functions (portfolio, recommender, predictor, technicals,
                  #   traders, shadow, validation, assistant)
        api/      # ApiClient interface + mockClient + httpClient
        mocks/    # seed/demo data
  apps/
    server/     # @stock-advisor/server — Express REST API + data providers
      src/
        providers/  # MarketDataProvider interface + finnhub/nse/yahoo + registry
        marketService.ts  # orchestration + caching + fallback
        index.ts    # routes + middleware
    web/        # @stock-advisor/web — React + Vite SPA
      src/
        app/        # providers, router, theme, stores (api, theme, title)
        components/  # shared UI (layout, common, motion, toast, search, bot host)
        features/<name>/  # feature-scoped pages + hooks + tests
```

## Golden rules

1. **The `ApiClient` interface in `packages/shared` is the single contract.**
   The web app depends only on it. New data operations: add to the interface,
   implement in BOTH `mockClient` and `httpClient`, then add the server route.
2. **Domain logic lives in `packages/shared`, not in apps.** Keep it pure and
   framework-agnostic so web and (future) mobile reuse it. Add Vitest coverage
   for new pure logic.
3. **Server data flows through the provider layer.** Never call an external API
   directly from a route. Add a `MarketDataProvider`, register it, and let the
   registry pick/fallback. History/detail default to Yahoo.
4. **Feature-first on the web.** Each feature gets its own folder with its page,
   hooks, and tests. Shared presentational bits go in `components/`.

## Conventions

- TypeScript strict everywhere; prefer explicit types on exported functions.
- Client state: Zustand (persisted where it should survive reloads). Server
  state: TanStack Query. Don't mix the two concerns.
- Money is INR; format via helpers in `components/common` (`formatCurrency`,
  `formatCompact` using `en-IN`).
- Keep components presentational; put data fetching in `hooks.ts` per feature.
- Verify changes with `npm run web:build`, `npm run web:test`, and
  `npm run typecheck --workspace @stock-advisor/server` before finishing.
