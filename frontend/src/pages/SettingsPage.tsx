import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useLanguage, SupportedLanguage } from '../contexts/LanguageContext';
import { NavigationItem } from '../components/layout/BottomNavigation';

interface SettingsPageProps {
  navigationItems: NavigationItem[];
  onNavigationItemClick: (itemId: string) => void;
  onBackClick?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigationItems, onNavigationItemClick, onBackClick }) => {
  const { t, changeLanguage, language } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language);

  const handleBack = () => {
    // Возвращаемся к предыдущей странице
    onBackClick?.();
  };

  const handleLanguageChange = (language: SupportedLanguage) => {
    setSelectedLanguage(language);
  };

  const handleSave = () => {
    // Применяем выбранный язык
    changeLanguage(selectedLanguage);
    console.log('Settings saved');
  };

  return (
    <AppLayout
      navigationItems={navigationItems}
      activeNavigationItem="settings"
      onNavigationItemClick={onNavigationItemClick}
      onSettingsClick={() => {}}
      header={{
        title: '',
        showBackButton: true,
        onBackClick: handleBack,
      }}
    >
      <div className="container py-2">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {t('settings.title')}
          </h1>
        </div>
        
        <div className="card p-8">
          <LanguageSelector onLanguageChange={handleLanguageChange} />
        </div>

        <button
          onClick={handleSave}
          className="w-full btn btn-primary py-3 px-6 mt-6"
        >
          {t('settings.save')}
        </button>
      </div>
    </AppLayout>
  );
};
