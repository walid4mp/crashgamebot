// API service for backend communication
import { config } from '../config/env';
import type { DepositRequest, DepositResponse } from '../../../shared/types/deposit';
import type { 
  BalanceResponse, 
  TransactionHistoryResponse,
  StarsDepositResponse
} from '../../../shared/types/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ReferralUser {
  username?: string;
  firstname?: string;
}

interface ReferralsResponse {
  referrals: ReferralUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Wallet API types
interface ConnectWalletRequest {
  walletAddress: string;
}

interface ConnectWalletResponse {
  walletAddress: string;
  connectedAt: string;
}

interface WalletStatusResponse {
  isConnected: boolean;
  walletAddress?: string;
  connectedAt?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    // URL бэкенда из конфигурации
    this.baseURL = config.apiUrl;
  }

  /**
   * Получить initData для аутентификации
   */
  private getInitData(): string {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp.initData || '';
    }
    return '';
  }

  /**
   * Выполнить API запрос
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const initData = this.getInitData();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Получить список рефералов с пагинацией
   */
  async getReferrals(page: number = 1, limit: number = 10): Promise<ApiResponse<ReferralsResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.request<ReferralsResponse>(`/api/referrals?${params}`);
  }

  /**
   * Подключить TON кошелек
   */
  async connectWallet(walletAddress: string): Promise<ApiResponse<ConnectWalletResponse>> {
    return this.request<ConnectWalletResponse>('/api/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress })
    });
  }

  /**
   * Отключить TON кошелек
   */
  async disconnectWallet(): Promise<ApiResponse> {
    return this.request('/api/wallet/disconnect', {
      method: 'POST'
    });
  }

  /**
   * Получить статус кошелька
   */
  async getWalletStatus(): Promise<ApiResponse<WalletStatusResponse>> {
    return this.request<WalletStatusResponse>('/api/wallet/status');
  }

  /**
   * Получить депозитный адрес с уникальным комментарием
   */
  async getDepositAddress(request: DepositRequest): Promise<ApiResponse<DepositResponse>> {
    return this.request<DepositResponse>('/api/deposit/get', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Получить баланс пользователя
   */
  async getBalance(): Promise<ApiResponse<BalanceResponse>> {
    return this.request<BalanceResponse>('/api/wallet/balance');
  }

  /**
   * Получить историю транзакций пользователя
   */
  async getTransactions(limit: number = 50, offset: number = 0): Promise<ApiResponse<TransactionHistoryResponse>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request<TransactionHistoryResponse>(`/api/wallet/transactions?${params}`);
  }

  /**
   * Создать Stars invoice для пополнения
   */
  async createStarsInvoice(amount: number): Promise<ApiResponse<StarsDepositResponse>> {
    return this.request<StarsDepositResponse>('/api/deposit/stars', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

}

// Экспортируем единственный экземпляр
export const apiService = new ApiService();
export type { 
  ReferralUser, 
  ReferralsResponse,
  ConnectWalletRequest,
  ConnectWalletResponse,
  WalletStatusResponse,
  DepositRequest,
  DepositResponse,
  BalanceResponse,
  TransactionHistoryResponse
};
