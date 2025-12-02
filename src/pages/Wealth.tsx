import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { ASSET_CATEGORY_LABELS, PERSON_FILTERS, TIME_RANGES } from '@/constants';
import type { AssetCategory } from '@/types';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNetWorthSummary, useLiabilities } from '@/hooks/useSheetData';

export default function Wealth() {
  const formatOptions = useFormatOptions();
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1Y');

  // Get person ID based on filter
  const personId = personFilter === 'all' ? undefined : personFilter === 'self' ? 'manan' : 'anushka';

  const { total, byCategory, latestDate, loading, error } = useNetWorthSummary(personId);
  const { data: liabilities, loading: liabilitiesLoading } = useLiabilities();

  // TODO: Calculate actual change from historical data
  const previousNetWorth = total * 0.95; // Placeholder
  const change = total - previousNetWorth;
  const changePercent = previousNetWorth > 0 ? (change / previousNetWorth) * 100 : 0;

  // Sort categories by value
  const sortedCategories = Object.entries(byCategory)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);

  // Filter liabilities by person
  const filteredLiabilities = personId
    ? liabilities.filter((l) => l.person_id === personId)
    : liabilities;

  const totalLiabilities = filteredLiabilities.reduce(
    (sum, l) => sum + Number(l.outstanding || 0),
    0
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wealth Watch</h1>
        <p className="text-muted-foreground">
          Track your net worth across all asset classes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Tabs value={personFilter} onValueChange={setPersonFilter}>
          <TabsList>
            {PERSON_FILTERS.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            {TIME_RANGES.map((range) => (
              <TabsTrigger key={range.value} value={range.value}>
                {range.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Net Worth Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Net Worth
            {latestDate && (
              <span className="ml-2 text-xs">
                (as of {new Date(latestDate).toLocaleDateString()})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold">
                {formatCurrency(total - totalLiabilities, formatOptions)}
              </span>
              {change !== 0 && (
                <div className="flex items-center gap-1">
                  {change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {formatCurrency(change, formatOptions)} ({formatPercent(changePercent)})
                  </span>
                </div>
              )}
            </div>
          )}
          {total === 0 && !loading && (
            <p className="text-sm text-muted-foreground mt-2">
              No net worth entries found. Add entries in the Google Sheet to see your data.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : sortedCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No assets recorded
              </p>
            ) : (
              <div className="space-y-4">
                {sortedCategories.map(([category, value]) => {
                  const percentage = total > 0 ? (value / total) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{ASSET_CATEGORY_LABELS[category as AssetCategory] || category}</span>
                        <span className="font-medium">
                          {formatCurrency(value, formatOptions)} ({percentage.toFixed(1)}%)
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

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : sortedCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No assets recorded
              </p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map(([category, value]) => (
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
                  <span>{formatCurrency(total, formatOptions)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liabilities Section */}
      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {liabilitiesLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : filteredLiabilities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No liabilities recorded
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLiabilities.map((liability) => (
                <div
                  key={liability.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{liability.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {liability.category} • {liability.interest_rate}% interest
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
                <span className="text-destructive">-{formatCurrency(totalLiabilities, formatOptions)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
