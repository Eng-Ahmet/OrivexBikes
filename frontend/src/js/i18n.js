import es from './locales/es.js';
import en from './locales/en.js';
import ar from './locales/ar.js';

export const currentLang = {
  code: localStorage.getItem('qq_lang') || 'es' // 'es' | 'en' | 'ar'
};

export const translations = {
  es,
  en,
  ar
};

export function setLanguage(langCode) {
  if (['es', 'en', 'ar'].includes(langCode)) {
    currentLang.code = langCode;
    localStorage.setItem('qq_lang', langCode);
    const isRtl = langCode === 'ar';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', langCode);
  }
}

export function initI18n() {
  const saved = localStorage.getItem('qq_lang') || 'es';
  setLanguage(saved);
}

export function t(key) {
  const lang = currentLang.code || 'es';
  return (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || (translations['es'] && translations['es'][key]) || key;
}
