import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage.js';

/**
 * Page Object for the /admin/rooms dashboard (post-login).
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  Navbar: "Restful Booker Platform Demo" │
 * │  Tabs: Rooms | Report | Branding | Messages │
 * │  Links: Front Page | Logout             │
 * ├─────────────────────────────────────────┤
 * │  Dashboard Content (varies by tab)     │
 * │  - Rooms management form               │
 * │  - Reports                             │
 * │  - Branding settings                   │
 * │  - Messages                            │
 * └─────────────────────────────────────────┘
 *
 * This page appears after successful login.
 * URL changes from /admin to /admin/rooms (or other admin routes).
 */
export class AdminDashboardPage extends BasePage {
  protected readonly url = '/admin/rooms';
  protected readonly readyLocator = this.page.getByRole('link', { name: 'Rooms' });

  // ─── Navigation Tabs ──────────────────────────────────────
  readonly roomsTab: Locator;
  readonly reportTab: Locator;
  readonly brandingTab: Locator;
  readonly messagesTab: Locator;

  // ─── Navigation Links ────────────────────────────────────
  readonly frontPageLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation tabs
    this.roomsTab = page.getByRole('link', { name: 'Rooms' });
    this.reportTab = page.getByRole('link', { name: 'Report' });
    this.brandingTab = page.getByRole('link', { name: 'Branding' });
    this.messagesTab = page.getByRole('link', { name: 'Messages' });

    // Navigation links
    this.frontPageLink = page.getByRole('link', { name: 'Front Page' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  // ─── Navigation Actions ──────────────────────────────────

  /** Navigate to Rooms tab */
  async navigateToRooms(): Promise<void> {
    // Wait for dashboard to fully load before attempting navigation
    await this.waitForDashboardLoad();
    // Expand menu if needed (mobile/tablet) before clicking tab
    await this.expandHamburgerMenuIfNeeded();
    // Verify tab is accessible before attempting to click (fails fast if menu didn't expand)
    const isTabVisible = await this.roomsTab.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isTabVisible) {
      throw new Error(
        'Rooms tab is not accessible. Hamburger menu may not have expanded (BUG-014). ' +
        'Tab exists in DOM but is not visible.'
      );
    }
    await this.roomsTab.click();
    await this.page.waitForURL(/\/admin\/rooms/, { timeout: 5000 });
  }

  /** Navigate to Report tab */
  async navigateToReport(): Promise<void> {
    // Wait for dashboard to fully load before attempting navigation
    await this.waitForDashboardLoad();
    // Expand menu if needed (mobile/tablet) before clicking tab
    await this.expandHamburgerMenuIfNeeded();
    // Verify tab is accessible before attempting to click (fails fast if menu didn't expand)
    const isTabVisible = await this.reportTab.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isTabVisible) {
      throw new Error(
        'Report tab is not accessible. Hamburger menu may not have expanded (BUG-014). ' +
        'Tab exists in DOM but is not visible.'
      );
    }
    // Use Promise.all to click and wait for navigation simultaneously
    await Promise.all([
      this.page.waitForURL(/\/admin\/report/, { timeout: 10000 }),
      this.reportTab.click(),
    ]);
    // Also wait a moment for the page to fully render
    await this.page.waitForTimeout(500);
  }

