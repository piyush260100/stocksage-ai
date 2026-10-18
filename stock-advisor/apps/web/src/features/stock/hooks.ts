import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../app/api";

export function useStockDetail(symbol: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: ["stock-detail", symbol],
    queryFn: () => api.getStockDetail(symbol as string),
    enabled: Boolean(symbol),
    // Keep the quote portion reasonably fresh.
    refetchInterval: 20_000,
  });
}
