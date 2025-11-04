// Environment configuration
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3000'),
  
  // App Configuration  
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  // Telegram Configuration
  telegramBotUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME,
  
  // Development helpers
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // TON Deposit Settings
  ton: {
    minDepositTon: parseFloat(import.meta.env.VITE_MIN_DEPOSIT_TON || '0.1'),
    maxDepositTon: parseFloat(import.meta.env.VITE_MAX_DEPOSIT_TON || '1000')
  }
} as const;

// Type-safe environment checking
export const isValidEnvironment = () => {
  // В development режиме VITE_API_URL опционально (используется proxy)
  if (config.isProduction) {
    const requiredVars = ['VITE_API_URL'] as const;
    
    for (const varName of requiredVars) {
      if (!import.meta.env[varName]) {
        console.warn(`Missing required environment variable for production: ${varName}`);
        return false;
      }
    }
  }
  
  return true;
};

// Log configuration in development
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    apiUrl: config.apiUrl,
    appEnv: config.appEnv,
    telegramBotUsername: config.telegramBotUsername || 'not set',
  });
}