  /** Navigate to Branding tab */
  async navigateToBranding(): Promise<void> {
    // Wait for dashboard to fully load before attempting navigation
    await this.waitForDashboardLoad();
    // Expand menu if needed (mobile/tablet) before clicking tab
    await this.expandHamburgerMenuIfNeeded();
    // Verify tab is accessible before attempting to click (fails fast if menu didn't expand)
    const isTabVisible = await this.brandingTab.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isTabVisible) {
      throw new Error(
        'Branding tab is not accessible. Hamburger menu may not have expanded (BUG-014). ' +
        'Tab exists in DOM but is not visible.'
      );
    }
    await this.brandingTab.click();
    await this.page.waitForURL(/\/admin\/branding/, { timeout: 5000 });
  }

  /** Navigate to Messages tab */
  async navigateToMessages(): Promise<void> {
    // Wait for dashboard to fully load before attempting navigation
    await this.waitForDashboardLoad();
    // Expand menu if needed (mobile/tablet) before clicking tab
    await this.expandHamburgerMenuIfNeeded();
    // Verify tab is accessible before attempting to click (fails fast if menu didn't expand)
    const isTabVisible = await this.messagesTab.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isTabVisible) {
      throw new Error(
        'Messages tab is not accessible. Hamburger menu may not have expanded (BUG-014). ' +
        'Tab exists in DOM but is not visible.'
      );
    }
    await this.messagesTab.click();
    await this.page.waitForURL(/\/admin\/message/, { timeout: 5000 });
  }

  /** Logout and return to home page */
  async logout(): Promise<void> {
    // Wait for dashboard to fully load before attempting logout
    await this.waitForDashboardLoad();
    // Expand menu if needed (mobile/tablet) before clicking logout
    await this.expandHamburgerMenuIfNeeded();

    // Verify logout button is accessible before attempting to click
    // This fails fast if menu didn't expand (BUG-014), instead of waiting 30s for timeout
    const isLogoutVisible = await this.logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isLogoutVisible) {
      throw new Error(
        'Logout button is not accessible. Hamburger menu may not have expanded (BUG-014). ' +
        'Button exists in DOM but is not visible.'
      );
    }

    await this.logoutButton.click();
    // Logout redirects to home page (/), not back to /admin
    await this.page.waitForURL('**/', { timeout: 5000 });
  }

  // ─── Private Helpers ─────────────────────────────────────

  /**
   * Wait for dashboard page to fully load.
   * Ensures "Loading..." state is gone and page content is rendered.
   * This is dashboard-specific loading logic, different from base page load.
   */
  private async waitForDashboardLoad(): Promise<void> {
    // Wait for loading indicator to disappear
    const loadingIndicator = this.page.locator('text=Loading...');
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // If loading indicator doesn't exist or already gone, continue
    });

    // Wait for page to be in a stable state (use base class method)
    await super.waitForPageLoad();
  }

  /**
   * Expand hamburger menu if visible and collapsed (mobile/tablet responsive behavior).
   * This is a private helper used by public methods that need to access menu items.
   */
  private async expandHamburgerMenuIfNeeded(): Promise<void> {
    const hamburgerButton = this.page.getByRole('button', { name: 'Toggle navigation' });
    const isHamburgerVisible = await hamburgerButton.isVisible().catch(() => false);

    if (isHamburgerVisible) {
      const navbar = this.page.locator('#navbarSupportedContent');
      const hasShowClass = await navbar.evaluate((el) => el.classList.contains('show')).catch(() => false);

      if (!hasShowClass) {
        await hamburgerButton.click();
        await this.page.waitForFunction(
          () => {
            const nav = document.querySelector('#navbarSupportedContent');
            return nav && nav.classList.contains('show');
          },
          { timeout: 3000 }
        ).catch(() => {
          return this.page.waitForTimeout(500);
        });
      }
    }
  }

  // ─── Validation Helpers ───────────────────────────────────

  /** Check if currently on dashboard (any admin route after login) */
  async isOnDashboard(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/admin/') && !url.endsWith('/admin');
  }

  /**
   * Verify dashboard is accessible and key elements are available.
   * Handles responsive design: expands hamburger menu on mobile/tablet if needed.
   * This method encapsulates all responsive logic, so tests don't need to worry about viewport.
   */
  async verifyDashboardAccessible(): Promise<void> {
    // First, verify we're on dashboard (URL check is most reliable)
    const isOnDashboard = await this.isOnDashboard();
    if (!isOnDashboard) {
      throw new Error('Not on dashboard. Current URL: ' + this.page.url());
    }

    // Expand menu if needed (mobile/tablet)
    await this.expandHamburgerMenuIfNeeded();

    // Verify at least one key element is accessible (logout button is most critical)
    // This confirms we're logged in and dashboard is functional
    await this.logoutButton.waitFor({ state: 'visible', timeout: 5000 });
  }
}
