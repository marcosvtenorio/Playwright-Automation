import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  // API Configuration
  API_BASE_URL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
  API_AUTH_USERNAME: process.env.API_AUTH_USERNAME ?? 'admin',
  API_AUTH_PASSWORD: process.env.API_AUTH_PASSWORD ?? 'password123',

  // UI Configuration
  UI_BASE_URL: process.env.UI_BASE_URL ?? 'https://automationintesting.online',
  UI_ADMIN_USERNAME: process.env.UI_ADMIN_USERNAME ?? 'admin',
  UI_ADMIN_PASSWORD: process.env.UI_ADMIN_PASSWORD ?? 'password',

  // Test Settings
  HEADLESS: process.env.HEADLESS !== 'false',
  SLOW_MO: Number(process.env.SLOW_MO ?? 0),
  TIMEOUT: Number(process.env.TIMEOUT ?? 30000),
} as const;

