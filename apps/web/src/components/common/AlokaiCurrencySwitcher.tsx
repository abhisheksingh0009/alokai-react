import React, { useState, useEffect } from 'react';
import { useAlokaiI18n } from '../../hooks/useAlokaiI18n';

/**
 * AlokaiCurrencySwitcher - Currency switching component
 * Allows users to switch to different currencies
 */
export const AlokaiCurrencySwitcher: React.FC = () => {
  const { config, locales, setLocale } = useAlokaiI18n();
  const [uniqueCurrencies, setUniqueCurrencies] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique currencies from available locales
    const currencies = Array.from(new Set(locales.map(l => l.currency)));
    setUniqueCurrencies(currencies);
  }, [locales]);

  const handleCurrencyChange = (selectedCurrency: string) => {
    // Find a locale that has the selected currency and switch to it
    const targetLocale = locales.find(l => l.currency === selectedCurrency);
    if (targetLocale && targetLocale.code !== config.locale) {
      setLocale(targetLocale.code);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="currency-select" className="text-sm font-medium">
        Currency
      </label>
      <select
        id="currency-select"
        value={config.currency}
        onChange={(e) => handleCurrencyChange(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm font-medium cursor-pointer"
      >
        {uniqueCurrencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * AlokaiCurrencyButtons - Currency switcher with button layout
 */
export const AlokaiCurrencyButtons: React.FC = () => {
  const { config, locales, setLocale } = useAlokaiI18n();
  const [uniqueCurrencies, setUniqueCurrencies] = useState<string[]>([]);

  useEffect(() => {
    const currencies = Array.from(new Set(locales.map(l => l.currency)));
    setUniqueCurrencies(currencies);
  }, [locales]);

  const handleCurrencyChange = (selectedCurrency: string) => {
    const targetLocale = locales.find(l => l.currency === selectedCurrency);
    if (targetLocale && targetLocale.code !== config.locale) {
      setLocale(targetLocale.code);
    }
  };

  return (
    <div className="flex gap-1">
      {uniqueCurrencies.map((currency) => (
        <button
          key={currency}
          onClick={() => handleCurrencyChange(currency)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            config.currency === currency
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={`Switch to ${currency}`}
        >
          {currency}
        </button>
      ))}
    </div>
  );
};
