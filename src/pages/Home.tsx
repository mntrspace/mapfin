import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { TrendingUp, TrendingDown, Wallet, Receipt, Target, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useSheetData';

export default function Home() {
  const formatOptions = useFormatOptions();
  const {
    netWorth,
    netWorthLoading,
    monthlySpending,
    totalBudget,
    goalsProgress,
    loading,
    error,
  } = useDashboardData();

  // TODO: Calculate actual change from previous period
  const netWorthChange = 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure the API server is running: <code>npm run server</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Net Worth Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {netWorthLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(netWorth, formatOptions)}
                </div>
                {netWorthChange !== 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {netWorthChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        netWorthChange >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {formatPercent(netWorthChange)}
                    </span>
                    <span>from last month</span>
                  </p>
                )}
                {netWorth === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add net worth entries to see your total
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(monthlySpending, formatOptions)}
                </div>
                {totalBudget > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Math.max(0, totalBudget - monthlySpending), formatOptions)}{' '}
                      remaining of {formatCurrency(totalBudget, formatOptions)} budget
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                      <div
                        className={`h-2 rounded-full ${
                          monthlySpending > totalBudget ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{
                          width: `${Math.min(
                            (monthlySpending / totalBudget) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Set budgets to track spending limits
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{goalsProgress.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  {goalsProgress > 0
                    ? 'Average progress across all goals'
                    : 'Add goals to track your progress'}
                </p>
                {goalsProgress > 0 && (
                  <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${goalsProgress}%` }}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/wealth">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Wealth Watch</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed asset breakdown
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/expenses">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Receipt className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Expenses</h3>
                <p className="text-sm text-muted-foreground">
                  Track your spending
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/goals">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Goals</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your progress
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
