import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import type { SupportedLanguage } from './i18n.constants';

import { apiBaseUrl } from '../lib/api-base-url';
import { DEFAULT_LANGUAGE, I18N_NAMESPACE, LOCALE_MAPPING, SUPPORTED_LANGUAGES } from './i18n.constants';

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: [I18N_NAMESPACE],
    defaultNS: I18N_NAMESPACE,

    backend: {
      loadPath: `${apiBaseUrl()}/api/i18n/translations?lng={{lng}}`,
      requestOptions: import.meta.env.DEV ? { cache: 'no-cache' } : { cache: 'default' },
    },

    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: false,
    load: 'currentOnly',
    fallbackLng: DEFAULT_LANGUAGE,

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
      convertDetectedLanguage: (lng: string): SupportedLanguage => {
        const prefix = lng.toLowerCase().slice(0, 2);
        return LOCALE_MAPPING[prefix] ?? DEFAULT_LANGUAGE;
      },
    },

    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    if (import.meta.env.DEV) {
      console.group('[i18n] initialized');
      console.log('language:', i18n.language);
      console.log('bundle loaded:', i18n.hasResourceBundle(i18n.language, I18N_NAMESPACE));
      console.groupEnd();
    }
  })
  .catch((err: unknown) => {
    console.error('[i18n] initialization failed:', err);
  });

export default i18n;
