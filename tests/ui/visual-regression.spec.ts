import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';

/**
 * Visual Regression Tests
 *
 * Strategy:
 * - Component-level screenshots of stable UI elements (no full-page)
 * - Dynamic content (dates, prices, room counts) is masked to prevent flakiness
 * - Only runs on ui-desktop project for consistent viewport (1280×720)
 *
 * Business Impact:
 * - Catches unintended CSS regressions, broken layouts, and missing elements
 * - Protects brand consistency (navbar, footer, forms)
 *
 * Usage:
 * - First run generates baselines (tests fail — expected)
 * - Accept baselines: npx playwright test --update-snapshots --grep "VR"
 * - Subsequent runs compare against baselines
 */

test.describe('Visual Regression — Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForPageLoad();
    // Eliminate scrollbar width variance between runs
    await page.addStyleTag({ content: 'body { overflow-y: scroll !important; }' });
  });

  test('VR01 - valid: navbar should match baseline', async () => {
    await expect(homePage.navbar).toHaveScreenshot('navbar.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('VR02 - valid: footer should match baseline', async () => {
    await homePage.footer.scrollIntoViewIfNeeded();

    await expect(homePage.footer).toHaveScreenshot('footer.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('VR03 - valid: contact form should match baseline', async () => {
    await homePage.scrollToContact();

    await expect(homePage.contactSection).toHaveScreenshot('contact-form.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('VR04 - valid: booking widget should match baseline', async ({ page }) => {
    await expect(homePage.bookingSection).toHaveScreenshot('booking-widget.png', {
      mask: [homePage.checkinInput, homePage.checkoutInput],
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe('Visual Regression — Admin Login', () => {
  test('VR05 - valid: login form should match baseline', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    await expect(page).toHaveScreenshot('admin-login-page.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});

