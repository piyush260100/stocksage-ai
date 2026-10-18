import { describe, it, expect } from "vitest";
import {
  validateSignup,
  createMockApiClient,
  type SignupRequest,
} from "@stock-advisor/shared";

const valid: SignupRequest = {
  name: "Asha Rao",
  email: "asha@example.com",
  password: "supersecret",
  riskTolerance: "medium",
};

describe("validateSignup", () => {
  it("accepts a well-formed request", () => {
    expect(validateSignup(valid)).toEqual({});
  });

  it("rejects a short name, bad email, and short password", () => {
    const errors = validateSignup({ name: "A", email: "nope", password: "123", riskTolerance: "low" });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe("mock auth flow", () => {
  it("logs in with the seeded demo account", async () => {
    const api = createMockApiClient();
    const session = await api.login({ email: "demo@stockadvisor.in", password: "demo1234" });
    expect(session.user.email).toBe("demo@stockadvisor.in");
    expect(session.tokens.accessToken).toContain("mock-access");
  });

  it("rejects invalid credentials", async () => {
    const api = createMockApiClient();
    await expect(api.login({ email: "demo@stockadvisor.in", password: "wrong" })).rejects.toThrow(
      /invalid email or password/i,
    );
  });

  it("signs up a new account and returns a session", async () => {
    const api = createMockApiClient();
    const email = `user_${Date.now()}@example.com`;
    const session = await api.signup({ ...valid, email });
    expect(session.user.email).toBe(email);
    expect(session.user.id).toMatch(/^u_/);
  });

  it("rejects duplicate email on signup", async () => {
    const api = createMockApiClient();
    await expect(
      api.signup({ ...valid, email: "demo@stockadvisor.in" }),
    ).rejects.toThrow(/already exists/i);
  });
});
