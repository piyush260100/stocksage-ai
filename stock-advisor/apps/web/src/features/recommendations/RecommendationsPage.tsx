import {
  Box,
  CardContent,
  Chip,
  Grid2 as Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Recommendation, RecommendationAction } from "@stock-advisor/shared";
import { useRecommendations } from "./hooks";
import {
  LoadingState,
  ErrorState,
  TrendText,
  formatCurrency,
  formatPercent,
  StockLink,
} from "../../components/common";
import { AnimatedCard } from "../../components/motion";

const actionColor: Record<RecommendationAction, "success" | "warning" | "error"> = {
  buy: "success",
  hold: "warning",
  sell: "error",
};

function RecommendationCard({ rec, delay }: { rec: Recommendation; delay: number }) {
  const upside = ((rec.targetPrice - rec.stock.price) / rec.stock.price) * 100;
  return (
    <AnimatedCard delay={delay} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h6">
              <StockLink symbol={rec.stock.symbol} />
              {rec.alreadyHeld && (
                <CheckCircleIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle", opacity: 0.6 }} />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {rec.stock.name}
            </Typography>
            <Chip label={rec.stock.exchange} size="small" variant="outlined" sx={{ mt: 0.5 }} />
          </Box>
          <Chip label={rec.action.toUpperCase()} color={actionColor[rec.action]} size="small" />
        </Box>

        <Stack direction="row" spacing={3} sx={{ my: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Price
            </Typography>
            <Typography>{formatCurrency(rec.stock.price)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Target
            </Typography>
            <Typography>{formatCurrency(rec.targetPrice)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Upside
            </Typography>
            <TrendText value={upside}>{formatPercent(upside)}</TrendText>
          </Box>
        </Stack>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              Confidence
            </Typography>
            <Typography variant="caption">{Math.round(rec.score * 100)}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={rec.score * 100}
            color={actionColor[rec.action]}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        <Stack spacing={0.5}>
          {rec.rationale.map((r, i) => (
            <Typography key={i} variant="body2" color="text.secondary">
              • {r}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </AnimatedCard>
  );
}

export function RecommendationsPage() {
  const { data, isLoading, isError, error } = useRecommendations();

  if (isLoading) return <LoadingState label="Generating recommendations…" />;
  if (isError || !data) return <ErrorState error={error} />;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 2 }}>
        <Typography variant="h4">AI Recommendations</Typography>
        <Chip label={`Risk: ${data.assumedRisk}`} size="small" variant="outlined" />
        <Typography variant="caption" color="text.secondary">
          Generated {new Date(data.generatedAt).toLocaleString()}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {data.recommendations.map((rec, i) => (
          <Grid key={rec.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <RecommendationCard rec={rec} delay={i * 0.06} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
