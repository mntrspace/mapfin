import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function TagBadge({
  name,
  color,
  onRemove,
  className,
  size = 'sm',
}: TagBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
