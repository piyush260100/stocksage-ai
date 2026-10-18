import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PriceAlert, AlertDirection } from "@stock-advisor/shared";

const uid = () => Math.random().toString(36).slice(2);

interface AlertState {
  alerts: PriceAlert[];
  add: (input: {
    symbol: string;
    name: string;
    direction: AlertDirection;
    target: number;
    createdPrice: number;
  }) => void;
  remove: (id: string) => void;
  /**
   * Evaluate active alerts against the latest prices. Returns alerts that just
   * triggered so the UI can notify the user. Marks them triggered in-place.
   */
  evaluate: (priceBySymbol: Map<string, number>) => PriceAlert[];
}

/** Persisted price alerts with client-side evaluation. */
export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      add: (input) =>
        set((s) => ({
          alerts: [
            ...s.alerts,
            {
              id: uid(),
              status: "active",
              createdAt: new Date().toISOString(),
              ...input,
            },
          ],
        })),
      remove: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      evaluate: (priceBySymbol) => {
        const triggered: PriceAlert[] = [];
        const next = get().alerts.map((a) => {
          if (a.status !== "active") return a;
          const price = priceBySymbol.get(a.symbol);
          if (price == null) return a;
          const hit = a.direction === "above" ? price >= a.target : price <= a.target;
          if (hit) {
            const updated: PriceAlert = {
              ...a,
              status: "triggered",
              triggeredAt: new Date().toISOString(),
            };
            triggered.push(updated);
            return updated;
          }
          return a;
        });
        if (triggered.length > 0) set({ alerts: next });
        return triggered;
      },
    }),
    { name: "stocksage-alerts" },
  ),
);
