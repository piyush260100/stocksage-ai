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
    try {
      unsub = api.subscribeMarket((overview) => {
        setData(overview);
        setError(null);
      });
    } catch (err) {
      setError(err);
    }
    return () => unsub();
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
