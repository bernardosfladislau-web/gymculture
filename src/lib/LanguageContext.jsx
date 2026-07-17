import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, LANGUAGES } from '@/lib/i18n/translations';
import { extraTranslations } from '@/lib/i18n/extra-translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('app_language') || null);

  useEffect(() => {
    if (lang) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [lang]);

  const changeLanguage = useCallback((code) => {
    setLang(code);
    localStorage.setItem('app_language', code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const resetLanguage = useCallback(() => {
    setLang(null);
    localStorage.removeItem('app_language');
    document.documentElement.lang = '';
    document.documentElement.dir = 'ltr';
  }, []);

  const t = useCallback(
    (key) => extraTranslations[lang]?.[key] || translations[lang]?.[key] || extraTranslations.en?.[key] || translations.en[key] || key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, resetLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}