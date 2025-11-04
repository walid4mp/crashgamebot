import { useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TelegramWebAppProvider, useTelegramWebAppContext } from './contexts/TelegramWebAppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TonConnectProvider } from './contexts/TonConnectContext';
import { MarketPage } from './pages/MarketPage';
import { CasesPage } from './pages/CasesPage';
import { CrashPage } from './pages/CrashPage';
import { BalancePage } from './pages/BalancePage';
import { EarningsPage } from './pages/EarningsPage';
import { SettingsPage } from './pages/SettingsPage';
import { getNavigationItems, DEFAULT_NAVIGATION_ITEM, ADDITIONAL_PAGES } from './constants/navigation';
import { useLanguage } from './contexts/LanguageContext';
import { tonConfig } from './config/ton';

function AppContent() {
  const [activePage, setActivePage] = useState(DEFAULT_NAVIGATION_ITEM);
  const { t } = useLanguage();
  const { isReady } = useTelegramWebAppContext();

  const handleNavigationClick = (itemId: string) => {
    setActivePage(itemId);
  };

  const handleSettingsClick = () => {
    setActivePage(ADDITIONAL_PAGES.settings);
  };

  const navigationItems = getNavigationItems(t);

  const renderPage = () => {
    switch (activePage) {
      case 'market':
        return <MarketPage navigationItems={navigationItems} onNavigationItemClick={handleNavigationClick} onSettingsClick={handleSettingsClick} />;
      case 'cases':
        return <CasesPage navigationItems={navigationItems} onNavigationItemClick={handleNavigationClick} onSettingsClick={handleSettingsClick} />;
      case 'crash':
        return <CrashPage navigationItems={navigationItems} onNavigationItemClick={handleNavigationClick} onSettingsClick={handleSettingsClick} />;
      case 'balance':
        return <BalancePage navigationItems={navigationItems} onNavigationItemClick={handleNavigationClick} onSettingsClick={handleSettingsClick} />;
      case 'earnings':
        return <EarningsPage navigationItems={navigationItems} onNavigationItemClick={handleNavigationClick} onSettingsClick={handleSettingsClick} />;
      case ADDITIONAL_PAGES.settings:
        return <SettingsPage navigationItems={navigationItems} onNavigationItemClick={handleNavigationClick} onBackClick={() => setActivePage('crash')} />;
      default:
        return <CrashPage navigationItems={navigationItems} onNavigationItemClick={handleNavigationClick} onSettingsClick={handleSettingsClick} />;
    }
  };

  // Показываем загрузку пока WebApp не готов
  if (!isReady) {
    return (
      <div className="min-h-screen min-h-[100dvh] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] text-white">
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <TelegramWebAppProvider>
      <LanguageProvider>
        <TonConnectUIProvider manifestUrl={tonConfig.manifestUrl}>
          <TonConnectProvider>
            <AppContent />
          </TonConnectProvider>
        </TonConnectUIProvider>
      </LanguageProvider>
    </TelegramWebAppProvider>
  );
}

export default App;
