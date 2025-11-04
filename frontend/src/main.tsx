import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// Eruda для тестирования (только в development)
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_ERUDA === 'true') {
  // Загружаем Eruda из CDN как рекомендует официальная документация TON
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/eruda';
  script.onload = () => {
    // @ts-ignore - Eruda доступен глобально после загрузки
    window.eruda.init();
    console.log('🔧 Eruda enabled for debugging (CDN)');
  };
  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
