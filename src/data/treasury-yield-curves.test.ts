import { describe, expect, it } from "vitest";
import history from "./treasury-yield-curves.json";
import { isInverted, type YieldObservation } from "../lib/yieldCurve";

const observations = history.observations as unknown as YieldObservation[];

describe("baked Treasury history", () => {
  it("covers a continuous monthly timeline through the latest baked observation", () => {
    expect(observations.length).toBeGreaterThan(700);
    expect(observations[0].date).toBe("1962-01-01");
    expect(observations.at(-1)?.date).toMatch(/^20\d{2}-\d{2}-01$/);
  });

  it("preserves missing historic tenors as null", () => {
    expect(observations[0].yields[1]).toBeNull();
    expect(observations.find((entry) => entry.date === "2000-01-01")?.yields[1]).toBeNull();
  });

  it("contains known modern inversion months", () => {
    for (const date of ["2000-09-01", "2006-08-01", "2019-08-01", "2022-11-01"]) {
      const observation = observations.find((entry) => entry.date === date);
      expect(observation, `missing ${date}`).toBeDefined();
      expect(isInverted(observation!)).toBe(true);
    }
  });
});
