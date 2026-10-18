import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

/** Animated StockSage AI wordmark with a gradient, pulsing spark. */
export function BrandLogo({ size = "h6" }: { size?: "h6" | "h4" | "h5" }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <motion.span
        style={{ fontSize: size === "h4" ? 30 : size === "h5" ? 26 : 22, lineHeight: 1 }}
        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      >
        📈
      </motion.span>
      <Typography
        variant={size}
        sx={{
          fontWeight: 800,
          letterSpacing: 0.3,
          background: "linear-gradient(90deg, #4f8cff 0%, #2ecc71 50%, #4f8cff 100%)",
          backgroundSize: "200% auto",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 4s linear infinite",
          "@keyframes shimmer": {
            to: { backgroundPosition: "200% center" },
          },
        }}
      >
        StockSage&nbsp;AI
      </Typography>
    </Box>
  );
}
