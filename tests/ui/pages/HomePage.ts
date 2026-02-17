import { Page, Locator, Response } from '@playwright/test';
import { BasePage } from './BasePage.js';
import type { ContactFormData } from '../../fixtures/contact.data.js';

/**
 * Page Object for the automationintesting.online home page.
 *
 * Sections mapped from live analysis:
 * - Navbar (sticky top with brand + nav links)
 * - Hero (welcome heading + "Book Now" CTA)
 * - Booking widget (check-in/out date pickers + "Check Availability")
 * - Rooms (#rooms — 3 room cards with image, amenities, price, "Book now" link)
 * - Location (#location — Pigeon map + contact info card)
 * - Contact (#contact — "Send Us a Message" form)
 * - Footer (3-column: about, contact, quick links)
 */
export class HomePage extends BasePage {
  protected readonly url = '/';
  protected readonly readyLocator = this.page.locator('.navbar-brand');

  // ─── Navbar ───────────────────────────────────────────
  readonly navbar: Locator;
  readonly navbarBrand: Locator;
  readonly navbarToggler: Locator;
  readonly navLinks: Locator;
  readonly adminLink: Locator;

  // ─── Hero ─────────────────────────────────────────────
  readonly heroHeading: Locator;
  readonly heroBookNowLink: Locator;

  // ─── Booking Widget ───────────────────────────────────
  readonly bookingSection: Locator;
  readonly checkinInput: Locator;
  readonly checkoutInput: Locator;
  readonly checkAvailabilityButton: Locator;

  // ─── Rooms Section ────────────────────────────────────
  readonly roomsSection: Locator;
  readonly roomsSectionHeading: Locator;
  readonly roomCards: Locator;
  readonly bookNowLinks: Locator;

  // ─── Location Section ─────────────────────────────────
  readonly locationSection: Locator;
  readonly contactInfoCard: Locator;

  // ─── Contact Form ─────────────────────────────────────
  readonly contactSection: Locator;
  readonly contactNameInput: Locator;
  readonly contactEmailInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly contactSubjectInput: Locator;
  readonly contactMessageInput: Locator;
  readonly contactSubmitButton: Locator;
  readonly contactErrors: Locator;
  readonly contactSuccessMessage: Locator;

