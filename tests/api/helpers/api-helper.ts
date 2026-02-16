/**
 * API Helper Functions
 *
 * Utility functions for API tests:
 * - Authentication
 * - Cleanup operations
 * - Date generation
 * 
 */

import { APIRequestContext } from '@playwright/test';
import { ENV } from '../../config/env.js';

/**
 * Authenticate admin user and return token.
 * API returns token in response body.
 *
 * @returns Token string or null if authentication fails
 */
export async function authenticateAdmin(request: APIRequestContext): Promise<string | null> {
  try {
    const response = await request.post('/auth', {
      data: {
        username: ENV.API_AUTH_USERNAME,
        password: ENV.API_AUTH_PASSWORD,
      },
    });

    if (response.status() !== 200) {
      return null;
    }

    const body = await response.json().catch(() => ({}));
    
    // Try to get token from response body
    if (body.token) {
      return body.token;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Delete a booking by ID via admin API.
 * API requires authentication via Cookie header.
 * Best-effort cleanup — errors are swallowed.
 *
 * @param request - Playwright API request context
 * @param bookingId - ID of booking to delete
 */
export async function deleteBooking(request: APIRequestContext, bookingId: number): Promise<void> {
  try {
    const token = await authenticateAdmin(request);
    if (!token) {
      return; // Can't cleanup without auth
    }

    await request.delete(`/booking/${bookingId}`, {
      headers: { Cookie: `token=${token}` },
    });
  } catch {
    // Best-effort cleanup — swallow errors
  }
}

/**
 * Cleanup multiple bookings.
 * Best-effort — continues even if some deletions fail.
 *
 * @param request - Playwright API request context
 * @param bookingIds - Array of booking IDs to delete
 */
export async function cleanupBookings(
  request: APIRequestContext,
  bookingIds: number[]
): Promise<void> {
  for (const id of bookingIds) {
    await deleteBooking(request, id);
  }
}

/**
 * Get a booking by ID.
 * API does not have room endpoints, so we use bookings instead.
 *
 * @param request - Playwright API request context
 * @param bookingId - Booking ID to retrieve
 * @returns Booking object or null if not found
 */
export async function getBookingById(
  request: APIRequestContext,
  bookingId: number
): Promise<unknown | null> {
  try {
    const response = await request.get(`/booking/${bookingId}`);
    if (response.status() !== 200) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Generate a future date string (YYYY-MM-DD).
 * Each testSlot gets its own month to prevent overlap between tests.
 *
 * @param testSlot - Unique slot per test (1-15), each offset 1 month apart
 * @param day - Day of the month (1-28 recommended to avoid month-length issues)
 * @returns Date string in YYYY-MM-DD format
 */
export function generateFutureDate(testSlot: number, day: number): string {
  const now = new Date();
  const future = new Date(now.getFullYear(), now.getMonth() + 3 + testSlot, day);
  return future.toISOString().split('T')[0];
}

/**
 * Generate a date range for booking tests.
 *
 * @param testSlot - Unique slot per test (1-15)
 * @param days - Number of days for the stay (default: 3)
 * @returns Object with checkin and checkout dates
 */
export function generateDateRange(
  testSlot: number,
  days: number = 3
): { checkin: string; checkout: string } {
  const checkin = generateFutureDate(testSlot, 10);
  const checkoutDate = new Date(checkin);
  checkoutDate.setDate(checkoutDate.getDate() + days);
  const checkout = checkoutDate.toISOString().split('T')[0];

  return { checkin, checkout };
}
