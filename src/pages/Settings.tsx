import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings, type Currency, type NumberFormat } from '@/contexts/SettingsContext';
import { formatDate } from '@/lib/formatters';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { settings, updateCurrency, updateNumberFormat, refreshExchangeRate } = useSettings();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshRate = async () => {
    setRefreshing(true);
    try {
      await refreshExchangeRate();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your display preferences
        </p>
      </div>

      {/* Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Display Currency</CardTitle>
          <CardDescription>
            Choose how amounts are displayed throughout the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={settings.currency} onValueChange={(value) => updateCurrency(value as Currency)}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">
                <span className="flex items-center gap-2">
                  <span className="font-medium">₹</span>
                  <span>Indian Rupee (INR)</span>
                </span>
              </SelectItem>
              <SelectItem value="USD">
                <span className="flex items-center gap-2">
                  <span className="font-medium">$</span>
                  <span>US Dollar (USD)</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Exchange rate: 1 USD = ₹{settings.exchangeRate.toFixed(2)}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span>
              Updated: {formatDate(settings.lastExchangeUpdate)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefreshRate}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Number Format (only for INR) */}
      {settings.currency === 'INR' && (
        <Card>
          <CardHeader>
            <CardTitle>Number Format</CardTitle>
            <CardDescription>
              Choose between Indian and Western number notation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <FormatOption
                format="indian"
                label="Indian System"
                description="Uses Lakhs (L) and Crores (Cr)"
                examples={['₹1,00,000 = ₹1L', '₹1,00,00,000 = ₹1Cr']}
                selected={settings.numberFormat === 'indian'}
                onClick={() => updateNumberFormat('indian')}
              />
              <FormatOption
                format="western"
                label="Western System"
                description="Uses Thousands (K), Millions (M), Billions (B)"
                examples={['₹100,000 = ₹100K', '₹10,000,000 = ₹10M']}
                selected={settings.numberFormat === 'western'}
                onClick={() => updateNumberFormat('western')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how amounts will be displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PreviewAmount amount={1500} settings={settings} />
            <PreviewAmount amount={85000} settings={settings} />
            <PreviewAmount amount={1250000} settings={settings} />
            <PreviewAmount amount={25000000} settings={settings} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FormatOptionProps {
  format: NumberFormat;
  label: string;
  description: string;
  examples: string[];
  selected: boolean;
  onClick: () => void;
}

function FormatOption({ label, description, examples, selected, onClick }: FormatOptionProps) {
  return (
    <button
      className={`w-full p-4 rounded-lg border text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {examples.map((example, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded bg-muted font-mono"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
        <div
          className={`mt-1 h-4 w-4 rounded-full border-2 ${
            selected
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/30'
          }`}
        >
          {selected && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

interface PreviewAmountProps {
  amount: number;
  settings: {
    currency: Currency;
    numberFormat: NumberFormat;
    exchangeRate: number;
  };
}

function PreviewAmount({ amount, settings }: PreviewAmountProps) {
  const displayAmount = settings.currency === 'USD'
    ? amount / settings.exchangeRate
    : amount;

  const symbol = settings.currency === 'INR' ? '₹' : '$';

  let formatted: string;
  if (settings.currency === 'USD' || settings.numberFormat === 'western') {
    // Western format
    if (displayAmount >= 1_000_000_000) {
      formatted = `${symbol}${(displayAmount / 1_000_000_000).toFixed(1)}B`;
    } else if (displayAmount >= 1_000_000) {
      formatted = `${symbol}${(displayAmount / 1_000_000).toFixed(1)}M`;
    } else if (displayAmount >= 1_000) {
      formatted = `${symbol}${(displayAmount / 1_000).toFixed(1)}K`;
    } else {
      formatted = `${symbol}${displayAmount.toFixed(0)}`;
    }
  } else {
    // Indian format
    if (displayAmount >= 10_000_000) {
      formatted = `${symbol}${(displayAmount / 10_000_000).toFixed(1)} Cr`;
    } else if (displayAmount >= 100_000) {
      formatted = `${symbol}${(displayAmount / 100_000).toFixed(1)} L`;
    } else {
      formatted = symbol + new Intl.NumberFormat('en-IN').format(Math.round(displayAmount));
    }
  }

  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">
        ₹{amount.toLocaleString('en-IN')}
      </p>
      <p className="text-lg font-semibold">{formatted}</p>
    </div>
  );
}
