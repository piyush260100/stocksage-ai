import { describe, it, expect, beforeEach } from "vitest";
import { useAlertStore } from "./alertStore";

describe("alertStore.evaluate", () => {
  beforeEach(() => {
    useAlertStore.setState({ alerts: [] });
  });

  it("triggers an 'above' alert when price crosses the target", () => {
    const { add, evaluate } = useAlertStore.getState();
    add({ symbol: "RELIANCE", name: "Reliance", direction: "above", target: 1400, createdPrice: 1300 });

    // Below target: not triggered.
    expect(evaluate(new Map([["RELIANCE", 1350]]))).toHaveLength(0);
    // At/above target: triggered once.
    const fired = evaluate(new Map([["RELIANCE", 1410]]));
    expect(fired).toHaveLength(1);
    expect(fired[0]!.status).toBe("triggered");
  });

  it("triggers a 'below' alert when price drops under the target", () => {
    const { add, evaluate } = useAlertStore.getState();
    add({ symbol: "INFY", name: "Infosys", direction: "below", target: 1500, createdPrice: 1600 });
    expect(evaluate(new Map([["INFY", 1550]]))).toHaveLength(0);
    expect(evaluate(new Map([["INFY", 1490]]))).toHaveLength(1);
  });

  it("does not re-trigger an already-triggered alert", () => {
    const { add, evaluate } = useAlertStore.getState();
    add({ symbol: "TCS", name: "TCS", direction: "above", target: 4000, createdPrice: 3800 });
    expect(evaluate(new Map([["TCS", 4100]]))).toHaveLength(1);
    expect(evaluate(new Map([["TCS", 4200]]))).toHaveLength(0);
  });
});
