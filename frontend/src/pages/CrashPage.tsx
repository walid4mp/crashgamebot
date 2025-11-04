import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationItem } from '../components/layout/BottomNavigation';
import { GameChart } from '../components/game/GameChart';
import { PlayersList } from '../components/game/PlayersList';
import { BetPanel } from '../components/game/BetPanel';
import { useGame } from '../hooks/useGame';
import { CurrencyType } from '../../../shared/types/game';

interface CrashPageProps {
  navigationItems: NavigationItem[];
  onNavigationItemClick: (itemId: string) => void;
  onSettingsClick?: () => void;
}

export const CrashPage: React.FC<CrashPageProps> = ({ 
  navigationItems, 
  onNavigationItemClick, 
  onSettingsClick 
}) => {
  const { t } = useLanguage();
  
  // Use unified game hook - can switch between presentation and production
  const {
    gameState,
    userBet,
    isLoading,
    placeBet,
    cashout,
    canBet,
    canCashout
  } = useGame({
    mode: 'production', // Real WebSocket connection
    updateInterval: 300,
    bettingTime: 5
  });

  const [userBalance] = useState({
    tonBalance: '5.25',
    starsBalance: 150
  });

  const handlePlaceBet = async (amount: string, currency: CurrencyType) => {
    const success = await placeBet(amount, currency);
    if (!success) {
      console.log('Failed to place bet');
    }
  };

  const handleCashout = async () => {
    const result = await cashout();
    if (result.success) {
      console.log(`Cashed out at ${result.multiplier}x for ${result.profit}`);
    }
  };

  // Convert userBet to currentBet format for BetPanel
  const currentBet = userBet ? {
    amount: userBet.amount,
    currency: userBet.currency
  } : undefined;

  // Get user cashout info from activeBets
  const userBetInfo = gameState.activeBets.find(bet => bet.id === 'user_bet');
  const userCashedOut = userBetInfo?.cashedOut || false;
  const userCashoutData = userCashedOut && userBetInfo ? {
    multiplier: userBetInfo.cashoutAt || '1.00',
    profit: userBetInfo.profit || '0'
  } : undefined;

  return (
    <AppLayout
      navigationItems={navigationItems}
      activeNavigationItem="crash"
      onNavigationItemClick={onNavigationItemClick}
      onSettingsClick={onSettingsClick}
      header={{
        title: t('pages.crash.title'),
      }}
    >
      {/* Adaptive layout based on game status */}
      {gameState.status === 'betting' ? (
        // BETTING PHASE: Optimized for placing bets without scrolling
        <div className="h-full flex flex-col">
          <div className="flex-1 px-2 pt-2 pb-4 space-y-3">
            {/* Compact Game Chart */}
            <GameChart
              multiplier={gameState.currentMultiplier}
              status={gameState.status}
              timeUntilNextRound={gameState.timeUntilNextRound}
              roundHistory={gameState.roundHistory}
            />
            
            {/* Prominent Bet Panel */}
            <BetPanel
              onPlaceBet={handlePlaceBet}
              onCashout={handleCashout}
              canBet={canBet}
              canCashout={canCashout || false}
              userBalance={userBalance}
              currentBet={currentBet}
              isLoading={isLoading}
              gameStatus={gameState.status}
              currentMultiplier={gameState.currentMultiplier}
              userCashedOut={userCashedOut}
              userCashoutData={userCashoutData}
            />

            {/* Players List - always show */}
            <PlayersList
              players={gameState.activeBets}
              currentMultiplier={gameState.currentMultiplier}
              currentUserId="user_bet"
              gameStatus={gameState.status}
            />
          </div>
        </div>
      ) : (
        // GAME PHASE: Full layout with players list
        <div className="container py-2 space-y-3">
          <GameChart
            multiplier={gameState.currentMultiplier}
            status={gameState.status}
            timeUntilNextRound={gameState.timeUntilNextRound}
            roundHistory={gameState.roundHistory}
          />
          
          <BetPanel
            onPlaceBet={handlePlaceBet}
            onCashout={handleCashout}
            canBet={canBet}
            canCashout={canCashout || false}
            userBalance={userBalance}
            currentBet={currentBet}
            isLoading={isLoading}
            gameStatus={gameState.status}
            currentMultiplier={gameState.currentMultiplier}
            userCashedOut={userCashedOut}
            userCashoutData={userCashoutData}
          />
          
          <PlayersList
            players={gameState.activeBets}
            currentMultiplier={gameState.currentMultiplier}
            currentUserId="user_bet"
            gameStatus={gameState.status}
          />
        </div>
      )}
    </AppLayout>
  );
};