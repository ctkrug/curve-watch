/** A plotted yield curve point. */
export interface CurvePoint {
  months: number;
  yield: number;
}

/**
 * Interpolates yield values by tenor while preserving the target curve's geometry.
 * A tenor that only exists in the target observation appears at its real value.
 */
export function interpolateCurvePoints(
  from: readonly CurvePoint[],
  to: readonly CurvePoint[],
  progress: number,
): CurvePoint[] {
  const t = Math.max(0, Math.min(1, progress));
  const startingYields = new Map(from.map((point) => [point.months, point.yield]));
  return to.map((point) => {
    const start = startingYields.get(point.months);
    return {
      months: point.months,
      yield: start == null ? point.yield : start + ((point.yield - start) * t),
    };
  });
}
