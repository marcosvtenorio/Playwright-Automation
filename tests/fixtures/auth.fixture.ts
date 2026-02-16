import { ENV } from '../config/env.js';

/**
 * Authentication Fixtures - Restful Booker API
 *
 * Credentials for testing authentication endpoints.
 * Uses API-specific environment variables (API_AUTH_USERNAME, API_AUTH_PASSWORD).
 */

export interface AuthCredentials {
  username: string;
  password: string;
}

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
