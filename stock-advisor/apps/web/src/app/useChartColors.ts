import { useTheme } from "@mui/material/styles";
import { chartColors, type ThemeMode } from "./theme";

/** Returns theme-aware Recharts colors based on the active MUI theme mode. */
export function useChartColors() {
  const theme = useTheme();
  return chartColors(theme.palette.mode as ThemeMode);
}
