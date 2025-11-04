import React, { createContext, useContext, ReactNode } from 'react';
import { useTelegramWebApp, TelegramWebApp } from '../hooks/useTelegramWebApp';

interface TelegramWebAppContextType {
  webApp: TelegramWebApp | null;
  isReady: boolean;
}

const TelegramWebAppContext = createContext<TelegramWebAppContextType | undefined>(undefined);

export const useTelegramWebAppContext = () => {
  const context = useContext(TelegramWebAppContext);
  if (context === undefined) {
    throw new Error('useTelegramWebAppContext must be used within a TelegramWebAppProvider');
  }
  return context;
};

interface TelegramWebAppProviderProps {
  children: ReactNode;
}

export const TelegramWebAppProvider: React.FC<TelegramWebAppProviderProps> = ({ children }) => {
  const telegramWebApp = useTelegramWebApp();

  return (
    <TelegramWebAppContext.Provider value={telegramWebApp}>
      {children}
    </TelegramWebAppContext.Provider>
  );
};
