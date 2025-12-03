import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_COLORS,
  PAYMENT_METHOD_LABELS,
  CHART_COLORS,
} from '@/constants';
import type { TimeRangeValue } from '@/constants';
import type { ExpenseCategory, PaymentMethod, ExpenseFilterState } from '@/types';
import { Search, Loader2, Receipt, Calendar } from 'lucide-react';
import {
  useExpenses,
  useBudgets,
  useYTDExpenses,
  useLastMonthExpenses,
  useTags,
} from '@/hooks/useSheetData';
import { PersonTabs, type PersonId } from '@/components/shared/PersonTabs';
import { TimeRangeSelector } from '@/components/shared/TimeRangeSelector';
import { StatCard } from '@/components/shared/StatCard';
import { TagBadge } from '@/components/shared/TagBadge';
import { ExpenseFilters } from '@/components/shared/ExpenseFilters';
import { Pagination } from '@/components/shared/Pagination';
import { ChartContainer, TimeSeriesBarChart, AllocationPieChart } from '@/components/charts';
import {
  aggregateExpensesByPeriod,
  aggregateExpensesByCategory,
  type PieChartDataPoint,
} from '@/lib/chartUtils';
import { getTimeRange, getGranularity, isDateInRange } from '@/lib/dateUtils';

// Initial empty filter state
const initialFilterState: ExpenseFilterState = {
  categories: [],
  paymentMethods: [],
  paymentSpecifics: [],
  tags: [],
  amountMin: undefined,
  amountMax: undefined,
  reimbursementStatus: [],
};

export default function Expenses() {
  const formatOptions = useFormatOptions();
  const [personId, setPersonId] = useState<PersonId>(undefined);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('3M');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ExpenseFilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data: allExpenses, loading: expensesLoading, error: expensesError } = useExpenses();
  const { data: budgets } = useBudgets();
  const { tags: availableTags } = useTags();
  const ytdData = useYTDExpenses();
  const lastMonthData = useLastMonthExpenses();

  // Get time range dates
  const timeRangeData = useMemo(() => getTimeRange(timeRange), [timeRange]);
  const granularity = useMemo(() => getGranularity(timeRange), [timeRange]);

  // Get unique payment specifics from all expenses
  const uniquePaymentSpecifics = useMemo(() => {
    const specifics = new Set<string>();
    allExpenses.forEach((e) => {
      if (e.payment_specifics) {
        specifics.add(e.payment_specifics);
      }
    });
    return Array.from(specifics).sort();
  }, [allExpenses]);

  // Apply all filters in order
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      // Person filter
      if (personId && e.person_id !== personId) return false;

      // Time range filter
      if (!isDateInRange(e.date, timeRangeData)) return false;

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(e.category as ExpenseCategory)) {
        return false;
      }

      // Payment method filter
      if (filters.paymentMethods.length > 0 && !filters.paymentMethods.includes(e.payment_method as PaymentMethod)) {
        return false;
      }

      // Payment specifics filter
      if (filters.paymentSpecifics.length > 0 && !filters.paymentSpecifics.includes(e.payment_specifics)) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const expenseTagIds = e.tags?.map((t) => t.id) || [];
        if (!filters.tags.some((tagId) => expenseTagIds.includes(tagId))) {
          return false;
        }
      }

      // Amount range filter
      const amount = Number(e.inr_amount);
      if (filters.amountMin !== undefined && amount < filters.amountMin) return false;
      if (filters.amountMax !== undefined && amount > filters.amountMax) return false;

      // Reimbursement status filter
      if (filters.reimbursementStatus.length > 0 && !filters.reimbursementStatus.includes(e.reimbursement_status)) {
        return false;
      }

      return true;
    });
  }, [allExpenses, personId, timeRangeData, filters]);

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
      (EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory] || e.category).toLowerCase().includes(query) ||
      (e.payment_specifics?.toLowerCase().includes(query)) ||
      (e.tags?.some((t) => t.name.toLowerCase().includes(query)))
    );
  }, [filteredExpenses, searchQuery]);

  // Sort by date descending
  const sortedExpenses = useMemo(() => {
    return [...searchedExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [searchedExpenses]);

  // Pagination
  const totalPages = Math.ceil(sortedExpenses.length / pageSize);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedExpenses.slice(start, start + pageSize);
  }, [sortedExpenses, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: ExpenseFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

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

      {/* Person Filter */}
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Advanced Filters */}
          <ExpenseFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            paymentSpecifics={uniquePaymentSpecifics}
            availableTags={availableTags}
            onClearFilters={handleClearFilters}
          />

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sortedExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery || Object.values(filters).some((v) => Array.isArray(v) ? v.length > 0 : v !== undefined)
                ? 'No matching transactions found'
                : 'No transactions in the selected period'}
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedExpenses.map((expense) => {
                  const categoryColor = EXPENSE_CATEGORY_COLORS[expense.category as ExpenseCategory] || '#64748b';
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between py-3 px-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      style={{ borderLeftWidth: '4px', borderLeftColor: categoryColor }}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{expense.description}</p>
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
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground items-center">
                          <span>{formatDate(expense.date)}</span>
                          <span>•</span>
                          <Badge
                            variant="secondary"
                            className="text-xs text-white"
                            style={{ backgroundColor: categoryColor }}
                          >
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
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedExpenses.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