  // ─── Footer ───────────────────────────────────────────
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);

    // Navbar
    this.navbar = page.locator('.navbar');
    this.navbarBrand = page.locator('.navbar-brand');
    this.navbarToggler = page.locator('.navbar-toggler');
    this.navLinks = page.locator('.nav-link');
    this.adminLink = page.locator('a.nav-link', { hasText: 'Admin' });

    // Hero
    this.heroHeading = page.getByRole('heading', { name: 'Welcome to Shady Meadows B&B' });
    this.heroBookNowLink = page.getByRole('link', { name: 'Book Now', exact: true });

    // Booking widget
    this.bookingSection = page.locator('#booking');
    this.checkinInput = this.bookingSection.getByRole('textbox').first();
    this.checkoutInput = this.bookingSection.getByRole('textbox').last();
    this.checkAvailabilityButton = page.getByRole('button', { name: 'Check Availability' });

    // Rooms
    this.roomsSection = page.locator('#rooms');
    this.roomsSectionHeading = page.locator('#rooms h2');
    this.roomCards = page.locator('.room-card');
    this.bookNowLinks = page.locator('.room-card a.btn-primary');

    // Location
    this.locationSection = page.locator('#location');
    this.contactInfoCard = page.locator('.card-body', { hasText: 'Contact Information' });

    // Contact form
    this.contactSection = page.locator('#contact');
    this.contactNameInput = page.locator('[data-testid="ContactName"]');
    this.contactEmailInput = page.locator('[data-testid="ContactEmail"]');
    this.contactPhoneInput = page.locator('[data-testid="ContactPhone"]');
    this.contactSubjectInput = page.locator('[data-testid="ContactSubject"]');
    this.contactMessageInput = page.locator('[data-testid="ContactDescription"]');
    this.contactSubmitButton = page.getByRole('button', { name: 'Submit' });
    this.contactErrors = page.locator('.alert-danger p');
    this.contactSuccessMessage = page.locator('#contact h3', { hasText: 'Thanks for getting in touch' });

    // Footer
    this.footer = page.locator('footer');
  }

  // ─── Navigation Actions ───────────────────────────────

  async getNavLinkTexts(): Promise<string[]> {
    return this.navLinks.allTextContents();
  }

  async getVisibleNavLinkTexts(): Promise<string[]> {
    const all = await this.navLinks.all();
    const visible: string[] = [];
    for (const link of all) {
      if (await link.isVisible()) {
        const text = await link.textContent();
        if (text) visible.push(text.trim());
      }
    }
    return visible;
  }

  async expandHamburgerMenu(): Promise<void> {
    await this.navbarToggler.click();
    await this.navLinks.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  async navigateToAdmin(): Promise<void> {
    await this.adminLink.click();
  }

  // ─── Room Actions ─────────────────────────────────────

  async getRoomCount(): Promise<number> {
    return this.roomCards.count();
  }

  async getRoomNames(): Promise<string[]> {
    return this.roomCards.locator('.card-title').allTextContents();
  }

  async getRoomPrices(): Promise<string[]> {
    return this.roomCards.locator('.card-footer .fw-bold').allTextContents();
  }

  async clickBookNowForRoom(index: number): Promise<void> {
    await this.bookNowLinks.nth(index).click();
  }

  // ─── Contact Form Actions ─────────────────────────────

  async submitContactForm(data: ContactFormData): Promise<void> {
    await this.contactNameInput.fill(data.name);
    await this.contactEmailInput.fill(data.email);
    await this.contactPhoneInput.fill(data.phone);
    await this.contactSubjectInput.fill(data.subject);
    await this.contactMessageInput.fill(data.message);
    await this.contactSubmitButton.click();
  }

  async getContactErrors(): Promise<string[]> {
    await this.contactErrors.first().waitFor({ state: 'visible', timeout: 10000 });
    return this.contactErrors.allTextContents();
  }

  // ─── Section Visibility ───────────────────────────────

  async scrollToContact(): Promise<void> {
    await this.contactSection.scrollIntoViewIfNeeded();
  }

  async scrollToRooms(): Promise<void> {
    await this.roomsSection.scrollIntoViewIfNeeded();
  }

  // ─── Booking Widget Actions ──────────────────────────

  /**
   * Pick a date from the Check In datepicker.
   * @param day - Day of the month to select (1-31)
   * @param monthOffset - Number of months to navigate: positive = forward, negative = backward, 0 = current
   */
  async selectCheckinDate(day: number, monthOffset = 0): Promise<void> {
    await this.checkinInput.click();
    await this.navigateDatepicker(monthOffset);
    await this.pickDay(day);
  }

  /**
   * Pick a date from the Check Out datepicker.
   * @param day - Day of the month to select (1-31)
   * @param monthOffset - Number of months to navigate
   */
  async selectCheckoutDate(day: number, monthOffset = 0): Promise<void> {
    await this.checkoutInput.click();
    await this.navigateDatepicker(monthOffset);
    await this.pickDay(day);
  }

  /** Click "Check Availability" button (scrolls to rooms section) */
  async clickCheckAvailabilityButton(): Promise<void> {
    await this.checkAvailabilityButton.click();
  }

  /** Get the href values from all "Book now" links in room cards */
  async getBookNowHrefs(): Promise<string[]> {
    const links = await this.bookNowLinks.all();
    const hrefs: string[] = [];
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href) hrefs.push(href);
    }
    return hrefs;
  }

  // ─── Private Helpers ────────────────────────────────────

  /**
   * Select a day inside the currently open datepicker dialog.
   * Uses the pattern `, DAY ` to match the accessible name precisely
   * (e.g. "Choose Friday, 20 March 2026") and avoid partial matches with year "2026".
   */
  private async pickDay(day: number): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Choose Date' });
    await dialog.getByRole('gridcell', { name: new RegExp(`, ${day} `) }).first().click();
  }

  /** Navigate months inside an open datepicker dialog */
  private async navigateDatepicker(monthOffset: number): Promise<void> {
    if (monthOffset === 0) return;
    const dialog = this.page.getByRole('dialog', { name: 'Choose Date' });
    await dialog.waitFor({ state: 'visible' });
    const buttonName = monthOffset > 0 ? 'Next Month' : 'Previous Month';
    for (let i = 0; i < Math.abs(monthOffset); i++) {
      await dialog.getByRole('button', { name: buttonName }).click();
    }
  }

  // ─── Check Availability Functional Tests ────────────────

  /**
   * Wait for the availability API call and return the response.
   * Throws on timeout — callers get a descriptive Playwright error instead of silent null.
   * @param expectedCheckin - Expected check-in date in YYYY-MM-DD format
   * @param expectedCheckout - Expected check-out date in YYYY-MM-DD format
   */
  async waitForAvailabilitySearch(expectedCheckin: string, expectedCheckout: string): Promise<Response> {
    return this.page.waitForResponse(
      (response) => {
        const url = response.url();
        return (
          url.includes('/api/room') &&
          url.includes(`checkin=${expectedCheckin}`) &&
          url.includes(`checkout=${expectedCheckout}`)
        );
      },
      { timeout: 10000 }
    );
  }

  /**
   * Extract checkin and checkout Date objects from a reservation href.
   */
  parseDatesFromHref(href: string): { checkin: Date; checkout: Date } {
    const checkinMatch = href.match(/checkin=(\d{4}-\d{2}-\d{2})/);
    const checkoutMatch = href.match(/checkout=(\d{4}-\d{2}-\d{2})/);
    if (!checkinMatch || !checkoutMatch) {
      throw new Error(`Invalid href format: ${href}`);
    }
    return {
      checkin: new Date(checkinMatch[1]),
      checkout: new Date(checkoutMatch[1]),
    };
  }

  /**
   * Format date for URL (converts DD/MM/YYYY to YYYY-MM-DD).
   */
  formatDateForUrl(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get the current check-in date value from the input field.
   */
  async getCheckinDateValue(): Promise<string> {
    return (await this.checkinInput.inputValue()) || '';
  }

  /**
   * Get the current check-out date value from the input field.
   */
  async getCheckoutDateValue(): Promise<string> {
    return (await this.checkoutInput.inputValue()) || '';
  }

}
