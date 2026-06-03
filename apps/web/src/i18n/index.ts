// i18next initialization (Alokai-idiomatic i18n)
// Reuses the existing translation JSON files unchanged — they already use
// i18next's native nested-key + {{param}} interpolation format.
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '../sdk/translations/en.json';
import esTranslations from '../sdk/translations/es.json';
import frTranslations from '../sdk/translations/fr.json';
import deTranslations from '../sdk/translations/de.json';
import { DEFAULT_LOCALE } from '../sdk/i18n';

// Read the persisted locale (vsf-locale cookie) so the initial language
// matches what the SDK resolved, keeping the two systems in sync.
const getInitialLng = (): string => {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim().split('='))
    .find(([name]) => name === 'vsf-locale');
  return match ? decodeURIComponent(match[1]) : DEFAULT_LOCALE;
};

i18next.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enTranslations },
    'es-ES': { translation: esTranslations },
    'fr-FR': { translation: frTranslations },
    'de-DE': { translation: deTranslations },
  },
  lng: getInitialLng(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18next;
