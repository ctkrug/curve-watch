import type { YieldObservation } from "./yieldCurve";

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

/** Ensures a bundled history can safely enter the app's chart rendering path. */
export function hasUsableObservations(value: unknown): value is YieldObservation[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((observation) => {
    if (typeof observation !== "object" || observation === null) return false;
    const record = observation as { date?: unknown; yields?: unknown };
    if (!isCalendarDate(record.date) || typeof record.yields !== "object" || record.yields === null) return false;
    return Object.values(record.yields).every((yieldRate) => yieldRate === null || (typeof yieldRate === "number" && Number.isFinite(yieldRate)));
  });
}
