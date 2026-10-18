import { create } from "zustand";
import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";

type ToastSeverity = "success" | "info" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, severity?: ToastSeverity) => void;
  dismiss: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2);

/** Global toast store. Call `useToast.getState().push(...)` from anywhere. */
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, severity = "info") =>
    set((s) => ({ toasts: [...s.toasts, { id: uid(), message, severity }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helper usable outside React components. */
export const toast = {
  success: (m: string) => useToast.getState().push(m, "success"),
  info: (m: string) => useToast.getState().push(m, "info"),
  warning: (m: string) => useToast.getState().push(m, "warning"),
  error: (m: string) => useToast.getState().push(m, "error"),
};

/** Renders the current toasts, one at a time, bottom-left. */
export function ToastHost() {
  const { toasts, dismiss } = useToast();
  const current = toasts[0];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(Boolean(current));
  }, [current]);

  if (!current) return null;

  return (
    <Snackbar
      key={current.id}
      open={open}
      autoHideDuration={4000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      TransitionProps={{ onExited: () => dismiss(current.id) }}
    >
      <Alert
        severity={current.severity}
        variant="filled"
        onClose={() => setOpen(false)}
        sx={{ width: "100%" }}
      >
        {current.message}
      </Alert>
    </Snackbar>
  );
}
