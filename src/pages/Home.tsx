import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { Wallet, Receipt, Target, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useNetWorthSummary,
  useBudgets,
  useGoals,
  useLastMonthExpenses,
  useYTDExpenses,
} from '@/hooks/useSheetData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PersonId = 'manan' | 'anushka' | undefined;

export default function Home() {
  const formatOptions = useFormatOptions();
  const [selectedPerson, setSelectedPerson] = useState<PersonId>(undefined);

  // Net worth with person filter
  const netWorth = useNetWorthSummary(selectedPerson);

  // Expenses data
  const lastMonth = useLastMonthExpenses();
  const ytd = useYTDExpenses();

  // Budgets and goals
  const { data: budgets, loading: budgetsLoading } = useBudgets();
  const { data: goals, loading: goalsLoading } = useGoals();

  // Calculate total budget
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit || 0), 0);
  const budgetUsedPercent = totalBudget > 0 ? (lastMonth.total / totalBudget) * 100 : 0;
  const budgetRemaining = Math.max(0, totalBudget - lastMonth.total);

  // Calculate goals progress
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

  const error = netWorth.error || lastMonth.error || ytd.error;

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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Net Worth Card with Person Selector */}
        <Card>
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Net Worth</span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedPerson ?? 'all'}
                onValueChange={(v) => setSelectedPerson(v === 'all' ? undefined : (v as PersonId))}
              >
                <SelectTrigger className="h-7 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Aggregate</SelectItem>
                  <SelectItem value="manan">Manan</SelectItem>
                  <SelectItem value="anushka">Anushka</SelectItem>
                </SelectContent>
              </Select>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <CardContent>
            {netWorth.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(netWorth.total, formatOptions)}
                </div>
                {netWorth.total === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add net worth entries to see your total
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    As of {netWorth.latestDate ? new Date(netWorth.latestDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Last Month Expenses Card */}
        <StatCard
          title={lastMonth.displayMonth || 'Last Month'}
          value={lastMonth.total}
          changePercent={lastMonth.changePercent}
          changeLabel="vs prev month"
          icon={Receipt}
          loading={lastMonth.loading || budgetsLoading}
        >
          {totalBudget > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(budgetRemaining, formatOptions)} remaining of{' '}
                {formatCurrency(totalBudget, formatOptions)} budget
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div
                  className={`h-2 rounded-full ${
                    budgetUsedPercent > 100 ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                />
              </div>
            </>
          )}
        </StatCard>

        {/* YTD Expenses Card */}
        <StatCard
          title={`YTD ${new Date().getFullYear()}`}
          value={ytd.total}
          changePercent={ytd.changePercent}
          changeLabel="vs last year"
          icon={Calendar}
          loading={ytd.loading}
        />
      </div>

      {/* Goals Progress Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <span className="text-sm font-medium">Goals Progress</span>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardContent>
            {goalsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{avgGoalProgress.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  {goalsWithProgress.length > 0
                    ? `Average across ${goalsWithProgress.length} goal${goalsWithProgress.length > 1 ? 's' : ''}`
                    : 'Add goals to track your progress'}
                </p>
                {avgGoalProgress > 0 && (
                  <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${Math.min(avgGoalProgress, 100)}%` }}
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
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
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
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
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
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
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
