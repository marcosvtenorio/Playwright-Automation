/**
 * Expected Error Messages - Restful Booker API
 *
 * These constants define the exact error messages expected from the API
 * when validation fails. Currently, the API accepts invalid data and returns 200,
 * but when fixed, these messages should be validated exactly.
 *
 * Update these constants when API is fixed to return proper error messages.
 */

/**
 * Authentication error messages
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Bad credentials', // Current API behavior (returns 200 with this)
  UNAUTHORIZED: 'Unauthorized', // Expected when API returns 401
  AUTHENTICATION_FAILED: 'Authentication failed', // Alternative expected message
} as const;

/**
 * Booking validation error messages
 */
export const BOOKING_ERROR_MESSAGES = {
  // Empty required fields
  FIRSTNAME_REQUIRED: 'Firstname is required',
  LASTNAME_REQUIRED: 'Lastname is required',
  REQUIRED_FIELDS_MISSING: 'Required fields are missing',
  
  // Invalid price
  PRICE_NEGATIVE: 'Totalprice must be greater than or equal to 0',
  PRICE_INVALID: 'Invalid price value',
  
  // Invalid dates
  DATES_INVALID: 'Checkout date must be after checkin date',
  DATE_RANGE_INVALID: 'Invalid date range',
  
  // Generic validation
  VALIDATION_FAILED: 'Validation failed',
} as const;

/**
 * Helper to validate error message matches expected patterns
 */
export function validateErrorMessage(
  actualError: string,
  expectedMessages: readonly string[]
): boolean {
  return expectedMessages.some(expected => 
    actualError.toLowerCase().includes(expected.toLowerCase())
  );
}

