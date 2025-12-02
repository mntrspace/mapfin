import { format, parseISO } from 'date-fns';
import type { Currency, NumberFormat } from '@/contexts/SettingsContext';

export interface FormatOptions {
  currency?: Currency;
  numberFormat?: NumberFormat;
  exchangeRate?: number;
  decimals?: number;
}

/**
 * Format currency with configurable currency and format
 * Supports both Indian (L/Cr) and Western (K/M/B) notation
 */
export function formatCurrency(
  amount: number,
  options: FormatOptions = {}
): string {
  const {
    currency = 'INR',
    numberFormat = 'western',
    exchangeRate = 83.5,
    decimals = 1,
  } = options;

  // Convert amount if displaying in USD
  const displayAmount = currency === 'USD' ? amount / exchangeRate : amount;
  const absAmount = Math.abs(displayAmount);
  const sign = displayAmount < 0 ? '-' : '';
  const symbol = currency === 'INR' ? '₹' : '$';

  // USD always uses western format
  const useIndianFormat = currency === 'INR' && numberFormat === 'indian';

  if (useIndianFormat) {
    return formatIndianNotation(absAmount, symbol, sign, decimals);
  }
  return formatWesternNotation(absAmount, symbol, sign, decimals);
}

/**
 * Format in Indian notation: L (Lakhs) and Cr (Crores)
 */
function formatIndianNotation(
  absAmount: number,
  symbol: string,
  sign: string,
  decimals: number
): string {
  if (absAmount >= 10_000_000) {
    return `${sign}${symbol}${(absAmount / 10_000_000).toFixed(decimals)} Cr`;
  }
  if (absAmount >= 100_000) {
    return `${sign}${symbol}${(absAmount / 100_000).toFixed(decimals)} L`;
  }
  // Use Indian locale for smaller numbers
  return `${sign}${symbol}${new Intl.NumberFormat('en-IN').format(Math.round(absAmount))}`;
}

/**
 * Format in Western notation: K (Thousands), M (Millions), B (Billions)
 */
function formatWesternNotation(
  absAmount: number,
  symbol: string,
  sign: string,
  decimals: number
): string {
  if (absAmount >= 1_000_000_000) {
    return `${sign}${symbol}${(absAmount / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (absAmount >= 1_000_000) {
    return `${sign}${symbol}${(absAmount / 1_000_000).toFixed(decimals)}M`;
  }
  if (absAmount >= 1_000) {
    return `${sign}${symbol}${(absAmount / 1_000).toFixed(decimals)}K`;
  }
  return `${sign}${symbol}${absAmount.toFixed(0)}`;
}

/**
 * Format currency with full number (no abbreviation)
 * Example: ₹1,50,000 or $1,200
 */
export function formatCurrencyFull(
  amount: number,
  options: FormatOptions = {}
): string {
  const {
    currency = 'INR',
    exchangeRate = 83.5,
  } = options;

  const displayAmount = currency === 'USD' ? amount / exchangeRate : amount;

  const formatter = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(displayAmount);
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
  period: string = 'last month',
  options: FormatOptions = {}
): string {
  const change = current - previous;
  const changeStr = formatCurrency(change, options);
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
