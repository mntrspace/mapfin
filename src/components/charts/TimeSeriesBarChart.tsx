import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { formatCompactNumber } from '@/lib/formatters';
import type { BarChartDataPoint } from '@/lib/chartUtils';
import { CHART_COLORS } from '@/constants';

interface TimeSeriesBarChartProps {
  data: BarChartDataPoint[];
  showBreakdown?: boolean;
  breakdownKeys?: string[];
  breakdownLabels?: Record<string, string>;
  showLiabilities?: boolean;
  height?: number;
}

export function TimeSeriesBarChart({
  data,
  showBreakdown = false,
  breakdownKeys = [],
  breakdownLabels = {},
  showLiabilities = false,
  height = 300,
}: TimeSeriesBarChartProps) {
  const formatOptions = useFormatOptions();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  const renderBars = () => {
    if (showBreakdown && breakdownKeys.length > 0) {
      return breakdownKeys.map((key, index) => (
        <Bar
          key={key}
          dataKey={key}
          name={breakdownLabels[key] || key}
          stackId="stack"
          fill={CHART_COLORS[index % CHART_COLORS.length]}
          radius={index === breakdownKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
        />
      ));
    }

    if (showLiabilities) {
      return (
        <>
          <Bar
            dataKey="assets"
            name="Assets"
            fill={CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="liabilities"
            name="Liabilities"
            fill={CHART_COLORS[3]}
            radius={[0, 0, 4, 4]}
          />
        </>
      );
    }

    return (
      <Bar
        dataKey="total"
        name="Total"
        fill={CHART_COLORS[0]}
        radius={[4, 4, 0, 0]}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCompactNumber(value)}
          className="text-muted-foreground"
          width={60}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active}
              payload={payload as Parameters<typeof ChartTooltip>[0]['payload']}
              label={String(label ?? '')}
              formatOptions={formatOptions}
              showTotal={showBreakdown && breakdownKeys.length > 1}
            />
          )}
        />
        {showLiabilities && (
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
        )}
        {(showBreakdown || showLiabilities) && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        )}
        {renderBars()}
      </BarChart>
    </ResponsiveContainer>
  );
}
