---
inclusion: always
---

# Product: StockSage AI

AI-powered stock predictions and portfolio tools for Indian markets (NSE/BSE).

## What it does

- **Dashboard** — live NIFTY 50 / SENSEX / NIFTY BANK, gainers/losers, trending,
  real-time via Server-Sent Events.
- **Stock detail** — 1-year chart, key stats, technical indicators (SMA, RSI,
  volatility, 52-week range, signal).
- **AI Predictions** — short- and long-term forecasts for any searched stock.
- **Recommendations** — Buy/Hold/Sell ranked by risk tolerance + momentum.
- **Portfolio** — holdings valued with live prices, P&L, sector allocation.
- **Top Investors** — real Indian superinvestors ranked by net worth, with
  publicly-disclosed holdings valued live.
- **Shadow Portfolio** (signature feature) — backtest mirroring an investor vs
  the NIFTY 50.
- **Watchlist, Price Alerts, Global search, Help bot, Light/Dark themes.**

## Audience

Retail investors and enthusiasts in India. The default currency is INR; numbers
use the Indian numbering system (Lakh/Crore).

## Non-negotiable principles

- **Honesty over hype.** This is information/education, never investment advice.
  Keep disclaimers visible. Do not fabricate data, returns, or metrics.
- **Real data where possible.** Prefer live/sourced data; clearly label anything
  mock, delayed, simplified, or illustrative.
- **Graceful degradation.** Live data can fail; always fall back cleanly (live →
  cached → mock) and show the user what they're seeing (LIVE/DEMO badges).
