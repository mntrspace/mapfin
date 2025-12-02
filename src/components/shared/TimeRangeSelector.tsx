import { Button } from '@/components/ui/button';
import { TIME_RANGES, type TimeRangeValue } from '@/constants';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
  value: TimeRangeValue;
  onChange: (value: TimeRangeValue) => void;
  className?: string;
}

export function TimeRangeSelector({ value, onChange, className }: TimeRangeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {TIME_RANGES.map((range) => (
        <Button
          key={range.value}
          variant={value === range.value ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => onChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}

export function getGranularityForRange(rangeValue: TimeRangeValue): string {
  const range = TIME_RANGES.find((r) => r.value === rangeValue);
  return range?.granularity || 'monthly';
}
