import { ENV } from '../config/env.js';

/**
 * Authentication Fixtures - Restful Booker API and UI
 *
 * Credentials for testing authentication endpoints (API) and admin login (UI).
 * API uses: API_AUTH_USERNAME, API_AUTH_PASSWORD
 * UI uses: UI_ADMIN_USERNAME, UI_ADMIN_PASSWORD
 */

export interface AuthCredentials {
  username: string;
  password: string;
}

/** Alias for UI admin credentials (same structure as AuthCredentials) */
export type AdminCredentials = AuthCredentials;

// ─── API Credentials ────────────────────────────────────────────────

/** Valid API credentials — should successfully authenticate and return token */
export function createValidAuthCredentials(): AuthCredentials {
  return {
    username: ENV.API_AUTH_USERNAME,
    password: ENV.API_AUTH_PASSWORD,
  };
}

/** Invalid API credentials — should return error with reason "Bad credentials" */
export function createInvalidAuthCredentials(): AuthCredentials {
  return {
    username: 'invalid',
    password: 'invalid',
  };
}

// ─── UI Admin Credentials ────────────────────────────────────────────

/** Valid UI admin credentials — should successfully log in to admin dashboard */
export function createValidAdminCredentials(): AdminCredentials {
  return {
    username: ENV.UI_ADMIN_USERNAME,
    password: ENV.UI_ADMIN_PASSWORD,
  };
}

/** Invalid UI admin credentials — should show error message and stay on login page */
export function createInvalidAdminCredentials(): AdminCredentials {
  return {
    username: 'invalid',
    password: 'invalid',
  };
}
