/**
 * Date utilities for time range calculations and granularity mapping
 */

export type TimeRangePreset = '1M' | '3M' | '6M' | '1Y' | '2Y' | '3Y' | '5Y' | 'ALL';
export type Granularity = 'monthly' | 'quarterly' | 'yearly';

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Get granularity based on time range preset
 * - 1M, 3M, 6M -> monthly
 * - 1Y, 2Y -> quarterly
 * - 3Y, 5Y, ALL -> yearly
 */
export function getGranularity(preset: TimeRangePreset): Granularity {
  const monthlyRanges: TimeRangePreset[] = ['1M', '3M', '6M'];
  const quarterlyRanges: TimeRangePreset[] = ['1Y', '2Y'];

  if (monthlyRanges.includes(preset)) return 'monthly';
  if (quarterlyRanges.includes(preset)) return 'quarterly';
  return 'yearly';
}

/**
 * Calculate time range from preset
 */
export function getTimeRange(preset: TimeRangePreset, referenceDate: Date = new Date()): TimeRange {
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case '1M':
      start.setMonth(start.getMonth() - 1);
      break;
    case '3M':
      start.setMonth(start.getMonth() - 3);
      break;
    case '6M':
      start.setMonth(start.getMonth() - 6);
      break;
    case '1Y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case '2Y':
      start.setFullYear(start.getFullYear() - 2);
      break;
    case '3Y':
      start.setFullYear(start.getFullYear() - 3);
      break;
    case '5Y':
      start.setFullYear(start.getFullYear() - 5);
      break;
    case 'ALL':
      start.setFullYear(2000); // Far back enough
      break;
  }

  return {
    start,
    end,
    label: getTimeRangeLabel(preset),
  };
}

/**
 * Get human-readable label for time range
 */
function getTimeRangeLabel(preset: TimeRangePreset): string {
  const labels: Record<TimeRangePreset, string> = {
    '1M': 'Last Month',
    '3M': 'Last 3 Months',
    '6M': 'Last 6 Months',
    '1Y': 'Last Year',
    '2Y': 'Last 2 Years',
    '3Y': 'Last 3 Years',
    '5Y': 'Last 5 Years',
    'ALL': 'All Time',
  };
  return labels[preset];
}

/**
 * Format a date for display based on granularity
 */
export function formatPeriodLabel(date: Date, granularity: Granularity): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = date.getFullYear();
  const month = date.getMonth();

  switch (granularity) {
    case 'monthly':
      return `${months[month]} ${year}`;
    case 'quarterly':
      const quarter = Math.floor(month / 3) + 1;
      return `Q${quarter} ${year}`;
    case 'yearly':
      return String(year);
    default:
      return `${months[month]} ${year}`;
  }
}

/**
 * Get the start of a period based on granularity
 */
export function getStartOfPeriod(date: Date, granularity: Granularity): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  switch (granularity) {
    case 'monthly':
      result.setDate(1);
      break;
    case 'quarterly':
      const quarterMonth = Math.floor(result.getMonth() / 3) * 3;
      result.setMonth(quarterMonth, 1);
      break;
    case 'yearly':
      result.setMonth(0, 1);
      break;
  }

  return result;
}

/**
 * Get the end of a period based on granularity
 */
export function getEndOfPeriod(date: Date, granularity: Granularity): Date {
  const result = getStartOfPeriod(date, granularity);

  switch (granularity) {
    case 'monthly':
      result.setMonth(result.getMonth() + 1);
      break;
    case 'quarterly':
      result.setMonth(result.getMonth() + 3);
      break;
    case 'yearly':
      result.setFullYear(result.getFullYear() + 1);
      break;
  }

  result.setMilliseconds(-1);
  return result;
}

/**
 * Generate an array of period labels for a time range
 */
export function generatePeriodLabels(
  startDate: Date,
  endDate: Date,
  granularity: Granularity
): { key: string; label: string; start: Date; end: Date }[] {
  const periods: { key: string; label: string; start: Date; end: Date }[] = [];
  let current = getStartOfPeriod(startDate, granularity);
  const end = endDate;

  while (current <= end) {
    const periodEnd = getEndOfPeriod(current, granularity);
    const label = formatPeriodLabel(current, granularity);

    periods.push({
      key: label,
      label,
      start: new Date(current),
      end: periodEnd > end ? end : periodEnd,
    });

    // Move to next period
    switch (granularity) {
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarterly':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
  }

  return periods;
}

/**
 * Check if a date falls within a time range
 */
export function isDateInRange(date: Date | string, range: TimeRange): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= range.start && d <= range.end;
}

/**
 * Get the same period from the previous year (for YoY comparison)
 */
export function getPreviousYearRange(range: TimeRange): TimeRange {
  const start = new Date(range.start);
  const end = new Date(range.end);

  start.setFullYear(start.getFullYear() - 1);
  end.setFullYear(end.getFullYear() - 1);

  return { start, end, label: 'Previous Year' };
}

/**
 * Get the previous period (for MoM comparison)
 */
export function getPreviousPeriodRange(range: TimeRange): TimeRange {
  const duration = range.end.getTime() - range.start.getTime();

  const end = new Date(range.start.getTime() - 1);
  const start = new Date(end.getTime() - duration);

  return { start, end, label: 'Previous Period' };
}

/**
 * Get year-to-date range
 */
export function getYTDRange(referenceDate: Date = new Date()): TimeRange {
  const year = referenceDate.getFullYear();
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  return { start, end, label: `YTD ${year}` };
}

/**
 * Get last month's range
 */
export function getLastMonthRange(referenceDate: Date = new Date()): TimeRange {
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0, 23, 59, 59, 999);
  const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  return { start, end, label: `${months[start.getMonth()]} ${start.getFullYear()}` };
}

/**
 * Get month before last month (for comparison)
 */
export function getMonthBeforeLastRange(referenceDate: Date = new Date()): TimeRange {
  const lastMonth = getLastMonthRange(referenceDate);
  const end = new Date(lastMonth.start.getTime() - 1);
  const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  return { start, end, label: `${months[start.getMonth()]} ${start.getFullYear()}` };
}
