import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { LoginRequest, SignupRequest } from "@stock-advisor/shared";
import { useApi } from "../../app/api";
import { useAuthStore } from "./authStore";

/** Logs in and redirects to the dashboard on success. */
export function useLogin() {
  const api = useApi();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (req: LoginRequest) => api.login(req),
    onSuccess: (session) => {
      setSession(session);
      navigate("/dashboard", { replace: true });
    },
  });
}

/** Creates an account, signs the user in, and redirects to the dashboard. */
export function useSignup() {
  const api = useApi();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (req: SignupRequest) => api.signup(req),
    onSuccess: (session) => {
      setSession(session);
      navigate("/dashboard", { replace: true });
    },
  });
}
