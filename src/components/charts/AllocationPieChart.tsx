import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChartTooltip } from './ChartTooltip';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/lib/formatters';
import type { PieChartDataPoint } from '@/lib/chartUtils';
import { Button } from '@/components/ui/button';
import { Percent, Hash } from 'lucide-react';

interface AllocationPieChartProps {
  data: PieChartDataPoint[];
  height?: number;
  showToggle?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function AllocationPieChart({
  data,
  height = 300,
  showToggle = true,
  innerRadius = 60,
  outerRadius = 100,
}: AllocationPieChartProps) {
  const formatOptions = useFormatOptions();
  const [showPercent, setShowPercent] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  const renderLegend = (props: { payload?: Array<{ value: string; color: string }> }) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {payload.map((entry, index) => {
          const dataItem = data.find((d) => d.name === entry.value);
          return (
            <li key={`legend-${index}`} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.value}</span>
              <span className="font-medium">
                {showPercent
                  ? `${dataItem?.percentage.toFixed(1)}%`
                  : formatCurrency(dataItem?.value || 0, formatOptions)}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="relative">
      {showToggle && (
        <div className="absolute top-0 right-0 z-10 flex gap-1">
          <Button
            variant={showPercent ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowPercent(true)}
          >
            <Percent className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={!showPercent ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowPercent(false)}
          >
            <Hash className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<PieChartTooltip formatOptions={formatOptions} />} />
          <Legend content={(props) => renderLegend(props as { payload?: Array<{ value: string; color: string }> })} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
