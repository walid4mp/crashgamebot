import React from 'react';
import { PublicBetInfo, CurrencyType, GameStatus } from '../../../../shared/types/game';
import { CURRENCY_SYMBOLS } from '../../constants/game';
import { useLanguage } from '../../contexts/LanguageContext';

interface PlayersListProps {
  players: PublicBetInfo[];
  currentMultiplier: string;
  currentUserId?: string;
  gameStatus: GameStatus;
}

const generateAvatar = (username: string): string => {
  const firstLetter = username.charAt(0).toUpperCase();
  return firstLetter;
};

const formatAmount = (amount: string, currency: CurrencyType): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'stars') {
    return `${symbol}${parseInt(amount)}`;
  }
  return `${symbol}${parseFloat(amount).toFixed(2)}`;
};

const calculatePotentialProfit = (amount: string, multiplier: string): string => {
  const bet = parseFloat(amount);
  const mult = parseFloat(multiplier);
  return (bet * mult).toFixed(2);
};

export const PlayersList: React.FC<PlayersListProps> = ({ 
  players, 
  currentMultiplier,
  currentUserId,
  gameStatus
}) => {
  const { t } = useLanguage();
  if (players.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-telegram-text mb-3">
          {t('pages.crash.players')} ({players.length})
        </h3>
        <div className="text-center text-telegram-hint py-8">
          {t('pages.crash.noPlayers')}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-telegram-text mb-3">
        {t('pages.crash.players')} ({players.length})
      </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {players.map((player) => {
          const isCurrentUser = player.id === currentUserId;
          const potentialProfit = !player.cashedOut 
            ? calculatePotentialProfit(player.amount, currentMultiplier)
            : undefined;
          
          return (
            <div
              key={player.id}
                 className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                   isCurrentUser 
                     ? 'bg-[#FF9A7A] bg-opacity-20 border border-[#FF9A7A] border-opacity-30' 
                     : 'bg-white/5 border border-white/10'
                 }`}
            >
              {/* Player info */}
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isCurrentUser 
                    ? 'bg-[#FF9A7A] text-white' 
                    : 'bg-white/20 text-white'
                }`}>
                  {generateAvatar(player.username)}
                </div>
                
                {/* Username and bet */}
                <div>
                    <div className={`font-medium ${
                      isCurrentUser ? 'text-[#FF9A7A]' : 'text-white'
                    }`}>
                    {player.username}
                    {isCurrentUser && ` (${t('pages.crash.you')})`}
                  </div>
                  <div className="text-sm text-telegram-hint">
                    {formatAmount(player.amount, player.currency)}
                  </div>
                </div>
              </div>

              {/* Status and profit */}
              <div className="text-right">
                {player.cashedOut ? (
                  <div>
                    <div className="text-emerald-400 font-semibold">
                      ✓ {player.cashoutAt || currentMultiplier}x
                    </div>
                    <div className="text-sm text-emerald-400">
                      +{formatAmount(player.profit || potentialProfit || '0', player.currency)}
                    </div>
                  </div>
                ) : gameStatus === 'crashed' ? (
                  <div>
                    <div className="text-red-500 font-semibold">
                      ✗ {currentMultiplier}x
                    </div>
                    <div className="text-sm text-red-500">
                      -{formatAmount(player.amount, player.currency)}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-telegram-text font-semibold">
                      {currentMultiplier}x
                    </div>
                    <div className="text-sm text-telegram-hint">
                      {formatAmount(potentialProfit || '0', player.currency)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
