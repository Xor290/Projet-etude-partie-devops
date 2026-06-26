import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frTranslation from './locales/fr.json';
import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frTranslation },
      en: { translation: enTranslation },
      ru: { translation: ruTranslation },
    },
    // French is the default language of the platform
    fallbackLng: 'fr',
    lng: localStorage.getItem('i18nextLng') || 'fr',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
      // If stored language is not one of our 3 supported, ignore it
      lookupLocalStorage: 'i18nextLng',
    },
    // Restrict supported languages to only fr, en, ru
    supportedLngs: ['fr', 'en', 'ru'],
    nonExplicitSupportedLngs: false,
    cleanCode: true,
  });

export default i18n;
