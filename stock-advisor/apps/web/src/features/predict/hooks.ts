import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../app/api";

/** Searches NSE/BSE stocks. Disabled until the query has at least 1 char. */
export function useStockSearch(query: string) {
  const api = useApi();
  return useQuery({
    queryKey: ["stock-search", query],
    queryFn: () => api.searchStocks(query),
    enabled: query.trim().length > 0,
  });
}

/** Runs the AI prediction agent for a selected symbol. */
export function useStockPrediction(symbol: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["stock-prediction", symbol],
    queryFn: () => api.predictStock(symbol as string),
    enabled: Boolean(symbol),
  });
}
