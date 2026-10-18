import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "./theme";

/** Initial mode from the OS preference (used only before any user choice). */
function systemMode(): ThemeMode {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return "dark";
}

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

/** Persisted light/dark preference. Defaults to the OS setting on first run. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: systemMode(),
      toggle: () => set((s) => ({ mode: s.mode === "dark" ? "light" : "dark" })),
      setMode: (mode) => set({ mode }),
    }),
    { name: "stocksage-theme" },
  ),
);
