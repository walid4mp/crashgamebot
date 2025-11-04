import React from 'react';
import { useTonConnect } from '../../contexts/TonConnectContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Icon } from '../ui/Icon';

interface WalletConnectButtonProps {
  className?: string;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ className = '' }) => {
  const { wallet, isConnecting, connectWallet, error } = useTonConnect();
  const { t } = useLanguage();

  // Если кошелек уже подключен, не показываем кнопку
  if (wallet) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full btn btn-primary py-4 px-6 flex items-center justify-center gap-3"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{t('common.loading')}</span>
          </>
        ) : (
          <>
            <Icon name="wallet" size="sm" />
            <span>{t('pages.balance.connectWallet')}</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          {t('pages.balance.walletNotConnected')}
        </p>
      </div>
    </div>
  );
};
