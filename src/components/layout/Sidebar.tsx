import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants';
import { useSettings } from '@/contexts/SettingsContext';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Target,
  Settings,
  Hash,
  Sigma,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Target,
};

const SIDEBAR_COLLAPSED_KEY = 'mapfin-sidebar-collapsed';

export function Sidebar() {
  const location = useLocation();
  const { settings, updateShowExactAmounts } = useSettings();

  // Collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Show expanded when not collapsed OR when hovering while collapsed
  const showExpanded = !isCollapsed || isHovered;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-background transition-all duration-200',
        showExpanded ? 'w-64' : 'w-16'
      )}
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">M</span>
            </div>
            {showExpanded && <span className="font-bold text-xl">MapFin</span>}
          </Link>
          {showExpanded && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !showExpanded && 'justify-center'
              )}
              title={!showExpanded ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {showExpanded && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Exact Amount Toggle */}
      <div className={cn('p-2 border-t', !showExpanded && 'flex justify-center')}>
        <button
          onClick={() => updateShowExactAmounts(!settings.showExactAmounts)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            !showExpanded && 'justify-center w-auto'
          )}
          title={settings.showExactAmounts ? 'Show compact amounts' : 'Show exact amounts'}
        >
          {settings.showExactAmounts ? (
            <Hash className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Sigma className="h-5 w-5 flex-shrink-0" />
          )}
          {showExpanded && (
            <span>{settings.showExactAmounts ? 'Exact' : 'Compact'}</span>
          )}
        </button>
      </div>

      {/* Settings Link */}
      <div className={cn('p-2 border-t', !showExpanded && 'flex justify-center')}>
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            showExpanded ? 'w-full' : 'justify-center'
          )}
          title={!showExpanded ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {showExpanded && 'Settings'}
        </Link>
      </div>

      {/* Footer */}
      {showExpanded && (
        <div className="p-4 pt-0">
          <p className="text-xs text-muted-foreground text-center">
            MapFin v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
