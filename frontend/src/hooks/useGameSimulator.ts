import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PublicBetInfo, CurrencyType, GameRound } from '../../../shared/types/game';
import { GAME_CONFIG } from '../constants/game';

interface GameSimulatorConfig {
  presentationMode?: boolean;
  updateInterval?: number;
  bettingTime?: number;
}

interface UserBet {
  amount: string;
  currency: CurrencyType;
  placedAt: number; // timestamp
}

export const useGameSimulator = (config: GameSimulatorConfig = {}) => {
  const {
    presentationMode = true,
    updateInterval = 300,
    bettingTime = 5
  } = config;

  // Generate initial history for presentation
  const generateInitialHistory = useCallback((): GameRound[] => {
    const history: GameRound[] = [];
    const crashPoints = ['2.45', '1.15', '5.67', '3.21', '1.89', '7.34', '2.11', '4.56'];
    
    for (let i = 0; i < 8; i++) {
      history.push({
        id: `initial_${i}`,
        crashPoint: crashPoints[i] || (1 + Math.random() * 5).toFixed(2),
        serverSeed: `seed_${i}`,
        hashedServerSeed: `hash_${i}`,
        status: 'crashed',
        startTime: new Date(Date.now() - (8 - i) * 60000),
        endTime: new Date(Date.now() - (8 - i) * 60000 + 30000),
        houseFee: '0.01'
      });
    }
    return history;
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    status: 'betting',
    timeUntilNextRound: bettingTime,
    currentMultiplier: '1.00',
    activeBets: [],
    roundHistory: generateInitialHistory()
  });

  const [userBet, setUserBet] = useState<UserBet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [targetCrashPoint, setTargetCrashPoint] = useState<number>(2.0);
  
  const intervalRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<'betting' | 'flying' | 'crashed'>('betting');

  // Generate random crash point (1.00 - 20.00 with realistic distribution)
  const generateCrashPoint = useCallback((): number => {
    const rand = Math.random();
    
    // Weighted distribution for more realistic crashes
    if (rand < 0.3) return 1.00 + Math.random() * 0.5; // 30% chance: 1.00-1.50
    if (rand < 0.6) return 1.50 + Math.random() * 1.0; // 30% chance: 1.50-2.50
    if (rand < 0.85) return 2.50 + Math.random() * 2.5; // 25% chance: 2.50-5.00
    if (rand < 0.95) return 5.00 + Math.random() * 5.0; // 10% chance: 5.00-10.00
    return 10.00 + Math.random() * 10.0; // 5% chance: 10.00-20.00
  }, []);

  // Generate mock players
  const generateMockPlayers = useCallback((): PublicBetInfo[] => {
    const names = [
      'Алексей', 'Marina', 'CryptoKing', 'Дмитрий', 'Anna_K', 'BitcoinBoy',
      'Елена', 'MaxPower', 'Света', 'TonMaster', 'Владимир', 'LuckyGirl',
      'Игорь', 'CoinHunter', 'Наташа', 'RocketMan', 'Сергей', 'MoonLady'
    ];
    
    const playerCount = Math.floor(Math.random() * 8) + 3; // 3-10 players
    const players: PublicBetInfo[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      const currency: CurrencyType = Math.random() > 0.7 ? 'stars' : 'ton';
      const amount = currency === 'ton' 
        ? (0.1 + Math.random() * 2).toFixed(2) // 0.1-2.1 TON
        : Math.floor(10 + Math.random() * 90).toString(); // 10-99 Stars
      
      players.push({
        id: `player_${i}`,
        username: names[Math.floor(Math.random() * names.length)],
        amount,
        currency,
        cashedOut: false
      });
    }
    
    return players;
  }, []);

  // Add players gradually during betting phase
  const [bettingPlayers, setBettingPlayers] = useState<PublicBetInfo[]>([]);
  const [nextPlayerTime, setNextPlayerTime] = useState<number>(0);
  const playerIdCounter = useRef<number>(0);

  // Calculate current multiplier based on time
  const calculateMultiplier = useCallback((elapsedMs: number): number => {
    // Exponential growth: starts slow, accelerates
    const seconds = elapsedMs / 1000;
    return 1 + (Math.pow(1.1, seconds) - 1) * 0.5;
  }, []);

  // Start new round
  const startNewRound = useCallback(() => {
    const newCrashPoint = generateCrashPoint();
    
    setTargetCrashPoint(newCrashPoint);
    setRoundStartTime(Date.now());
    gamePhaseRef.current = 'flying';
    
    setGameState(prev => ({
      ...prev,
      status: 'flying',
      currentMultiplier: '1.00',
      activeBets: bettingPlayers, // Use players who bet during betting phase
      timeUntilNextRound: 0
    }));
  }, [generateCrashPoint, bettingPlayers]);

  // End current round
  const endRound = useCallback((finalMultiplier: string) => {
    gamePhaseRef.current = 'crashed';
    
    setGameState(prev => {
      // Create round history entry
      const newRound: GameRound = {
        id: `round_${Date.now()}`,
        crashPoint: finalMultiplier,
        serverSeed: 'mock_seed',
        hashedServerSeed: 'mock_hash',
        status: 'crashed',
        startTime: new Date(roundStartTime),
        endTime: new Date(),
        houseFee: GAME_CONFIG.HOUSE_FEE
      };


      // Keep existing cashout status - don't modify players who already cashed out or didn't
      const updatedBets = prev.activeBets.map(bet => {
        // If player already cashed out during the round, keep their status
        if (bet.cashedOut) {
          return bet;
        }
        
        // If player didn't cash out, they lose their bet (no changes needed)
        // The UI will show a red X for non-cashed out players after crash
        return bet;
      });

      return {
        ...prev,
        status: 'crashed',
        currentMultiplier: finalMultiplier,
        activeBets: updatedBets,
        roundHistory: [...prev.roundHistory, newRound].slice(-10) // Keep last 10, new at end
      };
    });

    // Reset user bet at end of round
    if (userBet) {
      setUserBet(null);
    }

    // Start betting phase after 3 seconds
    setTimeout(() => {
      gamePhaseRef.current = 'betting';
      setBettingPlayers([]); // Reset betting players for next round
      playerIdCounter.current = 0; // Reset player ID counter
      setNextPlayerTime(Date.now() + 500); // First player in 0.5 seconds
      setGameState(prev => ({
        ...prev,
        status: 'betting',
        timeUntilNextRound: bettingTime,
        activeBets: [],
        currentMultiplier: '1.00'
      }));
    }, 3000);
  }, [roundStartTime, bettingTime, userBet, gameState.activeBets]);

  // Main game loop
  useEffect(() => {
    if (!presentationMode) return;

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      
      setGameState(prev => {
        if (gamePhaseRef.current === 'betting') {
          if (prev.timeUntilNextRound! > 0) {
            // Add players gradually during betting phase
            const timeLeft = prev.timeUntilNextRound! - (updateInterval / 1000);
            
            // Add a new player every 1-2 seconds during betting
            if (now > nextPlayerTime && bettingPlayers.length < 8) {
              const newPlayer = generateMockPlayers()[0]; // Get one random player
              if (newPlayer) {
                newPlayer.id = `betting_player_${playerIdCounter.current++}`;
                setBettingPlayers(prev => [...prev, newPlayer]);
                setNextPlayerTime(now + 1000 + Math.random() * 1000); // Next player in 1-2 seconds
              }
            }
            
            return {
              ...prev,
              timeUntilNextRound: timeLeft,
              activeBets: bettingPlayers // Show betting players during betting phase
            };
          } else {
            // Start flying phase
            setTimeout(startNewRound, 100);
            return prev;
          }
        } 
        
        if (gamePhaseRef.current === 'flying') {
          const elapsed = now - roundStartTime;
          const currentMult = calculateMultiplier(elapsed);
          
          // Check if should crash
          if (currentMult >= targetCrashPoint) {
            setTimeout(() => endRound(targetCrashPoint.toFixed(2)), 100);
            return prev;
          }
          
          // Simulate some players cashing out during flight
          const updatedBets = prev.activeBets.map(bet => {
            // Skip user bet and already cashed out players
            if (bet.id === 'user_bet' || bet.cashedOut) {
              return bet;
            }
            
            // Random chance to cash out at current multiplier
            const shouldCashout = Math.random() < 0.02; // 2% chance per update (~6% per second)
            
            if (shouldCashout && currentMult > 1.2) { // Only cash out after 1.2x
              const profit = (parseFloat(bet.amount) * currentMult).toFixed(2);
              return {
                ...bet,
                cashedOut: true,
                cashoutAt: currentMult.toFixed(2),
                profit
              };
            }
            
            return bet;
          });
          
          return {
            ...prev,
            currentMultiplier: currentMult.toFixed(2),
            activeBets: updatedBets
          };
        }
        
        return prev;
      });
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [presentationMode, updateInterval, startNewRound, endRound, calculateMultiplier, targetCrashPoint, roundStartTime]);

  // Place bet
  const placeBet = useCallback(async (amount: string, currency: CurrencyType): Promise<boolean> => {
    if (gameState.status !== 'betting' || userBet) return false;
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newBet: UserBet = {
      amount,
      currency,
      placedAt: Date.now()
    };
    
    setUserBet(newBet);
    setIsLoading(false);
    
    return true;
  }, [gameState.status, userBet]);

  // Cashout
  const cashout = useCallback(async (): Promise<{ success: boolean; multiplier?: string; profit?: string }> => {
    if (gameState.status !== 'flying' || !userBet) {
      return { success: false };
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentMult = parseFloat(gameState.currentMultiplier);
    const profit = (parseFloat(userBet.amount) * currentMult).toFixed(2);
    
    // Add user to cashed out players
    setGameState(prev => ({
      ...prev,
      activeBets: prev.activeBets.map(bet => 
        bet.id === 'user_bet' 
          ? { 
              ...bet, 
              cashedOut: true, 
              cashoutAt: currentMult.toFixed(2), 
              profit: profit
            }
          : bet
      )
    }));
    
    // Don't remove userBet immediately - keep it until round ends
    // setUserBet(null); // This was causing the user to disappear from the list
    setIsLoading(false);
    
    return {
      success: true,
      multiplier: currentMult.toFixed(2),
      profit
    };
  }, [gameState.status, gameState.currentMultiplier, userBet]);

  // Add user bet to active bets when round starts
  useEffect(() => {
    if (gameState.status === 'flying' && userBet) {
      setGameState(prev => {
        const userInBets = prev.activeBets.find(bet => bet.id === 'user_bet');
        if (!userInBets) {
          const userBetInfo: PublicBetInfo = {
            id: 'user_bet',
            username: 'Вы',
            amount: userBet.amount,
            currency: userBet.currency,
            cashedOut: false
          };
          
          return {
            ...prev,
            activeBets: [userBetInfo, ...prev.activeBets]
          };
        }
        return prev;
      });
    }
  }, [gameState.status, userBet]);

  return {
    gameState,
    userBet,
    isLoading,
    placeBet,
    cashout,
    canBet: gameState.status === 'betting' && !userBet && !isLoading,
    canCashout: gameState.status === 'flying' && userBet && !isLoading && 
                !gameState.activeBets.find(bet => bet.id === 'user_bet')?.cashedOut
  };
};
