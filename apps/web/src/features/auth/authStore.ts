import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, User } from "@stock-advisor/shared";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

/**
 * Client-side auth state. Tokens are persisted so a refresh keeps the user
 * logged in. When the real backend lands, the HTTP client reads the token
 * from here to attach the Authorization header.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          isAuthenticated: true,
        }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: "stock-advisor-auth" },
  ),
);
