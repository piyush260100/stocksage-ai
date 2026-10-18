import { describe, it, expect } from "vitest";
import { answerQuery } from "@stock-advisor/shared";

describe("answerQuery", () => {
  it("routes prediction questions to the predict page", () => {
    const r = answerQuery("how do predictions work?");
    expect(r.answer.toLowerCase()).toContain("predict");
    expect(r.links?.some((l) => l.to === "/predict")).toBe(true);
  });

  it("routes dashboard questions to the dashboard", () => {
    const r = answerQuery("show me the market dashboard");
    expect(r.links?.some((l) => l.to === "/dashboard")).toBe(true);
  });

  it("answers top investor questions and links to traders", () => {
    const r = answerQuery("who are the top traders");
    expect(r.links?.some((l) => l.to === "/traders")).toBe(true);
  });

  it("handles a greeting", () => {
    const r = answerQuery("hello");
    expect(r.answer.toLowerCase()).toContain("sage");
  });

  it("falls back gracefully on unknown input", () => {
    const r = answerQuery("what is the capital of France");
    expect(r.answer.toLowerCase()).toContain("not sure");
  });

  it("returns the fallback for empty input", () => {
    const r = answerQuery("   ");
    expect(r.answer).toBeTruthy();
  });
});
