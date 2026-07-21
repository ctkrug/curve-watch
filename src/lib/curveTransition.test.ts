import { describe, expect, it } from "vitest";
import { interpolateCurvePoints, type CurvePoint } from "./curveTransition";

const from: CurvePoint[] = [
  { months: 3, yield: 4 },
  { months: 120, yield: 5 },
];
const to: CurvePoint[] = [
  { months: 3, yield: 5 },
  { months: 120, yield: 4 },
  { months: 240, yield: 4.2 },
];

describe("interpolateCurvePoints", () => {
  it("interpolates shared tenors and preserves the target point order", () => {
    expect(interpolateCurvePoints(from, to, 0.5)).toEqual([
      { months: 3, yield: 4.5 },
      { months: 120, yield: 4.5 },
      { months: 240, yield: 4.2 },
    ]);
  });

  it("clamps animation progress and snaps newly available tenors to their real yield", () => {
    expect(interpolateCurvePoints(from, to, -1)).toEqual([
      { months: 3, yield: 4 },
      { months: 120, yield: 5 },
      { months: 240, yield: 4.2 },
    ]);
    expect(interpolateCurvePoints(from, to, 2)).toEqual(to);
  });
});
