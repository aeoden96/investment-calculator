import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'hr', label: 'HR', flag: '🇭🇷' }
  ];
  
  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`btn btn-sm ${
            i18n.language === lang.code 
              ? 'btn-primary' 
              : 'btn-ghost'
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
}
