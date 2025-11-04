import React, { useState } from 'react';
import { CurrencyType, GameStatus } from '../../../../shared/types/game';
import { GAME_CONFIG, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '../../constants/game';
import { useLanguage } from '../../contexts/LanguageContext';

interface BetPanelProps {
  onPlaceBet: (amount: string, currency: CurrencyType) => void;
  onCashout: () => void;
  canBet: boolean;
  canCashout: boolean;
  userBalance: {
    tonBalance: string;
    starsBalance: number;
  };
  currentBet?: {
    amount: string;
    currency: CurrencyType;
  };
  isLoading?: boolean;
  gameStatus?: GameStatus; // Game status for adaptive design
  currentMultiplier?: string; // Current multiplier for profit calculation
  userCashedOut?: boolean; // Whether user has cashed out
  userCashoutData?: { multiplier: string; profit: string }; // User's cashout data
}

export const BetPanel: React.FC<BetPanelProps> = ({
  onPlaceBet,
  onCashout,
  canBet,
  canCashout,
  userBalance,
  currentBet,
  isLoading = false,
  gameStatus = 'betting',
  currentMultiplier = '1.00',
  userCashedOut = false,
  userCashoutData
}) => {
  const { t } = useLanguage();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('ton');
  const [betAmount, setBetAmount] = useState<string>('');

  const minBet = selectedCurrency === 'ton' 
    ? GAME_CONFIG.MIN_BET.TON 
    : GAME_CONFIG.MIN_BET.STARS.toString();

  const maxBet = selectedCurrency === 'ton'
    ? userBalance.tonBalance
    : userBalance.starsBalance.toString();

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point for TON
    if (selectedCurrency === 'ton') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setBetAmount(value);
      }
    } else {
      // Only integers for Stars
      if (value === '' || /^\d+$/.test(value)) {
        setBetAmount(value);
      }
    }
  };

  const handleQuickAmount = (multiplier: number) => {
    const balance = selectedCurrency === 'ton' 
      ? parseFloat(userBalance.tonBalance)
      : userBalance.starsBalance;
    
    const amount = balance * multiplier;
    
    if (selectedCurrency === 'ton') {
      setBetAmount(amount.toFixed(2));
    } else {
      setBetAmount(Math.floor(amount).toString());
    }
  };

  const handlePlaceBet = () => {
    if (!betAmount || isLoading) return;
    
    const amount = parseFloat(betAmount);
    const minAmount = parseFloat(minBet);
    const maxAmount = parseFloat(maxBet);
    
    if (amount < minAmount || amount > maxAmount) return;
    
    onPlaceBet(betAmount, selectedCurrency);
  };

  const isValidAmount = () => {
    if (!betAmount) return false;
    const amount = parseFloat(betAmount);
    const minAmount = parseFloat(minBet);
    const maxAmount = parseFloat(maxBet);
    return amount >= minAmount && amount <= maxAmount;
  };

  // Adaptive design based on game status
  const isBetting = gameStatus === 'betting';

  // Don't render empty panel
  if (!isBetting && !canCashout && !currentBet) {
    return null;
  }

  return (
    <div className={`card space-y-3 ${
      isBetting ? 'p-3' : 'p-4 space-y-4'
    }`}>
      {/* Currency Selection - only during betting and no current bet */}
      {isBetting && !currentBet && (
        <div className="flex space-x-2">
          {(['ton', 'stars'] as CurrencyType[]).map((currency) => (
            <button
              key={currency}
              onClick={() => setSelectedCurrency(currency)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                selectedCurrency === currency
                  ? 'bg-[#FF9A7A] text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {CURRENCY_SYMBOLS[currency]} {CURRENCY_NAMES[currency]}
            </button>
          ))}
        </div>
      )}


      {/* Current Bet Display */}
      {currentBet && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className="text-sm text-telegram-hint mb-1">{t('pages.crash.yourBet')}</div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-telegram-text">
              {CURRENCY_SYMBOLS[currentBet.currency]}
              {currentBet.currency === 'ton' 
                ? parseFloat(currentBet.amount).toFixed(2)
                : parseInt(currentBet.amount)
              }
            </div>
            {(gameStatus === 'flying' || userCashedOut) && (
              <div className="text-lg font-bold text-emerald-400">
                {CURRENCY_SYMBOLS[currentBet.currency]}
                {userCashedOut && userCashoutData ? (
                  // Show fixed profit if user cashed out
                  currentBet.currency === 'ton' 
                    ? parseFloat(userCashoutData.profit).toFixed(2)
                    : Math.floor(parseFloat(userCashoutData.profit))
                ) : (
                  // Show live profit calculation
                  currentBet.currency === 'ton' 
                    ? (parseFloat(currentBet.amount) * parseFloat(currentMultiplier)).toFixed(2)
                    : Math.floor(parseInt(currentBet.amount) * parseFloat(currentMultiplier))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bet Input */}
      {canBet && !currentBet && (
        <div className="space-y-3">
          <div>
                <input
                  type="text"
                  value={betAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder={`${t('pages.crash.minBet')} ${minBet} ${CURRENCY_NAMES[selectedCurrency]}`}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9A7A] focus:border-transparent text-center text-lg font-semibold"
                />
            {/* Compact Balance Display */}
            <div className="text-xs text-telegram-hint font-semibold mt-1">
              {t('pages.crash.balance')}: {selectedCurrency === 'ton' 
                ? `${CURRENCY_SYMBOLS.ton}${parseFloat(userBalance.tonBalance).toFixed(2)}`
                : `${CURRENCY_SYMBOLS.stars}${userBalance.starsBalance}`
              }
            </div>
          </div>

          {/* Quick Amount Buttons - compact during betting */}
          <div className="grid grid-cols-4 gap-2">
            {[0.25, 0.5, 0.75, 1].map((multiplier) => (
                  <button
                    key={multiplier}
                    onClick={() => handleQuickAmount(multiplier)}
                    className={`bg-white/5 border border-white/10 text-gray-400 rounded-lg font-medium hover:text-white hover:bg-white/10 transition-colors ${
                      isBetting ? 'py-1.5 px-2 text-xs' : 'py-2 px-3 text-sm'
                    }`}
                  >
                {multiplier === 1 ? t('pages.crash.maxBet') : `${multiplier * 100}%`}
              </button>
            ))}
          </div>

          {/* Place Bet Button - compact during betting */}
          <button
            onClick={handlePlaceBet}
            disabled={!isValidAmount() || isLoading}
            className={`w-full rounded-lg font-semibold transition-all ${
              isBetting ? 'py-3 text-base' : 'py-4 text-lg'
            } ${
              isValidAmount() && !isLoading
                ? 'btn btn-primary'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? t('pages.crash.placing') : t('pages.crash.placeBet')}
          </button>
        </div>
      )}

      {/* Cashout Button - prominent during game */}
      {canCashout && currentBet && (
        <button
          onClick={onCashout}
          disabled={isLoading}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
            !isLoading
              ? 'btn btn-primary animate-pulse'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? t('pages.crash.cashing') : t('pages.crash.cashout')}
        </button>
      )}

    </div>
  );
};
