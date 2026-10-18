import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { darkTheme, lightTheme } from "./theme";
import { useThemeStore } from "./themeStore";
import { ApiProvider } from "./api";
import { router } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

export function App() {
  const mode = useThemeStore((s) => s.mode);
  return (
    <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
      <CssBaseline />
      <ApiProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}
