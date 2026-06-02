// Alokai i18n SDK - Multi-Language & Multi-Currency Support
// Uses vsf-locale cookie pattern and Alokai middleware API
import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';
import frTranslations from './translations/fr.json';
import deTranslations from './translations/de.json';
import alokaiI18nApi from '../services/alokaiI18nApi';
import type { LocaleConfig, I18nConfig } from '../types/i18n';

export type AlokaiLocale = LocaleConfig;

export const ALOKAI_LOCALES: AlokaiLocale[] = [
  { 
    code: 'en-US', 
    label: 'English (US)', 
    flag: '🇺🇸', 
    currency: 'USD', 
    region: 'US' 
  },
  { 
    code: 'es-ES', 
    label: 'Español', 
    flag: '🇪🇸', 
    currency: 'EUR', 
    region: 'ES' 
  },
  { 
    code: 'fr-FR', 
    label: 'Français', 
    flag: '🇫🇷', 
    currency: 'EUR', 
    region: 'FR' 
  },
  { 
    code: 'de-DE', 
    label: 'Deutsch', 
    flag: '🇩🇪', 
    currency: 'EUR', 
    region: 'DE' 
  },
];

export const DEFAULT_LOCALE = 'en-US';

// Local translations fallback
const translations: Record<string, any> = {
  'en-US': enTranslations,
  'es-ES': esTranslations,
  'fr-FR': frTranslations,
  'de-DE': deTranslations,
};

export interface AlokaiI18nConfig extends I18nConfig {}

// Helper to read vsf-locale cookie
const getVsfLocaleCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'vsf-locale') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Helper to set vsf-locale cookie
const setVsfLocaleCookie = (locale: string): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `vsf-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
};

class AlokaiI18n {
  private currentConfig: AlokaiI18nConfig;
  private changeListeners: Array<(config: AlokaiI18nConfig) => void> = [];
  private remoteCurrencies: Record<string, number> = {};

  constructor() {
    this.currentConfig = this.getInitialConfig();
  }

  private getInitialConfig(): AlokaiI18nConfig {
    if (typeof window === 'undefined') {
      const defaultLocale = ALOKAI_LOCALES.find(l => l.code === DEFAULT_LOCALE)!;
      return {
        locale: defaultLocale.code,
        currency: defaultLocale.currency,
        region: defaultLocale.region
      };
    }

    // Try to read vsf-locale cookie first
    const cookieLocale = getVsfLocaleCookie();
    if (cookieLocale) {
      const localeConfig = ALOKAI_LOCALES.find(l => l.code === cookieLocale);
      if (localeConfig) {
        return {
          locale: localeConfig.code,
          currency: localeConfig.currency,
          region: localeConfig.region
        };
      }
    }

    // Fallback to localStorage
    const saved = localStorage.getItem('alokai-i18n-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const locale = ALOKAI_LOCALES.find(l => l.code === parsed.locale);
        if (locale) {
          return {
            locale: locale.code,
            currency: locale.currency,
            region: locale.region
          };
        }
      } catch {}
    }

    const defaultLocale = ALOKAI_LOCALES.find(l => l.code === DEFAULT_LOCALE)!;
    return {
      locale: defaultLocale.code,
      currency: defaultLocale.currency,
      region: defaultLocale.region
    };
  }

  getConfig(): AlokaiI18nConfig {
    return { ...this.currentConfig };
  }

  // Update locale and set vsf-locale cookie
  async setLocale(localeCode: string): Promise<void> {
    const locale = ALOKAI_LOCALES.find(l => l.code === localeCode);
    if (!locale) {
      console.warn(`Locale ${localeCode} not found`);
      return;
    }

    this.currentConfig = {
      locale: locale.code,
      currency: locale.currency,
      region: locale.region
    };

    // Update vsf-locale cookie
    setVsfLocaleCookie(localeCode);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('alokai-i18n-config', JSON.stringify(this.currentConfig));
    }

    // Call remote API to set cookie server-side
    try {
      await alokaiI18nApi.setLocale(localeCode);
    } catch (error) {
      console.warn('Failed to sync locale with server:', error);
    }

    this.notifyListeners();
  }

  // Format price using Intl API and optional API formatting
  formatPrice(amount: number): string {
    const { currency, locale } = this.currentConfig;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Format number without currency
  formatNumber(number: number): string {
    const { locale } = this.currentConfig;
    
    return new Intl.NumberFormat(locale).format(number);
  }

  // Convert price between currencies
  async convertPrice(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await alokaiI18nApi.convertCurrency(amount, fromCurrency, toCurrency);
      return response.data?.convertedAmount || amount;
    } catch (error) {
      console.warn('Failed to convert price:', error);
      return amount;
    }
  }

  // Translation helper with nested object support
  t(key: string, params?: Record<string, any>): string {
    const { locale } = this.currentConfig;
    const localeTranslations = translations[locale as keyof typeof translations] || translations['en-US'];
    
    const keys = key.split('.');
    let value: any = localeTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Interpolate parameters
    if (!params) return value;
    
    return Object.entries(params).reduce((result, [param, paramValue]) => {
      return result.replace(new RegExp(`{{${param}}}`, 'g'), String(paramValue));
    }, value);
  }

  // Listen for configuration changes
  onConfigChange(listener: (config: AlokaiI18nConfig) => void): () => void {
    this.changeListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.changeListeners.forEach(listener => listener(this.currentConfig));
  }

  // Get exchange rates for current currency
  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      const response = await alokaiI18nApi.getCurrencies(this.currentConfig.currency);
      if (response.data?.currencies) {
        const rates: Record<string, number> = {};
        response.data.currencies.forEach((curr: any) => {
          rates[curr.code] = curr.rate;
        });
        this.remoteCurrencies = rates;
        return rates;
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rates:', error);
    }
    return {};
  }
}

export const alokaiI18n = new AlokaiI18n();
