import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationItem } from '../components/layout/BottomNavigation';

interface CasesPageProps {
  navigationItems: NavigationItem[];
  onNavigationItemClick: (itemId: string) => void;
  onSettingsClick?: () => void;
}

export const CasesPage: React.FC<CasesPageProps> = ({ navigationItems, onNavigationItemClick, onSettingsClick }) => {
  const { t } = useLanguage();

  return (
    <AppLayout
      navigationItems={navigationItems}
      activeNavigationItem="cases"
      onNavigationItemClick={onNavigationItemClick}
      onSettingsClick={onSettingsClick}
      header={{
        title: t('pages.cases.title'),
      }}
    >
      <div className="container py-2">
        <div className="card p-8 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">{t('pages.cases.description')}</h2>
          <p className="text-gray-400 text-sm">Скоро здесь будут кейсы с подарками</p>
        </div>
      </div>
    </AppLayout>
  );
};