import { useState } from "react";
import {
  Box,
  CardContent,
  Chip,
  Grid2 as Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Stock } from "@stock-advisor/shared";
import { useMarketOverview, useStockHistory } from "./hooks";
import {
  LoadingState,
  ErrorState,
  TrendText,
  formatCurrency,
  formatPercent,
  formatCompact,
  StockLink,
} from "../../components/common";
import { AnimatedCard, CountUp } from "../../components/motion";
import { trendColors } from "../../app/theme";
import { useChartColors } from "../../app/useChartColors";

function IndexCard({
  name,
  value,
  changePercent,
  delay,
}: {
  name: string;
  value: number;
  changePercent: number;
  delay: number;
}) {
  return (
    <AnimatedCard delay={delay}>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {name}
        </Typography>
        <Typography variant="h5" sx={{ my: 0.5 }}>
          <CountUp
            value={value}
            format={(n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          />
        </Typography>
        <TrendText value={changePercent}>{formatPercent(changePercent)}</TrendText>
      </CardContent>
    </AnimatedCard>
  );
}

function StockMiniTable({
  title,
  stocks,
  onSelect,
  activeSymbol,
}: {
  title: string;
  stocks: Stock[];
  onSelect?: (symbol: string) => void;
  activeSymbol?: string;
}) {
  return (
    <AnimatedCard sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Table size="small">
          <TableBody>
            {stocks.map((s) => (
              <TableRow
                key={s.symbol}
                hover
                onClick={() => onSelect?.(s.symbol)}
                selected={activeSymbol === s.symbol}
                sx={{ cursor: onSelect ? "pointer" : "default" }}
              >
                <TableCell><StockLink symbol={s.symbol} /></TableCell>
                <TableCell>{formatCurrency(s.price)}</TableCell>
                <TableCell align="right">
                  <TrendText value={s.changePercent}>{formatPercent(s.changePercent)}</TrendText>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </AnimatedCard>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, error } = useMarketOverview();
  const [symbol, setSymbol] = useState("RELIANCE");
  const chart = useChartColors();
  const history = useStockHistory(symbol);

  if (isLoading) return <LoadingState label="Loading market data…" />;
  if (isError || !data) return <ErrorState error={error} />;

  const chartSymbols = data.trending.map((s) => s.symbol);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
        <Typography variant="h4">Market Dashboard</Typography>
        <Chip
          size="small"
          icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
          label={data.live ? `LIVE • ${(data.source ?? "live").toUpperCase()}` : "DEMO DATA"}
          color={data.live ? "success" : "default"}
          variant={data.live ? "filled" : "outlined"}
          sx={
            data.live
              ? { "& .MuiChip-icon": { animation: "pulse 1.4s ease-in-out infinite" }, "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } } }
              : undefined
          }
        />
        {data.asOf && (
          <Typography variant="caption" color="text.secondary">
            Updated {new Date(data.asOf).toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {data.indices.map((idx, i) => (
          <Grid key={idx.id} size={{ xs: 12, sm: 4 }}>
            <IndexCard
              name={idx.name}
              value={idx.value}
              changePercent={idx.changePercent}
              delay={i * 0.1}
            />
          </Grid>
        ))}
      </Grid>

      <AnimatedCard delay={0.15} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6">Price history</Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={symbol}
              onChange={(_, v) => v && setSymbol(v)}
            >
              {chartSymbols.map((sym) => (
                <ToggleButton key={sym} value={sym}>
                  {sym}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ height: 300 }}>
            {history.data && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.data}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendColors.up} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={trendColors.up} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip
                    contentStyle={{ background: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}`, color: chart.tooltipText }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={trendColors.up}
                    fill="url(#priceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </AnimatedCard>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StockMiniTable
            title="Top Gainers"
            stocks={data.topGainers}
            onSelect={setSymbol}
            activeSymbol={symbol}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StockMiniTable
            title="Top Losers"
            stocks={data.topLosers}
            onSelect={setSymbol}
            activeSymbol={symbol}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AnimatedCard sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trending (by volume)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">Volume</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.trending.map((s) => (
                    <TableRow
                      key={s.symbol}
                      hover
                      onClick={() => setSymbol(s.symbol)}
                      selected={symbol === s.symbol}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell><StockLink symbol={s.symbol} /></TableCell>
                      <TableCell align="right">{formatCompact(s.volume)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>
    </Box>
  );
}
