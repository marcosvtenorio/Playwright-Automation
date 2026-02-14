import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : Number(process.env.RETRIES ?? 1),
  workers: isCI ? 2 : Number(process.env.WORKERS ?? 4),
  timeout: Number(process.env.TIMEOUT ?? 30000),

  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // ─── API Tests ──────────────────────────────────────
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: '**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },

    // ─── UI Tests (Chromium) ────────────────────────────
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL ?? 'https://automationintesting.online',
        headless: process.env.HEADLESS !== 'false',
        launchOptions: {
          slowMo: Number(process.env.SLOW_MO ?? 0),
        },
      },
    },
  ],
});

