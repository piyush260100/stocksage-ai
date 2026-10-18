import { createContext, useContext, type ReactNode } from "react";
import {
  createMockApiClient,
  createHttpApiClient,
  type ApiClient,
} from "@stock-advisor/shared";

/**
 * Provides the ApiClient to the whole app via context.
 *
 * If VITE_API_URL is set, we use the real HTTP client (live NSE/BSE data via
 * the Node proxy). Otherwise we fall back to the mock client so the app still
 * runs standalone. Swapping is a single decision here — no UI code changes.
 */
const ApiContext = createContext<ApiClient | null>(null);

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const defaultClient: ApiClient = apiUrl
  ? createHttpApiClient(apiUrl)
  : createMockApiClient();

export function ApiProvider({
  client = defaultClient,
  children,
}: {
  client?: ApiClient;
  children: ReactNode;
}) {
  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClient {
  const client = useContext(ApiContext);
  if (!client) throw new Error("useApi must be used within an ApiProvider");
  return client;
}
