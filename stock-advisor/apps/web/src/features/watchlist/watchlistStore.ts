import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

/** Persisted watchlist of stock symbols. */
export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: [],
      add: (symbol) =>
        set((s) => (s.symbols.includes(symbol) ? s : { symbols: [...s.symbols, symbol] })),
      remove: (symbol) => set((s) => ({ symbols: s.symbols.filter((x) => x !== symbol) })),
      toggle: (symbol) =>
        set((s) =>
          s.symbols.includes(symbol)
            ? { symbols: s.symbols.filter((x) => x !== symbol) }
            : { symbols: [...s.symbols, symbol] },
        ),
      has: (symbol) => get().symbols.includes(symbol),
    }),
    { name: "stocksage-watchlist" },
  ),
);
