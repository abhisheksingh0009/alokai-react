import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸", currency: "USD" },
  { code: "es", label: "Español", flag: "🇪🇸", currency: "EUR" },
  { code: "fr", label: "Français", flag: "🇫🇷", currency: "EUR" },
] as const;

export type LocaleCode = typeof SUPPORTED_LOCALES[number]["code"];
export type CurrencyCode = typeof SUPPORTED_LOCALES[number]["currency"];

const STORAGE_KEY = "locale";

function getInitialLocale(): LocaleCode {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
    return saved as LocaleCode;
  }
  return "en";
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: getInitialLocale(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export function changeLocale(code: LocaleCode) {
  i18n.changeLanguage(code);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, code);
  }
}

export default i18n;
