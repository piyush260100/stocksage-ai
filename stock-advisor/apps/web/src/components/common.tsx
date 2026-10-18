import { Box, Chip, CircularProgress, Link as MuiLink, Typography } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link as RouterLink } from "react-router-dom";
import type { Trend } from "@stock-advisor/shared";
import { trendColors } from "../app/theme";

/** A stock symbol rendered as a link to its detail page. */
export function StockLink({ symbol }: { symbol: string }) {
  return (
    <MuiLink
      component={RouterLink}
      to={`/stock/${symbol}`}
      underline="hover"
      onClick={(e) => e.stopPropagation()}
      sx={{ fontWeight: 600, color: "inherit", "&:hover": { color: "primary.main" } }}
    >
      {symbol}
    </MuiLink>
  );
}

/** Formats a number as INR currency. */
export const formatCurrency = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

/** Formats a signed percentage, e.g. +1.24%. */
export const formatPercent = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

/** Compact large numbers using the Indian numbering system (Lakh/Crore). */
export const formatCompact = (n: number) =>
  n.toLocaleString("en-IN", { notation: "compact", maximumFractionDigits: 2 });

export function TrendText({
  value,
  children,
}: {
  value: number;
  children: React.ReactNode;
}) {
  const color = value > 0 ? trendColors.up : value < 0 ? trendColors.down : trendColors.flat;
  return (
    <Box component="span" sx={{ color, display: "inline-flex", alignItems: "center", fontWeight: 600 }}>
      {value > 0 && <ArrowDropUpIcon fontSize="small" />}
      {value < 0 && <ArrowDropDownIcon fontSize="small" />}
      {children}
    </Box>
  );
}

export function TrendChip({ trend }: { trend: Trend }) {
  return (
    <Chip
      size="small"
      label={trend.toUpperCase()}
      sx={{ bgcolor: `${trendColors[trend]}22`, color: trendColors[trend], fontWeight: 700 }}
    />
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 4 }}>
      <CircularProgress size={24} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <Box sx={{ p: 4 }}>
      <Typography color="error">⚠️ {message}</Typography>
    </Box>
  );
}
