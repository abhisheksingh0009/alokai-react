import { useState, useEffect, useCallback } from 'react';
import { alokaiI18n, ALOKAI_LOCALES, type AlokaiI18nConfig } from '../sdk/i18n';

export function useAlokaiI18n() {
  const [config, setConfig] = useState<AlokaiI18nConfig>(() => alokaiI18n.getConfig());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = alokaiI18n.onConfigChange(setConfig);
    return unsubscribe;
  }, []);

  const setLocale = useCallback(async (localeCode: string) => {
    setLoading(true);
    try {
      await alokaiI18n.setLocale(localeCode);
    } catch (error) {
      console.error('Failed to set locale:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const convertPrice = useCallback(async (amount: number, fromCurrency: string, toCurrency: string) => {
    try {
      return await alokaiI18n.convertPrice(amount, fromCurrency, toCurrency);
    } catch (error) {
      console.error('Failed to convert price:', error);
      return amount;
    }
  }, []);

  const getExchangeRates = useCallback(async () => {
    try {
      return await alokaiI18n.getExchangeRates();
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return {};
    }
  }, []);

  return {
    config,
    locales: ALOKAI_LOCALES,
    loading,
    setLocale,
    formatPrice: (amount: number) => alokaiI18n.formatPrice(amount),
    formatNumber: (number: number) => alokaiI18n.formatNumber(number),
    convertPrice,
    getExchangeRates,
    t: (key: string, params?: Record<string, any>) => alokaiI18n.t(key, params)
  };
}
