import { useState } from "react";
import { Autocomplete, Box, TextField, Typography, Chip, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import type { Stock } from "@stock-advisor/shared";
import { useStockSearch } from "../features/predict/hooks";

/** Compact global stock search for the top bar; navigates to stock detail. */
export function GlobalSearch() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const search = useStockSearch(input);

  return (
    <Autocomplete<Stock>
      size="small"
      sx={{ width: { xs: 160, sm: 240, md: 300 } }}
      options={search.data ?? []}
      loading={search.isLoading}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o.symbol}
      isOptionEqualToValue={(a, b) => a.symbol === b.symbol}
      onChange={(_, value) => {
        if (value) {
          navigate(`/stock/${value.symbol}`);
          setInput("");
        }
      }}
      onInputChange={(_, value) => setInput(value)}
      noOptionsText={input ? "No matches" : "Type a symbol or company"}
      renderOption={(props, option) => (
        <li {...props} key={option.symbol}>
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Box>
              <Typography component="span" sx={{ fontWeight: 600 }}>
                {option.symbol}
              </Typography>
              <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: 13 }}>
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
          placeholder="Search stocks…"
          InputProps={{
            ...params.InputProps,
            startAdornment: <SearchIcon sx={{ mr: 0.5, opacity: 0.6 }} fontSize="small" />,
            endAdornment: (
              <>
                {search.isLoading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
