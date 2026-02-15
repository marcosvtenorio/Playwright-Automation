import { ENV } from '../config/env.js';

/**
 * Admin Authentication Fixtures
 *
 * Credentials for testing admin login flow.
 * Uses environment variables with sensible defaults for the test environment.
 */

export interface AdminCredentials {
  username: string;
  password: string;
}

/** Valid admin credentials — should successfully log in */
export function createValidAdminCredentials(): AdminCredentials {
  return {
    username: ENV.UI_ADMIN_USERNAME,
    password: ENV.UI_ADMIN_PASSWORD,
  };
}

/** Invalid admin credentials — should show error message */
export function createInvalidAdminCredentials(): AdminCredentials {
  return {
    username: 'invalid_user',
    password: 'wrong_password',
  };
}
