import { useAlokaiI18n } from "./useAlokaiI18n";

// FX rates against the base price currency (USD).
// In a real Alokai stack these come from the middleware (currency-aware product feed).
const FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
};

type CurrencyCode = 'USD' | 'EUR';

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  USD: "en-US",
  EUR: "es-ES",
};

export function useCurrency() {
  const { config } = useAlokaiI18n();
  
  const currency = config.currency as CurrencyCode;
  const rate = FX_RATES[currency];

  function format(usdPrice: number): string {
    const converted = usdPrice * rate;
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }

  return { format, currency, rate };
}
