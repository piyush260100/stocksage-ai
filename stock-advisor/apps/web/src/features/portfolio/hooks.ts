import { useQuery } from "@tanstack/react-query";
import { summarizePortfolio } from "@stock-advisor/shared";
import { useApi } from "../../app/api";

/**
 * Fetches the raw portfolio and derives all metrics via the shared pure
 * function, so web and mobile show identical numbers.
 */
export function usePortfolioSummary() {
  const api = useApi();
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.getPortfolio(),
    select: (portfolio) => summarizePortfolio(portfolio),
    // Reprice holdings with fresh quotes during market hours.
    refetchInterval: 15_000,
  });
}
