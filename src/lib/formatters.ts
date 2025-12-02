import { format, parseISO } from 'date-fns';

/**
 * Format currency in Western notation (K/M/B) with ₹ symbol
 * Examples: ₹500, ₹1.5K, ₹2.3M, ₹1.2B
 */
export function formatCurrency(amount: number, decimals: number = 1): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1_000_000_000) {
    return `${sign}₹${(absAmount / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (absAmount >= 1_000_000) {
    return `${sign}₹${(absAmount / 1_000_000).toFixed(decimals)}M`;
  }
  if (absAmount >= 1_000) {
    return `${sign}₹${(absAmount / 1_000).toFixed(decimals)}K`;
  }
  return `${sign}₹${absAmount.toFixed(0)}`;
}

/**
 * Format currency with full number (no abbreviation)
 * Example: ₹1,50,000
 */
export function formatCurrencyFull(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * Format percentage with 1 decimal place
 * Example: 12.5%
 */
export function formatPercent(value: number, decimals: number = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format date as "DD MMM YYYY"
 * Example: 25 Dec 2024
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM yyyy');
}

/**
 * Format date as "MMM YYYY"
 * Example: Dec 2024
 */
export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM yyyy');
}

/**
 * Format date as "DD/MM/YYYY"
 * Example: 25/12/2024
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy');
}

/**
 * Get relative change string
 * Example: +₹50K from last month
 */
export function formatChange(
  current: number,
  previous: number,
  period: string = 'last month'
): string {
  const change = current - previous;
  const changeStr = formatCurrency(change);
  const direction = change >= 0 ? 'up' : 'down';
  return `${changeStr} ${direction} from ${period}`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Parse currency string to number
 * Handles formats like "$50", "₹1,000", "1000"
 */
export function parseCurrencyAmount(value: string | number): number {
  if (typeof value === 'number') return value;

  // Remove currency symbols and commas
  const cleaned = value.replace(/[₹$€£,\s]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}
