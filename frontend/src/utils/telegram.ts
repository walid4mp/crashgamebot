// Telegram WebApp utilities

/**
 * Получить пользователя из Telegram WebApp
 */
export function getTelegramUser() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe?.user;
  }
  return null;
}

/**
 * Получить реферальную ссылку для пользователя
 */
export function generateReferralLink(botUsername?: string): string {
  const user = getTelegramUser();
  
  // Получаем username бота из конфига, если не передан явно
  const username = botUsername || import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  
  if (!username) {
    console.warn('Bot username not configured. Set VITE_TELEGRAM_BOT_USERNAME environment variable.');
    return 'https://t.me/';
  }
  
  if (!user?.id) {
    return `https://t.me/${username}`;
  }
  
  return `https://t.me/${username}?start=${user.id}`;
}

/**
 * Открыть диалог шеринга в Telegram (ПРАВИЛЬНЫЙ СПОСОБ)
 */
export function shareToTelegram(text: string, url: string): void {
  console.log('🚀 shareToTelegram called with:', { text, url });
  
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    console.log('📱 Telegram WebApp available, version:', webApp.version);
    
    // ПРАВИЛЬНАЯ ссылка для шеринга в Telegram
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    console.log('🔗 Opening Telegram share URL:', shareUrl);
    
    try {
      // Открываем ссылку для шеринга - это откроет список контактов в Telegram
      webApp.openTelegramLink(shareUrl);
    } catch (error) {
      console.error('❌ openTelegramLink failed:', error);
      
      // Fallback - копирование в буфер
      const fullMessage = `${text}\n\n${url}`;
      navigator.clipboard.writeText(fullMessage).then(() => {
        webApp.showAlert('Ссылка скопирована в буфер обмена!\n\nВставьте её в любой чат Telegram.');
      }).catch(() => {
        webApp.showAlert(`Скопируйте эту ссылку:\n\n${fullMessage}`);
      });
    }
  } else {
    console.log('⚠️ Not in Telegram WebApp, using fallback');
    // Fallback для браузера - открываем ссылку шеринга
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  }
}

/**
 * Прямой шеринг в Telegram без проверок (для тестирования)
 */
export function directTelegramShare(text: string, url: string): void {
  console.log('⚡ directTelegramShare called');
  
  // Формируем правильную ссылку для шеринга
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  console.log('🚀 Direct share URL:', shareUrl);
  
  if (window.Telegram?.WebApp?.openTelegramLink) {
    console.log('📱 Using Telegram WebApp openTelegramLink');
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else {
    console.log('🌐 Using window.open fallback');
    window.open(shareUrl, '_blank');
  }
}

/**
 * Простая функция шеринга с использованием Haptic Feedback
 */
export function simpleShare(text: string, url: string): void {
  console.log('🎯 simpleShare called');
  
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    const fullMessage = `${text}\n\n${url}`;
    
    // Haptic feedback для лучшего UX
    try {
      if ((webApp as any).HapticFeedback) {
        (webApp as any).HapticFeedback.impactOccurred('medium');
      }
    } catch (e) {
      console.log('Haptic feedback not available');
    }
    
    // Простой способ - показываем алерт с текстом и копируем в буфер
    navigator.clipboard.writeText(fullMessage).then(() => {
      webApp.showAlert('✅ Ссылка скопирована в буфер обмена!\n\nВставьте её в любой чат Telegram чтобы пригласить друга.');
    }).catch(() => {
      webApp.showAlert(`📋 Скопируйте эту ссылку и отправьте другу:\n\n${fullMessage}`);
    });
  }
}

/**
 * Хук для работы с шерингом
 */
export function useTelegramShare() {
  /**
   * Поделиться реферальной ссылкой (ПРОСТОЙ И НАДЕЖНЫЙ СПОСОБ)
   */
  const shareReferralLink = (shareText: string, botUsername?: string) => {
    const referralLink = generateReferralLink(botUsername);
    console.log('📤 Sharing referral link:', { shareText, referralLink });
    
    // Прямой вызов правильного метода шеринга
    shareToTelegram(shareText, referralLink);
  };

  return {
    shareReferralLink,
    generateReferralLink,
    getTelegramUser,
    simpleShare,
    directTelegramShare
  };
}
