import { Box, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography, Alert } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import type { Stock } from "@stock-advisor/shared";
import { useApi } from "../../app/api";
import { useWatchlistStore } from "./watchlistStore";
import { WatchlistButton } from "./WatchlistButton";
import { AddAlertButton } from "../alerts/AddAlertButton";
import { AnimatedCard } from "../../components/motion";
import { LoadingState, TrendText, StockLink, formatCurrency, formatPercent } from "../../components/common";

export function WatchlistPage() {
  const api = useApi();
  const symbols = useWatchlistStore((s) => s.symbols);

  const results = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["stock", symbol],
      queryFn: () => api.getStock(symbol),
      refetchInterval: 20_000,
    })),
  });

  const loading = results.some((r) => r.isLoading);
  const stocks = results.map((r) => r.data).filter((s): s is Stock => Boolean(s));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Watchlist
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Track the stocks you care about. Prices refresh automatically.
      </Typography>

      {symbols.length === 0 && (
        <Alert severity="info">
          Your watchlist is empty. Tap the ☆ star on any stock to add it here.
        </Alert>
      )}

      {symbols.length > 0 && loading && stocks.length === 0 && <LoadingState label="Loading watchlist…" />}

      {stocks.length > 0 && (
        <AnimatedCard>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((s) => (
                  <TableRow key={s.symbol} hover>
                    <TableCell><StockLink symbol={s.symbol} /></TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell align="right">{formatCurrency(s.price)}</TableCell>
                    <TableCell align="right">
                      <TrendText value={s.changePercent}>{formatPercent(s.changePercent)}</TrendText>
                    </TableCell>
                    <TableCell align="right">
                      <AddAlertButton symbol={s.symbol} name={s.name} currentPrice={s.price} />
                      <WatchlistButton symbol={s.symbol} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </AnimatedCard>
      )}
    </Box>
  );
}
