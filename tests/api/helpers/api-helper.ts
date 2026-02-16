/**
 * API Helper Functions
 *
 * Utility functions for API tests:
 * - Authentication
 * - Cleanup operations
 * - Room operations
 * - Date generation
 */

import { APIRequestContext } from '@playwright/test';
import { ENV } from '../../config/env.js';
import type { Room, BookingResponse } from '../../types/booking.types.js';

/**
 * Authenticate admin user and return token.
 * Token may be in response body or Set-Cookie header.
 *
 * @returns Token string or null if authentication fails
 */
export async function authenticateAdmin(request: APIRequestContext): Promise<string | null> {
  try {
    const response = await request.post('/api/auth/login', {
      data: {
        username: ENV.UI_ADMIN_USERNAME,
        password: ENV.UI_ADMIN_PASSWORD,
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

    // Try to get token from Set-Cookie header
    const setCookieHeader = response.headers()['set-cookie'];
    if (setCookieHeader) {
      const cookieMatch = setCookieHeader.match(/token=([^;]+)/);
      if (cookieMatch && cookieMatch[1]) {
        return cookieMatch[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Delete a booking by ID via admin API.
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

    await request.delete(`/api/booking/${bookingId}`, {
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
 * Get the first available room from the API.
 *
 * @returns Room object or null if no rooms available
 */
export async function getAvailableRoom(request: APIRequestContext): Promise<Room | null> {
  try {
    const response = await request.get('/api/room');
    if (response.status() !== 200) {
      return null;
    }

    const body = await response.json();
    const rooms = Array.isArray(body) ? body : body.rooms || [];

    if (rooms.length === 0) {
      return null;
    }

    return rooms[0] as Room;
  } catch {
    return null;
  }
}

/**
 * Get room details by ID.
 *
 * @param request - Playwright API request context
 * @param roomId - Room ID to retrieve
 * @returns Room object or null if not found
 */
export async function getRoomById(
  request: APIRequestContext,
  roomId: number
): Promise<Room | null> {
  try {
    const response = await request.get(`/api/room/${roomId}`);
    if (response.status() !== 200) {
      return null;
    }

    return (await response.json()) as Room;
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
