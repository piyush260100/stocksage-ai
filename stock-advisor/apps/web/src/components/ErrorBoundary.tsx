import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** Catches render errors anywhere below it so the app never white-screens. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production this would report to an error tracker (Sentry, etc.).
    console.error("Render error:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", p: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              An unexpected error occurred. You can try reloading the page.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}
