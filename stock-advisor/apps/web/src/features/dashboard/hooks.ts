import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MarketOverview } from "@stock-advisor/shared";
import { useApi } from "../../app/api";

/**
 * Live market overview backed by a push stream (SSE in live mode, simulated
 * ticks in mock mode). Returns the latest snapshot plus loading/error state so
 * the UI updates in real time without manual polling.
 */
export function useMarketOverview() {
  const api = useApi();
  const [data, setData] = useState<MarketOverview | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let unsub = () => {};
    let received = false;
    // If no data arrives within 15s, surface an error instead of spinning.
    const guard = setTimeout(() => {
      if (!received) setError(new Error("Timed out loading market data. Is the server running?"));
    }, 15_000);
    try {
      unsub = api.subscribeMarket((overview) => {
        received = true;
        clearTimeout(guard);
        setData(overview);
        setError(null);
      });
    } catch (err) {
      clearTimeout(guard);
      setError(err);
    }
    return () => {
      clearTimeout(guard);
      unsub();
    };
  }, [api]);

  return {
    data,
    isLoading: data === null && error === null,
    isError: error !== null,
    error,
  };
}

export function useStockHistory(symbol: string, days = 90) {
  const api = useApi();
  return useQuery({
    queryKey: ["stock-history", symbol, days],
    queryFn: () => api.getStockHistory(symbol, days),
    enabled: Boolean(symbol),
  });
}
