import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE = "StockSage AI";

/** Human-readable titles per route prefix, for the browser tab and bookmarks. */
const TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/" || p.startsWith("/dashboard"), title: "Market Dashboard" },
  { match: (p) => p.startsWith("/portfolio"), title: "My Portfolio" },
  { match: (p) => p.startsWith("/watchlist"), title: "Watchlist" },
  { match: (p) => p.startsWith("/recommendations"), title: "AI Recommendations" },
  { match: (p) => p.startsWith("/predict"), title: "AI Predictions" },
  { match: (p) => p.startsWith("/traders"), title: "Top Investors" },
  { match: (p) => p.startsWith("/shadow"), title: "Shadow Portfolio" },
  { match: (p) => p.startsWith("/alerts"), title: "Price Alerts" },
  { match: (p) => p.startsWith("/stock/"), title: "Stock Details" },
  { match: (p) => p.startsWith("/login"), title: "Sign In" },
  { match: (p) => p.startsWith("/signup"), title: "Create Account" },
];

/** Keeps document.title in sync with the active route. */
export function useDocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const entry = TITLES.find((t) => t.match(pathname));
    // For stock detail, surface the symbol from the path.
    if (pathname.startsWith("/stock/")) {
      const symbol = decodeURIComponent(pathname.split("/")[2] ?? "");
      document.title = symbol ? `${symbol} — ${BASE}` : `Stock Details — ${BASE}`;
      return;
    }
    document.title = entry ? `${entry.title} — ${BASE}` : BASE;
  }, [pathname]);
}
