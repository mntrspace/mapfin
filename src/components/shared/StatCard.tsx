import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Loader2, type LucideIcon } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { useFormatOptions } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  changePercent?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  change,
  changePercent,
  changeLabel = 'from last period',
  icon: Icon,
  loading = false,
  children,
  className,
  valuePrefix,
  valueSuffix,
  subtitle,
}: StatCardProps) {
  const formatOptions = useFormatOptions();

  const getTrendIcon = () => {
    if (changePercent === undefined || changePercent === 0) {
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
    return changePercent > 0 ? (
      <TrendingUp className="h-3 w-3 text-green-500" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-500" />
    );
  };

  const getTrendColor = () => {
    if (changePercent === undefined || changePercent === 0) {
      return 'text-muted-foreground';
    }
    return changePercent > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="text-2xl font-bold">
              {valuePrefix}
              {formatCurrency(value, formatOptions)}
              {valueSuffix}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {(changePercent !== undefined || change !== undefined) && (
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon()}
                <span className={cn('text-xs', getTrendColor())}>
                  {changePercent !== undefined && formatPercent(changePercent)}
                </span>
                {change !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    ({formatCurrency(change, formatOptions)})
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}
            {children}
          </>
        )}
      </CardContent>
    </Card>
  );
}
