import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants';
import { LayoutDashboard, Wallet, Receipt, Target, Settings } from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
};

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">M</span>
          </div>
          <span className="font-bold text-xl">MapFin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings Link */}
      <div className="p-4 border-t">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0">
        <p className="text-xs text-muted-foreground text-center">
          MapFin v1.0
        </p>
      </div>
    </aside>
  );
}
