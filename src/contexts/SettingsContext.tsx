import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Currency = 'INR' | 'USD';
export type NumberFormat = 'indian' | 'western';

export interface Settings {
  currency: Currency;
  numberFormat: NumberFormat;
  exchangeRate: number;
  lastExchangeUpdate: string;
}

interface SettingsContextType {
  settings: Settings;
  updateCurrency: (currency: Currency) => void;
  updateNumberFormat: (format: NumberFormat) => void;
  refreshExchangeRate: () => Promise<void>;
}

const STORAGE_KEY = 'mapfin-settings';
const EXCHANGE_RATE_CACHE_KEY = 'mapfin-exchange-rate';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const defaultSettings: Settings = {
  currency: 'INR',
  numberFormat: 'indian',
  exchangeRate: 83.5,
  lastExchangeUpdate: new Date().toISOString(),
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

interface ExchangeRateCache {
  rate: number;
  timestamp: string;
}

function loadCachedExchangeRate(): ExchangeRateCache | null {
  try {
    const stored = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load cached exchange rate:', e);
  }
  return null;
}

function saveCachedExchangeRate(rate: number): void {
  try {
    const cache: ExchangeRateCache = {
      rate,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to cache exchange rate:', e);
  }
}

async function fetchExchangeRate(): Promise<number> {
  try {
    // Try primary API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = await response.json();
      return data.rates?.INR || defaultSettings.exchangeRate;
    }
  } catch (e) {
    console.warn('Primary exchange rate API failed:', e);
  }

  try {
    // Try backup API
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (response.ok) {
      const data = await response.json();
      return data.rates?.INR || defaultSettings.exchangeRate;
    }
  } catch (e) {
    console.warn('Backup exchange rate API failed:', e);
  }

  return defaultSettings.exchangeRate;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateCurrency = (currency: Currency) => {
    setSettings((prev) => {
      const newSettings = { ...prev, currency };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const updateNumberFormat = (numberFormat: NumberFormat) => {
    setSettings((prev) => {
      const newSettings = { ...prev, numberFormat };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const refreshExchangeRate = async () => {
    const rate = await fetchExchangeRate();
    const timestamp = new Date().toISOString();
    saveCachedExchangeRate(rate);
    setSettings((prev) => {
      const newSettings = { ...prev, exchangeRate: rate, lastExchangeUpdate: timestamp };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  // Load exchange rate on mount
  useEffect(() => {
    const initExchangeRate = async () => {
      const cached = loadCachedExchangeRate();

      if (cached) {
        const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
        if (cacheAge < CACHE_DURATION) {
          // Use cached rate
          setSettings((prev) => ({
            ...prev,
            exchangeRate: cached.rate,
            lastExchangeUpdate: cached.timestamp,
          }));
          return;
        }
      }

      // Fetch fresh rate
      await refreshExchangeRate();
    };

    initExchangeRate();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateCurrency, updateNumberFormat, refreshExchangeRate }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

/**
 * Hook that provides format options from current settings
 * Use this to pass to formatCurrency and other formatter functions
 */
export function useFormatOptions() {
  const { settings } = useSettings();
  return {
    currency: settings.currency,
    numberFormat: settings.numberFormat,
    exchangeRate: settings.exchangeRate,
  };
}
