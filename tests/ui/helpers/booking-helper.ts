/**
 * UI Booking Helpers
 *
 * Date generation and cleanup operations for UI booking tests.
 * Uses UI API (automationintesting.online), NOT the Restful Booker API.
 */

import { APIRequestContext } from '@playwright/test';
import { ENV } from '../../config/env.js';

/**
 * Generate a future date string (YYYY-MM-DD).
 *
 * Each testSlot gets its own month to prevent overlap between tests.
 * Combined with API cleanup after each booking, re-runs are safe.
 *
 * @param testSlot - Unique slot per test (1-9), each offset 1 month apart
 * @param day - Day of the month (1-28 recommended to avoid month-length issues)
 */
export function futureDate(testSlot: number, day: number): string {
  const now = new Date();
  const future = new Date(now.getFullYear(), now.getMonth() + 3 + testSlot, day);
  return future.toISOString().split('T')[0];
}

/**
 * Delete a booking by ID via UI admin API.
 * Best-effort cleanup — errors are swallowed.
 *
 * Note: The UI API uses different credentials and paths than the Restful Booker API.
 * - UI API: POST /api/auth/login, DELETE /api/booking/:id
 * - Restful Booker: POST /auth, DELETE /booking/:id
 */
export async function deleteBooking(
  request: APIRequestContext,
  bookingId: number
): Promise<void> {
  try {
    const auth = await request.post('/api/auth/login', {
      data: {
        username: ENV.UI_ADMIN_USERNAME,
        password: ENV.UI_ADMIN_PASSWORD,
      },
    });
    const { token } = await auth.json();
    await request.delete(`/api/booking/${bookingId}`, {
      headers: { Cookie: `token=${token}` },
    });
  } catch {
    /* best-effort */
  }
}

