import { describe, expect, it } from "vitest";
import {
  formatObservationMonth,
  formatTenor,
  formatYield,
  inversionAnnotations,
  clampObservationIndex,
  inversionSpans,
  isInverted,
  spread,
  type YieldObservation,
  visibleRecessions,
} from "./yieldCurve";

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

describe("formatObservationMonth", () => {
  it("formats a valid monthly observation in UTC", () => {
    expect(formatObservationMonth("2023-06-01")).toBe("Jun 2023");
  });

  it("rejects malformed dates instead of presenting a misleading label", () => {
    expect(() => formatObservationMonth("June 2023")).toThrow("Invalid observation date");
  });

  it("rejects impossible calendar dates instead of rolling them into another month", () => {
    expect(() => formatObservationMonth("2023-02-30")).toThrow("Invalid observation date");
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

describe("point-in-time formatting", () => {
  it("formats finite yields and keeps missing or malformed values explicit", () => {
    expect(formatYield(4.125)).toBe("4.13%");
    expect(formatYield(null)).toBe("—");
    expect(formatYield(Number.NaN)).toBe("—");
  });

  it("uses compact month and year labels for every tenor boundary", () => {
    expect(formatTenor(1)).toBe("1M");
    expect(formatTenor(6)).toBe("6M");
    expect(formatTenor(12)).toBe("1Y");
    expect(formatTenor(360)).toBe("30Y");
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

describe("inversionAnnotations", () => {
  it("links an inversion to the first recession that follows it", () => {
    const observations = [
      obs("2006-06-01", 5.1, 5),
      obs("2006-07-01", 4.8, 5),
      obs("2006-08-01", 4.7, 5),
    ];
    const recessions = [{ start: "2007-12-01", end: "2009-06-01" }];
    expect(inversionAnnotations(observations, recessions)).toEqual([
      { start: "2006-06-01", end: "2006-07-01", recession: recessions[0] },
    ]);
  });

  it("keeps an inversion visible when no later recession exists", () => {
    expect(inversionAnnotations([obs("2023-06-01", 5.2, 3.8)], [])).toEqual([
      { start: "2023-06-01", end: "2023-06-01", recession: null },
    ]);
  });
});

describe("visibleRecessions", () => {
  const periods = [
    { start: "2001-03-01", end: "2001-11-01" },
    { start: "2007-12-01", end: "2009-06-01" },
  ];

  it("does not reveal a recession before its start", () => {
    expect(visibleRecessions(periods, "2001-02-01")).toEqual([]);
  });

  it("reveals each period as its start month is reached", () => {
    expect(visibleRecessions(periods, "2007-12-01")).toEqual(periods);
  });
});

describe("clampObservationIndex", () => {
  const observations = [obs("2000-01-01", 1, 2), obs("2000-02-01", 1, 2)];

  it("clamps negative, fractional, and oversized indices", () => {
    expect(clampObservationIndex(-4, observations)).toBe(0);
    expect(clampObservationIndex(0.6, observations)).toBe(1);
    expect(clampObservationIndex(20, observations)).toBe(1);
  });

  it("recovers to the first month when a control supplies a non-finite value", () => {
    expect(clampObservationIndex(Number.NaN, observations)).toBe(0);
    expect(clampObservationIndex(Number.NEGATIVE_INFINITY, observations)).toBe(0);
    expect(clampObservationIndex(Number.POSITIVE_INFINITY, observations)).toBe(0);
  });

  it("uses zero for an empty timeline", () => {
    expect(clampObservationIndex(3, [])).toBe(0);
  });
});
