import {
  Box,
  Button,
  CardContent,
  Chip,
  Grid2 as Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { WatchlistButton } from "../watchlist/WatchlistButton";
import { AddAlertButton } from "../alerts/AddAlertButton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import type { TechnicalIndicators } from "@stock-advisor/shared";
import { useStockDetail } from "./hooks";
import { AnimatedCard } from "../../components/motion";
import { useChartColors } from "../../app/useChartColors";
import {
  LoadingState,
  ErrorState,
  TrendText,
  formatCurrency,
  formatPercent,
  formatCompact,
} from "../../components/common";
import { trendColors } from "../../app/theme";

const signalColor: Record<TechnicalIndicators["signal"], "success" | "error" | "warning"> = {
  bullish: "success",
  bearish: "error",
  neutral: "warning",
};

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

const fmt = (n: number | null | undefined, formatter: (x: number) => string, fallback = "—") =>
  n == null ? fallback : formatter(n);

export function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useStockDetail(symbol);
  const chart = useChartColors();

  if (isLoading) return <LoadingState label={`Loading ${symbol}…`} />;
  if (isError || !data) return <ErrorState error={error} />;

  const { stock, profile, stats, technicals, history } = data;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {/* Header */}
      <AnimatedCard sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h4">{stock.symbol}</Typography>
                <Chip label={profile.exchange} size="small" variant="outlined" />
                <Chip
                  size="small"
                  icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
                  label={data.live ? "LIVE" : "DEMO"}
                  color={data.live ? "success" : "default"}
                  variant={data.live ? "filled" : "outlined"}
                />
                <WatchlistButton symbol={stock.symbol} size="medium" />
                <AddAlertButton symbol={stock.symbol} name={profile.longName} currentPrice={stock.price} />
              </Box>
              <Typography color="text.secondary">{profile.longName}</Typography>
              <Chip label={profile.sector} size="small" sx={{ mt: 1 }} />
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h4">{formatCurrency(stock.price)}</Typography>
              <TrendText value={stock.change}>
                {formatCurrency(stock.change)} ({formatPercent(stock.changePercent)})
              </TrendText>
              <Box sx={{ mt: 1 }}>
                <Button
                  component={RouterLink}
                  to="/predict"
                  size="small"
                  variant="outlined"
                  startIcon={<QueryStatsIcon />}
                >
                  AI Prediction
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </AnimatedCard>

      <Grid container spacing={2}>
        {/* Price chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <AnimatedCard delay={0.05} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                1-Year Price History
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={trendColors.up} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={trendColors.up} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={50} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={64} />
                    <Tooltip
                      contentStyle={{ background: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}`, color: chart.tooltipText }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={trendColors.up}
                      fill="url(#detailGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* Key statistics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AnimatedCard delay={0.1} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Statistics
              </Typography>
              <StatRow label="Previous Close" value={fmt(stats.previousClose, formatCurrency)} />
              <StatRow label="Day High" value={fmt(stats.dayHigh, formatCurrency)} />
              <StatRow label="Day Low" value={fmt(stats.dayLow, formatCurrency)} />
              <StatRow label="52-Week High" value={fmt(stats.high52w, formatCurrency)} />
              <StatRow label="52-Week Low" value={fmt(stats.low52w, formatCurrency)} />
              <StatRow label="Volume" value={fmt(stats.volume, formatCompact)} />
              <StatRow label="Market Cap" value={fmt(stats.marketCap, (n) => `₹${formatCompact(n)}`)} />
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* Technical indicators */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AnimatedCard delay={0.15} sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6">Technical Indicators</Typography>
                <Chip
                  label={technicals.signal.toUpperCase()}
                  color={signalColor[technicals.signal]}
                  size="small"
                />
              </Box>
              <StatRow label="SMA (20)" value={fmt(technicals.sma20, formatCurrency)} />
              <StatRow label="SMA (50)" value={fmt(technicals.sma50, formatCurrency)} />
              <StatRow label="RSI (14)" value={fmt(technicals.rsi14, (n) => n.toFixed(1))} />
              <StatRow
                label="Volatility (annualized)"
                value={fmt(technicals.volatilityPercent, (n) => `${n.toFixed(1)}%`)}
              />

              {technicals.rsi14 != null && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">
                      RSI — {technicals.rsi14 > 70 ? "Overbought" : technicals.rsi14 < 30 ? "Oversold" : "Neutral"}
                    </Typography>
                    <Typography variant="caption">{technicals.rsi14.toFixed(0)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={technicals.rsi14}
                    color={technicals.rsi14 > 70 ? "error" : technicals.rsi14 < 30 ? "success" : "primary"}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* 52-week range position */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AnimatedCard delay={0.2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                52-Week Range
              </Typography>
              <Box sx={{ mt: 3, mb: 1 }}>
                <Box sx={{ position: "relative", height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.08)" }}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: -6,
                      left: `${technicals.positionIn52wRange * 100}%`,
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 20,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(technicals.low52w)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatCurrency(stock.price)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(technicals.high52w)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Trading at {(technicals.positionIn52wRange * 100).toFixed(0)}% of its 52-week range.
              </Typography>
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* Company profile */}
        <Grid size={{ xs: 12 }}>
          <AnimatedCard delay={0.25}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About {profile.longName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.summary}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                <Chip label={`Sector: ${profile.sector}`} size="small" />
                <Chip label={`Exchange: ${profile.exchange}`} size="small" />
                <Chip label={`Currency: ${profile.currency}`} size="small" />
              </Stack>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Data as of {new Date(data.asOf).toLocaleString()}.{" "}
        {data.live ? "Live (delayed) NSE/BSE data." : "Indicative demo data."} Technical indicators are
        computed from historical prices and are not investment advice.
      </Typography>
    </Box>
  );
}
