import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/ui/Icon';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationItem } from '../components/layout/BottomNavigation';
import { apiService, ReferralUser } from '../services/api';
import { useTelegramShare } from '../utils/telegram';

interface EarningsPageProps {
  navigationItems: NavigationItem[];
  onNavigationItemClick: (itemId: string) => void;
  onSettingsClick: () => void;
}

const ITEMS_PER_PAGE = 10;

export const EarningsPage: React.FC<EarningsPageProps> = ({
  navigationItems,
  onNavigationItemClick,
  onSettingsClick,
}) => {
  const { t } = useLanguage();
  const { generateReferralLink, directTelegramShare } = useTelegramShare();
  const [currentPage, setCurrentPage] = useState(1);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Генерируем реферальную ссылку динамически
  const inviteLink = generateReferralLink();

  // Загрузка данных рефералов
  const loadReferrals = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getReferrals(page, ITEMS_PER_PAGE);
      
      if (response.success && response.data) {
        setReferrals(response.data.referrals);
        setTotalReferrals(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || 'Ошибка загрузки данных');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadReferrals(currentPage);
  }, [currentPage]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleInviteFriends = () => {
    // Получаем текст для шеринга на текущем языке
    const shareText = t('earnings.shareText');
    const referralLink = generateReferralLink();
    
    console.log('🎯 Invite friends button clicked');
    console.log('📝 Share data:', { shareText, referralLink });
    
    // ПРЯМОЙ вызов без проверок - должен открыть список контактов
    directTelegramShare(shareText, referralLink);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Вспомогательная функция для отображения имени пользователя
  const getUserDisplayName = (user: ReferralUser): string => {
    if (user.username) {
      return `@${user.username}`;
    }
    if (user.firstname) {
      return user.firstname;
    }
    return 'Пользователь';
  };

  // Вспомогательная функция для получения первой буквы для аватарки
  const getUserInitial = (user: ReferralUser): string => {
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user.firstname) {
      return user.firstname.charAt(0).toUpperCase();
    }
    return 'П';
  };

  // Генерация случайного количества звёзд для заглушки
  const getRandomStars = (): number => {
    return Math.floor(Math.random() * 50) + 5; // От 5 до 54
  };

  return (
    <AppLayout
      navigationItems={navigationItems}
      activeNavigationItem="earnings"
      onNavigationItemClick={onNavigationItemClick}
      onSettingsClick={onSettingsClick}
      header={{
        title: t('navigation.earnings'),
        showBackButton: false,
      }}
    >
      <div className="container py-2 space-y-6">
        {/* Основной блок реферальной системы */}
        <div className="card p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              {t('earnings.inviteTitle')}
            </h2>
          </div>

          {/* Инвайт ссылка */}
          <div className="mb-6">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-transparent text-white text-sm outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 btn btn-primary rounded-lg"
                title={linkCopied ? t('earnings.linkCopied') : t('earnings.copyLink')}
              >
                <Icon name="copy" size="sm" />
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {isLoading ? '...' : totalReferrals}
              </div>
              <div className="text-sm text-gray-300">
                {t('earnings.totalReferrals')}
              </div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-green-400 mb-1 flex items-center justify-center gap-1">
                <Icon name="stars" size="sm" />
                {isLoading ? '...' : '0.0'}
              </div>
              <div className="text-sm text-gray-300">
                {t('earnings.totalEarnings')}
              </div>
            </div>
          </div>

          {/* Кнопка пригласить друзей */}
          <button
            onClick={handleInviteFriends}
            className="w-full btn btn-primary py-3 px-6 flex items-center justify-center gap-2"
          >
            <Icon name="share" size="sm" />
            {t('earnings.inviteFriends')}
          </button>
        </div>

        {/* Блок списка рефералов */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            {t('earnings.referralsList')}
          </h3>

          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              Загрузка...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              {error}
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {t('earnings.noReferrals')}
            </div>
          ) : (
            <>
              {/* Список рефералов */}
              <div className="space-y-3 mb-6">
                {referrals.map((referral, index) => (
                  <div
                    key={`${referral.username || referral.firstname || 'user'}-${index}`}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {getUserInitial(referral)}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {getUserDisplayName(referral)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold flex items-center gap-1">
                        <Icon name="stars" size="sm" />
                        {getRandomStars().toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                  >
                    <Icon name="chevronLeft" size="sm" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={isLoading}
                          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                            page === currentPage
                              ? 'bg-orange-400 text-white'
                              : 'bg-white/10 hover:bg-white/20 text-gray-300'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                  >
                    <Icon name="chevronRight" size="sm" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};