import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  Grid2 as Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTopTraders } from "../traders/hooks";
import { useShadowBacktest } from "./hooks";
import { AnimatedCard, CountUp } from "../../components/motion";
import {
  LoadingState,
  ErrorState,
  TrendText,
  StockLink,
  formatCurrency,
  formatPercent,
} from "../../components/common";
import { trendColors } from "../../app/theme";
import { useChartColors } from "../../app/useChartColors";

export function ShadowPage() {
  const traders = useTopTraders();
  const chart = useChartColors();
  const backtest = useShadowBacktest();

  const [traderId, setTraderId] = useState("");
  const [invested, setInvested] = useState(100000);
  const [startDate, setStartDate] = useState("2024-01-01");

  const run = () => {
    if (!traderId) return;
    backtest.mutate({ traderId, invested, startDate });
  };

  const result = backtest.data;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
        <Typography variant="h4">Shadow Portfolio</Typography>
        <Chip icon={<ContentCopyIcon sx={{ fontSize: 16 }} />} label="Signature feature" color="primary" size="small" />
      </Box>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Mirror a legendary Indian investor: pick an amount and a start date, and see how you would
        have performed by copying their portfolio — benchmarked against the NIFTY 50.
      </Typography>

      {/* Controls */}
      <AnimatedCard sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Investor to mirror"
                value={traderId}
                onChange={(e) => setTraderId(e.target.value)}
                fullWidth
                disabled={traders.isLoading}
              >
                {(traders.data ?? []).map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} — {t.firm}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Amount (₹)"
                type="number"
                value={invested}
                onChange={(e) => setInvested(Math.max(1, Number(e.target.value)))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().slice(0, 10) }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={run}
                disabled={!traderId || backtest.isPending}
              >
                {backtest.isPending ? "Running…" : "Run"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </AnimatedCard>

      {backtest.isPending && <LoadingState label="Backtesting the mirrored portfolio…" />}
      {backtest.isError && <ErrorState error={backtest.error} />}
      {!result && !backtest.isPending && !backtest.isError && (
        <Alert severity="info">Pick an investor and tap Run to see your shadow portfolio.</Alert>
      )}

      {result && (
        <Box>
          {/* Hero result */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnimatedCard delay={0}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Your value today
                  </Typography>
                  <Typography variant="h5">
                    <CountUp value={result.currentValue} format={formatCurrency} />
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    from {formatCurrency(result.invested)} invested
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnimatedCard delay={0.08}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total return
                  </Typography>
                  <Typography variant="h5">
                    <TrendText value={result.returnPercent}>
                      {formatPercent(result.returnPercent)}
                    </TrendText>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(result.profit)} P&L
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnimatedCard delay={0.16}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Alpha vs NIFTY 50
                  </Typography>
                  <Typography variant="h5">
                    <TrendText value={result.alphaPercent}>
                      {formatPercent(result.alphaPercent)}
                    </TrendText>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    index: {formatPercent(result.benchmarkReturnPercent)}
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnimatedCard delay={0.24}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    CAGR
                  </Typography>
                  <Typography variant="h5">
                    <TrendText value={result.cagrPercent}>
                      {formatPercent(result.cagrPercent)}
                    </TrendText>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    annualized
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>

          {/* Value curve */}
          <AnimatedCard delay={0.1} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mirror vs NIFTY 50 — {formatCurrency(result.invested)} since {result.startDate}
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={50} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={70} />
                    <Tooltip
                      contentStyle={{ background: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}`, color: chart.tooltipText }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Mirror" stroke={trendColors.up} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="benchmark" name="NIFTY 50" stroke="#9aa4b2" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </AnimatedCard>

          {/* Best / worst */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {result.bestHolding && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <AnimatedCard delay={0.1}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Best performer
                    </Typography>
                    <Typography variant="h6">
                      <StockLink symbol={result.bestHolding.symbol} />{" "}
                      <TrendText value={result.bestHolding.returnPercent}>
                        {formatPercent(result.bestHolding.returnPercent)}
                      </TrendText>
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            )}
            {result.worstHolding && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <AnimatedCard delay={0.16}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Worst performer
                    </Typography>
                    <Typography variant="h6">
                      <StockLink symbol={result.worstHolding.symbol} />{" "}
                      <TrendText value={result.worstHolding.returnPercent}>
                        {formatPercent(result.worstHolding.returnPercent)}
                      </TrendText>
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            )}
          </Grid>

          {/* Allocation table */}
          <AnimatedCard delay={0.2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How your money was allocated
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">Weight</TableCell>
                    <TableCell align="right">Allocated</TableCell>
                    <TableCell align="right">Start price</TableCell>
                    <TableCell align="right">Now</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Return</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.holdings.map((h) => (
                    <TableRow key={h.symbol} hover>
                      <TableCell><StockLink symbol={h.symbol} /></TableCell>
                      <TableCell align="right">{(h.weight * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right">{formatCurrency(h.allocated)}</TableCell>
                      <TableCell align="right">{formatCurrency(h.startPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(h.endPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(h.currentValue)}</TableCell>
                      <TableCell align="right">
                        <TrendText value={h.returnPercent}>{formatPercent(h.returnPercent)}</TrendText>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </AnimatedCard>

          <Alert severity="info" sx={{ mt: 2 }}>
            {result.note} {result.live ? "Prices are live NSE/BSE data." : "Prices are indicative demo data."}
          </Alert>
        </Box>
      )}
    </Box>
  );
}
