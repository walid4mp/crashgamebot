// TON Connect types
import { Wallet, WalletInfo } from '@tonconnect/ui-react';

export interface TonWalletState {
  wallet: Wallet | null;
  connectionRestored: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface TonBalance {
  ton: string; // Decimal as string for precision
  lastUpdated: Date;
}

export interface TonTransaction {
  hash: string;
  amount: string;
  comment?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface DepositRequest {
  amount: string;
  userChatId: string;
  comment: string;
}

export interface WithdrawRequest {
  amount: string;
  toAddress: string;
  comment?: string;
}

// TON Network configuration
export interface TonNetworkConfig {
  network: 'testnet' | 'mainnet';
  manifestUrl: string;
  receiverWalletAddress: string; // Наш кошелек для приема платежей
}
