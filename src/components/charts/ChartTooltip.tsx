import { formatCurrency } from '@/lib/formatters';
import type { FormatOptions } from '@/contexts/SettingsContext';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatOptions: FormatOptions;
  valuePrefix?: string;
  valueSuffix?: string;
  showTotal?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatOptions,
  valuePrefix = '',
  valueSuffix = '',
  showTotal = false,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const total = showTotal
    ? payload.reduce((sum, entry) => sum + (entry.value || 0), 0)
    : null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      {label && <p className="mb-2 font-medium text-sm">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium">
              {valuePrefix}
              {formatCurrency(entry.value, formatOptions)}
              {valueSuffix}
            </span>
          </div>
        ))}
        {showTotal && total !== null && payload.length > 1 && (
          <>
            <div className="my-1 border-t" />
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">
                {valuePrefix}
                {formatCurrency(total, formatOptions)}
                {valueSuffix}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      percentage: number;
      color: string;
    };
  }>;
  formatOptions: FormatOptions;
}

export function PieChartTooltip({ active, payload, formatOptions }: PieTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-medium text-sm">{data.name}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {formatCurrency(data.value, formatOptions)} ({data.percentage.toFixed(1)}%)
      </div>
    </div>
  );
}
