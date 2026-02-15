import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';

/**
 * Responsive Layout Tests — Hamburger Menu Behavior
 *
 * Strategy:
 * - Validate navbar adapts to smaller viewports (hamburger replaces full links)
 * - Verify hamburger interaction expands navigation correctly
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
 */

test.describe('Responsive Layout', () => {
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
