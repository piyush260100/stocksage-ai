import type { ReactNode } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PieChartIcon from "@mui/icons-material/PieChart";
import InsightsIcon from "@mui/icons-material/Insights";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import StarIcon from "@mui/icons-material/Star";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../features/auth/authStore";
import { useThemeStore } from "../app/themeStore";
import { useDocumentTitle } from "../app/useDocumentTitle";
import { BrandLogo } from "./BrandLogo";
import { GlobalSearch } from "./GlobalSearch";
import { HelpBot } from "../features/assistant/HelpBot";
import { ToastHost } from "./toast";
import { useAlertWatcher } from "../features/alerts/useAlertWatcher";

const DRAWER_WIDTH = 220;

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
  { label: "Portfolio", to: "/portfolio", icon: <PieChartIcon /> },
  { label: "Watchlist", to: "/watchlist", icon: <StarIcon /> },
  { label: "Recommendations", to: "/recommendations", icon: <InsightsIcon /> },
  { label: "AI Predictions", to: "/predict", icon: <QueryStatsIcon /> },
  { label: "Top Traders", to: "/traders", icon: <LeaderboardIcon /> },
  { label: "Shadow Portfolio", to: "/shadow", icon: <ContentCopyIcon /> },
  { label: "Price Alerts", to: "/alerts", icon: <NotificationsIcon /> },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mode, toggle } = useThemeStore();
  useAlertWatcher();
  useDocumentTitle();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} color="default">
        <Toolbar sx={{ gap: 1 }}>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <BrandLogo />
          </Box>
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <GlobalSearch />
          </Box>
          <Typography variant="body2" sx={{ mr: 1, opacity: 0.8, display: { xs: "none", md: "block" } }}>
            {user?.name}
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggle}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            sx={{ mr: 1 }}
          >
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
              whileHover={{ x: 4 }}
            >
              <ListItemButton
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </motion.div>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      <HelpBot />
      <ToastHost />
    </Box>
  );
}
