import React, { createContext, useContext } from 'react';
import { useAlokaiI18n } from '../hooks/useAlokaiI18n';
import type { AlokaiI18nConfig } from '../sdk/i18n';

interface AlokaiI18nContextType {
  config: AlokaiI18nConfig;
  locales: Array<{ code: string; label: string; flag: string; currency: string; region: string }>;
  loading: boolean;
  setLocale: (locale: string) => Promise<void>;
  formatPrice: (amount: number) => string;
  formatNumber: (number: number) => string;
  convertPrice: (amount: number, from: string, to: string) => Promise<number>;
  getExchangeRates: () => Promise<Record<string, number>>;
  t: (key: string, params?: Record<string, any>) => string;
}

const AlokaiI18nContext = createContext<AlokaiI18nContextType | undefined>(undefined);

export const AlokaiI18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const i18n = useAlokaiI18n();

  return (
    <AlokaiI18nContext.Provider value={i18n}>
      {children}
    </AlokaiI18nContext.Provider>
  );
};

export const useAlokaiI18nContext = (): AlokaiI18nContextType => {
  const context = useContext(AlokaiI18nContext);
  if (!context) {
    throw new Error('useAlokaiI18nContext must be used within AlokaiI18nProvider');
  }
  return context;
};
