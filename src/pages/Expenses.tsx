import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { EXPENSE_CATEGORY_LABELS, PAYMENT_METHOD_LABELS, CHART_COLORS } from '@/constants';
import type { TimeRangeValue } from '@/constants';
import type { ExpenseCategory, PaymentMethod } from '@/types';
import { Search, Loader2, Receipt, Calendar } from 'lucide-react';
import {
  useExpenses,
  useBudgets,
  useYTDExpenses,
  useLastMonthExpenses,
} from '@/hooks/useSheetData';
import { PersonTabs, type PersonId } from '@/components/shared/PersonTabs';
import { TimeRangeSelector } from '@/components/shared/TimeRangeSelector';
import { StatCard } from '@/components/shared/StatCard';
import { TagBadge } from '@/components/shared/TagBadge';
import { ChartContainer, TimeSeriesBarChart, AllocationPieChart } from '@/components/charts';
import {
  aggregateExpensesByPeriod,
  aggregateExpensesByCategory,
  type PieChartDataPoint,
} from '@/lib/chartUtils';
import { getTimeRange, getGranularity, isDateInRange } from '@/lib/dateUtils';

export default function Expenses() {
  const formatOptions = useFormatOptions();
  const [personId, setPersonId] = useState<PersonId>(undefined);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('3M');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allExpenses, loading: expensesLoading, error: expensesError } = useExpenses();
  const { data: budgets } = useBudgets();
  const ytdData = useYTDExpenses();
  const lastMonthData = useLastMonthExpenses();

  // Get time range dates
  const timeRangeData = useMemo(() => getTimeRange(timeRange), [timeRange]);
  const granularity = useMemo(() => getGranularity(timeRange), [timeRange]);

  // Filter expenses by person and time range
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      if (personId && e.person_id !== personId) return false;
      return isDateInRange(e.date, timeRangeData);
    });
  }, [allExpenses, personId, timeRangeData]);

  // Expenses for totals (exclude reimbursed)
  const expensesForTotals = useMemo(() => {
    return filteredExpenses.filter((e) => e.reimbursement_status !== 'reimbursed');
  }, [filteredExpenses]);

  // Calculate period total
  const periodTotal = useMemo(() => {
    return expensesForTotals.reduce((sum, e) => sum + Number(e.inr_amount || 0), 0);
  }, [expensesForTotals]);

  // Calculate total budget
  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + Number(b.monthly_limit || 0), 0);
  }, [budgets]);

  // Bar chart data
  const barChartData = useMemo(() => {
    return aggregateExpensesByPeriod(filteredExpenses, timeRangeData, granularity);
  }, [filteredExpenses, timeRangeData, granularity]);

  // Pie chart data
  const pieChartData: PieChartDataPoint[] = useMemo(() => {
    return aggregateExpensesByCategory(
      expensesForTotals,
      EXPENSE_CATEGORY_LABELS,
      CHART_COLORS
    );
  }, [expensesForTotals]);

  // Filter expenses by search
  const searchedExpenses = useMemo(() => {
    if (!searchQuery) return filteredExpenses;
    const query = searchQuery.toLowerCase();
    return filteredExpenses.filter((e) =>
      e.description.toLowerCase().includes(query) ||
      (EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory] || e.category).toLowerCase().includes(query)
    );
  }, [filteredExpenses, searchQuery]);

  // Sort by date descending
  const sortedExpenses = useMemo(() => {
    return [...searchedExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [searchedExpenses]);

  const loading = expensesLoading;
  const error = expensesError;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">
          Track and manage your spending
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <PersonTabs value={personId} onChange={setPersonId} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title={`YTD ${new Date().getFullYear()}`}
          value={ytdData.total}
          changePercent={ytdData.changePercent}
          changeLabel="vs last year"
          icon={Calendar}
          loading={ytdData.loading}
        />
        <StatCard
          title={lastMonthData.displayMonth || 'Last Month'}
          value={lastMonthData.total}
          changePercent={lastMonthData.changePercent}
          changeLabel="vs prev month"
          icon={Receipt}
          loading={lastMonthData.loading}
        >
          {totalBudget > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(Math.max(0, totalBudget - lastMonthData.total), formatOptions)} remaining of{' '}
                {formatCurrency(totalBudget, formatOptions)} budget
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div
                  className={`h-2 rounded-full ${
                    lastMonthData.total > totalBudget ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((lastMonthData.total / totalBudget) * 100, 100)}%` }}
                />
              </div>
            </>
          )}
        </StatCard>
      </div>

      {/* Time Range Filter */}
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expenses Bar Chart */}
        <ChartContainer
          title="Expenses Over Time"
          loading={loading}
          height={300}
        >
          {barChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No expenses in the selected time range
            </div>
          ) : (
            <TimeSeriesBarChart data={barChartData} height={300} />
          )}
        </ChartContainer>

        {/* Category Pie Chart */}
        <ChartContainer
          title="Spending by Category"
          loading={loading}
          height={300}
        >
          {pieChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No expenses recorded
            </div>
          ) : (
            <AllocationPieChart data={pieChartData} height={300} />
          )}
        </ChartContainer>
      </div>

      {/* Period Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Period Total: {formatCurrency(periodTotal, formatOptions)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredExpenses.length} transactions)
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Transactions</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sortedExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No matching transactions found' : 'No transactions in the selected period'}
            </p>
          ) : (
            <div className="space-y-3">
              {sortedExpenses.slice(0, 50).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{expense.description}</p>
                      {/* Tags will be shown here when implemented */}
                      {expense.tags && expense.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {expense.tags.map((tag) => (
                            <TagBadge
                              key={tag.id}
                              name={tag.name}
                              color={tag.color}
                              size="sm"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(expense.date)}</span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        {EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory] || expense.category}
                      </Badge>
                      <span>•</span>
                      <span>
                        {PAYMENT_METHOD_LABELS[expense.payment_method as PaymentMethod] || expense.payment_method}
                        {expense.payment_specifics && ` (${expense.payment_specifics})`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">
                      {formatCurrency(Number(expense.inr_amount), formatOptions)}
                    </p>
                    {expense.reimbursement_status !== 'none' && (
                      <Badge
                        variant={expense.reimbursement_status === 'reimbursed' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {expense.reimbursement_status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {sortedExpenses.length > 50 && (
                <p className="text-center text-sm text-muted-foreground pt-4">
                  Showing 50 of {sortedExpenses.length} transactions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
