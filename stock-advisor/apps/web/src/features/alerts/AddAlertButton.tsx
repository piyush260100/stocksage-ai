import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import type { AlertDirection } from "@stock-advisor/shared";
import { useAlertStore } from "./alertStore";
import { toast } from "../../components/toast";
import { formatCurrency } from "../../components/common";

/** Icon button that opens a dialog to create a price alert for a stock. */
export function AddAlertButton({
  symbol,
  name,
  currentPrice,
}: {
  symbol: string;
  name: string;
  currentPrice: number;
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [target, setTarget] = useState<number>(Number((currentPrice * 1.05).toFixed(2)));
  const add = useAlertStore((s) => s.add);

  const save = () => {
    add({ symbol, name, direction, target, createdPrice: currentPrice });
    toast.success(`Alert set: ${symbol} ${direction} ${formatCurrency(target)}`);
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Set price alert">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          aria-label="set price alert"
        >
          <NotificationsActiveIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Set price alert — {symbol}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {name} • current price {formatCurrency(currentPrice)}
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              label="Notify me when price goes"
              value={direction}
              onChange={(e) => setDirection(e.target.value as AlertDirection)}
              fullWidth
            >
              <MenuItem value="above">Above</MenuItem>
              <MenuItem value="below">Below</MenuItem>
            </TextField>
            <TextField
              label="Target price (₹)"
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={target <= 0}>
            Set Alert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
