import type { SignupRequest } from "../types/auth.js";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates a signup payload. Returns a map of field -> error message; an empty
 * object means the input is valid. Shared so web and mobile enforce the same
 * rules the backend will later enforce authoritatively.
 */
export function validateSignup(req: Partial<SignupRequest>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!req.name || req.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!req.email || !EMAIL_REGEX.test(req.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!req.password || req.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!req.riskTolerance) {
    errors.riskTolerance = "Select a risk tolerance.";
  }

  return errors;
}
