import type { ReactNode } from "react";
import { Box, Card, CardContent, IconButton, Typography } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { motion } from "framer-motion";
import { BrandLogo } from "../../components/BrandLogo";
import { useThemeStore } from "../../app/themeStore";
import { useDocumentTitle } from "../../app/useDocumentTitle";

/** Branded, animated card layout shared by the login and signup screens. */
export function AuthShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: ReactNode;
}) {
  const { mode, toggle } = useThemeStore();
  useDocumentTitle();
  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        py: 4,
        bgcolor: "background.default",
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(1200px 600px at 20% -10%, rgba(79,140,255,0.18), transparent), radial-gradient(900px 500px at 90% 110%, rgba(46,204,113,0.15), transparent), #0d1117"
            : "radial-gradient(1200px 600px at 20% -10%, rgba(79,140,255,0.12), transparent), radial-gradient(900px 500px at 90% 110%, rgba(46,204,113,0.10), transparent), #f4f6fb",
      })}
    >
      <IconButton
        onClick={toggle}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        <Card sx={{ width: 420, backdropFilter: "blur(6px)" }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 1 }}>
              <BrandLogo size="h4" />
            </Box>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>
            {children}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
