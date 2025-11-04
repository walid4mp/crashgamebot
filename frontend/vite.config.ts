import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Полифиллы для Node.js API
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Включаем только необходимые полифиллы
      include: ['buffer', 'process', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'localhost',
      '.devtunnels.ms'
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        // Дополнительные заголовки для прокси при необходимости
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    // Глобальные константы для runtime (опционально)
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000'),
    global: 'globalThis',
  },
  envPrefix: 'VITE_',
  optimizeDeps: {
    include: ['@ton/ton', '@ton/core', '@ton/crypto']
  }
})
