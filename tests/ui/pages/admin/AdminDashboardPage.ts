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
    await this.roomsTab.click();
    await this.page.waitForURL('**/admin/rooms', { timeout: 5000 });
  }

  /** Navigate to Report tab */
  async navigateToReport(): Promise<void> {
    await this.reportTab.click();
    await this.page.waitForURL('**/admin/report', { timeout: 5000 });
  }

  /** Navigate to Branding tab */
  async navigateToBranding(): Promise<void> {
    await this.brandingTab.click();
    await this.page.waitForURL('**/admin/branding', { timeout: 5000 });
  }

  /** Navigate to Messages tab */
  async navigateToMessages(): Promise<void> {
    await this.messagesTab.click();
    await this.page.waitForURL('**/admin/message', { timeout: 5000 });
  }

  /** Logout and return to home page */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    // Logout redirects to home page (/), not back to /admin
    await this.page.waitForURL('**/', { timeout: 5000 });
  }

  // ─── Validation Helpers ───────────────────────────────────

  /** Check if currently on dashboard (any admin route after login) */
  async isOnDashboard(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/admin/') && !url.endsWith('/admin');
  }
}
