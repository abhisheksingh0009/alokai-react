// Alokai i18n API client
import type { LocaleConfig } from '../types/i18n';

const API_BASE_URL = import.meta.env.VITE_MIDDLEWARE_URL || 'http://localhost:4000';

export const alokaiI18nApi = {
  // Get all supported locales
  async getLocales() {
    const res = await fetch(`${API_BASE_URL}/api/i18n/locales`);
    if (!res.ok) throw new Error('Failed to fetch locales');
    return res.json();
  },

  // Get current locale config from vsf-locale cookie
  async getConfig() {
    const res = await fetch(`${API_BASE_URL}/api/i18n/config`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  },

  // Get currencies with rates
  async getCurrencies(base = 'USD') {
    const res = await fetch(`${API_BASE_URL}/api/i18n/currencies?base=${base}`);
    if (!res.ok) throw new Error('Failed to fetch currencies');
    return res.json();
  },

  // Convert amount between currencies
  async convertCurrency(amount: number, from: string, to: string) {
    const res = await fetch(`${API_BASE_URL}/api/i18n/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, from, to })
    });
    if (!res.ok) throw new Error('Failed to convert currency');
    return res.json();
  },

  // Get translations for specific locale
  async getTranslations(locale: string) {
    const res = await fetch(`${API_BASE_URL}/api/i18n/translations/${locale}`);
    if (!res.ok) throw new Error(`Failed to fetch translations for ${locale}`);
    return res.json();
  },

  // Format price for locale and currency
  async formatPrice(amount: number, locale: string, currency: string) {
    const res = await fetch(`${API_BASE_URL}/api/i18n/format-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, locale, currency })
    });
    if (!res.ok) throw new Error('Failed to format price');
    return res.json();
  },

  // Set vsf-locale cookie
  async setLocale(locale: string) {
    const res = await fetch(`${API_BASE_URL}/api/i18n/set-locale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ locale })
    });
    if (!res.ok) throw new Error('Failed to set locale');
    return res.json();
  }
};

export default alokaiI18nApi;
