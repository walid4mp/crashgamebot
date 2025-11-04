import React, { useState } from 'react';
import { useLanguage, SupportedLanguage } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
  className?: string;
}

const languages = [
  { code: 'ru' as SupportedLanguage, name: 'Русский', flag: '🇷🇺' },
  { code: 'en' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
  className = '',
}) => {
  const { language, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setSelectedLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {t('settings.language')}
      </label>
      <select
        value={selectedLanguage}
        onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
