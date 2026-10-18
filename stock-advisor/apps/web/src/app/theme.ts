import { createTheme, type Theme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

/** Build a theme for the given mode. Shared tokens, mode-specific palette. */
export function buildTheme(mode: ThemeMode): Theme {
  const isDark = mode === "dark";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return createTheme({
    palette: {
      mode,
      primary: { main: "#4f8cff" },
      background: isDark
        ? { default: "#0d1117", paper: "#161b22" }
        : { default: "#f4f6fb", paper: "#ffffff" },
      success: { main: isDark ? "#2ecc71" : "#1a9e55" },
      error: { main: isDark ? "#ff5c5c" : "#e03131" },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
      h4: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${borderColor}`,
            transition: "border-color 0.25s ease, background-color 0.25s ease",
            "&:hover": { borderColor: "rgba(79,140,255,0.35)" },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 8, margin: "2px 8px", transition: "all 0.2s ease" },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { transition: "all 0.2s ease" },
        },
      },
    },
  });
}

/** Pre-built themes. */
export const darkTheme = buildTheme("dark");
export const lightTheme = buildTheme("light");

/** Semantic colors for market direction, used across charts and tables. */
export const trendColors = {
  up: "#2ecc71",
  down: "#ff5c5c",
  flat: "#9aa4b2",
} as const;

/** Theme-aware colors for Recharts (tooltips, grid lines). */
export function chartColors(mode: ThemeMode) {
  const isDark = mode === "dark";
  return {
    tooltipBg: isDark ? "#161b22" : "#ffffff",
    tooltipBorder: isDark ? "#30363d" : "#d0d7de",
    tooltipText: isDark ? "#e6edf3" : "#1c2128",
    grid: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
  };
}
