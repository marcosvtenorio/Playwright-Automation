import { test, expect } from '@playwright/test';
import { BookingPage } from './pages/BookingPage.js';
import {
  createValidReservation,
  createMinBoundaryReservation,
  createMaxBoundaryReservation,
  createEmptyReservation,
  createBelowMinReservation,
  createAboveMaxReservation,
  createInvalidEmailReservation,
} from '../fixtures/booking.data.js';
import { BookingCreateResponse } from '@tests/types/booking.types.js';
import { futureDate, deleteBooking } from './helpers/booking-helper.js';

/**
 * Reservation Form Tests
 *
 * Strategy:
 * - Validate booking form on /reservation/:roomId page
 * - BVA (Boundary Value Analysis) on all input fields
 * - Verify successful booking flow → confirmation screen
 * - Verify form validation errors for invalid data
 * - Document known bug: 409 conflict → frontend crash (test.fail)
 *
 * Date strategy:
 * - Each test uses dates a few months in the future (3 + slot), producing
 *   dates like April 2026, May 2026, etc. — readable and realistic.
 * - Tests that create bookings (RF01-RF03, RF09) clean up via
 *   DELETE /api/booking/:id after assertions, preventing 409 conflicts
 *   on re-runs.
 * - In the shared public environment, another user could theoretically
 *   book the same dates — this is a known, accepted limitation.
 *
 * Trade-off: cleanup happens after assertions (not in try/finally).
 * If a test fails mid-execution, the booking remains orphaned and may
 * cause 409 on the next run. This is accepted because:
 * 1. Each test uses unique date slots (different months), so orphans
 *    only affect the same test on re-run, not other tests.
 * 2. The alternative (try/finally) adds verbosity for a rare edge case.
 * 3. The environment is shared/public — external conflicts are possible anyway.
 *
 * Business impact:
 * - Reservation is the core revenue flow; broken form = lost bookings.
 */

