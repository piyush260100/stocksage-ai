import { describe, it, expect, beforeEach } from "vitest";
import { useWatchlistStore } from "./watchlistStore";

describe("watchlistStore", () => {
  beforeEach(() => {
    useWatchlistStore.setState({ symbols: [] });
  });

  it("adds and de-dupes symbols", () => {
    const { add } = useWatchlistStore.getState();
    add("RELIANCE");
    add("RELIANCE");
    add("INFY");
    expect(useWatchlistStore.getState().symbols).toEqual(["RELIANCE", "INFY"]);
  });

  it("toggles a symbol on and off", () => {
    const { toggle } = useWatchlistStore.getState();
    toggle("TCS");
    expect(useWatchlistStore.getState().symbols).toContain("TCS");
    toggle("TCS");
    expect(useWatchlistStore.getState().symbols).not.toContain("TCS");
  });

  it("removes a symbol", () => {
    const { add, remove } = useWatchlistStore.getState();
    add("SBIN");
    remove("SBIN");
    expect(useWatchlistStore.getState().symbols).toEqual([]);
  });
});
