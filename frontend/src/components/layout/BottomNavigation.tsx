import React from 'react';
import { Icon } from '../ui/Icon';
import { useLanguage } from '../../contexts/LanguageContext';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export interface BottomNavigationProps {
  items: NavigationItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  className,
}) => {
  const { t } = useLanguage();

  return (
    <nav className={`bottom-nav ${className || ''}`}>
      <div className="bottom-nav-content">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
          >
            <div className="relative">
              <Icon
                name={item.icon}
                className="nav-icon"
              />
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>
            <span className="nav-label">
              {t(`navigation.${item.id}`)}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};