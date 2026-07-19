import { describe, expect, it } from "vitest";
import { inversionSpans, isInverted, spread, type YieldObservation } from "./yieldCurve";

function obs(date: string, threeMonth: number | null, tenYear: number | null): YieldObservation {
  return {
    date,
    yields: {
      1: null,
      3: threeMonth,
      6: null,
      12: null,
      24: null,
      36: null,
      60: null,
      84: null,
      120: tenYear,
      240: null,
      360: null,
    },
  };
}

describe("isInverted", () => {
  it("is false for a normal upward-sloping curve", () => {
    expect(isInverted(obs("2015-01-01", 0.05, 2.1))).toBe(false);
  });

  it("is true when the short end yields more than the long end", () => {
    expect(isInverted(obs("2006-07-01", 5.1, 5.0))).toBe(true);
  });

  it("is false when either tenor is missing", () => {
    expect(isInverted(obs("1972-01-01", null, 6.0))).toBe(false);
  });
});

describe("spread", () => {
  it("is negative while inverted", () => {
    expect(spread(obs("2006-07-01", 5.1, 5.0))).toBeCloseTo(-0.1);
  });

  it("is null when a tenor is missing", () => {
    expect(spread(obs("1972-01-01", null, 6.0))).toBeNull();
  });
});

describe("inversionSpans", () => {
  it("collapses consecutive inverted months into a single span", () => {
    const observations = [
      obs("2006-06-01", 4.9, 5.0),
      obs("2006-07-01", 5.1, 5.0),
      obs("2006-08-01", 5.05, 4.9),
      obs("2006-09-01", 4.8, 4.85),
    ];
    expect(inversionSpans(observations)).toEqual([{ start: "2006-07-01", end: "2006-09-01" }]);
  });

  it("returns an open span through the last observation if still inverted", () => {
    const observations = [obs("2023-06-01", 5.2, 3.8), obs("2023-07-01", 5.3, 3.9)];
    expect(inversionSpans(observations)).toEqual([{ start: "2023-06-01", end: "2023-07-01" }]);
  });

  it("returns no spans when the curve never inverts", () => {
    const observations = [obs("2015-01-01", 0.05, 2.1), obs("2015-02-01", 0.06, 2.2)];
    expect(inversionSpans(observations)).toEqual([]);
  });
});
