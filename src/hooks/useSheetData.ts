import { useState, useEffect, useCallback } from 'react';
import {
  peopleApi,
  netWorthApi,
  liabilitiesApi,
  expensesApi,
  incomeApi,
  budgetsApi,
  goalsApi,
  categoriesApi,
  cardsApi,
} from '@/lib/api';
import type {
  Person,
  NetWorthEntry,
  Liability,
  Expense,
  Income,
  Budget,
  Goal,
  Card,
} from '@/types';

// Generic hook for fetching data
function useData<T>(
  fetchFn: () => Promise<T[]>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// People hook
export function usePeople() {
  return useData<Person>(peopleApi.getAll);
}

// Net Worth hooks
export function useNetWorth() {
  return useData<NetWorthEntry>(netWorthApi.getAll);
}

export function useNetWorthByPerson(personId?: string) {
  const { data, ...rest } = useNetWorth();
  const filtered = personId
    ? data.filter((entry) => entry.person_id === personId)
    : data;
  return { data: filtered, ...rest };
}

export function useNetWorthSummary(personId?: string) {
  const { data: entries, loading, error, refetch } = useNetWorth();

  // Filter by person if specified
  const filtered = personId
    ? entries.filter((e) => e.person_id === personId)
    : entries;

  // Get latest entries (most recent report_date)
  const latestDate = filtered.reduce((max, e) => {
    return e.report_date > max ? e.report_date : max;
  }, '');

  const latestEntries = filtered.filter((e) => e.report_date === latestDate);

  // Calculate totals
  const total = latestEntries.reduce((sum, e) => sum + Number(e.amount_inr || 0), 0);

  // Group by category
  const byCategory = latestEntries.reduce(
    (acc, e) => {
      const cat = e.category;
      acc[cat] = (acc[cat] || 0) + Number(e.amount_inr || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total,
    byCategory,
    entries: latestEntries,
    latestDate,
    loading,
    error,
    refetch,
  };
}

// Liabilities hook
export function useLiabilities() {
  return useData<Liability>(liabilitiesApi.getAll);
}

// Expenses hooks
export function useExpenses() {
  return useData<Expense>(expensesApi.getAll);
}

export function useExpensesByMonth(year: number, month: number) {
  const { data, ...rest } = useExpenses();

  const filtered = data.filter((expense) => {
    const date = new Date(expense.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  // Exclude reimbursed expenses from totals
  const forTotals = filtered.filter((e) => e.reimbursement_status !== 'reimbursed');

  const total = forTotals.reduce((sum, e) => sum + Number(e.inr_amount || 0), 0);

  const byCategory = forTotals.reduce(
    (acc, e) => {
      const cat = e.category;
      acc[cat] = (acc[cat] || 0) + Number(e.inr_amount || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    expenses: filtered,
    total,
    byCategory,
    ...rest,
  };
}

export function useCurrentMonthExpenses() {
  const { data: allExpenses, loading, error, refetch } = useExpenses();

  // Find the most recent month with expenses
  // If no expenses in current month, fall back to most recent month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Check if there are expenses in current month
  const currentMonthExpenses = allExpenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });

  // If no expenses in current month, find most recent month
  let targetYear = currentYear;
  let targetMonth = currentMonth;

  if (currentMonthExpenses.length === 0 && allExpenses.length > 0) {
    // Find the most recent expense date
    const mostRecentExpense = allExpenses.reduce((latest, expense) => {
      const expenseDate = new Date(expense.date);
      const latestDate = new Date(latest.date);
      return expenseDate > latestDate ? expense : latest;
    }, allExpenses[0]);

    const recentDate = new Date(mostRecentExpense.date);
    targetYear = recentDate.getFullYear();
    targetMonth = recentDate.getMonth();
  }

  // Filter expenses for the target month
  const filtered = allExpenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getFullYear() === targetYear && date.getMonth() === targetMonth;
  });

  // Exclude reimbursed expenses from totals
  const forTotals = filtered.filter((e) => e.reimbursement_status !== 'reimbursed');

  const total = forTotals.reduce((sum, e) => sum + Number(e.inr_amount || 0), 0);

  const byCategory = forTotals.reduce(
    (acc, e) => {
      const cat = e.category;
      acc[cat] = (acc[cat] || 0) + Number(e.inr_amount || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  // Format display month
  const monthName = new Date(targetYear, targetMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return {
    expenses: filtered,
    total,
    byCategory,
    loading,
    error,
    refetch,
    displayMonth: monthName,
    isCurrentMonth: targetYear === currentYear && targetMonth === currentMonth,
  };
}

// Income hook
export function useIncome() {
  return useData<Income>(incomeApi.getAll);
}

// Budgets hook
export function useBudgets() {
  return useData<Budget>(budgetsApi.getAll);
}

// Goals hooks
export function useGoals() {
  return useData<Goal>(goalsApi.getAll);
}

// Categories hook
export function useCategories() {
  return useData<{ id: string; name: string }>(categoriesApi.getAll);
}

// Cards hook
export function useCards() {
  return useData<Card>(cardsApi.getAll);
}

// Combined data hook for dashboard
export function useDashboardData() {
  const netWorth = useNetWorthSummary();
  const { total: monthlySpending, byCategory, displayMonth, isCurrentMonth } = useCurrentMonthExpenses();
  const { data: budgets } = useBudgets();
  const { data: goals } = useGoals();

  // Calculate total budget
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit || 0), 0);

  // Calculate goals progress (simplified - just count completed)
  const goalsWithProgress = goals.map((goal) => {
    const current = Number(goal.current_amount || 0);
    const target = Number(goal.target_amount || 0);
    const progress = target > 0 ? (current / target) * 100 : 0;
    return { ...goal, current, target, progress };
  });

  const avgGoalProgress =
    goalsWithProgress.length > 0
      ? goalsWithProgress.reduce((sum, g) => sum + g.progress, 0) / goalsWithProgress.length
      : 0;

  return {
    netWorth: netWorth.total,
    netWorthLoading: netWorth.loading,
    monthlySpending,
    spendingByCategory: byCategory,
    totalBudget,
    goalsProgress: avgGoalProgress,
    goals: goalsWithProgress,
    loading: netWorth.loading,
    error: netWorth.error,
    displayMonth,
    isCurrentMonth,
  };
}
