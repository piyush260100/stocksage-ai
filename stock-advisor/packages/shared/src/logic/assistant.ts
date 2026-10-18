import type { KnowledgeEntry, Suggestion } from "../types/assistant.js";

/**
 * Knowledge base for the in-app help bot. This is a deterministic, rule-based
 * assistant (no LLM/API key) that explains the app's features and links to the
 * right pages. Shared so web and mobile can reuse the same guidance.
 */
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "greeting",
    patterns: ["hi", "hello", "hey", "start", "help", "what can you do", "who are you"],
    answer:
      "Hi! I'm Sage, your guide to StockSage AI. I can explain any feature and take you there. Try asking about the Dashboard, Portfolio, AI Predictions, Recommendations, Top Traders, or stock search.",
  },
  {
    id: "dashboard",
    patterns: ["dashboard", "market", "indices", "nifty", "sensex", "gainers", "losers", "trending"],
    answer:
      "The Dashboard shows the live Indian market: NIFTY 50, SENSEX and NIFTY BANK, plus top gainers, losers and trending stocks. It updates in real time (look for the pulsing LIVE badge and the 'Updated' time). Click any stock to open its full details.",
    links: [{ label: "Open Dashboard", to: "/dashboard" }],
  },
  {
    id: "portfolio",
    patterns: ["portfolio", "my holdings", "my stocks", "pnl", "p&l", "allocation", "my investments"],
    answer:
      "The Portfolio page shows your holdings valued with live prices: total value, profit/loss, cash, sector allocation pie, and a holdings table. Figures refresh automatically.",
    links: [{ label: "Open Portfolio", to: "/portfolio" }],
  },
  {
    id: "recommendations",
    patterns: ["recommend", "recommendation", "buy", "sell", "hold", "suggest", "what to buy"],
    answer:
      "Recommendations ranks stocks as Buy / Hold / Sell based on your risk tolerance and market momentum, each with a confidence score and reasoning. It recomputes against live quotes.",
    links: [{ label: "Open Recommendations", to: "/recommendations" }],
  },
  {
    id: "predictions",
    patterns: ["predict", "prediction", "forecast", "future", "target price", "short term", "long term", "ai"],
    answer:
      "AI Predictions lets you search any NSE/BSE stock and get short-term (1–3 months) and long-term (1–3 years) forecasts with target price, expected return, confidence and reasoning. Just search a symbol or company name.",
    links: [{ label: "Open AI Predictions", to: "/predict" }],
  },
  {
    id: "search",
    patterns: ["search", "find stock", "look up", "find a stock", "search stock"],
    answer:
      "You can search any stock on the AI Predictions page using the search box — type a symbol like RELIANCE or a company name like Infosys. From results you can view predictions and full technical details.",
    links: [{ label: "Search stocks", to: "/predict" }],
  },
  {
    id: "stock-detail",
    patterns: ["detail", "technical", "metrics", "rsi", "sma", "52 week", "company", "indicators", "fundamentals"],
    answer:
      "Click any stock symbol anywhere in the app to open its detail page. It shows a 1-year chart, key stats (day/52-week range, volume, market cap), technical indicators (SMA 20/50, RSI, volatility, a signal) and a company profile.",
    links: [{ label: "Browse stocks on Dashboard", to: "/dashboard" }],
  },
  {
    id: "traders",
    patterns: ["trader", "traders", "investor", "investors", "top traders", "superinvestor", "damani", "jhunjhunwala"],
    answer:
      "Top Investors lists India's most prominent public-market investors (like Radhakishan Damani and Rekha Jhunjhunwala) ranked by net worth. Click one to see their notable disclosed holdings valued with live quotes.",
    links: [{ label: "Open Top Investors", to: "/traders" }],
  },
  {
    id: "shadow",
    patterns: ["shadow", "mirror", "copy", "copy portfolio", "backtest", "what if", "shadow portfolio", "mirror portfolio", "usp"],
    answer:
      "Shadow Portfolio is our signature feature: pick a legendary investor, an amount and a start date, and we backtest how you'd have done by mirroring their portfolio — including total return, CAGR, and alpha vs the NIFTY 50, with a value-over-time chart.",
    links: [{ label: "Try Shadow Portfolio", to: "/shadow" }],
  },
  {
    id: "watchlist",
    patterns: ["watchlist", "watch list", "track", "star", "favourite", "favorite", "follow stock"],
    answer:
      "Add any stock to your Watchlist by tapping the ☆ star on its detail page. The Watchlist page shows all your tracked stocks with live prices that refresh automatically.",
    links: [{ label: "Open Watchlist", to: "/watchlist" }],
  },
  {
    id: "alerts",
    patterns: ["alert", "alerts", "price alert", "notify", "notification", "remind", "target price alert"],
    answer:
      "Set a Price Alert by tapping the 🔔 bell on a stock's detail page — choose above/below and a target price. You'll get a notification when the live price crosses it. Manage all alerts on the Price Alerts page.",
    links: [{ label: "Open Price Alerts", to: "/alerts" }],
  },
  {
    id: "live-data",
    patterns: ["live", "real time", "realtime", "real-time", "delayed", "data source", "accurate", "updating"],
    answer:
      "Market data comes from a live NSE/BSE source and is delayed by roughly 15 minutes. Prices only move while the market is open (09:15–15:30 IST, Mon–Fri). The Dashboard shows a LIVE badge and the last-updated time; if the source is unreachable it falls back to DEMO data.",
  },
  {
    id: "risk",
    patterns: ["risk", "risk tolerance", "conservative", "aggressive", "change risk"],
    answer:
      "Your risk tolerance (low / medium / high) is set when you sign up and drives how Recommendations and Predictions are tuned. Low favors stability, high favors growth.",
  },
  {
    id: "account",
    patterns: ["login", "log in", "sign up", "signup", "account", "register", "logout", "password"],
    answer:
      "You can create an account on the Sign Up page (name, email, password, risk tolerance) or log in from the Login page. A demo account is pre-filled on the login screen so you can explore right away. Use the Logout button in the top bar to sign out.",
  },
  {
    id: "disclaimer",
    patterns: ["advice", "safe", "should i buy", "guarantee", "trust", "reliable"],
    answer:
      "StockSage AI is for information and education only — it is not investment advice. Predictions and signals are model-generated estimates, and markets are risky. Always do your own research.",
  },
];

