import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { validateSignup, type RiskLevel } from "@stock-advisor/shared";
import { AuthShell } from "./AuthShell";
import { useSignup } from "./hooks";

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "low", label: "Low — capital preservation" },
  { value: "medium", label: "Medium — balanced growth" },
  { value: "high", label: "High — aggressive growth" },
];

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<RiskLevel>("medium");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const signup = useSignup();

  const req = { name, email, password, riskTolerance };
  const errors = validateSignup(req);
  const showError = (field: string) => touched[field] && errors[field];

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, riskTolerance: true });
    if (Object.keys(errors).length > 0) return;
    signup.mutate(req);
  };

  return (
    <AuthShell subtitle="Create your StockSage AI account to start getting predictions.">
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => markTouched("name")}
            error={Boolean(showError("name"))}
            helperText={showError("name") || " "}
            fullWidth
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched("email")}
            error={Boolean(showError("email"))}
            helperText={showError("email") || " "}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markTouched("password")}
            error={Boolean(showError("password"))}
            helperText={showError("password") || "At least 8 characters."}
            fullWidth
          />
          <TextField
            select
            label="Risk tolerance"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value as RiskLevel)}
            fullWidth
          >
            {RISK_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          {signup.isError && (
            <Alert severity="error">
              {signup.error instanceof Error ? signup.error.message : "Sign up failed"}
            </Alert>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={signup.isPending}
            >
              {signup.isPending ? "Creating account…" : "Create Account"}
            </Button>
          </motion.div>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{" "}
            <MuiLink component={RouterLink} to="/login" underline="hover">
              Sign in
            </MuiLink>
          </Typography>
        </Stack>
      </form>
    </AuthShell>
  );
}
