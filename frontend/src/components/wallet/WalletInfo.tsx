import React from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { useTonConnect } from '../../contexts/TonConnectContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Icon } from '../ui/Icon';

interface WalletInfoProps {
  className?: string;
}

export const WalletInfo: React.FC<WalletInfoProps> = ({ className = '' }) => {
  const { wallet, disconnectWallet } = useTonConnect();
  const walletAddress = useTonAddress();
  const { t } = useLanguage();

  if (!wallet || !walletAddress) {
    return null;
  }

  // Форматируем user-friendly адрес кошелька для отображения
  const formatAddress = (address: string): string => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Иконка кошелька */}
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <Icon name="wallet" size="sm" className="text-white" />
          </div>
          
          <div className="flex-1">
            <p className="text-gray-200 text-sm font-semibold font-mono">
              {formatAddress(walletAddress)}
            </p>
          </div>
        </div>

        {/* Кнопка отключения */}
        <button
          onClick={disconnectWallet}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
          title={t('pages.balance.disconnectWallet')}
        >
          <Icon name="logout" size="sm" className="text-gray-400" />
        </button>
      </div>

      {/* Информация о кошельке */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {wallet.device.appName}
          </span>
          <span className="text-green-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {t('pages.balance.walletConnected')}
          </span>
        </div>
      </div>
    </div>
  );
};
