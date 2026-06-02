import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/smoke', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:41731',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'VITE_RUN_MODE=demo vite --port=41731 --host=127.0.0.1',
    port: 41731,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