/** Suggested quick-reply chips shown when the chat opens. */
export const SUGGESTIONS: Suggestion[] = [
  { label: "What can you do?", query: "what can you do" },
  { label: "How do predictions work?", query: "how do predictions work" },
  { label: "Show me the dashboard", query: "dashboard" },
  { label: "Top investors", query: "top traders" },
  { label: "Is the data live?", query: "is the data live" },
];

const FALLBACK =
  "I'm not sure about that one. I can help with the Dashboard, Portfolio, Recommendations, AI Predictions, stock search & details, Top Investors, live data, and your account. What would you like to know?";

/** Normalize text for matching: lowercase, strip punctuation. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s&]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Score how well a query matches a knowledge entry by counting pattern hits,
 * weighting longer (more specific) phrases higher.
 */
function scoreEntry(query: string, entry: KnowledgeEntry): number {
  const q = normalize(query);
  let score = 0;
  for (const pattern of entry.patterns) {
    const p = normalize(pattern);
    if (!p) continue;
    if (q === p) score += 10;
    else if (q.includes(p)) score += p.includes(" ") ? 4 : 2;
    else if (p.includes(" ") && p.split(" ").every((w) => q.includes(w))) score += 3;
  }
  return score;
}

/** The bot's answer plus any links. */
export interface BotReply {
  answer: string;
  links?: { label: string; to: string }[];
}

/** Match a user query to the best knowledge entry, or return a fallback. */
export function answerQuery(query: string): BotReply {
  if (!query.trim()) return { answer: FALLBACK };

  let best: KnowledgeEntry | null = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    const score = scoreEntry(query, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (!best || bestScore === 0) return { answer: FALLBACK };
  return { answer: best.answer, links: best.links };
}
