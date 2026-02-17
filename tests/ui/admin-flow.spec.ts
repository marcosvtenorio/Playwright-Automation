import { test, expect } from '@playwright/test';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import {
  createValidAdminCredentials,
  createInvalidAdminCredentials,
} from '../fixtures/auth.fixture.js';

/**
 * Admin Login Flow Tests
 *
 * Strategy:
 * - Test successful login flow → redirects to dashboard
 * - Test failed login flow → shows error message, stays on login page
 * - Test logout flow → returns to login page, clears session
 * - Test multiple failed attempts → no account lockout, error persists
 * - Verify authentication state (logged in vs logged out)
 * - Document responsive menu bug (BUG-014)
 *
 * Known Bugs:
 * - BUG-014: Hamburger menu does not expand on mobile/tablet, preventing access to navigation items
 *   Impact: Admin users cannot access dashboard features (Rooms, Report, Logout) on mobile/tablet
 *   Workaround: Tests use URL checks and DOM selectors to bypass menu dependency
 *
 * Business impact:
 * - Admin panel controls all bookings, rooms, and branding
 * - Broken login = staff cannot manage the hotel → operational failure
 * - Security: invalid credentials must be rejected with clear feedback
 * - Logout must work reliably to prevent unauthorized access
 * - Mobile menu bug → staff cannot manage hotel from mobile devices
 */

test.describe('Admin Login Flow', () => {
  // ─── Happy Path ──────────────────────────────────────────

  test('AD01 - valid: should successfully log in with valid credentials and redirect to dashboard', async ({
    page,
  }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Verify we're on the login page
    await expect(loginPage.loginHeading).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Login with valid credentials
    const credentials = createValidAdminCredentials();
    await loginPage.login(credentials);

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/rooms/, { timeout: 10000 });

    // Verify we're logged in
    const dashboardPage = new AdminDashboardPage(page);
    const isLoggedIn = await dashboardPage.isOnDashboard();
    expect(isLoggedIn).toBe(true);
  });

  // ─── Negative Path ───────────────────────────────────────

  test('AD02 - invalid: should show error message and stay on login page with invalid credentials', async ({
    page,
  }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Verify we're on the login page
    await expect(loginPage.loginHeading).toBeVisible();

    // Attempt login with invalid credentials
    const invalidCredentials = createInvalidAdminCredentials();
    await loginPage.login(invalidCredentials);

    // Verify we're still on the login page (no redirect)
    await expect(page).toHaveURL(/\/admin$/, { timeout: 5000 });

    // Verify error message is displayed
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(loginPage.errorAlert).toContainText('Invalid credentials');

    // Verify login form is still visible (user can retry)
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Verify dashboard elements are NOT visible (not logged in)
    const dashboardPage = new AdminDashboardPage(page);
    const isOnDashboard = await dashboardPage.isOnDashboard();
    expect(isOnDashboard).toBe(false);
  });

  // ─── Logout Flow ────────────────────────────────────────

  test('AD03 - valid: should logout and return to login page', async ({ page }) => {
    // BUG-014: Hamburger menu does not expand on mobile/tablet, preventing logout button access
    // Expected: Hamburger menu should expand when clicked, making logout button accessible
    // Remove test.fail() when BUG-014 is fixed
    const viewport = page.viewportSize();
    const isMobile = viewport ? viewport.width <= 767 : false;
    test.fail(isMobile, 'BUG-014'); // this test should fail on mobile

    const loginPage = new AdminLoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Step 1: Login first
    await loginPage.login(createValidAdminCredentials());
    await expect(page).toHaveURL(/\/admin\/rooms/, { timeout: 10000 });

    // Step 2: Verify we're logged in (check URL, not menu elements)
    const dashboardPage = new AdminDashboardPage(page);
    const isLoggedIn = await dashboardPage.isOnDashboard();
    expect(isLoggedIn).toBe(true);

    // Step 3: Logout
    // In desktop: logout button is always visible, logout works normally
    // In mobile/tablet: menu bug prevents access to logout button, test will fail (expected)
    await dashboardPage.logout();

    // Step 4: Verify we're redirected to home page (logout behavior)
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });

    // Step 5: Navigate back to admin to verify we're logged out
    await loginPage.navigate();
    await expect(loginPage.loginHeading).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // Step 6: Verify dashboard elements are NOT visible (logged out)
    const isOnDashboardAfterLogout = await dashboardPage.isOnDashboard();
    expect(isOnDashboardAfterLogout).toBe(false);
  });

  // ─── Responsive Menu Bug ──────────────────────────────────

  test('AD05 - valid: hamburger menu should expand on mobile to access navigation items', async ({
    page,
  }) => {
    // BUG-014: Hamburger menu button does not expand the navigation menu on mobile/tablet
    // Expected: Clicking hamburger button should add 'show' class to #navbarSupportedContent
    // Actual: Menu remains collapsed, navigation items (Rooms, Report, Logout) are inaccessible
    // Impact: Admin users cannot access dashboard features on mobile/tablet devices
    // Root cause: Bootstrap collapse functionality not working correctly
    test.fail(true, 'BUG-014');

    const loginPage = new AdminLoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Login first
    await loginPage.login(createValidAdminCredentials());
    await expect(page).toHaveURL(/\/admin\/rooms/, { timeout: 10000 });

    // Check if hamburger button is visible (mobile/tablet)
    const hamburgerButton = page.getByRole('button', { name: 'Toggle navigation' });
    const isHamburgerVisible = await hamburgerButton.isVisible().catch(() => false);

    // Skip test if hamburger is not visible (desktop viewport)
    if (!isHamburgerVisible) {
      test.skip();
      return;
    }

    // Check initial state: menu should be collapsed
    const navbar = page.locator('#navbarSupportedContent');
    const hasShowClassBefore = await navbar.evaluate((el) => el.classList.contains('show')).catch(() => false);
    expect(hasShowClassBefore).toBe(false);

    // Click hamburger button
    await hamburgerButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify menu expanded: 'show' class should be added
    const hasShowClassAfter = await navbar.evaluate((el) => el.classList.contains('show')).catch(() => false);
    expect(hasShowClassAfter).toBe(true);

    // Verify navigation items are now accessible
    const logoutButton = page.getByRole('button', { name: 'Logout' });
    await expect(logoutButton).toBeVisible({ timeout: 2000 });
  });

  // ─── Edge Cases ──────────────────────────────────────────

  test('AD04 - edge: should handle multiple failed login attempts gracefully', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Attempt login 3 times with invalid credentials
    for (let attempt = 1; attempt <= 3; attempt++) {
      const invalidCredentials = createInvalidAdminCredentials();
      await loginPage.login(invalidCredentials);

      // Verify error message appears after each attempt
      await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
      await expect(loginPage.errorAlert).toContainText('Invalid credentials');

      // Verify still on login page (not locked out)
      await expect(page).toHaveURL(/\/admin$/, { timeout: 5000 });
      await expect(loginPage.loginHeading).toBeVisible();
    }

    // Verify login form is still accessible after multiple failures
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Verify we can still attempt login (no account lockout)
    const invalidCredentials = createInvalidAdminCredentials();
    await loginPage.login(invalidCredentials);
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
  });
});
