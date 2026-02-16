/**
 * Authentication API Tests - Restful Booker
 *
 * Strategy:
 * - Test authentication endpoint (POST /auth) with valid and invalid credentials
 * - Validate token generation for successful authentication
 * - Validate error response for invalid credentials
 *
 * Business Impact:
 * - Authentication is the foundation for all protected operations (PUT, PATCH, DELETE)
 * - Broken authentication = inability to manage bookings = operational failure
 *
 * API Behavior:
 * - Endpoint: POST /auth
 * - Success (200): Returns {token: "..."} in response body
 * - Error (200): Returns {reason: "Bad credentials"} - same status code! (BUG: Restful Booker API returns 200 instead of 401 for invalid credentials)
 * - Token must be used in Cookie header: Cookie: token={token}
 * - Default credentials: admin / password123
 */

import { test, expect } from '@playwright/test';
import { authResponseSchema, authErrorSchema } from './schemas/auth.schema.js';
import { createValidAuthCredentials, createInvalidAuthCredentials } from '../fixtures/auth.fixture.js';
import { AUTH_ERROR_MESSAGES } from './constants/error-messages.js';

test.describe('Authentication API Tests', () => {
  test('AU01 - valid: should authenticate with valid admin credentials', async ({ request }) => {
    // Arrange
    const authData = createValidAuthCredentials();

    // Act
    const response = await request.post('/auth', {
      data: authData,
    });

    // Assert
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    authResponseSchema.parse(body); // Zod validation with detailed error messages
    
    expect(body.token).toBeTruthy();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('AU02 - invalid: should reject invalid credentials', async ({ request }) => {
    // BUG: Restful Booker API returns 200 instead of 401 for invalid credentials
    // Expected: 401 Unauthorized
    // Actual: 200 OK with {reason: "Bad credentials"}
    // This test documents the expected behavior (401) but will fail until API is fixed or CR closed as WAD (work as design)
    test.fail();
    
    // Arrange
    const invalidAuthData = createInvalidAuthCredentials();

    // Act
    const response = await request.post('/auth', {
      data: invalidAuthData,
    });

    // Assert - Expected behavior (401 Unauthorized)
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    // Expected error response format
    // API currently returns {reason: "Bad credentials"} instead of {error: "..."}
    // When API is fixed to return 401, it should return an error message indicating unauthorized access
    if (body.reason) {
      // Current API behavior (bug): returns 200 with reason
      expect(body.reason).toBe(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS); // Exact message from API
    } else if (body.error) {
      // Expected behavior when API is fixed: 401 with error message
      expect(typeof body.error).toBe('string');
      expect(body.error.length).toBeGreaterThan(0);
      // Validate exact error message when API is fixed
      const expectedMessages = [
        AUTH_ERROR_MESSAGES.UNAUTHORIZED,
        AUTH_ERROR_MESSAGES.AUTHENTICATION_FAILED,
        AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      ];
      expect(expectedMessages.some(msg => body.error.includes(msg))).toBe(true);
      // When API is fixed, uncomment for exact validation:
      // expect(body.error).toBe(AUTH_ERROR_MESSAGES.UNAUTHORIZED);
    }
    expect(body.token).toBeUndefined();
  });
});
