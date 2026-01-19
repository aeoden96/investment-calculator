import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hr from './locales/hr.json';

// Detect language from localStorage or browser
const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem('budgetCalculator_language');
  if (stored) return stored;
  
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'hr'].includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hr: { translation: hr }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('budgetCalculator_language', lng);
  }
});

export default i18n;
