import React from 'react';
import { Icon } from '../ui/Icon';
import { UserProfile } from './UserProfile';
import { useLanguage } from '../../contexts/LanguageContext';

export interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
  showUserProfile?: boolean;
  onSettingsClick?: () => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  rightAction,
  showUserProfile = true,
  onSettingsClick,
  className,
}) => {
  const { t } = useLanguage();
  return (
    <header className={`page-header ${className || ''}`}>
      <div className="page-header-content">
        {showBackButton ? (
          <button
            onClick={onBackClick}
            className="page-title flex items-center gap-2 hover:bg-white/5 transition-colors duration-200"
          >
            <Icon name="arrowLeft" size="sm" />
            <span>{t('common.back')}</span>
          </button>
        ) : (
          <h1 className="page-title">
            {title}
          </h1>
        )}
        {rightAction}
        {showUserProfile && <UserProfile onSettingsClick={onSettingsClick} />}
      </div>
    </header>
  );
};