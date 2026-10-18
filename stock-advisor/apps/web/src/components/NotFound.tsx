import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/** Friendly 404 page. */
export function NotFound() {
  return (
    <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", p: 4 }}>
      <Box>
        <Typography variant="h2" sx={{ fontWeight: 800, opacity: 0.3 }}>
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The page you're looking for doesn't exist or has moved.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/dashboard">
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
}
