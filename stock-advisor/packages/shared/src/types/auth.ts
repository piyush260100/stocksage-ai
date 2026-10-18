import type { RiskLevel } from "./recommendation.js";

export interface User {
  id: string;
  email: string;
  name: string;
  /** Risk tolerance drives how the recommendation engine ranks stocks. */
  riskTolerance: RiskLevel;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  riskTolerance: RiskLevel;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
