import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../app/api";

export function useTopTraders() {
  const api = useApi();
  return useQuery({
    queryKey: ["top-traders"],
    queryFn: () => api.getTopTraders(),
    refetchInterval: 30_000,
  });
}

export function useTrader(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: ["trader", id],
    queryFn: () => api.getTrader(id as string),
    enabled: Boolean(id),
    refetchInterval: 30_000,
  });
}
