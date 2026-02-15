/**
 * Booking Date Fixtures
 *
 * Provides date combinations for booking availability tests.
 * All dates are relative to today to ensure tests remain valid over time.
 */

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
