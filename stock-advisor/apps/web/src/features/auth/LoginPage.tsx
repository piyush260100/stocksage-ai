import { useState, type FormEvent } from "react";
import { Button, Link as MuiLink, Stack, TextField, Typography, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { AuthShell } from "./AuthShell";
import { useLogin } from "./hooks";

export function LoginPage() {
  const [email, setEmail] = useState("demo@stockadvisor.in");
  const [password, setPassword] = useState("demo1234");

  const login = useLogin();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <AuthShell subtitle="Smart AI predictions for Indian markets. Sign in to continue.">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          {login.isError && (
            <Alert severity="error">
              {login.error instanceof Error ? login.error.message : "Login failed"}
            </Alert>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign In"}
            </Button>
          </motion.div>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            New here?{" "}
            <MuiLink component={RouterLink} to="/signup" underline="hover">
              Create an account
            </MuiLink>
          </Typography>
        </Stack>
      </form>
    </AuthShell>
  );
}
