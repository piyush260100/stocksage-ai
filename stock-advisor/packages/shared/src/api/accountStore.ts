import type { User, SignupRequest } from "../types/auth.js";
import { mockUser } from "../mocks/data.js";

/** An account as stored by the mock backend. Password is plain for the mock only. */
interface Account {
  user: User;
  password: string;
}

const STORAGE_KEY = "stocksage-accounts";

/**
 * In-memory account store with optional localStorage persistence, standing in
 * for a real users collection. The seeded demo account lets existing demo
 * credentials keep working.
 */
function loadAccounts(): Account[] {
  const seed: Account = { user: mockUser, password: "demo1234" };
  try {
    if (typeof localStorage === "undefined") return [seed];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [seed];
    const parsed = JSON.parse(raw) as Account[];
    // Ensure the demo account always exists.
    if (!parsed.some((a) => a.user.email === mockUser.email)) parsed.unshift(seed);
    return parsed;
  } catch {
    return [seed];
  }
}

function persist(accounts: Account[]): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }
  } catch {
    // ignore persistence failures (e.g. private mode)
  }
}

let accounts = loadAccounts();

export const accountStore = {
  findByEmail(email: string): Account | undefined {
    const normalized = email.trim().toLowerCase();
    return accounts.find((a) => a.user.email.toLowerCase() === normalized);
  },

  verify(email: string, password: string): User | null {
    const account = this.findByEmail(email);
    if (!account || account.password !== password) return null;
    return account.user;
  },

  create(req: SignupRequest): User {
    if (this.findByEmail(req.email)) {
      throw new Error("An account with this email already exists.");
    }
    const user: User = {
      id: `u_${Date.now().toString(36)}`,
      name: req.name.trim(),
      email: req.email.trim(),
      riskTolerance: req.riskTolerance,
    };
    accounts = [...accounts, { user, password: req.password }];
    persist(accounts);
    return user;
  },
};
