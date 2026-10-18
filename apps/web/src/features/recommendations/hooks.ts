import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../app/api";

export function useRecommendations() {
  const api = useApi();
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: () => api.getRecommendations(),
    // Recompute against fresh quotes periodically.
    refetchInterval: 30_000,
  });
}
