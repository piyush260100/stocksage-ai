import {
  Avatar,
  Box,
  CardContent,
  Chip,
  Grid2 as Grid,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useNavigate } from "react-router-dom";
import type { TraderWithPortfolio } from "@stock-advisor/shared";
import { useTopTraders } from "./hooks";
import { AnimatedCard } from "../../components/motion";
import { LoadingState, ErrorState, formatCurrency } from "../../components/common";

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"]; // gold, silver, bronze
const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

/** Format ₹ crore into a readable string (₹ Cr / ₹ Lakh Cr). */
function formatCrore(cr: number): string {
  if (cr >= 100000) return `₹${(cr / 100000).toFixed(2)} Lakh Cr`;
  return `₹${cr.toLocaleString("en-IN")} Cr`;
}

function TraderCard({
  trader,
  rank,
  onClick,
  delay,
}: {
  trader: TraderWithPortfolio;
  rank: number;
  onClick: () => void;
  delay: number;
}) {
  const rankColor = RANK_COLORS[rank] ?? "transparent";
  return (
    <AnimatedCard delay={delay} sx={{ cursor: "pointer", height: "100%" }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48, fontWeight: 700 }}>
              {initials(trader.name)}
            </Avatar>
            {rank < 3 && (
              <EmojiEventsIcon
                sx={{ position: "absolute", top: -8, right: -8, color: rankColor, fontSize: 22 }}
              />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              #{rank + 1} {trader.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {trader.firm}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={3} sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Net worth
            </Typography>
            <Typography sx={{ fontWeight: 700, color: "success.main" }}>
              {formatCrore(trader.netWorthCr)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Disclosed holdings
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{trader.holdingsCount}</Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 60 }}>
          {trader.bio}
        </Typography>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {trader.tags.map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Stack>

        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Typography variant="caption" color="text.secondary">
            Notable holdings valued live
          </Typography>
          <Typography variant="h6">{formatCurrency(trader.portfolio.totalValue)}</Typography>
        </Box>
      </CardContent>
    </AnimatedCard>
  );
}

export function TradersPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTopTraders();

  if (isLoading) return <LoadingState label="Loading top investors…" />;
  if (isError || !data) return <ErrorState error={error} />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Top Investors of India
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        India's most prominent public-market investors, ranked by publicly reported net worth. Click
        a name to see their notable disclosed holdings, valued with live quotes where available.
      </Typography>

      <Grid container spacing={2}>
        {data.map((trader, i) => (
          <Grid key={trader.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <TraderCard
              trader={trader}
              rank={i}
              delay={i * 0.05}
              onClick={() => navigate(`/traders/${trader.id}`)}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Data sourced from public disclosures (SEBI shareholding filings, M3M Hurun India Rich List,
        and press reporting). Holdings are quarterly snapshots, not live positions, and share counts
        shown are representative. Not investment advice.
      </Typography>
    </Box>
  );
}
