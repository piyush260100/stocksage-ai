import { IconButton, Tooltip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useWatchlistStore } from "./watchlistStore";
import { toast } from "../../components/toast";

/** Star toggle to add/remove a symbol from the watchlist. */
export function WatchlistButton({ symbol, size = "small" }: { symbol: string; size?: "small" | "medium" }) {
  const symbols = useWatchlistStore((s) => s.symbols);
  const toggle = useWatchlistStore((s) => s.toggle);
  const inList = symbols.includes(symbol);

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(symbol);
    toast.success(inList ? `Removed ${symbol} from watchlist` : `Added ${symbol} to watchlist`);
  };

  return (
    <Tooltip title={inList ? "Remove from watchlist" : "Add to watchlist"}>
      <IconButton size={size} onClick={handle} color={inList ? "warning" : "default"} aria-label="watchlist">
        {inList ? <StarIcon fontSize={size} /> : <StarBorderIcon fontSize={size} />}
      </IconButton>
    </Tooltip>
  );
}
