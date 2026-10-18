import {
  Box,
  CardContent,
  Grid2 as Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { usePortfolioSummary } from "./hooks";
import {
  LoadingState,
  ErrorState,
  TrendText,
  formatCurrency,
  formatPercent,
  StockLink,
} from "../../components/common";
import { AnimatedCard, CountUp } from "../../components/motion";
import { useChartColors } from "../../app/useChartColors";

const SECTOR_COLORS = ["#4f8cff", "#2ecc71", "#f1c40f", "#e67e22", "#9b59b6", "#1abc9c"];

function SummaryCard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: number;
  sub?: React.ReactNode;
  delay?: number;
}) {
  return (
    <AnimatedCard delay={delay}>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ my: 0.5 }}>
          <CountUp value={value} format={formatCurrency} />
        </Typography>
        {sub}
      </CardContent>
    </AnimatedCard>
  );
}

export function PortfolioPage() {
  const { data, isLoading, isError, error } = usePortfolioSummary();
  const chart = useChartColors();

  if (isLoading) return <LoadingState label="Loading portfolio…" />;
  if (isError || !data) return <ErrorState error={error} />;

  const pieData = data.allocationBySector.map((a) => ({
    name: a.sector,
    value: Number(a.value.toFixed(2)),
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Portfolio
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard label="Total Value" value={data.totalValue} delay={0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            label="Total P&L"
            value={data.totalPnl}
            delay={0.1}
            sub={<TrendText value={data.totalPnlPercent}>{formatPercent(data.totalPnlPercent)}</TrendText>}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard label="Cash" value={data.cash} delay={0.2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard label="Cost Basis" value={data.totalCost} delay={0.3} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <AnimatedCard delay={0.1} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sector Allocation
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}`, color: chart.tooltipText }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <AnimatedCard delay={0.2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Holdings
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Avg Cost</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">P&L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.holdings.map((h) => (
                    <TableRow key={h.symbol} hover sx={{ transition: "background-color 0.2s" }}>
                      <TableCell><StockLink symbol={h.symbol} /></TableCell>
                      <TableCell align="right">{h.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(h.avgCost)}</TableCell>
                      <TableCell align="right">{formatCurrency(h.currentPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(h.marketValue)}</TableCell>
                      <TableCell align="right">
                        <TrendText value={h.unrealizedPnl}>
                          {formatPercent(h.unrealizedPnlPercent)}
                        </TrendText>
                      </TableCell>
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
