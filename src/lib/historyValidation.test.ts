import { describe, expect, it } from "vitest";
import { hasUsableObservations } from "./historyValidation";

describe("hasUsableObservations", () => {
  it("accepts records with valid monthly dates and finite or absent yields", () => {
    expect(hasUsableObservations([{ date: "2024-01-01", yields: { 3: 5.4, 120: null } }])).toBe(true);
  });

  it("rejects malformed records before the app shell tries to render them", () => {
    expect(hasUsableObservations(null)).toBe(false);
    expect(hasUsableObservations([])).toBe(false);
    expect(hasUsableObservations([{ date: "2024-02-30", yields: {} }])).toBe(false);
    expect(hasUsableObservations([{ date: "2024-01-01", yields: { 3: Number.NaN } }])).toBe(false);
    expect(hasUsableObservations([{ date: "2024-01-01", yields: null }])).toBe(false);
  });
});
