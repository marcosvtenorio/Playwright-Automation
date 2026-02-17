import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import {
  createValidDateRange,
  createInvalidDateRange,
  createPastDateRange,
  createSameDayDateRange,
} from '../fixtures/booking.data.js';

/**
 * Check Availability Functional Tests
 *
 * Strategy:
 * - Test the "Check Availability" feature end-to-end
 * - Verify date selection → API call → room link updates
 * - Document known API bugs (missing server-side validation)
 *
 * API behavior (verified via Playwright MCP discovery):
 * - GET /api/room?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD
 * - ALWAYS returns 200 with all rooms, regardless of date validity
 * - No server-side validation for: invalid ranges, past dates, same-day
 *
 * Business impact:
 * - Broken availability search → guests can't find rooms → revenue loss
 * - Missing date validation → overbooking or impossible reservations
 */

test.describe('Check Availability', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForPageLoad();
  });

  test('CA01 - valid: should call API with correct date params and display rooms', async () => {
    // BUG-013: Application incorrectly converts dates to UTC, adding +1 day
    // This test explicitly documents the timezone conversion bug
    // Expected: API receives the exact dates selected by the user (no timezone conversion)
    // Actual: API receives dates with +1 day (e.g., user selects 10/02/2026, API gets 2026-02-11)
    // Root cause: Date conversion from local timezone (UTC-3) to UTC adds +1 day
    // Impact: Users searching for availability on a specific date get incorrect results
    test.fail(new Date().getHours() >= 21, 'BUG-013'); // this test should fail after 21:00 UTC
    const dateRange = createValidDateRange();

    await homePage.selectCheckinDate(dateRange.checkinDay, dateRange.checkinMonthOffset);
    await homePage.selectCheckoutDate(dateRange.checkoutDay, dateRange.checkoutMonthOffset);

    const checkinValue = await homePage.getCheckinDateValue();
    const checkoutValue = await homePage.getCheckoutDateValue();
    const checkinUrl = homePage.formatDateForUrl(checkinValue);
    const checkoutUrl = homePage.formatDateForUrl(checkoutValue);

    // Intercept API response and click simultaneously
    const [apiResponse] = await Promise.all([
      homePage.waitForAvailabilitySearch(checkinUrl, checkoutUrl),
      homePage.clickCheckAvailabilityButton(),
    ]);

    expect(apiResponse.status()).toBe(200);

    // Verify room links contain selected dates with correct order
    const hrefs = await homePage.getBookNowHrefs();
    expect(hrefs.length).toBeGreaterThanOrEqual(1);

    for (const href of hrefs) {
      expect(href).toContain(`checkin=${checkinUrl}`);
      expect(href).toContain(`checkout=${checkoutUrl}`);

      const { checkin, checkout } = homePage.parseDatesFromHref(href);
      expect(checkin.getTime()).toBeLessThan(checkout.getTime());
    }
  });

  test('CA02 - valid: should scroll to rooms section after search', async () => {
    const dateRange = createValidDateRange();

    await homePage.selectCheckinDate(dateRange.checkinDay, dateRange.checkinMonthOffset);
    await homePage.selectCheckoutDate(dateRange.checkoutDay, dateRange.checkoutMonthOffset);

    await homePage.clickCheckAvailabilityButton();

    // Rooms section should be visible and within viewport after click
    await expect(homePage.roomsSection).toBeInViewport();

    const roomCount = await homePage.getRoomCount();
    expect(roomCount).toBeGreaterThan(0);
  });

  test('CA03 - negative: should reject invalid date range (checkout before checkin)', async () => {
    // BUG: Server returns 200 OK when checkout < checkin — no server-side validation
    // Expected: 400 Bad Request or client-side prevention
    // Impact: Users can proceed with impossible date ranges → broken reservations
    // Remove test.fail() when the bug is fixed
    test.fail(true, 'BUG-011');

    const dateRange = createInvalidDateRange();

    await homePage.selectCheckinDate(dateRange.checkinDay, dateRange.checkinMonthOffset);
    await homePage.selectCheckoutDate(dateRange.checkoutDay, dateRange.checkoutMonthOffset);

    const checkinValue = await homePage.getCheckinDateValue();
    const checkoutValue = await homePage.getCheckoutDateValue();
    const checkinUrl = homePage.formatDateForUrl(checkinValue);
    const checkoutUrl = homePage.formatDateForUrl(checkoutValue);

    const [apiResponse] = await Promise.all([
      homePage.waitForAvailabilitySearch(checkinUrl, checkoutUrl),
      homePage.clickCheckAvailabilityButton(),
    ]);

    // IDEAL behavior: API should reject invalid date ranges
    const status = apiResponse.status();
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
  });

  test('CA04 - negative: should reject past dates', async () => {
    // BUG: Server returns 200 OK for dates in the past — no validation
    // Expected: 400 Bad Request or datepicker should disable past dates
    // Impact: Users can search for rooms on dates that have already passed
    // Remove test.fail() when the bug is fixed
    test.fail(true, 'BUG-012');

    const dateRange = createPastDateRange();

    await homePage.selectCheckinDate(dateRange.checkinDay, dateRange.checkinMonthOffset);
    await homePage.selectCheckoutDate(dateRange.checkoutDay, dateRange.checkoutMonthOffset);

    const checkinValue = await homePage.getCheckinDateValue();
    const checkoutValue = await homePage.getCheckoutDateValue();
    const checkinUrl = homePage.formatDateForUrl(checkinValue);
    const checkoutUrl = homePage.formatDateForUrl(checkoutValue);

    const [apiResponse] = await Promise.all([
      homePage.waitForAvailabilitySearch(checkinUrl, checkoutUrl),
      homePage.clickCheckAvailabilityButton(),
    ]);

    // IDEAL behavior: API should reject past dates
    const status = apiResponse.status();
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
  });

  test('CA05 - edge: should handle same-day check-in and check-out', async () => {
    // BUG-013: Application incorrectly converts dates to UTC, adding +1 day
    // This test explicitly documents the timezone conversion bug
    // Expected: API receives the exact dates selected by the user (no timezone conversion)
    // Actual: API receives dates with +1 day (e.g., user selects 10/02/2026, API gets 2026-02-11)
    // Root cause: Date conversion from local timezone (UTC-3) to UTC adds +1 day
    // Impact: Users searching for availability on a specific date get incorrect results
    test.fail(new Date().getHours() >= 21, 'BUG-013'); // this test should fail after 21:00 UTC
    const dateRange = createSameDayDateRange();

    await homePage.selectCheckinDate(dateRange.checkinDay, dateRange.checkinMonthOffset);
    await homePage.selectCheckoutDate(dateRange.checkoutDay, dateRange.checkoutMonthOffset);

    const checkinValue = await homePage.getCheckinDateValue();
    const checkoutValue = await homePage.getCheckoutDateValue();
    const checkinUrl = homePage.formatDateForUrl(checkinValue);
    const checkoutUrl = homePage.formatDateForUrl(checkoutValue);

    const [apiResponse] = await Promise.all([
      homePage.waitForAvailabilitySearch(checkinUrl, checkoutUrl),
      homePage.clickCheckAvailabilityButton(),
    ]);

    expect(apiResponse.status()).toBe(200);

    // Verify all room links have identical checkin/checkout (0-night stay)
    const hrefs = await homePage.getBookNowHrefs();
    expect(hrefs.length).toBeGreaterThanOrEqual(1);

    for (const href of hrefs) {
      const { checkin, checkout } = homePage.parseDatesFromHref(href);
      expect(checkin.getTime()).toBe(checkout.getTime());
    }
  });
});
