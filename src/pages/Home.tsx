import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import {
  Wallet,
  Receipt,
  Target,
  Calendar,
  Loader2,
  Droplets,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useNetWorth,
  useLiabilities,
  useBudgets,
  useGoals,
  useLastMonthExpenses,
  useYTDExpenses,
} from '@/hooks/useSheetData';
import { PersonTabs, type PersonId } from '@/components/shared/PersonTabs';
import {
  ASSET_LIQUIDITY,
  EXPENSE_CATEGORY_CRITICAL,
  GOAL_TYPE_LABELS,
} from '@/constants';
import type { AssetCategory, ExpenseCategory } from '@/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function Home() {
  const formatOptions = useFormatOptions();
  const [personId, setPersonId] = useState<PersonId>(undefined);

  // Fetch all data
  const { data: netWorthEntries, loading: netWorthLoading, error: netWorthError } = useNetWorth();
  const { data: liabilities, loading: liabilitiesLoading } = useLiabilities();
  const { data: budgets, loading: budgetsLoading } = useBudgets();
  const { data: goals, loading: goalsLoading } = useGoals();
  const lastMonth = useLastMonthExpenses();
  const ytd = useYTDExpenses();

  // Filter by person
  const filteredEntries = useMemo(() => {
    return personId
      ? netWorthEntries.filter((e) => e.person_id === personId)
      : netWorthEntries;
  }, [netWorthEntries, personId]);

  const filteredLiabilities = useMemo(() => {
    return personId
      ? liabilities.filter((l) => l.person_id === personId)
      : liabilities;
  }, [liabilities, personId]);

  // Calculate net worth with liquid/illiquid breakdown
  const {
    totalAssets,
    netWorth,
    liquidAssets,
    illiquidAssets,
    latestDate,
  } = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalAssets: 0,
        netWorth: 0,
        liquidAssets: 0,
        illiquidAssets: 0,
        latestDate: '',
      };
    }

    // Get latest date
    const latestDate = filteredEntries.reduce((max, e) => {
      return e.report_date > max ? e.report_date : max;
    }, '');

    const latestEntries = filteredEntries.filter((e) => e.report_date === latestDate);

    let totalAssets = 0;
    let liquidAssets = 0;
    let illiquidAssets = 0;

    latestEntries.forEach((e) => {
      const amount = Number(e.amount_inr || 0);
      totalAssets += amount;

      const liquidity = ASSET_LIQUIDITY[e.category as AssetCategory];
      if (liquidity === 'liquid') {
        liquidAssets += amount;
      } else {
        illiquidAssets += amount;
      }
    });

    const liabilitiesTotal = filteredLiabilities.reduce(
      (sum, l) => sum + Number(l.outstanding || 0),
      0
    );

    return {
      totalAssets,
      netWorth: totalAssets - liabilitiesTotal,
      liquidAssets,
      illiquidAssets,
      latestDate,
    };
  }, [filteredEntries, filteredLiabilities]);

  // Calculate critical monthly budget for emergency runway
  const { criticalMonthlyBudget, emergencyRunwayMonths } = useMemo(() => {
    let criticalTotal = 0;

    budgets.forEach((budget) => {
      // Use budget's is_critical if set, otherwise use default from constants
      // Note: value from Google Sheets may come as string "true"/"false"
      const isCritical =
        budget.is_critical !== undefined
          ? String(budget.is_critical) === 'true' || budget.is_critical === true
          : EXPENSE_CATEGORY_CRITICAL[budget.category as ExpenseCategory] ?? false;

      if (isCritical) {
        criticalTotal += Number(budget.monthly_limit || 0);
      }
    });

    // Emergency runway = liquid assets / critical monthly expenses
    const runway = criticalTotal > 0 ? liquidAssets / criticalTotal : 0;

    return {
      criticalMonthlyBudget: criticalTotal,
      emergencyRunwayMonths: runway,
    };
  }, [budgets, liquidAssets]);

  // Process goals for display
  const processedGoals = useMemo(() => {
    return goals
      .map((goal) => {
        const current = Number(goal.current_amount || 0);
        const target = Number(goal.target_amount || 0);
        const progress = target > 0 ? (current / target) * 100 : 0;
        return { ...goal, current, target, progress };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [goals]);

  const loading = netWorthLoading || liabilitiesLoading || budgetsLoading;
  const error = netWorthError || lastMonth.error || ytd.error;

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

  // Liquid/illiquid percentage for the breakdown bar
  const liquidPercent = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;

  // Format runway for display
  const formatRunway = (months: number) => {
    if (months === 0) return 'N/A';
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = Math.round(months % 12);
      if (remainingMonths === 0) return `${years}y`;
      return `${years}y ${remainingMonths}m`;
    }
    return `${Math.round(months)}m`;
  };

  // Get runway color based on months
  const getRunwayColor = (months: number) => {
    if (months >= 12) return 'text-green-600';
    if (months >= 6) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Health</h1>
        <p className="text-muted-foreground">
          Your complete financial picture at a glance
        </p>
      </div>

      {/* Person Filter */}
      <PersonTabs value={personId} onChange={setPersonId} />

      {/* Hero: Net Worth Card */}
      <Card className="border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Worth
            </CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="text-4xl font-bold tracking-tight">
                {formatCurrency(netWorth, formatOptions)}
              </div>
              {latestDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  As of{' '}
                  {new Date(latestDate).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}

              {/* Liquid/Illiquid breakdown bar */}
              {totalAssets > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">
                      Liquid: {formatCurrency(liquidAssets, formatOptions)} ({liquidPercent.toFixed(0)}%)
                    </span>
                    <span className="text-amber-600">
                      Illiquid: {formatCurrency(illiquidAssets, formatOptions)} ({(100 - liquidPercent).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-amber-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-l-full transition-all"
                      style={{ width: `${liquidPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Row 2: Liquid Assets + Emergency Runway */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Liquid Assets"
          value={liquidAssets}
          icon={Droplets}
          loading={loading}
          subtitle={
            totalAssets > 0
              ? `${liquidPercent.toFixed(0)}% of total assets`
              : undefined
          }
          className="[&_[data-value]]:text-blue-600"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Runway</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading || budgetsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className={cn('text-2xl font-bold', getRunwayColor(emergencyRunwayMonths))}>
                  {formatRunway(emergencyRunwayMonths)}
                </div>
                {criticalMonthlyBudget > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Based on {formatCurrency(criticalMonthlyBudget, formatOptions)}/mo critical expenses
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Set up budgets to calculate runway
                  </p>
                )}
                {emergencyRunwayMonths > 0 && emergencyRunwayMonths < 6 && (
                  <p className="text-xs text-red-600 mt-1">
                    Consider building to 6+ months
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Expenses */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title={lastMonth.displayMonth || 'Last Month'}
          value={lastMonth.total}
          changePercent={lastMonth.changePercent}
          changeLabel="vs prev month"
          icon={Receipt}
          loading={lastMonth.loading}
        />

        <StatCard
          title={`YTD ${new Date().getFullYear()}`}
          value={ytd.total}
          changePercent={ytd.changePercent}
          changeLabel="vs last year"
          icon={Calendar}
          loading={ytd.loading}
        />
      </div>

      {/* Row 4: Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Goals</CardTitle>
          <Link
            to="/goals"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {goalsLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : processedGoals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No goals set yet.{' '}
              <Link to="/goals" className="text-primary hover:underline">
                Create your first goal
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {processedGoals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{goal.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {GOAL_TYPE_LABELS[goal.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          goal.progress >= 100 ? 'text-green-600' : ''
                        )}
                      >
                        {goal.progress.toFixed(0)}%
                      </span>
                      {/* Hover to reveal amounts */}
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(goal.current, formatOptions)} / {formatCurrency(goal.target, formatOptions)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(goal.progress, 100)}
                    className="h-2"
                  />
                </div>
              ))}
              {processedGoals.length > 4 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{processedGoals.length - 4} more goals
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
