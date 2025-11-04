import React from 'react';
import { BottomNavigation, NavigationItem } from './BottomNavigation';
import { PageHeader, PageHeaderProps } from './PageHeader';

export interface AppLayoutProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  activeNavigationItem: string;
  onNavigationItemClick: (itemId: string) => void;
  onSettingsClick?: () => void;
  header?: PageHeaderProps;
  showBottomNavigation?: boolean;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  navigationItems,
  activeNavigationItem,
  onNavigationItemClick,
  onSettingsClick,
  header,
  showBottomNavigation = true,
  className,
}) => {
  return (
    <div className={`app-container relative z-10 ${className || ''}`}>
      {/* Заголовок страницы */}
      {header && <PageHeader {...header} onSettingsClick={onSettingsClick} />}
      
      {/* Основной контент */}
      <main className="main-content">
        {children}
      </main>
      
      {/* Нижняя навигация */}
      {showBottomNavigation && (
        <BottomNavigation
          items={navigationItems}
          activeItem={activeNavigationItem}
          onItemClick={onNavigationItemClick}
        />
      )}
    </div>
  );
};
