import {
  Avatar,
  Box,
  Button,
  CardContent,
  Chip,
  Grid2 as Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { useTrader } from "./hooks";
import { AnimatedCard } from "../../components/motion";
import { useChartColors } from "../../app/useChartColors";
import {
  LoadingState,
  ErrorState,
  TrendText,
  StockLink,
  formatCurrency,
  formatPercent,
} from "../../components/common";

const SECTOR_COLORS = ["#4f8cff", "#2ecc71", "#f1c40f", "#e67e22", "#9b59b6", "#1abc9c"];
const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

function formatCrore(cr: number): string {
  if (cr >= 100000) return `₹${(cr / 100000).toFixed(2)} Lakh Cr`;
  return `₹${cr.toLocaleString("en-IN")} Cr`;
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{children}</Typography>
    </Box>
  );
}

export function TraderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTrader(id);
  const chart = useChartColors();

  if (isLoading) return <LoadingState label="Loading trader…" />;
  if (isError || !data) return <ErrorState error={error} />;

  const { portfolio } = data;
  const pieData = portfolio.allocationBySector.map((a) => ({
    name: a.sector,
    value: Number(a.value.toFixed(2)),
  }));

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <AnimatedCard sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, fontWeight: 700, fontSize: 24 }}>
              {initials(data.name)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 200 }}>
              <Typography variant="h4">{data.name}</Typography>
              <Typography color="text.secondary">{data.firm}</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                {data.tags.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
                <Chip label={`${data.riskProfile} risk`} size="small" />
              </Stack>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {data.bio}
          </Typography>

          <Stack direction="row" spacing={4} sx={{ mt: 2, flexWrap: "wrap" }} useFlexGap>
            <Stat label="Net worth (reported)">{formatCrore(data.netWorthCr)}</Stat>
            <Stat label="Disclosed holdings">{data.holdingsCount}</Stat>
            <Stat label="Notable holdings (live)">{formatCurrency(portfolio.totalValue)}</Stat>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            Holdings as of {data.asOfQuarter}. Source: {data.source}.
          </Typography>
        </CardContent>
      </AnimatedCard>

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
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Weight</TableCell>
                    <TableCell align="right">P&L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolio.holdings.map((h) => (
                    <TableRow key={h.symbol} hover>
                      <TableCell>
                        <StockLink symbol={h.symbol} />
                      </TableCell>
                      <TableCell align="right">{h.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(h.currentPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(h.marketValue)}</TableCell>
                      <TableCell align="right">{(h.weight * 100).toFixed(1)}%</TableCell>
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
