import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import type { Stock } from "@stock-advisor/shared";
import { useStockSearch, useStockPrediction } from "./hooks";
import { ForecastCard } from "./ForecastCard";
import {
  LoadingState,
  ErrorState,
  TrendText,
  formatCurrency,
  formatPercent,
} from "../../components/common";

export function PredictPage() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Stock | null>(null);

  const search = useStockSearch(input);
  const prediction = useStockPrediction(selected?.symbol ?? null);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Stock Predictions
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Search any NSE/BSE listed stock to get short-term and long-term AI forecasts.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Autocomplete<Stock>
            options={search.data ?? []}
            loading={search.isLoading}
            filterOptions={(x) => x}
            getOptionLabel={(o) => `${o.symbol} — ${o.name}`}
            isOptionEqualToValue={(a, b) => a.symbol === b.symbol}
            value={selected}
            onChange={(_, value) => setSelected(value)}
            onInputChange={(_, value) => setInput(value)}
            noOptionsText={input ? "No matching stocks" : "Start typing a symbol or company"}
            renderOption={(props, option) => (
              <li {...props} key={option.symbol}>
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <Box>
                    <Typography component="span" sx={{ fontWeight: 600 }}>
                      {option.symbol}
                    </Typography>
                    <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                      {option.name}
                    </Typography>
                  </Box>
                  <Chip label={option.exchange} size="small" variant="outlined" />
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search stocks (e.g. RELIANCE, Infosys, TCS)"
                placeholder="Type a symbol or company name"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
                  endAdornment: (
                    <>
                      {search.isLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      {!selected && (
        <Alert severity="info">
          Pick a stock from the search above to generate AI predictions.
        </Alert>
      )}

      {selected && prediction.isLoading && (
        <LoadingState label={`Running AI agent for ${selected.symbol}…`} />
      )}

      {selected && prediction.isError && <ErrorState error={prediction.error} />}

      {prediction.data && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Box>
                  <Typography variant="h5">
                    {prediction.data.stock.symbol}{" "}
                    <Chip label={prediction.data.stock.exchange} size="small" variant="outlined" sx={{ ml: 1 }} />
                  </Typography>
                  <Typography color="text.secondary">{prediction.data.stock.name}</Typography>
                  <Button
                    component={RouterLink}
                    to={`/stock/${prediction.data.stock.symbol}`}
                    size="small"
                    sx={{ mt: 0.5, px: 0 }}
                  >
                    View full technical details →
                  </Button>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="h5">{formatCurrency(prediction.data.stock.price)}</Typography>
                  <TrendText value={prediction.data.stock.changePercent}>
                    {formatPercent(prediction.data.stock.changePercent)}
                  </TrendText>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ForecastCard title="Short-term forecast" forecast={prediction.data.shortTerm} delay={0} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ForecastCard title="Long-term forecast" forecast={prediction.data.longTerm} delay={0.12} />
            </Grid>
          </Grid>

          <Alert severity="warning" sx={{ mt: 2 }}>
            {prediction.data.disclaimer}
          </Alert>
        </Box>
      )}
    </Box>
  );
}
