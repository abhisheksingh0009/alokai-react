import React from 'react';
import { useAlokaiI18n } from '../../hooks/useAlokaiI18n';

/**
 * AlokaiLocaleSwitcher - Complete locale and currency switcher
 * Displays all available locales with flags and allows switching
 * Uses vsf-locale cookie pattern for persistence
 */
export const AlokaiLocaleSwitcher: React.FC = () => {
  const { config, locales, setLocale } = useAlokaiI18n();

  const handleLocaleChange = (localeCode: string) => {
    if (localeCode !== config.locale) {
      setLocale(localeCode);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-select" className="text-sm font-medium">
        {config.locale.split('-')[1]}
      </label>
      <select
        id="locale-select"
        value={config.locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm font-medium cursor-pointer"
      >
        {locales.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.flag} {locale.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * AlokaiLocaleButtons - Locale switcher with button layout
 * Shows flags as clickable buttons
 */
export const AlokaiLocaleButtons: React.FC = () => {
  const { config, locales, setLocale } = useAlokaiI18n();

  return (
    <div className="flex gap-1">
      {locales.map((locale) => (
        <button
          key={locale.code}
          onClick={() => setLocale(locale.code)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            config.locale === locale.code
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={locale.label}
        >
          {locale.flag}
        </button>
      ))}
    </div>
  );
};

/**
 * AlokaiLocaleList - Locale switcher with list layout
 * Shows full information about each locale
 */
export const AlokaiLocaleList: React.FC = () => {
  const { config, locales, setLocale } = useAlokaiI18n();

  return (
    <div className="space-y-2">
      {locales.map((locale) => (
        <button
          key={locale.code}
          onClick={() => setLocale(locale.code)}
          className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
            config.locale === locale.code
              ? 'bg-blue-500 text-white'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{locale.flag}</span>
              <div>
                <p className="font-medium">{locale.label}</p>
                <p className="text-xs opacity-75">{locale.currency} • {locale.region}</p>
              </div>
            </div>
            {config.locale === locale.code && (
              <span className="text-sm font-bold">✓</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
