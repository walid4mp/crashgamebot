// Типы для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        requestFullscreen: () => void;
        exitFullscreen: () => void;
        disableVerticalSwipes?: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons: Array<{
            type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
            id?: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        openTelegramLink: (url: string) => void;
        onEvent: (event: string, handler: () => void) => void;
        offEvent: (event: string, handler: () => void) => void;
        
        // Данные
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
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
      };
    };
  }
}

export {};
