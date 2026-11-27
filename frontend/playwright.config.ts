import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.pw.ts',
  use: {
    baseURL: process.env.CALCULATOR_URL ?? 'http://127.0.0.1:3000',
    channel: 'chrome',
  },
})