test.describe('Reservation Form', () => {
  // ─── Happy Path ──────────────────────────────────────────

  test('RF01 - valid: should complete booking with valid data and show confirmation', async ({ page, request }) => {
    const checkin = futureDate(1, 23);
    const checkout = futureDate(1, 26);
    const bookingPage = new BookingPage(page, 1, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    const data = createValidReservation();

    // Intercept API response + submit
    const [apiResponse] = await Promise.all([
      bookingPage.waitForBookingApiResponse(),
      bookingPage.completeBooking(data),
    ]);

    // 409 = orphaned booking from a previous failed run occupies these dates.
    // Skip honestly instead of failing — the booking flow itself is not broken.
    // BUG-010 (409 frontend crash) is tested in RF09 — this is the happy path.
    test.skip(apiResponse.status() === 409, 'Dates already booked (orphaned booking). Re-run to retry.');
    expect(apiResponse.status()).toBe(201);

    const body = await apiResponse.json() as BookingCreateResponse;

    // Verify confirmation screen
    await expect(bookingPage.confirmationHeading).toBeVisible({ timeout: 10000 });
    await expect(bookingPage.confirmationMessage).toBeVisible();

    // Verify dates match what was booked
    const confirmedDates = await bookingPage.getConfirmedDates();
    expect(confirmedDates).toContain(checkin);
    expect(confirmedDates).toContain(checkout);

    // Verify "Return home" link
    await expect(bookingPage.returnHomeLink).toBeVisible();
    await expect(bookingPage.returnHomeLink).toHaveAttribute('href', '/');

    // Cleanup: delete booking so re-runs don't get 409
    await deleteBooking(request, body.bookingid);
  });

  test('RF02 - valid: should complete booking with minimum boundary values', async ({ page, request }) => {
    const checkin = futureDate(2, 12);
    const checkout = futureDate(2, 15);
    const bookingPage = new BookingPage(page, 2, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    const data = createMinBoundaryReservation();

    const [apiResponse] = await Promise.all([
      bookingPage.waitForBookingApiResponse(),
      bookingPage.completeBooking(data),
    ]);
    // 409 = orphaned booking from a previous failed run occupies these dates.
    // Skip honestly instead of failing — the booking flow itself is not broken.
    // BUG-010 (409 frontend crash) is tested in RF09 — this is the happy path.
    test.skip(apiResponse.status() === 409, 'Dates already booked (orphaned booking). Re-run to retry.');
    expect(apiResponse.status()).toBe(201);
    await expect(bookingPage.confirmationHeading).toBeVisible({ timeout: 10000 });

    // Cleanup
    const body = await apiResponse.json() as BookingCreateResponse;
    await deleteBooking(request, body.bookingid);
  });

  test('RF03 - valid: should complete booking with maximum boundary values', async ({ page, request }) => {
    const checkin = futureDate(3, 7);
    const checkout = futureDate(3, 10);
    const bookingPage = new BookingPage(page, 3, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    const data = createMaxBoundaryReservation();

    // Validate exact boundary lengths (maximums)
    expect(data.firstname.length).toBe(18);  // maximum allowed
    expect(data.lastname.length).toBe(30);   // maximum allowed
    expect(data.phone.length).toBe(21);      // maximum allowed

    const [apiResponse] = await Promise.all([
      bookingPage.waitForBookingApiResponse(),
      bookingPage.completeBooking(data),
    ]);
    // 409 = orphaned booking from a previous failed run occupies these dates.
    // Skip honestly instead of failing — the booking flow itself is not broken.
    // BUG-010 (409 frontend crash) is tested in RF09 — this is the happy path.
    test.skip(apiResponse.status() === 409, 'Dates already booked (orphaned booking). Re-run to retry.');
    expect(apiResponse.status()).toBe(201);
    await expect(bookingPage.confirmationHeading).toBeVisible({ timeout: 10000 });

    // Cleanup
    const body = await apiResponse.json() as BookingCreateResponse;
    await deleteBooking(request, body.bookingid);
  });

  // ─── Negative Path ───────────────────────────────────────

  test('RF04 - invalid: should show field-specific validation errors when submitting empty form', async ({ page }) => {
    // BUG: ambiguous-validation-messages
    // API returns "size must be between 3 and 18" without specifying WHICH field.
    // Ideal: every error message should reference the field name (e.g. "Firstname size...").
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'BUG-009');

    const checkin = futureDate(4, 1);
    const checkout = futureDate(4, 4);
    const bookingPage = new BookingPage(page, 1, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    const data = createEmptyReservation();
    await bookingPage.completeBooking(data);

    const errors = await bookingPage.getValidationErrors();

    expect(errors.some(e => e.includes('Firstname should not be blank'))).toBe(true);
    expect(errors.some(e => e.includes('Lastname should not be blank'))).toBe(true);
    expect(errors.some(e => e.includes('Email must not be empty'))).toBe(true);
    expect(errors.some(e => e.includes('Phone must not be empty'))).toBe(true);
    expect(errors.some(e => e.includes('Firstname size must be between 3 and 18'))).toBe(true);
    expect(errors.some(e => e.includes('Lastname size must be between 3 and 30'))).toBe(true);
    expect(errors.some(e => e.includes('Phone size must be between 11 and 21'))).toBe(true);
  });

  test('RF05 - invalid: should show errors for below-minimum field lengths', async ({ page }) => {
    // BUG: ambiguous-validation-messages
    // API returns "size must be between 3 and 18" without specifying WHICH field.
    // Ideal: every error message should reference the field name (e.g. "Firstname size...").
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'BUG-009');

    const checkin = futureDate(5, 6);
    const checkout = futureDate(5, 9);
    const bookingPage = new BookingPage(page, 1, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    const data = createBelowMinReservation();

    await bookingPage.completeBooking(data);

    const errors = await bookingPage.getValidationErrors();

    expect(errors.some(e => e.includes('Firstname size must be between 3 and 18'))).toBe(true);
    expect(errors.some(e => e.includes('Lastname size must be between 3 and 30'))).toBe(true);
    expect(errors.some(e => e.includes('Phone size must be between 11 and 21'))).toBe(true);
    expect(errors.some(e => e.includes('must be a well-formed email address'))).toBe(true);

    // Negative: "not blank" errors should NOT appear (fields have content)
    expect(errors.some(e => e.includes('Firstname should not be blank'))).toBe(false);
    expect(errors.some(e => e.includes('Lastname should not be blank'))).toBe(false);
  });

  test('RF06 - invalid: should show errors for above-maximum field lengths', async ({ page }) => {
    // BUG: ambiguous-validation-messages
    // API returns "size must be between 3 and 18" without specifying WHICH field.
    // Ideal: every error message should reference the field name (e.g. "Firstname size...").
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'BUG-009');

    const checkin = futureDate(6, 11);
    const checkout = futureDate(6, 14);
    const bookingPage = new BookingPage(page, 1, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    const data = createAboveMaxReservation();

    // Validate exact boundary lengths (above maximum)
    expect(data.firstname.length).toBe(19);  // above 18 maximum
    expect(data.lastname.length).toBe(31);   // above 30 maximum
    expect(data.phone.length).toBe(22);      // above 21 maximum

    await bookingPage.completeBooking(data);

    const errors = await bookingPage.getValidationErrors();

    expect(errors.some(e => e.includes('Firstname size must be between 3 and 18'))).toBe(true);
    expect(errors.some(e => e.includes('Lastname size must be between 3 and 30'))).toBe(true);
    expect(errors.some(e => e.includes('Phone size must be between 11 and 21'))).toBe(true);

    // Negative: blank/empty errors should NOT appear
    expect(errors.some(e => e.includes('Firstname should not be blank'))).toBe(false);
    expect(errors.some(e => e.includes('Lastname should not be blank'))).toBe(false);
    expect(errors.some(e => e.includes('must not be empty'))).toBe(false);
  });

  test('RF07 - invalid: should show error for invalid email format only', async ({ page }) => {
    const checkin = futureDate(7, 16);
    const checkout = futureDate(7, 19);
    const bookingPage = new BookingPage(page, 1, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    // All fields except email are valid
    const data = createInvalidEmailReservation();

    await bookingPage.completeBooking(data);

    const errors = await bookingPage.getValidationErrors();

    // Only email error should appear
    expect(errors.some(e => e.includes('must be a well-formed email address'))).toBe(true);

    // Negative: no size or blank errors should appear
    expect(errors.some(e => e.includes('size must be between'))).toBe(false);
    expect(errors.some(e => e.includes('should not be blank'))).toBe(false);
    expect(errors.some(e => e.includes('must not be empty'))).toBe(false);

    // Should be exactly 1 error
    expect(errors.length).toBe(1);
  });

  // ─── UX / Interaction ────────────────────────────────────

  test('RF08 - valid: should cancel booking form and return to calendar view', async ({ page }) => {
    const checkin = futureDate(8, 1);
    const checkout = futureDate(8, 4);
    const bookingPage = new BookingPage(page, 1, checkin, checkout);

    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    // Calendar should be visible initially
    await expect(bookingPage.calendarTable).toBeVisible();
    await expect(bookingPage.reserveNowButton).toBeVisible();

    // Open form
    await bookingPage.openBookingForm();
    await expect(bookingPage.firstnameInput).toBeVisible();
    await expect(bookingPage.cancelButton).toBeVisible();

    // Calendar should be hidden while form is open
    await expect(bookingPage.calendarTable).not.toBeVisible();

    // Cancel form
    await bookingPage.cancelBookingForm();

    // Calendar should reappear, form fields should be hidden
    await expect(bookingPage.calendarTable).toBeVisible();
    await expect(bookingPage.reserveNowButton).toBeVisible();
    await expect(bookingPage.firstnameInput).not.toBeVisible();
    await expect(bookingPage.cancelButton).not.toBeVisible();
  });

  // ─── Known Bugs ───────────────────────────────────────────

  test('RF09 - edge: should handle date conflict gracefully', async ({ page, request }) => {
    // BUG: 409-frontend-crash
    // POST /api/booking returns 409 on date conflict → frontend crashes with
    // "TypeError: Cannot read properties of undefined (reading 'length')"
    // instead of showing a user-friendly error message.
    // Ideal: show an error like "These dates are no longer available".
    // Remove test.fail() when the bug is fixed.
    test.fail(true, 'BUG-010');

    const checkin = futureDate(9, 1);
    const checkout = futureDate(9, 4);
    const validData = createValidReservation();

    // Step 1: Occupy the dates via API (fast, no UI dependency)
    const apiSetup = await request.post('/api/booking', {
      data: {
        roomid: 1,
        firstname: validData.firstname,
        lastname: validData.lastname,
        email: validData.email,
        phone: validData.phone,
        depositpaid: true,
        bookingdates: { checkin, checkout },
      },
    });
    expect(apiSetup.status()).toBe(201);
    const setupBody = await apiSetup.json();

    // Step 2: Navigate to the same room + same dates via UI
    const bookingPage = new BookingPage(page, 1, checkin, checkout);
    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();

    // Step 3: Try to book the same dates → should get 409
    await bookingPage.completeBooking(validData);

    // Ideal behavior: application should show an error message, NOT crash
    // Currently crashes with "Application error: a client-side exception has occurred"
    await expect(bookingPage.validationAlert).toBeVisible({ timeout: 10000 });
    const errors = await bookingPage.getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);

    // Cleanup: delete the setup booking
    await deleteBooking(request, setupBody.bookingid);
  });
});
