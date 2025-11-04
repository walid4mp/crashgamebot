import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  isActive: boolean;
  isFullscreen: boolean;
  safeAreaInset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentSafeAreaInset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Проверяем, что мы в Telegram WebApp
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      console.log('Not running in Telegram WebApp, using fallback');
      setIsReady(true);
      return;
    }

    const initWebApp = async () => {
      try {
        // Инициализируем WebApp
        WebApp.ready();
        
        // Настраиваем цвета ПЕРЕД expand
        WebApp.setHeaderColor('#0A0A0A');
        WebApp.setBackgroundColor('#0A0A0A');
        
        // Разворачиваем WebApp на всю высоту
        WebApp.expand();
        
        // Отключаем вертикальные свайпы только для предотвращения закрытия WebApp
        if (WebApp.disableVerticalSwipes) {
          WebApp.disableVerticalSwipes();
        }
        
        // Ждем немного, чтобы Telegram обновил viewport
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Обновляем viewport для корректной высоты после expand
        const updateViewport = () => {
          const vh = WebApp.viewportHeight || window.innerHeight;
          document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
          
          // Принудительно обновляем высоту корневого элемента
          const root = document.getElementById('root');
          if (root) {
            root.style.minHeight = `${vh}px`;
          }
        };
        
        updateViewport();
        
        // Дополнительно обновляем через небольшую задержку
        setTimeout(updateViewport, 300);
        
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    };

    initWebApp().then(() => {
      try {
        // Получаем данные WebApp после инициализации
        const webAppData: TelegramWebApp = {
          initData: WebApp.initData,
          initDataUnsafe: WebApp.initDataUnsafe,
          version: WebApp.version,
          platform: WebApp.platform,
          colorScheme: WebApp.colorScheme,
          themeParams: WebApp.themeParams,
          isExpanded: WebApp.isExpanded,
          viewportHeight: WebApp.viewportHeight,
          viewportStableHeight: WebApp.viewportStableHeight,
          headerColor: WebApp.headerColor,
          backgroundColor: WebApp.backgroundColor,
          isClosingConfirmationEnabled: WebApp.isClosingConfirmationEnabled,
          isVerticalSwipesEnabled: WebApp.isVerticalSwipesEnabled,
          isActive: WebApp.isActive,
          isFullscreen: WebApp.isFullscreen,
          safeAreaInset: WebApp.safeAreaInset,
          contentSafeAreaInset: WebApp.contentSafeAreaInset,
        };
        
        setWebApp(webAppData);
        setIsReady(true);
      } catch (error) {
        console.error('Error getting WebApp data:', error);
        setIsReady(true);
      }
    });
    
    // Обработчики событий (только если WebApp доступен)
    if (window.Telegram?.WebApp) {
      const handleViewportChanged = () => {
        // Обновляем viewport переменную
        const vh = WebApp.viewportHeight || window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
        
        // Обновляем высоту root элемента
        const root = document.getElementById('root');
        if (root) {
          root.style.minHeight = `${vh}px`;
        }
        
        setWebApp(prev => prev ? {
          ...prev,
          viewportHeight: WebApp.viewportHeight,
          viewportStableHeight: WebApp.viewportStableHeight,
        } : null);
      };
      
      const handleThemeChanged = () => {
        setWebApp(prev => prev ? {
          ...prev,
          colorScheme: WebApp.colorScheme,
          themeParams: WebApp.themeParams,
        } : null);
      };
      
      const handleFullscreenChanged = () => {
        setWebApp(prev => prev ? {
          ...prev,
          isFullscreen: WebApp.isFullscreen,
        } : null);
      };
      
      const handleFullscreenFailed = () => {
        // Fullscreen failed
      };
      
      // Подписываемся на события
      WebApp.onEvent('viewportChanged', handleViewportChanged);
      WebApp.onEvent('themeChanged', handleThemeChanged);
      WebApp.onEvent('fullscreenChanged', handleFullscreenChanged);
      WebApp.onEvent('fullscreenFailed', handleFullscreenFailed);
      
      // Очистка при размонтировании
      return () => {
        WebApp.offEvent('viewportChanged', handleViewportChanged);
        WebApp.offEvent('themeChanged', handleThemeChanged);
        WebApp.offEvent('fullscreenChanged', handleFullscreenChanged);
        WebApp.offEvent('fullscreenFailed', handleFullscreenFailed);
      };
    }
  }, []);

  return {
    webApp,
    isReady,
  };
};
