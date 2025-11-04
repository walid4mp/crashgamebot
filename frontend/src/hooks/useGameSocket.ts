import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, CurrencyType } from '../../../shared/types/game';
import { ServerToClientEvents, ClientToServerEvents } from '../../../shared/types/socket';

interface UseGameSocketConfig {
  serverUrl?: string;
  autoConnect?: boolean;
}

interface UserBet {
  betId: string;
  amount: string;
  currency: CurrencyType;
  placedAt: number;
}

export const useGameSocket = (config: UseGameSocketConfig = {}) => {
  const {
    serverUrl = 'ws://localhost:3000',
    autoConnect = true
  } = config;

  const [gameState, setGameState] = useState<GameState>({
    status: 'betting',
    timeUntilNextRound: 10,
    currentMultiplier: '1.00',
    activeBets: [],
    roundHistory: []
  });

  const [userBet, setUserBet] = useState<UserBet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartTimeRef = useRef<number>(0);
  const bettingPhaseDurationRef = useRef<number>(10000);

  // Start countdown timer for betting phase
  const startCountdown = useCallback((durationMs: number, serverTime: number) => {
    // Clear existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    roundStartTimeRef.current = serverTime;
    bettingPhaseDurationRef.current = durationMs;

    // Update countdown every 100ms for smooth animation
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - roundStartTimeRef.current;
      const remaining = Math.max(0, durationMs - elapsed);
      const timeInSeconds = remaining / 1000;

      setGameState(prev => ({
        ...prev,
        timeUntilNextRound: timeInSeconds
      }));

      // Stop countdown when time is up
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 100);
  }, []);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const initData = window.Telegram?.WebApp?.initData || '';

    socketRef.current = io(`${serverUrl}/game`, {
      auth: {
        initData
      },
      transports: ['websocket']
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);

      // Connect to game
      socket.emit('game:connect');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('error', (errorMessage: string) => {
      setError(errorMessage);
    });

    // Game events
    socket.on('game:round_info', (data) => {
      // When client connects, sync with current round state
      const now = Date.now();
      const timeUntilCrash = Math.max(0, data.crashTime - now);
      const timeUntilFlying = Math.max(0, data.bettingPhaseDuration - (now - data.serverTime));

      // If still in betting phase
      if (timeUntilFlying > 0) {
        startCountdown(timeUntilFlying, now);
        setGameState(prev => ({
          ...prev,
          status: 'betting',
          currentMultiplier: '1.00',
          timeUntilNextRound: timeUntilFlying / 1000
        }));
      } else if (timeUntilCrash > 0) {
        // Already in flying phase
        setGameState(prev => ({
          ...prev,
          status: 'flying',
          currentMultiplier: '1.00'
        }));
      }
    });

    socket.on('game:round_start', (data) => {
      // Start countdown for betting phase
      startCountdown(data.bettingPhaseDuration, data.serverTime);

      setGameState(prev => ({
        ...prev,
        status: 'betting',
        currentMultiplier: '1.00',
        timeUntilNextRound: data.bettingPhaseDuration / 1000
      }));
    });

    socket.on('game:multiplier_update', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'flying',
        currentMultiplier: data.multiplier.toFixed(2)
      }));
    });

    socket.on('game:round_crashed', (data) => {
      // Stop countdown when round crashes
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      setGameState(prev => ({
        ...prev,
        status: 'crashed',
        currentMultiplier: data.crashMultiplier.toFixed(2)
      }));
    });

    socket.on('game:round_results', (_data) => {
      // Stop countdown after round results
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      setGameState(prev => ({
        ...prev,
        status: 'betting',
        currentMultiplier: '1.00',
        timeUntilNextRound: 10 // Will be updated by next game:round_start
      }));
    });

    socket.on('game:bet_placed', (data) => {
      setIsLoading(false);
      setUserBet({
        betId: data.betId,
        amount: data.amount.toString(),
        currency: data.currency as CurrencyType,
        placedAt: Date.now()
      });
    });

    // User-specific events
    socket.on('game:cashout_success', (_result) => {
      setIsLoading(false);
      setUserBet(null);
    });

    socket.on('game:error', (error) => {
      setIsLoading(false);
      setError(error.message || 'An error occurred');
    });

  }, [serverUrl, startCountdown]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Place bet
  const placeBet = useCallback(async (amount: string, currency: CurrencyType): Promise<boolean> => {
    if (!socketRef.current?.connected || gameState.status !== 'betting' || userBet) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      socketRef.current.emit('game:place_bet', {
        amount: parseFloat(amount),
        currency
      });

      return true;
    } catch (err) {
      setIsLoading(false);
      setError('Failed to place bet');
      return false;
    }
  }, [gameState.status, userBet]);

  // Cashout
  const cashout = useCallback(async (): Promise<{ success: boolean; multiplier?: string; profit?: string }> => {
    if (!socketRef.current?.connected || gameState.status !== 'flying' || !userBet) {
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      // ✅ БЕЗОПАСНОСТЬ: Отправляем только betId
      // Сервер использует СВОЙ мультипликатор из gameLoopService
      socketRef.current.emit('game:cashout', {
        betId: userBet.betId
      });

      return { success: true };
    } catch (err) {
      setIsLoading(false);
      setError('Failed to cashout');
      return { success: false };
    }
  }, [gameState.status, userBet, socketRef]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
      // Cleanup countdown interval on unmount
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [autoConnect, connect, disconnect]);

  return {
    gameState,
    userBet,
    isLoading,
    isConnected,
    error,
    placeBet,
    cashout,
    connect,
    disconnect,
    canBet: gameState.status === 'betting' && !userBet && !isLoading && isConnected,
    canCashout: gameState.status === 'flying' && userBet && !isLoading && isConnected
  };
};
