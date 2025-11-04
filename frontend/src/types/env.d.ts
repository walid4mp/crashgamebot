/// <reference types="vite/client" />

// Environment variables types for Vite
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: 'development' | 'production' | 'staging';
  readonly VITE_TELEGRAM_BOT_USERNAME?: string;
  readonly VITE_ENABLE_ERUDA?: string; // 'true' для включения Eruda
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
