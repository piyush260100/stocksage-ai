import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { useAuthStore } from "../features/auth/authStore";
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { NotFound } from "../components/NotFound";
import { LoadingState } from "../components/common";

// Lazy-load feature pages so each becomes its own code-split chunk, keeping the
// initial bundle small. Auth pages stay eager since they load first.
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const PortfolioPage = lazy(() => import("../features/portfolio/PortfolioPage").then((m) => ({ default: m.PortfolioPage })));
const RecommendationsPage = lazy(() => import("../features/recommendations/RecommendationsPage").then((m) => ({ default: m.RecommendationsPage })));
const PredictPage = lazy(() => import("../features/predict/PredictPage").then((m) => ({ default: m.PredictPage })));
const StockDetailPage = lazy(() => import("../features/stock/StockDetailPage").then((m) => ({ default: m.StockDetailPage })));
const TradersPage = lazy(() => import("../features/traders/TradersPage").then((m) => ({ default: m.TradersPage })));
const TraderDetailPage = lazy(() => import("../features/traders/TraderDetailPage").then((m) => ({ default: m.TraderDetailPage })));
const ShadowPage = lazy(() => import("../features/shadow/ShadowPage").then((m) => ({ default: m.ShadowPage })));
const WatchlistPage = lazy(() => import("../features/watchlist/WatchlistPage").then((m) => ({ default: m.WatchlistPage })));
const AlertsPage = lazy(() => import("../features/alerts/AlertsPage").then((m) => ({ default: m.AlertsPage })));

/** Wraps lazy routes with a Suspense fallback and an error boundary. */
function Lazy({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState label="Loading…" />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

/** Gate that redirects unauthenticated users to the login screen. */
function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

/** Keeps already-authenticated users out of the login/signup screens. */
function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicOnlyRoute>
        <SignupPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Lazy><DashboardPage /></Lazy> },
      { path: "portfolio", element: <Lazy><PortfolioPage /></Lazy> },
      { path: "recommendations", element: <Lazy><RecommendationsPage /></Lazy> },
      { path: "predict", element: <Lazy><PredictPage /></Lazy> },
      { path: "stock/:symbol", element: <Lazy><StockDetailPage /></Lazy> },
      { path: "traders", element: <Lazy><TradersPage /></Lazy> },
      { path: "traders/:id", element: <Lazy><TraderDetailPage /></Lazy> },
      { path: "shadow", element: <Lazy><ShadowPage /></Lazy> },
      { path: "watchlist", element: <Lazy><WatchlistPage /></Lazy> },
      { path: "alerts", element: <Lazy><AlertsPage /></Lazy> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
