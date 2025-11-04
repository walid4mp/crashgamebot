import { useGameSimulator } from './useGameSimulator';
import { useGameSocket } from './useGameSocket';

interface UseGameConfig {
  mode: 'presentation' | 'production';
  serverUrl?: string;
  updateInterval?: number;
  bettingTime?: number;
}

/**
 * Unified hook for game logic that can switch between presentation and production modes
 * This allows for easy switching between mock data and real WebSocket connection
 */
export const useGame = (config: UseGameConfig) => {
  const { mode, ...otherConfig } = config;

  if (mode === 'presentation') {
    const result = useGameSimulator({
      presentationMode: true,
      updateInterval: otherConfig.updateInterval || 300,
      bettingTime: otherConfig.bettingTime || 10
    });
    
    return {
      ...result,
      isConnected: true,
      error: null,
      connect: () => {},
      disconnect: () => {}
    };
  }

  return useGameSocket({
    serverUrl: otherConfig.serverUrl || 'ws://localhost:3000',
    autoConnect: true
  });
};
