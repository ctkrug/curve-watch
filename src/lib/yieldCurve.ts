/** Treasury constant-maturity tenors tracked across the full history, in months. */
export const TENORS_MONTHS = [1, 3, 6, 12, 24, 36, 60, 84, 120, 240, 360] as const;

export type TenorMonths = (typeof TENORS_MONTHS)[number];

/** One month of the full Treasury yield curve. Missing tenors (e.g. 20Y pre-1993) are `null`. */
export interface YieldObservation {
  /** First day of the month, e.g. "1978-06-01". */
  date: string;
  yields: Record<TenorMonths, number | null>;
}

/** A recorded NBER recession, used to shade the chart. */
export interface RecessionPeriod {
  start: string;
  end: string;
}

export interface InversionAnnotation {
  start: string;
  end: string;
  recession: RecessionPeriod | null;
}

/** Formats a monthly observation date for the reader-facing timeline. */
export function formatObservationMonth(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (
    Number.isNaN(parsed.valueOf())
    || !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`Invalid observation date: ${date}`);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

/**
 * An inversion is defined as the short end (3M) yielding more than the long end (10Y) —
 * the spread the NY Fed's recession-probability model is built on.
 */
export function isInverted(observation: YieldObservation): boolean {
  const short = observation.yields[3];
  const long = observation.yields[120];
  if (short == null || long == null) return false;
  return short > long;
}

/** The 10Y-minus-3M spread in percentage points, or null if either tenor is missing. */
export function spread(observation: YieldObservation): number | null {
  const short = observation.yields[3];
  const long = observation.yields[120];
  if (short == null || long == null) return null;
  return long - short;
}

/** Formats one yield for the point-in-time tenor table. */
export function formatYield(yieldRate: number | null): string {
  if (yieldRate == null || !Number.isFinite(yieldRate)) return "—";
  return `${yieldRate.toFixed(2)}%`;
}

/** Converts a tenor in months into the concise label used in the reader-facing UI. */
export function formatTenor(months: TenorMonths): string {
  if (months < 12) return `${months}M`;
  return `${months / 12}Y`;
}

/** Collapses consecutive inverted months into contiguous [start, end] date ranges. */
export function inversionSpans(observations: YieldObservation[]): RecessionPeriod[] {
  const spans: RecessionPeriod[] = [];
  let openStart: string | null = null;

  for (const obs of observations) {
    if (isInverted(obs)) {
      if (openStart === null) openStart = obs.date;
    } else if (openStart !== null) {
      spans.push({ start: openStart, end: obs.date });
      openStart = null;
    }
  }
  if (openStart !== null) {
    spans.push({ start: openStart, end: observations[observations.length - 1].date });
  }
  return spans;
}

/** Pairs each detected inversion with the next recession, if the record contains one. */
export function inversionAnnotations(
  observations: YieldObservation[],
  recessions: readonly RecessionPeriod[],
): InversionAnnotation[] {
  return inversionSpans(observations).map((span) => ({
    ...span,
    recession: recessions.find((recession) => recession.start >= span.end) ?? null,
  }));
}

/** Returns recession periods whose starting month has been reached by the reader. */
export function visibleRecessions(
  recessions: readonly RecessionPeriod[],
  currentDate: string,
): RecessionPeriod[] {
  return recessions.filter((recession) => recession.start <= currentDate);
}

/** Keeps a timeline index inside the available data range. */
export function clampObservationIndex(index: number, observations: readonly YieldObservation[]): number {
  if (observations.length === 0) return 0;
  return Math.max(0, Math.min(observations.length - 1, Math.round(index)));
}
