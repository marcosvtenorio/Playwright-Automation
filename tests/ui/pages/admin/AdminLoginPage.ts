import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage.js';
import type { AdminCredentials } from '../../../fixtures/auth.fixture.js';

/**
 * Page Object for the /admin login page.
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  Navbar: "Restful Booker Platform Demo" │
 * │  Links: Front Page | Logout             │
 * ├─────────────────────────────────────────┤
 * │  Heading: "Login" (h2)                  │
 * │  ┌───────────────────────────────────┐ │
 * │  │ Username: [textbox]                │ │
 * │  │ Password: [textbox]                │ │
 * │  │ [Login button]                     │ │
 * │  └───────────────────────────────────┘ │
 * │  Alert: error message (if invalid)     │
 * └─────────────────────────────────────────┘
 *
 * Behavior:
 * - Valid credentials → redirects to /admin/rooms
 * - Invalid credentials → shows "Invalid credentials" alert, stays on /admin
 */
export class AdminLoginPage extends BasePage {
  protected readonly url = '/admin';

  // ─── Form Elements ───────────────────────────────────────
  readonly loginHeading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  // ─── Error Messages ───────────────────────────────────────
  readonly errorAlert: Locator;

  // ─── Navigation ───────────────────────────────────────────
  readonly frontPageLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);

    // Form elements
    this.loginHeading = page.getByRole('heading', { name: 'Login', level: 2 });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });

    // Error messages — alert appears after failed login
    // Use locator with text filter to find the alert containing error message
    this.errorAlert = page.locator('[role="alert"]').filter({ hasText: /Invalid credentials/i }).first();

    // Navigation
    this.frontPageLink = page.getByRole('link', { name: 'Front Page' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  // ─── Login Actions ───────────────────────────────────────

  /** Fill username and password fields */
  async fillCredentials(credentials: AdminCredentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
  }

  /** Submit the login form */
  async submitLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /** Fill credentials and submit in one step */
  async login(credentials: AdminCredentials): Promise<void> {
    await this.fillCredentials(credentials);
    await this.submitLogin();
  }

  // ─── Validation Helpers ───────────────────────────────────

  /** Get the error message text (if present) */
  async getErrorMessage(): Promise<string | null> {
    try {
      // Wait for alert to appear (with timeout)
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorAlert.textContent();
    } catch {
      // Alert not visible or doesn't exist
      return null;
    }
  }

  /** Check if currently logged in (logout button visible) */
  async isLoggedIn(): Promise<boolean> {
    return await this.logoutButton.isVisible().catch(() => false);
  }
}
