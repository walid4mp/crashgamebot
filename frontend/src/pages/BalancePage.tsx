import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { useTonConnect } from '../contexts/TonConnectContext';
import { NavigationItem } from '../components/layout/BottomNavigation';
import { WalletConnectButton } from '../components/wallet/WalletConnectButton';
import { WalletInfo } from '../components/wallet/WalletInfo';
import { Icon } from '../components/ui/Icon';
import { apiService, BalanceResponse } from '../services/api';
import type { TransactionItem } from '../../../shared/types/api';
import { beginCell } from '@ton/ton';
import { config } from '../config/env';

interface BalancePageProps {
  navigationItems: NavigationItem[];
  onNavigationItemClick: (itemId: string) => void;
  onSettingsClick?: () => void;
}

type DepositTab = 'ton' | 'stars' | 'gifts';

export const BalancePage: React.FC<BalancePageProps> = ({
  navigationItems,
  onNavigationItemClick,
  onSettingsClick
}) => {
  const { t } = useLanguage();
  const { wallet, sendTransaction } = useTonConnect();
  const [activeTab, setActiveTab] = useState<DepositTab>('ton');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  
  // State для баланса и транзакций
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);

  // Загрузка баланса
  useEffect(() => {
    const loadBalance = async () => {
      try {
        setIsLoadingBalance(true);
        const response = await apiService.getBalance();
        if (response.success && response.data) {
          setBalance(response.data);
        }
      } catch (error) {
        console.error('Failed to load balance:', error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadBalance();
  }, []);

  // Загрузка транзакций
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoadingTransactions(true);
        const response = await apiService.getTransactions(50);
        if (response.success && response.data) {
          setTransactions(response.data.transactions);
        }
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, []);

  // Обработчики для депозита
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры и точку
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
      setDepositError(null);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amount) || amount < config.ton.minDepositTon || amount > config.ton.maxDepositTon) {
      setDepositError(`Amount must be between ${config.ton.minDepositTon} and ${config.ton.maxDepositTon} TON`);
      return;
    }
    
    setIsDepositing(true);
    setDepositError(null);
    
    try {
      // 1. Получаем депозитный адрес с комментарием
      const depositResponse = await apiService.getDepositAddress({ amount: depositAmount });
      
      if (!depositResponse.success || !depositResponse.data) {
        throw new Error(depositResponse.error || 'Failed to generate deposit address');
      }
      
      
      // 2. Создаем транзакцию через TON Connect с комментарием
      const body = beginCell()
        .storeUint(0, 32) // указывает что следует текстовый комментарий
        .storeStringTail(depositResponse.data.comment) // записываем наш текстовый комментарий
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // 6 минут
        messages: [
          {
            address: depositResponse.data.depositAddress,
            amount: (parseFloat(depositAmount) * 1000000000).toString(), // Конвертируем в nanoTON
            payload: body.toBoc().toString("base64") // payload с комментарием
          }
        ]
      };
      
      // 3. Отправляем транзакцию
      await sendTransaction(transaction);
      
      console.log('Deposit transaction sent:', {
        transaction,
        comment: depositResponse.data.comment,
        depositAddress: depositResponse.data.depositAddress
      });
      
    } catch (error) {
      console.error('Deposit error:', error);
      
      // Обрабатываем ошибки пользователя дружелюбно
      let userFriendlyMessage = t('pages.balance.connectionError');
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('user rejects') || 
            errorMessage.includes('user declined') || 
            errorMessage.includes('cancelled') ||
            errorMessage.includes('rejected')) {
          userFriendlyMessage = t('pages.balance.transactionCancelled');
        } else if (errorMessage.includes('insufficient funds') || 
                   errorMessage.includes('not enough')) {
          userFriendlyMessage = t('pages.balance.insufficientFunds');
        } else if (errorMessage.includes('network') || 
                   errorMessage.includes('connection')) {
          userFriendlyMessage = t('pages.balance.networkError');
        }
      }
      
      setDepositError(userFriendlyMessage);
    } finally {
      setIsDepositing(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderDepositContent = () => {
    switch (activeTab) {
      case 'ton':
        return (
          <div className="space-y-4">
            {/* Баланс TON */}
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="tonCoin" size="sm" className="text-blue-400" />
                <span className="text-sm text-gray-300">{t('pages.balance.tonBalance')}</span>
              </div>
              {isLoadingBalance ? (
                <div className="text-sm text-gray-400">{t('pages.balance.loadingBalance')}</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    {balance?.tonBalance || '0.00'}
                  </div>
                  <p className="text-xs text-gray-400">TON</p>
                </>
              )}
            </div>

            {/* Информация о кошельке для TON */}
            {wallet && (
              <WalletInfo />
            )}

            {wallet ? (
              <div className="space-y-4">
                {/* Форма ввода суммы */}
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={depositAmount}
                      onChange={handleAmountChange}
                      placeholder={t('pages.balance.enterAmount')}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9A7A] focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      TON
                    </div>
                  </div>
                  
                  {depositError && (
                    <div className="text-red-400 text-sm text-center">
                      {depositError}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleDeposit}
                    disabled={!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) < config.ton.minDepositTon || parseFloat(depositAmount) > config.ton.maxDepositTon || isDepositing}
                    className="w-full btn btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDepositing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('pages.balance.processing')}
                      </>
                    ) : (
                      <>
                        <Icon name="plus" size="sm" />
                        {t('pages.balance.depositTon')}
                      </>
                    )}
                  </button>
                  
                  {/* Блок с минимальной и максимальной суммой под кнопкой */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm mb-2">{t('pages.balance.minAmount')}: {config.ton.minDepositTon} TON</p>
                    <p className="text-gray-400 text-sm">{t('pages.balance.maxAmount')}: {config.ton.maxDepositTon} TON</p>
                  </div>
                  
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Icon name="wallet" size="lg" className="text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-sm mb-4">
                  {t('pages.balance.connectWalletForDeposit')}
                </p>
                <WalletConnectButton />
              </div>
            )}
          </div>
        );
        
      case 'stars':
        return (
          <div className="space-y-4">
            {/* Баланс Stars */}
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm text-gray-300">{t('pages.balance.starsBalance')}</span>
              </div>
              {isLoadingBalance ? (
                <div className="text-sm text-gray-400">{t('pages.balance.loadingBalance')}</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    {balance?.starsBalance || 0}
                  </div>
                  <p className="text-xs text-gray-400">Stars</p>
                </>
              )}
            </div>

            {/* Форма пополнения Stars */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={handleAmountChange}
                    placeholder={t('pages.balance.enterAmount')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9A7A] focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    Stars
                  </div>
                </div>
                
                {depositError && (
                  <div className="text-red-400 text-sm text-center">
                    {depositError}
                  </div>
                )}
                
                <button 
                  onClick={async () => {
                    const amount = parseInt(depositAmount);
                    if (isNaN(amount) || amount < 1) {
                      setDepositError('Введите корректную сумму (минимум 1 Stars)');
                      return;
                    }

                    setIsDepositing(true);
                    setDepositError(null);

                    try {
                      // Создаем invoice через API
                      const response = await apiService.createStarsInvoice(amount);

                      if (!response.success || !response.data) {
                        throw new Error(response.error || 'Failed to create invoice');
                      }

                      // Открываем invoice через Telegram WebApp
                      if (window.Telegram?.WebApp) {
                        (window.Telegram.WebApp as any).openInvoice(response.data.invoiceLink, (status: string) => {
                          if (status === 'paid') {
                            console.log('Payment successful!');
                            // Обновляем баланс
                            apiService.getBalance().then((res) => {
                              if (res.success && res.data) {
                                setBalance(res.data);
                              }
                            });
                            setDepositAmount('');
                          } else if (status === 'cancelled') {
                            setDepositError(t('pages.balance.transactionCancelled'));
                          } else if (status === 'failed') {
                            setDepositError('Ошибка оплаты');
                          }
                          setIsDepositing(false);
                        });
                      } else {
                        throw new Error('Telegram WebApp not available');
                      }
                    } catch (error) {
                      console.error('Stars deposit error:', error);
                      setDepositError(error instanceof Error ? error.message : 'Ошибка создания платежа');
                      setIsDepositing(false);
                    }
                  }}
                  disabled={!depositAmount || isNaN(parseInt(depositAmount)) || parseInt(depositAmount) < 1 || isDepositing}
                  className="w-full btn btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDepositing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('pages.balance.processing')}
                    </>
                  ) : (
                    <>
                      <span>⭐</span>
                      <span className="ml-2">{t('pages.balance.depositStars')}</span>
                    </>
                  )}
                </button>
                
                {/* Минимальная сумма пополнения */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm">{t('pages.balance.minAmount')}: 1 Stars</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'gifts':
        return (
          <div className="space-y-4">
            <div className="text-center py-6">
              <Icon name="gift" size="lg" className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-sm mb-4">
                Пополнение подарками скоро будет доступно
              </p>
              <button 
                disabled 
                className="btn btn-primary opacity-50 cursor-not-allowed"
              >
                <Icon name="gift" size="sm" />
                {t('pages.balance.depositGifts')}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <AppLayout
      navigationItems={navigationItems}
      activeNavigationItem="balance"
      onNavigationItemClick={onNavigationItemClick}
      onSettingsClick={onSettingsClick}
      header={{
        title: t('pages.balance.title'),
      }}
    >
      <div className="container py-2 space-y-6">
        
        {/* Блок пополнения */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {t('pages.balance.deposit')}
          </h2>
          
          {/* Табы */}
          <div className="flex bg-white/5 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('ton')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-md transition-all duration-200 min-w-0 ${
                activeTab === 'ton'
                  ? 'currency-toggle-active'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon name="tonCoin" size="sm" className="flex-shrink-0" />
              <span className="font-medium text-sm truncate">TON</span>
            </button>
            
            <button
              onClick={() => setActiveTab('stars')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-md transition-all duration-200 min-w-0 ${
                activeTab === 'stars'
                  ? 'currency-toggle-active'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="flex-shrink-0">⭐</span>
              <span className="font-medium text-sm truncate">Stars</span>
            </button>
            
            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-md transition-all duration-200 min-w-0 ${
                activeTab === 'gifts'
                  ? 'currency-toggle-active'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon name="gift" size="sm" className="flex-shrink-0" />
              <span className="font-medium text-sm truncate">Gifts</span>
            </button>
          </div>

          {/* Контент выбранного таба */}
          {renderDepositContent()}
        </div>

        {/* Блок истории транзакций */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            {t('pages.balance.transactionHistory')}
          </h3>
          
          {isLoadingTransactions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">
                {t('pages.balance.loadingTransactions')}
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="history" size="lg" className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">
                {t('pages.balance.noTransactions')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={tx.type === 'deposit' ? 'plus' : tx.type === 'withdrawal' ? 'minus' : 'exchange'} 
                        size="sm" 
                        className={tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_bonus' ? 'text-green-400' : 'text-red-400'}
                      />
                      <span className="text-white font-medium">
                        {t(`pages.balance.transactionTypes.${tx.type}`)}
                      </span>
                    </div>
                    <span className={`font-bold ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_bonus' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_bonus' ? '+' : '-'}{tx.amount} {tx.currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(tx.createdAt)}</span>
                    <span className={`px-2 py-1 rounded ${
                      tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      tx.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {t(`pages.balance.transactionStatus.${tx.status}`)}
                    </span>
                  </div>
                  {tx.externalId && (
                    <div className="mt-2 text-xs text-gray-500 truncate">
                      TX: {tx.externalId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};