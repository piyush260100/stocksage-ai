import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../app/api";

/** Runs a shadow-portfolio backtest on demand. */
export function useShadowBacktest() {
  const api = useApi();
  return useMutation({
    mutationFn: (params: { traderId: string; invested: number; startDate: string }) =>
      api.getShadowBacktest(params),
  });
}
