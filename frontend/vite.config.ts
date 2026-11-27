import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/api': {
        target: loadEnv(mode, process.cwd(), 'API_').API_URL,
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../coverage/frontend',
      reporter: ['text', 'html', 'json-summary'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@common': fileURLToPath(new URL('./src/common', import.meta.url)),
    },
  },
}))
