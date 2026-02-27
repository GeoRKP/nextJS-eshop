export type DateRange = { from: Date; to: Date };

/**
 * Convert period preset string or custom from/to dates to a DateRange.
 * Returns null for "all" (no date filter).
 */
export function resolveDateRange(params: {
  period?: string;
  from?: string;
  to?: string;
}): DateRange | null {
  // Custom from/to override period presets
  if (params.from && params.to) {
    return {
      from: new Date(params.from),
      to: endOfDay(new Date(params.to)),
    };
  }

  const now = new Date();
  const period = params.period || "30d";

  switch (period) {
    case "7d":
      return { from: daysAgo(7), to: now };
    case "30d":
      return { from: daysAgo(30), to: now };
    case "this-month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case "3m":
      return { from: daysAgo(90), to: now };
    case "6m":
      return { from: daysAgo(180), to: now };
    case "this-year":
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case "all":
      return null;
    default:
      return { from: daysAgo(30), to: now };
  }
}

/**
 * Given a DateRange, compute the previous period of equal length for comparison.
 * E.g. if range is Jan 15 – Feb 15, previous is Dec 15 – Jan 15.
 */
export function previousDateRange(range: DateRange): DateRange {
  const duration = range.to.getTime() - range.from.getTime();
  return {
    from: new Date(range.from.getTime() - duration),
    to: new Date(range.from.getTime()),
  };
}

/**
 * Calculate percentage change between current and previous values.
 * Returns null if comparison is not meaningful (previous is 0 and current is 0).
 */
export function percentChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

/**
 * Whether the date range spans less than the given number of days.
 * Used to decide daily vs monthly grouping for time series charts.
 */
export function rangeSpanDays(range: DateRange): number {
  return Math.ceil(
    (range.to.getTime() - range.from.getTime()) / (24 * 60 * 60 * 1000)
  );
}

// ── Helpers ──

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
