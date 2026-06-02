// This file has been replaced by Alokai's i18n system
// See src/sdk/i18n.ts and src/hooks/useAlokaiI18n.ts

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸", currency: "USD" },
  { code: "es", label: "Español", flag: "🇪🇸", currency: "EUR" },
  { code: "fr", label: "Français", flag: "🇫🇷", currency: "EUR" },
] as const;

export type LocaleCode = typeof SUPPORTED_LOCALES[number]["code"];
export type CurrencyCode = typeof SUPPORTED_LOCALES[number]["currency"];

// Legacy exports for compatibility
export function changeLocale(_code: LocaleCode) {
  console.warn('changeLocale is deprecated. Use useAlokaiI18n().setLocale() instead.');
}

// Export empty object to prevent import errors
export default {};
