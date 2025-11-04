import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { TonWalletState } from '../types/ton';
import { useLanguage } from './LanguageContext';
import { apiService } from '../services/api';

interface TonConnectContextType extends TonWalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  sendTransaction: (transaction: any) => Promise<any>;
}

const TonConnectContext = createContext<TonConnectContextType | undefined>(undefined);

export const useTonConnect = () => {
  const context = useContext(TonConnectContext);
  if (context === undefined) {
    throw new Error('useTonConnect must be used within a TonConnectProvider');
  }
  return context;
};

interface TonConnectProviderProps {
  children: React.ReactNode;
}

export const TonConnectProvider: React.FC<TonConnectProviderProps> = ({ children }) => {
  const { t } = useLanguage();
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const wallet = useTonWallet();
  const [connectionRestored, setConnectionRestored] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация завершена когда TON Connect UI готов
  useEffect(() => {
    if (tonConnectUI) {
      setConnectionRestored(true);
    }
  }, [tonConnectUI]);

  // Сохраняем адрес кошелька в бэкенде при подключении
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (walletAddress && wallet) {
        try {
          console.log('🔍 Saving user-friendly address:', {
            address: walletAddress,
            isUserFriendly: walletAddress.startsWith('UQ') || walletAddress.startsWith('EQ'),
            length: walletAddress.length
          });
          
          const response = await apiService.connectWallet(walletAddress);
          if (!response.success) {
            setError('Failed to save wallet address');
          }
        } catch (err) {
          console.error('Failed to save wallet address:', err);
          setError('Failed to save wallet address');
        }
      }
    };

    saveWalletAddress();
  }, [walletAddress, wallet]);

  const connectWallet = async () => {
    if (!tonConnectUI) {
      setError('TON Connect UI not initialized');
      return;
    }

    // Проверяем, не подключен ли уже кошелек
    if (wallet) {
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      await tonConnectUI.connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      
      // Проверяем тип ошибки
      const errorMessage = err instanceof Error ? err.message : '';
      
      // Если кошелек уже подключен, это не ошибка
      if (errorMessage.includes('WalletAlreadyConnectedError') ||
          errorMessage.includes('wallet already connected')) {
        return;
      }
      
      // Если пользователь отменил подключение, не показываем ошибку
      if (errorMessage.includes('Wallet was not connected') || 
          errorMessage.includes('User declined') ||
          errorMessage.includes('cancelled') ||
          errorMessage.includes('rejected')) {
        return;
      }
      
      // Для других ошибок показываем локализованное сообщение
      setError(t('pages.balance.connectionError'));
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!tonConnectUI) {
      setError('TON Connect UI not initialized');
      return;
    }

    try {
      // Сначала отключаем в бэкенде
      console.log('🔌 Disconnecting wallet from backend...');
      const response = await apiService.disconnectWallet();
      if (response.success) {
        console.log('✅ Wallet disconnected from backend');
      } else {
        console.error('❌ Failed to disconnect wallet from backend:', response.error);
        setError('Failed to disconnect wallet from backend');
        return;
      }

      // Затем отключаем в TON Connect
      await tonConnectUI.disconnect();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  };

  const sendTransaction = async (transaction: any) => {
    if (!tonConnectUI) {
      throw new Error('TON Connect UI not initialized');
    }

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await tonConnectUI.sendTransaction(transaction);
      return result;
    } catch (err) {
      console.error('Failed to send transaction:', err);
      throw err;
    }
  };

  const value: TonConnectContextType = {
    wallet,
    connectionRestored,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    sendTransaction
  };

  return (
    <TonConnectContext.Provider value={value}>
      {children}
    </TonConnectContext.Provider>
  );
};
