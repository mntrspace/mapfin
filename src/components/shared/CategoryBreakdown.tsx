import { formatCurrency } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface CategoryItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface CategoryBreakdownProps {
  items: CategoryItem[];
  maxItems?: number;
  className?: string;
  showValues?: boolean;
}

export function CategoryBreakdown({
  items,
  maxItems = 6,
  className,
  showValues = true,
}: CategoryBreakdownProps) {
  const formatOptions = useFormatOptions();
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No data available
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayItems.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {showValues && (
                <span className="font-medium">
                  {formatCurrency(item.value, formatOptions)}
                </span>
              )}
              <span className="text-muted-foreground text-xs w-12 text-right">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
