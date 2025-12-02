import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onAddExpense?: () => void;
}

export function Header({ onAddExpense }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Logo */}
        <div className="flex items-center gap-4 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">M</span>
            </div>
            <span className="font-bold text-xl">MapFin</span>
          </Link>
        </div>

        {/* Desktop: Just some space or breadcrumb */}
        <div className="hidden md:block" />

        {/* Add Expense Button - Always visible */}
        <Button onClick={onAddExpense} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
}
