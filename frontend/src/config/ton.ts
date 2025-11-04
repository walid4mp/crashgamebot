import { TonNetworkConfig } from '../types/ton';

// TON Network configuration
export const tonConfig: TonNetworkConfig = {
  // TODO: В продакшене изменить на 'mainnet'
  network: 'testnet',
  manifestUrl: `${window.location.origin}/tonconnect-manifest.json`,
  
  // TODO: Заменить на реальный адрес кошелька для приема платежей
  receiverWalletAddress: 'EQD4eA1U1YLBmb9n_lZ2HhL_0Q3c9T_Y3rz_wB9Q3r2Q3r2Q' // Placeholder testnet address
};

// Helper для создания комментария к транзакции
export const createDepositComment = (userChatId: string): string => {
  return `deposit_${userChatId}_${Date.now()}`;
};

// Helper для парсинга комментария
export const parseDepositComment = (comment: string): { userChatId: string; timestamp: number } | null => {
  const match = comment.match(/^deposit_(\d+)_(\d+)$/);
  if (!match) return null;
  
  return {
    userChatId: match[1],
    timestamp: parseInt(match[2])
  };
};

// Минимальная сумма для депозита (в TON)
export const MIN_DEPOSIT_AMOUNT = '0.1';

// Максимальная сумма для депозита (в TON)  
export const MAX_DEPOSIT_AMOUNT = '1000';

export default tonConfig;
