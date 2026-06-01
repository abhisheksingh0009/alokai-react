import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, type CurrencyCode } from "../i18n";

// FX rates against the base price currency (USD).
// In a real Alokai stack these come from the middleware (currency-aware product feed).
const FX_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
};

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  USD: "en-US",
  EUR: "es-ES",
};

export function useCurrency() {
  const { i18n } = useTranslation();

  const meta =
    SUPPORTED_LOCALES.find(l => l.code === i18n.language) ?? SUPPORTED_LOCALES[0];
  const currency = meta.currency;
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
