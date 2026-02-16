/**
 * Restful Booker API Types
 *
 * Interfaces derived from empirical API testing via Playwright discovery.
 * Based on Restful Booker API: https://restful-booker.herokuapp.com
 */

// ─── Authentication Types ──────────────────────────────────

/** POST /auth — request payload */
export interface AuthRequest {
  username: string;
  password: string;
}

/** POST /auth → 200 — success response */
export interface AuthResponse {
  token: string;
}

/** POST /auth → 200 — error response (invalid credentials) */
export interface AuthError {
  reason: string; // "Bad credentials"
}

// ─── Booking Types ─────────────────────────────────────────

export interface BookingDates {
  checkin: string;  // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
}

/** POST /booking — request payload */
export interface BookingRequest {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string; // Optional
}

/** POST /booking → 200 — success response */
export interface BookingCreateResponse {
  bookingid: number;
  booking: BookingDetails;
}

/** GET /booking/:id → 200 — booking details */
export interface BookingDetails {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/** PUT /booking/:id — request payload (same as BookingRequest) */
export type BookingUpdateRequest = BookingRequest;

/** PATCH /booking/:id — partial update request */
export type BookingPartialUpdate = Partial<BookingRequest>;

/** Error responses */
export interface BookingError {
  error?: string;
  reason?: string;
}
