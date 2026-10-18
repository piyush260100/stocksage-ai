import { useEffect } from "react";
import type { MarketOverview } from "@stock-advisor/shared";
import { useApi } from "../../app/api";
import { useAlertStore } from "./alertStore";
import { toast } from "../../components/toast";

/**
 * Subscribes to the live market stream and evaluates price alerts on each tick,
 * firing a toast when one triggers. Mounted once at the app shell level.
 */
export function useAlertWatcher() {
  const api = useApi();
  const evaluate = useAlertStore((s) => s.evaluate);

  useEffect(() => {
    const handle = (overview: MarketOverview) => {
      // Build a price map from all stocks present in the overview snapshot.
      const priceBySymbol = new Map<string, number>();
      for (const group of [overview.topGainers, overview.topLosers, overview.trending]) {
        for (const s of group) priceBySymbol.set(s.symbol, s.price);
      }
      const triggered = evaluate(priceBySymbol);
      for (const a of triggered) {
        toast.warning(
          `🔔 ${a.symbol} is now ${a.direction} ₹${a.target.toLocaleString("en-IN")}`,
        );
      }
    };
    const unsub = api.subscribeMarket(handle);
    return () => unsub();
  }, [api, evaluate]);
}
