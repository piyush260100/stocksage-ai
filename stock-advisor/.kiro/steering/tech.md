---
inclusion: always
---

# Tech stack & commands

## Stack

- **Web**: React 18, TypeScript, Vite, MUI, TanStack Query, Zustand, Recharts,
  Framer Motion, React Router.
- **Server**: Node + Express + TypeScript (ESM, run via `tsx`); helmet,
  compression, morgan, express-rate-limit.
- **Shared**: framework-agnostic TypeScript domain logic + the `ApiClient` contract.
- **Testing**: Vitest + Testing Library.
- **Platform**: Windows; shell is PowerShell. Use `;` to chain commands, not `&&`.

## Commands (run from repo root)

```bash
npm install                                   # install all workspaces
npm run server                                # Express API at :4000 (tsx watch)
npm run web                                   # Vite dev server at :5173
npm run web:build                             # type-check + production build
npm run web:test                              # Vitest unit tests
npm run server:build                          # compile the server
npm run typecheck --workspace @stock-advisor/server
```

Long-running dev servers (`npm run server`, `npm run web`) must be started as
background processes, never as blocking shell commands.

## Environment

- `apps/web/.env` → `VITE_API_URL=http://localhost:4000` selects live data
  (remove to use the mock client).
- `apps/server/.env` → optional `FINNHUB_API_KEY` to enable the Finnhub provider;
  optional `PORT`.

## External data reality (don't relearn the hard way)

- **Yahoo Finance** `v8/chart` is the reliable free source for NSE/BSE
  (`.NS`/`.BO`); its `v7/quote` and `quoteSummary` now need auth (401).
- **NSE/BSE** official endpoints block programmatic/server access (403) except
  the light `marketStatus`. Treat them as best-effort only.
- **Finnhub** free tier is US-focused; Indian real-time may need a paid plan.
- Always cache (quotes ~10s, history ~5m) and fall back to mock on failure.
