import React, { useState, useRef, useEffect } from 'react';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { useLanguage } from '../../contexts/LanguageContext';

export interface UserProfileProps {
  className?: string;
  onSettingsClick?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className, onSettingsClick }) => {
  const { webApp } = useTelegramWebApp();
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Обработка кликов вне dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const user = webApp?.initDataUnsafe?.user;

  if (!user) {
    return null;
  }

  const handleSettingsClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSettingsItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Небольшая задержка для корректной обработки на десктопе
    setTimeout(() => {
      setIsDropdownOpen(false);
      onSettingsClick?.();
    }, 0);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Получаем аватарку из правильного источника
  const getAvatarUrl = () => {
    if (user?.photo_url) {
      // Исправляем экранирование слэшей в URL
      let fixedUrl = user.photo_url;
      
      if (fixedUrl.includes('\\/')) {
        fixedUrl = fixedUrl.replace(/\\\//g, '/');
      } else if (fixedUrl.includes('/') && !fixedUrl.startsWith('http')) {
        if (!fixedUrl.startsWith('https://') && !fixedUrl.startsWith('http://')) {
          fixedUrl = 'https://' + fixedUrl;
        }
      }
      
      return fixedUrl;
    }
    
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div ref={dropdownRef} className={`user-profile ${className || ''}`}>
      <button 
        className={`user-profile-button ${isDropdownOpen ? 'active' : ''}`}
        onClick={handleSettingsClick}
      >
        <div className="user-avatar">
          {avatarUrl && !imageError ? (
            <img 
              src={avatarUrl} 
              alt={`${user.first_name} ${user.last_name || ''}`.trim()}
              className="avatar-image"
              onError={handleImageError}
            />
          ) : (
            <div className="avatar-placeholder">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="avatar-icon"
              >
                <circle cx="12" cy="12" r="12" fill="currentColor"/>
                <path 
                  d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 12C14.2 12 16 13.8 16 16V18H8V16C8 13.8 9.8 12 12 12Z" 
                  fill="white"
                />
              </svg>
              <span className="avatar-initials">
                {user.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="user-name">
          {user.first_name} {user.last_name || ''}
        </div>
        <div className="dropdown-arrow">
          ▼
        </div>
      </button>
      
      {isDropdownOpen && (
        <div className="user-dropdown">
          <button className="dropdown-item" onClick={handleSettingsItemClick}>
            {t('settings.title')}
          </button>
        </div>
      )}
    </div>
  );
};
