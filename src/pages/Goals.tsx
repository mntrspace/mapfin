import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { GOAL_TYPE_LABELS } from '@/constants';
import type { GoalType } from '@/types';
import { Plus, Target, TrendingUp, Loader2 } from 'lucide-react';
import { useGoals } from '@/hooks/useSheetData';

export default function Goals() {
  const formatOptions = useFormatOptions();
  const { data: goals, loading, error } = useGoals();

  // Calculate progress for each goal
  const goalsWithProgress = goals.map((goal) => {
    const current = Number(goal.current_amount || 0);
    const target = Number(goal.target_amount || 0);
    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const remaining = Math.max(0, target - current);
    return { ...goal, current, target, progress, remaining };
  });

  // Stats
  const totalGoals = goals.length;
  const onTrackGoals = goalsWithProgress.filter((g) => g.progress >= 50).length;
  const totalTarget = goalsWithProgress.reduce((sum, g) => sum + g.target, 0);

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
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Set and track your financial goals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Goals Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalGoals}</div>
                <p className="text-xs text-muted-foreground">
                  Active financial goals
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-500">
                  {onTrackGoals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Goals progressing well (50%+)
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalTarget, formatOptions)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined goal amount
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : goalsWithProgress.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No goals yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Start by creating your first financial goal
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          goalsWithProgress.map((goal) => {
            const isOnTrack = goal.progress >= 50;

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {GOAL_TYPE_LABELS[goal.type as GoalType] || goal.type}
                      </Badge>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        isOnTrack ? 'text-green-500' : 'text-yellow-500'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>{goal.progress.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {formatCurrency(goal.current, formatOptions)} /{' '}
                        {formatCurrency(goal.target, formatOptions)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className={`h-2 rounded-full ${
                          isOnTrack ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium">
                      {formatCurrency(goal.remaining, formatOptions)}
                    </span>
                  </div>

                  {goal.target_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target Date</span>
                      <span className="font-medium">
                        {formatDate(goal.target_date)}
                      </span>
                    </div>
                  )}

                  {goal.notes && (
                    <p className="text-sm text-muted-foreground border-t pt-3">
                      {goal.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
