import {
  Box,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Alert as MuiAlert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAlertStore } from "./alertStore";
import { AnimatedCard } from "../../components/motion";
import { StockLink, formatCurrency } from "../../components/common";

export function AlertsPage() {
  const alerts = useAlertStore((s) => s.alerts);
  const remove = useAlertStore((s) => s.remove);

  const active = alerts.filter((a) => a.status === "active");
  const triggered = alerts.filter((a) => a.status === "triggered");

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Price Alerts
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Get notified when a stock crosses your target. Alerts are checked against live prices.
      </Typography>

      {alerts.length === 0 && (
        <MuiAlert severity="info">
          No alerts yet. Open any stock and tap the 🔔 bell to set a price alert.
        </MuiAlert>
      )}

      {alerts.length > 0 && (
        <AnimatedCard>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell align="right">Target</TableCell>
                  <TableCell align="right">Set at</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {[...triggered, ...active].map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell><StockLink symbol={a.symbol} /></TableCell>
                    <TableCell>Price {a.direction}</TableCell>
                    <TableCell align="right">{formatCurrency(a.target)}</TableCell>
                    <TableCell align="right">{formatCurrency(a.createdPrice)}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.status === "triggered" ? "Triggered" : "Active"}
                        color={a.status === "triggered" ? "success" : "default"}
                        size="small"
                        variant={a.status === "triggered" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => remove(a.id)} aria-label="delete alert">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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
