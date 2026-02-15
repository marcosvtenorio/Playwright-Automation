/**
 * Booking Fixtures
 *
 * Part 1: Date combinations for check-availability tests.
 * Part 2: Reservation form data for booking-form tests (BVA).
 *
 * All dates are relative to today to ensure tests remain valid over time.
 */

// ═══════════════════════════════════════════════════════════
// Part 1 — Date Range Fixtures (Check Availability)
// ═══════════════════════════════════════════════════════════

export interface BookingDateRange {
  checkinDay: number;
  checkinMonthOffset: number;
  checkoutDay: number;
  checkoutMonthOffset: number;
  description: string;
}

/**
 * Valid date range: check-in before check-out (next month, days 10-20)
 */
export function createValidDateRange(): BookingDateRange {
  return {
    checkinDay: 10,
    checkinMonthOffset: 1,
    checkoutDay: 20,
    checkoutMonthOffset: 1,
    description: 'Valid date range: check-in before check-out',
  };
}

/**
 * Invalid date range: check-in after check-out (next month, checkout day 5, checkin day 20)
 */
export function createInvalidDateRange(): BookingDateRange {
  return {
    checkinDay: 20,
    checkinMonthOffset: 1,
    checkoutDay: 5,
    checkoutMonthOffset: 1,
    description: 'Invalid date range: check-in after check-out',
  };
}

/**
 * Past dates: both check-in and check-out in the past (previous month, days 1-5)
 */
export function createPastDateRange(): BookingDateRange {
  return {
    checkinDay: 1,
    checkinMonthOffset: -1,
    checkoutDay: 5,
    checkoutMonthOffset: -1,
    description: 'Past dates: both check-in and check-out in the past',
  };
}

/**
 * Same-day booking: check-in and check-out on the same day (next month, day 15)
 */
export function createSameDayDateRange(): BookingDateRange {
  return {
    checkinDay: 15,
    checkinMonthOffset: 1,
    checkoutDay: 15,
    checkoutMonthOffset: 1,
    description: 'Same-day booking: check-in and check-out on the same day',
  };
}

// ═══════════════════════════════════════════════════════════
// Part 2 — Reservation Form Fixtures (Booking Page)
// ═══════════════════════════════════════════════════════════

/**
 * Reservation form data interface.
 * Maps to the POST /api/booking payload fields.
 */
export interface ReservationFormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

/** Generates a string of exact length by repeating a base text */
function repeatToLength(base: string, length: number): string {
  return base.repeat(Math.ceil(length / base.length)).substring(0, length);
}

/**
 * Validation Rules (empirically confirmed via Playwright MCP AND VALIDATED MANUALLY) 2/15/2026:
 *
 * ┌───────────┬─────┬─────┬───────────────────────────────────────────┐
 * │ Field     │ Min │ Max │ Error message                             │
 * ├───────────┼─────┼─────┼───────────────────────────────────────────┤
 * │ firstname │  3  │  18 │ "size must be between 3 and 18"           │
 * │ lastname  │  3  │  30 │ "size must be between 3 and 30"           │
 * │ email     │  —  │  —  │ "must be a well-formed email address"     │
 * │ phone     │ 11  │  21 │ "size must be between 11 and 21"          │
 * └───────────┴─────┴─────┴───────────────────────────────────────────┘
 *
 */

// ─── Valid Fixtures ────────────────────────────────────────

/** Happy path: all fields within valid range */
export function createValidReservation(overrides?: Partial<ReservationFormData>): ReservationFormData {
  return {
    firstname: 'Marcos',           // 6 chars (within 3-18)
    lastname: 'Silva',             // 5 chars (within 3-30)
    email: 'marcos@test.com',
    phone: '12345678901',          // 11 chars (minimum)
    ...overrides,
  };
}

/** Minimum boundary: all fields at their exact minimum length */
export function createMinBoundaryReservation(overrides?: Partial<ReservationFormData>): ReservationFormData {
  return {
    firstname: 'Ana',              // 3 chars (minimum)
    lastname: 'Lee',               // 3 chars (minimum)
    email: 'a@b.co',               // minimal valid email
    phone: '11111111111',          // 11 chars (minimum)
    ...overrides,
  };
}

/** Maximum boundary: all fields at their exact maximum length */
export function createMaxBoundaryReservation(overrides?: Partial<ReservationFormData>): ReservationFormData {
  return {
    firstname: repeatToLength('MaxFirstname. ', 18),    // 18 chars (maximum)
    lastname: repeatToLength('MaxLastname boundary. ', 30),  // 30 chars (maximum)
    email: 'maximumboundary@test.com',
    phone: '123456789012345678901',                      // 21 chars (maximum)
    ...overrides,
  };
}

// ─── Invalid Fixtures ──────────────────────────────────────

/** Empty form: all fields blank — triggers all validation errors */
export function createEmptyReservation(): ReservationFormData {
  return {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
  };
}

/** Below minimum: all fields below their minimum length */
export function createBelowMinReservation(overrides?: Partial<ReservationFormData>): ReservationFormData {
  return {
    firstname: 'AB',               // 2 chars (below 3 minimum)
    lastname: 'CD',                // 2 chars (below 3 minimum)
    email: 'invalid-email.com',        // missing @ → not well-formed
    phone: '1234567890',           // 10 chars (below 11 minimum)
    ...overrides,
  };
}

/** Above maximum: all fields above their maximum length */
export function createAboveMaxReservation(overrides?: Partial<ReservationFormData>): ReservationFormData {
  return {
    firstname: repeatToLength('AboveMax firstname. ', 19),   // 19 chars (above 18 maximum)
    lastname: repeatToLength('AboveMax lastname boundary. ', 31),  // 31 chars (above 30 maximum)
    email: 'above@max.com',
    phone: '1234567890123456789012',                          // 22 chars (above 21 maximum)
    ...overrides,
  };
}

/** Invalid email only: valid fields except email format */
export function createInvalidEmailReservation(overrides?: Partial<ReservationFormData>): ReservationFormData {
  return {
    firstname: 'Valid',
    lastname: 'User',
    email: 'not-an-email',
    phone: '12345678901234',
    ...overrides,
  };
}
