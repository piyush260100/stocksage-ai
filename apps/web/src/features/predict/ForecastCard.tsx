import { Box, CardContent, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HorizonForecast, Direction } from "@stock-advisor/shared";
import { TrendText, formatCurrency, formatPercent } from "../../components/common";
import { AnimatedCard } from "../../components/motion";
import { trendColors } from "../../app/theme";
import { useChartColors } from "../../app/useChartColors";

const directionColor: Record<Direction, "success" | "error" | "warning"> = {
  bullish: "success",
  bearish: "error",
  neutral: "warning",
};

const directionLine: Record<Direction, string> = {
  bullish: trendColors.up,
  bearish: trendColors.down,
  neutral: trendColors.flat,
};

export function ForecastCard({
  title,
  forecast,
  delay = 0,
}: {
  title: string;
  forecast: HorizonForecast;
  delay?: number;
}) {
  const chart = useChartColors();
  return (
    <AnimatedCard delay={delay} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Horizon: {forecast.label}
            </Typography>
          </Box>
          <Chip
            label={forecast.direction.toUpperCase()}
            color={directionColor[forecast.direction]}
            size="small"
          />
        </Box>

        <Stack direction="row" spacing={3} sx={{ my: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Target
            </Typography>
            <Typography>{formatCurrency(forecast.targetPrice)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Expected return
            </Typography>
            <TrendText value={forecast.expectedReturnPercent}>
              {formatPercent(forecast.expectedReturnPercent)}
            </TrendText>
          </Box>
        </Stack>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              Model confidence
            </Typography>
            <Typography variant="caption">{Math.round(forecast.confidence * 100)}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={forecast.confidence * 100}
            color={directionColor[forecast.direction]}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        <Box sx={{ height: 180, my: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast.projectedPath}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={30} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} width={64} />
              <Tooltip
                contentStyle={{ background: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}`, color: chart.tooltipText }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={directionLine[forecast.direction]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Stack spacing={0.5}>
          {forecast.rationale.map((r, i) => (
            <Typography key={i} variant="body2" color="text.secondary">
              • {r}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </AnimatedCard>
  );
}
