import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title?: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  headerActions?: ReactNode;
  height?: number;
}

export function ChartContainer({
  title,
  description,
  children,
  loading = false,
  className,
  headerActions,
  height = 300,
}: ChartContainerProps) {
  return (
    <Card className={cn('w-full', className)}>
      {(title || headerActions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle className="text-base font-medium">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !headerActions && 'pt-6')}>
        {loading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div style={{ height: `${height}px`, width: '100%' }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
