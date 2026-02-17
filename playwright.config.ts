import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;

/** Shared browser settings for all UI projects (Desktop, Tablet, Mobile) */
const sharedUiUse = {
  ...devices['Desktop Chrome'],
  baseURL: process.env.UI_BASE_URL ?? 'https://automationintesting.online',
  headless: process.env.HEADLESS !== 'false',
  launchOptions: {
    slowMo: Number(process.env.SLOW_MO ?? 0),
  },
} as const;

const responsiveTestMatch = ['**/responsive.spec.ts', '**/form-validation.spec.ts', '**/booking-flow.spec.ts', '**/check-availability.spec.ts', '**/reservation-form.spec.ts', 'admin-flow.spec.ts'];

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

    // ─── UI Tests (Desktop — 1280×720) ──────────────────
    {
      name: 'ui-desktop',
      testDir: './tests/ui',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/responsive.spec.ts',
      use: { ...sharedUiUse },
    },

    // ─── UI Tests (Tablet — 768×1024) ──────────────────
    {
      name: 'ui-tablet',
      testDir: './tests/ui',
      testMatch: responsiveTestMatch,
      use: { ...sharedUiUse, viewport: { width: 768, height: 1024 } },
    },

    // ─── UI Tests (Mobile — 375×667) ─────────────────────
    {
      name: 'ui-mobile',
      testDir: './tests/ui',
      testMatch: responsiveTestMatch,
      use: { ...sharedUiUse, viewport: { width: 375, height: 667 } },
    },
  ],
});

