import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { EXPENSE_CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from '@/constants';
import type { ExpenseCategory, PaymentMethod } from '@/types';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCurrentMonthExpenses, useBudgets } from '@/hooks/useSheetData';

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState('');

  const { expenses, total, byCategory, loading, error } = useCurrentMonthExpenses();
  const { data: budgets } = useBudgets();

  // Calculate total budget
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit || 0), 0);

  // Sort categories by spending
  const sortedCategories = Object.entries(byCategory)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);

  // Filter expenses by search query
  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by date descending
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your spending
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(total)}
                </div>
                {totalBudget > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Math.max(0, totalBudget - total))}{' '}
                      remaining of {formatCurrency(totalBudget)} budget
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                      <div
                        className={`h-2 rounded-full ${
                          total > totalBudget ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{
                          width: `${Math.min((total / totalBudget) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {expenses.length} transactions this month
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Active spending categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : sortedCategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No expenses this month
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedCategories.map(([category, value]) => {
                const percentage = total > 0 ? (value / total) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{EXPENSE_CATEGORY_LABELS[category as ExpenseCategory] || category}</span>
                      <span className="font-medium">
                        {formatCurrency(value)} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
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
              {searchQuery ? 'No matching transactions found' : 'No transactions this month'}
            </p>
          ) : (
            <div className="space-y-4">
              {sortedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{expense.description}</p>
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
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(Number(expense.inr_amount))}
                    </p>
                    {expense.reimbursement_status !== 'none' && (
                      <Badge
                        variant={
                          expense.reimbursement_status === 'reimbursed'
                            ? 'default'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {expense.reimbursement_status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
