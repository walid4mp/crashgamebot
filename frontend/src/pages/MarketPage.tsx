import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationItem } from '../components/layout/BottomNavigation';

interface MarketPageProps {
  navigationItems: NavigationItem[];
  onNavigationItemClick: (itemId: string) => void;
  onSettingsClick?: () => void;
}

export const MarketPage: React.FC<MarketPageProps> = ({ navigationItems, onNavigationItemClick, onSettingsClick }) => {
  const { t } = useLanguage();

  return (
    <AppLayout
      navigationItems={navigationItems}
      activeNavigationItem="market"
      onNavigationItemClick={onNavigationItemClick}
      onSettingsClick={onSettingsClick}
      header={{
        title: t('pages.market.title'),
      }}
    >
      <div className="container py-2">
        <div className="card p-8 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">{t('pages.market.description')}</h2>
          <p className="text-gray-400 text-sm">Скоро здесь будет магазин подарков</p>
        </div>
      </div>
    </AppLayout>
  );
};