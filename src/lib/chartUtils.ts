/**
 * Chart utilities for data aggregation and transformation
 */

import type { Expense, NetWorthEntry } from '@/types';
import {
  type TimeRange,
  type Granularity,
  generatePeriodLabels,
  isDateInRange,
} from './dateUtils';

// ============================================================================
// Types for Chart Data
// ============================================================================

export interface BarChartDataPoint {
  period: string;
  total: number;
  [key: string]: number | string; // Dynamic category values for stacked bars
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export interface TrendDataPoint {
  period: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

// ============================================================================
// Expense Aggregation
// ============================================================================

/**
 * Aggregate expenses by period for bar charts
 */
export function aggregateExpensesByPeriod(
  expenses: Expense[],
  timeRange: TimeRange,
  granularity: Granularity,
  excludeReimbursed: boolean = true
): BarChartDataPoint[] {
  const periods = generatePeriodLabels(timeRange.start, timeRange.end, granularity);

  // Filter expenses
  const filtered = expenses.filter((e) => {
    if (excludeReimbursed && e.reimbursement_status === 'reimbursed') return false;
    return isDateInRange(e.date, timeRange);
  });

  return periods.map(({ key, start, end }) => {
    const periodExpenses = filtered.filter((e) => {
      const date = new Date(e.date);
      return date >= start && date <= end;
    });

    const total = periodExpenses.reduce((sum, e) => sum + Number(e.inr_amount || 0), 0);

    return {
      period: key,
      total,
    };
  });
}

/**
 * Aggregate expenses by period with category breakdown
 */
export function aggregateExpensesByPeriodWithCategories(
  expenses: Expense[],
  timeRange: TimeRange,
  granularity: Granularity,
  _categories?: string[],
  excludeReimbursed: boolean = true
): BarChartDataPoint[] {
  const periods = generatePeriodLabels(timeRange.start, timeRange.end, granularity);

  // Filter expenses
  const filtered = expenses.filter((e) => {
    if (excludeReimbursed && e.reimbursement_status === 'reimbursed') return false;
    return isDateInRange(e.date, timeRange);
  });

  return periods.map(({ key, start, end }) => {
    const periodExpenses = filtered.filter((e) => {
      const date = new Date(e.date);
      return date >= start && date <= end;
    });

    const byCategory: Record<string, number> = {};
    let total = 0;

    periodExpenses.forEach((e) => {
      const amount = Number(e.inr_amount || 0);
      total += amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + amount;
    });

    return {
      period: key,
      total,
      ...byCategory,
    };
  });
}

/**
 * Aggregate expenses by category for pie chart
 */
export function aggregateExpensesByCategory(
  expenses: Expense[],
  categoryLabels: Record<string, string>,
  colors: string[],
  excludeReimbursed: boolean = true
): PieChartDataPoint[] {
  const filtered = excludeReimbursed
    ? expenses.filter((e) => e.reimbursement_status !== 'reimbursed')
    : expenses;

  const byCategory: Record<string, number> = {};
  let total = 0;

  filtered.forEach((e) => {
    const amount = Number(e.inr_amount || 0);
    total += amount;
    byCategory[e.category] = (byCategory[e.category] || 0) + amount;
  });

  return Object.entries(byCategory)
    .map(([category, value], index) => ({
      name: categoryLabels[category] || category,
      value,
      color: colors[index % colors.length],
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Calculate total expenses for a time range
 */
export function calculateExpenseTotal(
  expenses: Expense[],
  timeRange: TimeRange,
  excludeReimbursed: boolean = true
): number {
  return expenses
    .filter((e) => {
      if (excludeReimbursed && e.reimbursement_status === 'reimbursed') return false;
      return isDateInRange(e.date, timeRange);
    })
    .reduce((sum, e) => sum + Number(e.inr_amount || 0), 0);
}

// ============================================================================
// Net Worth Aggregation
// ============================================================================

/**
 * Get net worth snapshots grouped by period
 * Returns only periods where actual data exists
 */
export function aggregateNetWorthByPeriod(
  entries: NetWorthEntry[],
  timeRange: TimeRange,
  granularity: Granularity,
  personId?: string
): BarChartDataPoint[] {
  // Filter by person and time range
  const filtered = entries.filter((e) => {
    if (personId && e.person_id !== personId) return false;
    return isDateInRange(e.report_date, timeRange);
  });

  // Group by report_date
  const byDate: Record<string, NetWorthEntry[]> = {};
  filtered.forEach((e) => {
    byDate[e.report_date] = byDate[e.report_date] || [];
    byDate[e.report_date].push(e);
  });

  // For each unique date, create a data point
  const uniqueDates = Object.keys(byDate).sort();

  return uniqueDates.map((date) => {
    const dateEntries = byDate[date];
    let total = 0;
    const byCategory: Record<string, number> = {};

    dateEntries.forEach((e) => {
      const amount = Number(e.amount_inr || 0);
      total += amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + amount;
    });

    // Format period label based on granularity
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let period: string;

    switch (granularity) {
      case 'monthly':
        period = `${months[d.getMonth()]} ${d.getFullYear()}`;
        break;
      case 'quarterly':
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        period = `Q${quarter} ${d.getFullYear()}`;
        break;
      case 'yearly':
        period = String(d.getFullYear());
        break;
      default:
        period = `${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    return {
      period,
      total,
      ...byCategory,
    };
  });
}

/**
 * Get net worth with asset/liability split for waterfall chart
 * Liabilities returned as negative values
 */
export function aggregateNetWorthWithLiabilities(
  netWorthEntries: NetWorthEntry[],
  liabilities: { outstanding: number; category: string }[],
  timeRange: TimeRange,
  personId?: string
): BarChartDataPoint[] {
  // Get net worth by period
  const netWorthData = aggregateNetWorthByPeriod(
    netWorthEntries,
    timeRange,
    'monthly', // Use monthly for detail
    personId
  );

  // Add liabilities as negative
  const totalLiabilities = liabilities.reduce(
    (sum, l) => sum + Number(l.outstanding || 0),
    0
  );

  // For now, apply current liabilities to all periods
  // In future, could track liability history
  return netWorthData.map((point) => ({
    ...point,
    assets: point.total,
    liabilities: -totalLiabilities,
    netWorth: point.total - totalLiabilities,
  }));
}

/**
 * Aggregate net worth by asset category for pie chart
 */
export function aggregateNetWorthByCategory(
  entries: NetWorthEntry[],
  categoryLabels: Record<string, string>,
  colors: string[],
  personId?: string
): PieChartDataPoint[] {
  // Get latest date
  const filtered = personId
    ? entries.filter((e) => e.person_id === personId)
    : entries;

  if (filtered.length === 0) return [];

  const latestDate = filtered.reduce((max, e) => {
    return e.report_date > max ? e.report_date : max;
  }, '');

  const latestEntries = filtered.filter((e) => e.report_date === latestDate);

  const byCategory: Record<string, number> = {};
  let total = 0;

  latestEntries.forEach((e) => {
    const amount = Number(e.amount_inr || 0);
    total += amount;
    byCategory[e.category] = (byCategory[e.category] || 0) + amount;
  });

  return Object.entries(byCategory)
    .map(([category, value], index) => ({
      name: categoryLabels[category] || category,
      value,
      color: colors[index % colors.length],
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get latest net worth total
 */
export function getLatestNetWorth(
  entries: NetWorthEntry[],
  personId?: string
): { total: number; date: string } {
  const filtered = personId
    ? entries.filter((e) => e.person_id === personId)
    : entries;

  if (filtered.length === 0) return { total: 0, date: '' };

  const latestDate = filtered.reduce((max, e) => {
    return e.report_date > max ? e.report_date : max;
  }, '');

  const latestEntries = filtered.filter((e) => e.report_date === latestDate);
  const total = latestEntries.reduce((sum, e) => sum + Number(e.amount_inr || 0), 0);

  return { total, date: latestDate };
}

// ============================================================================
// Comparison Calculations
// ============================================================================

/**
 * Calculate comparison between two values
 */
export function calculateComparison(current: number, previous: number): ComparisonData {
  const change = current - previous;
  const changePercent = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

  return {
    current,
    previous,
    change,
    changePercent,
  };
}

/**
 * Calculate YoY comparison for expenses
 */
export function calculateExpenseYoYComparison(
  expenses: Expense[],
  ytdRange: TimeRange,
  previousYtdRange: TimeRange
): ComparisonData {
  const current = calculateExpenseTotal(expenses, ytdRange);
  const previous = calculateExpenseTotal(expenses, previousYtdRange);
  return calculateComparison(current, previous);
}

/**
 * Calculate MoM comparison for expenses
 */
export function calculateExpenseMoMComparison(
  expenses: Expense[],
  lastMonthRange: TimeRange,
  monthBeforeRange: TimeRange
): ComparisonData {
  const current = calculateExpenseTotal(expenses, lastMonthRange);
  const previous = calculateExpenseTotal(expenses, monthBeforeRange);
  return calculateComparison(current, previous);
}

// ============================================================================
// Budget Calculations
// ============================================================================

/**
 * Calculate budget usage
 */
export function calculateBudgetUsage(
  expenses: Expense[],
  budgets: { category: string; monthly_limit: number }[],
  timeRange: TimeRange
): { total: number; budget: number; percentage: number; remaining: number } {
  const expenseTotal = calculateExpenseTotal(expenses, timeRange);
  const budgetTotal = budgets.reduce((sum, b) => sum + Number(b.monthly_limit || 0), 0);

  return {
    total: expenseTotal,
    budget: budgetTotal,
    percentage: budgetTotal > 0 ? (expenseTotal / budgetTotal) * 100 : 0,
    remaining: budgetTotal - expenseTotal,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Filter data by person ID
 */
export function filterByPerson<T extends { person_id: string }>(
  data: T[],
  personId?: string
): T[] {
  if (!personId) return data;
  return data.filter((item) => item.person_id === personId);
}

/**
 * Sort pie chart data by value (descending)
 */
export function sortByValue(data: PieChartDataPoint[]): PieChartDataPoint[] {
  return [...data].sort((a, b) => b.value - a.value);
}

/**
 * Limit pie chart data to top N items + "Other"
 */
export function limitPieChartData(
  data: PieChartDataPoint[],
  limit: number = 8,
  otherColor: string = '#94a3b8'
): PieChartDataPoint[] {
  if (data.length <= limit) return data;

  const topItems = data.slice(0, limit - 1);
  const otherItems = data.slice(limit - 1);

  const otherTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return [
    ...topItems,
    {
      name: 'Other',
      value: otherTotal,
      color: otherColor,
      percentage: totalValue > 0 ? (otherTotal / totalValue) * 100 : 0,
    },
  ];
}
