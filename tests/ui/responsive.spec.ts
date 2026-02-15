import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { BookingPage } from './pages/BookingPage.js';

/**
 * Responsive Layout Tests — Mobile/Tablet-Only Behaviors
 *
 * Strategy:
 * - Validate navbar adapts to smaller viewports (hamburger replaces full links)
 * - Verify reservation page layout stacks correctly on narrow screens
 * - Confirm critical booking elements (calendar, form, price summary) are
 *   accessible and usable on small viewports
 *
 * Breakpoints tested via Playwright projects:
 * - ui-tablet: Chromium 768×1024
 * - ui-mobile: Chromium 375×667
 *
 * Note: booking-flow.spec.ts and form-validation.spec.ts also run on
 * tablet/mobile projects, covering section visibility, content assertions,
 * and form validation across viewports. This spec focuses exclusively on
 * responsive-only behavior that does NOT exist on desktop.
 *
 * Business impact:
 * - Most hotel traffic starts from mobile devices
 * - If hamburger menu is broken, guests can't navigate → lost reservations
 * - If booking form/calendar is unusable on mobile → lost revenue
 */

test.describe('Responsive — Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForPageLoad();
  });

  // ─── Hamburger Menu (responsive-only behavior) ──────────

  test('RS01 - valid: should show hamburger menu instead of full nav links', async () => {
    await expect(homePage.navbarToggler).toBeVisible();

    // Nav links must be collapsed (hidden) by default
    const visibleLinks = await homePage.getVisibleNavLinkTexts();
    expect(visibleLinks.length).toBe(0);
  });

  test('RS02 - valid: should expand nav links when hamburger is clicked', async () => {
    await homePage.expandHamburgerMenu();

    const visibleLinks = await homePage.getVisibleNavLinkTexts();
    expect(visibleLinks).toContain('Rooms');
    expect(visibleLinks).toContain('Booking');
    expect(visibleLinks).toContain('Contact');
    expect(visibleLinks).toContain('Admin');
  });
});

test.describe('Responsive — Reservation Page', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page, 1, '2029-06-10', '2029-06-15');
    await bookingPage.navigate();
    await bookingPage.waitForPageLoad();
  });

  test('RS03 - valid: should display all critical booking sections in single column', async ({ page }) => {
    // Room details must be visible
    await expect(bookingPage.roomTitle).toBeVisible();
    await expect(bookingPage.roomImage).toBeVisible();

    // Booking panel must be visible below room details
    await expect(bookingPage.bookThisRoomHeading).toBeVisible();
    await expect(bookingPage.calendarTable).toBeVisible();
    await expect(bookingPage.priceSummaryHeading).toBeVisible();
    await expect(bookingPage.reserveNowButton).toBeVisible();

    // Room details should be ABOVE the booking panel (stacked layout)
    const roomTitleBox = await bookingPage.roomTitle.boundingBox();
    const bookingHeadingBox = await bookingPage.bookThisRoomHeading.boundingBox();
    expect(roomTitleBox).not.toBeNull();
    expect(bookingHeadingBox).not.toBeNull();
    expect(roomTitleBox!.y).toBeLessThan(bookingHeadingBox!.y);

    // No horizontal overflow
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });

  test('RS04 - valid: should keep booking form usable on small viewport', async () => {
    await bookingPage.openBookingForm();

    // All form fields must be visible and accessible
    await expect(bookingPage.firstnameInput).toBeVisible();
    await expect(bookingPage.lastnameInput).toBeVisible();
    await expect(bookingPage.emailInput).toBeVisible();
    await expect(bookingPage.phoneInput).toBeVisible();

    // Reserve Now and Cancel buttons must be visible
    await expect(bookingPage.reserveNowButton).toBeVisible();
    await expect(bookingPage.cancelButton).toBeVisible();

    // Price summary should remain visible alongside the form
    await expect(bookingPage.priceSummaryHeading).toBeVisible();
  });

  test('RS05 - valid: similar room cards should fit within viewport', async ({ page }) => {
    await expect(bookingPage.similarRoomsHeading).toBeVisible();

    const links = await bookingPage.similarRoomViewDetailsLinks.all();
    expect(links.length).toBeGreaterThanOrEqual(2);

    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Every card must fit within the viewport (no horizontal overflow)
    for (const link of links) {
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
    }
  });

  test('RS06 - valid: should display breadcrumb navigation correctly', async ({ page }) => {
    await expect(bookingPage.breadcrumb).toBeVisible();
    await expect(bookingPage.breadcrumbHome).toBeVisible();
    await expect(bookingPage.breadcrumbRooms).toBeVisible();

    // Breadcrumb should not overflow the viewport
    const breadcrumbBox = await bookingPage.breadcrumb.boundingBox();
    expect(breadcrumbBox).not.toBeNull();

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(breadcrumbBox!.x + breadcrumbBox!.width).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
