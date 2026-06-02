// i18n type definitions
export interface LocaleConfig {
  code: string;
  label: string;
  flag: string;
  currency: string;
  region: string;
}

export interface CurrencyRate {
  code: string;
  rate: number;
  lastUpdated: string;
}

export interface I18nConfig {
  locale: string;
  currency: string;
  region: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConvertCurrencyResponse {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: string;
}

export interface FormatPriceResponse {
  amount: number;
  formatted: string;
  locale: string;
  currency: string;
}

export interface CurrenciesResponse {
  base: string;
  currencies: CurrencyRate[];
}

export interface TranslationsResponse {
  locale: string;
  translations: Record<string, any>;
}
