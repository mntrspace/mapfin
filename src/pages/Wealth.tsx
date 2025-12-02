import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import {
  ASSET_CATEGORY_LABELS,
  LIABILITY_CATEGORY_LABELS,
  CHART_COLORS,
} from '@/constants';
import type { TimeRangeValue } from '@/constants';
import type { AssetCategory, LiabilityCategory } from '@/types';
import { Wallet, Landmark, CreditCard, Loader2, BarChart3, Layers } from 'lucide-react';
import { useNetWorth, useLiabilities } from '@/hooks/useSheetData';
import { PersonTabs, type PersonId } from '@/components/shared/PersonTabs';
import { TimeRangeSelector } from '@/components/shared/TimeRangeSelector';
import { StatCard } from '@/components/shared/StatCard';
import { ChartContainer, TimeSeriesBarChart, AllocationPieChart } from '@/components/charts';
import {
  aggregateNetWorthByPeriod,
  aggregateNetWorthByCategory,
  type PieChartDataPoint,
} from '@/lib/chartUtils';
import { getTimeRange, getGranularity } from '@/lib/dateUtils';

export default function Wealth() {
  const formatOptions = useFormatOptions();
  const [personId, setPersonId] = useState<PersonId>(undefined);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('1Y');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { data: netWorthEntries, loading: netWorthLoading, error: netWorthError } = useNetWorth();
  const { data: liabilities, loading: liabilitiesLoading } = useLiabilities();

  // Filter entries by person
  const filteredEntries = useMemo(() => {
    return personId
      ? netWorthEntries.filter((e) => e.person_id === personId)
      : netWorthEntries;
  }, [netWorthEntries, personId]);

  // Filter liabilities by person
  const filteredLiabilities = useMemo(() => {
    return personId
      ? liabilities.filter((l) => l.person_id === personId)
      : liabilities;
  }, [liabilities, personId]);

  // Get time range dates
  const timeRangeData = useMemo(() => getTimeRange(timeRange), [timeRange]);
  const granularity = useMemo(() => getGranularity(timeRange), [timeRange]);

  // Calculate totals from latest entries
  const { totalAssets, totalLiabilities, netWorth, latestDate, byCategory } = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
        latestDate: '',
        byCategory: {} as Record<string, number>,
      };
    }

    // Get latest date
    const latestDate = filteredEntries.reduce((max, e) => {
      return e.report_date > max ? e.report_date : max;
    }, '');

    const latestEntries = filteredEntries.filter((e) => e.report_date === latestDate);
    const totalAssets = latestEntries.reduce((sum, e) => sum + Number(e.amount_inr || 0), 0);
    const totalLiabilities = filteredLiabilities.reduce((sum, l) => sum + Number(l.outstanding || 0), 0);

    const byCategory = latestEntries.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount_inr || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      latestDate,
      byCategory,
    };
  }, [filteredEntries, filteredLiabilities]);

  // Aggregate data for bar chart
  const barChartData = useMemo(() => {
    return aggregateNetWorthByPeriod(filteredEntries, timeRangeData, granularity, personId);
  }, [filteredEntries, timeRangeData, granularity, personId]);

  // Get unique categories for breakdown
  const breakdownKeys = useMemo(() => {
    const categories = new Set<string>();
    filteredEntries.forEach((e) => categories.add(e.category));
    return Array.from(categories);
  }, [filteredEntries]);

  // Pie chart data for assets
  const assetPieData: PieChartDataPoint[] = useMemo(() => {
    return aggregateNetWorthByCategory(
      filteredEntries,
      ASSET_CATEGORY_LABELS,
      CHART_COLORS,
      personId
    );
  }, [filteredEntries, personId]);

  // Pie chart data for liabilities
  const liabilityPieData: PieChartDataPoint[] = useMemo(() => {
    const byCategory: Record<string, number> = {};
    let total = 0;

    filteredLiabilities.forEach((l) => {
      const amount = Number(l.outstanding || 0);
      total += amount;
      byCategory[l.category] = (byCategory[l.category] || 0) + amount;
    });

    return Object.entries(byCategory)
      .map(([category, value], index) => ({
        name: LIABILITY_CATEGORY_LABELS[category as LiabilityCategory] || category,
        value,
        color: CHART_COLORS[(index + 5) % CHART_COLORS.length],
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredLiabilities]);

  const loading = netWorthLoading || liabilitiesLoading;
  const error = netWorthError;

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
        <h1 className="text-3xl font-bold tracking-tight">Wealth Watch</h1>
        <p className="text-muted-foreground">
          Track your net worth across all asset classes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <PersonTabs value={personId} onChange={setPersonId} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Net Worth"
          value={netWorth}
          icon={Wallet}
          loading={loading}
          subtitle={latestDate ? `As of ${new Date(latestDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : undefined}
        />
        <StatCard
          title="Total Assets"
          value={totalAssets}
          icon={Landmark}
          loading={loading}
        />
        <StatCard
          title="Total Liabilities"
          value={totalLiabilities}
          icon={CreditCard}
          loading={loading}
          className="[&_[data-value]]:text-destructive"
        />
      </div>

      {/* Time Range Filter */}
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

      {/* Net Worth Chart */}
      <ChartContainer
        title="Net Worth Over Time"
        loading={loading}
        height={350}
        headerActions={
          <Button
            variant={showBreakdown ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 gap-1.5"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? <BarChart3 className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
            {showBreakdown ? 'Total' : 'Breakdown'}
          </Button>
        }
      >
        {barChartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data available for the selected time range
          </div>
        ) : (
          <TimeSeriesBarChart
            data={barChartData}
            showBreakdown={showBreakdown}
            breakdownKeys={breakdownKeys}
            breakdownLabels={ASSET_CATEGORY_LABELS}
            height={350}
          />
        )}
      </ChartContainer>

      {/* Pie Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartContainer title="Asset Allocation" loading={loading} height={320}>
          {assetPieData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No assets recorded
            </div>
          ) : (
            <AllocationPieChart data={assetPieData} height={320} />
          )}
        </ChartContainer>

        <ChartContainer title="Liability Breakdown" loading={loading} height={320}>
          {liabilityPieData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No liabilities recorded
            </div>
          ) : (
            <AllocationPieChart data={liabilityPieData} height={320} />
          )}
        </ChartContainer>
      </div>

      {/* Detailed Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : Object.keys(byCategory).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No assets recorded</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, value]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <span className="text-sm">
                        {ASSET_CATEGORY_LABELS[category as AssetCategory] || category}
                      </span>
                      <span className="font-medium">{formatCurrency(value, formatOptions)}</span>
                    </div>
                  ))}
                <div className="flex justify-between items-center py-2 border-t-2 font-bold">
                  <span>Total Assets</span>
                  <span>{formatCurrency(totalAssets, formatOptions)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liabilities List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            {liabilitiesLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : filteredLiabilities.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No liabilities recorded</p>
            ) : (
              <div className="space-y-3">
                {filteredLiabilities.map((liability) => (
                  <div
                    key={liability.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{liability.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {LIABILITY_CATEGORY_LABELS[liability.category as LiabilityCategory] || liability.category}
                        {liability.interest_rate && ` • ${liability.interest_rate}%`}
                        {liability.emi && ` • EMI: ${formatCurrency(Number(liability.emi), formatOptions)}`}
                      </p>
                    </div>
                    <span className="font-medium text-destructive">
                      -{formatCurrency(Number(liability.outstanding), formatOptions)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-t-2 font-bold">
                  <span>Total Liabilities</span>
                  <span className="text-destructive">
                    -{formatCurrency(totalLiabilities, formatOptions)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
