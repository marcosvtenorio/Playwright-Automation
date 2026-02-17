import { Page, Locator, Response } from '@playwright/test';
import { BasePage } from './BasePage.js';
import type { ReservationFormData } from '../../fixtures/booking.data.js';

/**
 * Page Object for the /reservation/:roomId page.
 *
 * Sections mapped from MCP live analysis:
 * ┌──────────────────────────────────────────────────────────┐
 * │  Breadcrumb: Home / Rooms / {Room Type} Room             │
 * ├──────────────────────────┬───────────────────────────────┤
 * │  Room Details (left)     │  Booking Panel (right)        │
 * │  • Title (h1)            │  • "Book This Room" (h2)      │
 * │  • Accessible badge      │  • Price per night            │
 * │  • Max Guests             │  • Calendar (Month View)      │
 * │  • Room Image            │    - Today / Back / Next       │
 * │  • Description           │    - Day grid with Unavailable │
 * │  • Features              │  • Price Summary               │
 * │  • Policies              │  • "Reserve Now" button        │
 * │    - Check-in/out times  │                               │
 * │    - House rules         │  [After clicking Reserve Now]  │
 * │                          │  • Booking Form                │
 * │                          │    - Firstname, Lastname       │
 * │                          │    - Email, Phone              │
 * │                          │    - Price Summary (sticky)    │
 * │                          │    - Reserve Now / Cancel      │
 * │                          │  • Validation Errors (alert)   │
 * ├──────────────────────────┴───────────────────────────────┤
 * │  Booking Confirmed (replaces panel on success)           │
 * │  • "Booking Confirmed" (h2)                              │
 * │  • Date range                                            │
 * │  • "Return home" link                                    │
 * ├──────────────────────────────────────────────────────────┤
 * │  Similar Rooms                                           │
 * │  • Room cards with View Details links                    │
 * ├──────────────────────────────────────────────────────────┤
 * │  Footer                                                  │
 * └──────────────────────────────────────────────────────────┘
 *
 * API Endpoints:
 * - GET  /api/room/:id        → room details
 * - GET  /api/report/room/:id → unavailable dates
 * - POST /api/booking         → create booking (201/400/409)
 *
 * Validation Rules (empirically confirmed via MCP and Manually validated):
 * ┌───────────┬─────┬─────┬──────────┬────────────────────────────────────┐
 * │ Field     │ Min │ Max │ Required │ Error message                      │
 * ├───────────┼─────┼─────┼──────────┼────────────────────────────────────┤
 * │ firstname │  3  │  18 │   Yes    │ "size must be between 3 and 18"    │
 * │ lastname  │  3  │  30 │   Yes    │ "size must be between 3 and 30"    │
 * │ email     │  —  │  —  │   Yes    │ "must be a well-formed email"      │
 * │ phone     │ 11  │  21 │   Yes    │ "size must be between 11 and 21"   │
 * └───────────┴─────┴─────┴──────────┴────────────────────────────────────┘
 *
 * Known Bugs:
 * - BUG: 409-frontend-crash — API returns 409 on date conflict → frontend
 *   crashes with TypeError (Cannot read properties of undefined: 'length')
 * - BUG: ambiguous-validation-messages — API error messages don't include
 *   field names, making it impossible for users to identify which field failed
 */
export class BookingPage extends BasePage {
  protected readonly url: string;
  protected readonly readyLocator = this.page.getByRole('button', { name: 'Reserve Now' });

  // ─── Breadcrumb ─────────────────────────────────────────
  readonly breadcrumb: Locator;
  readonly breadcrumbHome: Locator;
  readonly breadcrumbRooms: Locator;
  readonly breadcrumbRoomName: Locator;

  // ─── Room Details ───────────────────────────────────────
  readonly roomTitle: Locator;
  readonly roomAccessibleBadge: Locator;
  readonly roomGuestCount: Locator;
  readonly roomImage: Locator;
  readonly roomDescriptionHeading: Locator;
  readonly roomDescription: Locator;
  readonly roomFeaturesHeading: Locator;
  readonly roomFeatures: Locator;
  readonly roomPoliciesHeading: Locator;

  // ─── Policies ───────────────────────────────────────────
  readonly checkinCheckoutHeading: Locator;
  readonly checkinTime: Locator;
  readonly checkoutTime: Locator;
  readonly earlyLatePolicy: Locator;
  readonly houseRulesHeading: Locator;
  readonly houseRules: Locator;

  // ─── Booking Panel ──────────────────────────────────────
  readonly bookThisRoomHeading: Locator;
  readonly pricePerNight: Locator;

  // ─── Calendar ───────────────────────────────────────────
  readonly calendarTodayButton: Locator;
  readonly calendarBackButton: Locator;
  readonly calendarNextButton: Locator;
  readonly calendarMonthLabel: Locator;
  readonly calendarTable: Locator;
  readonly calendarUnavailableMarkers: Locator;

  // ─── Price Summary ──────────────────────────────────────
  readonly priceSummaryHeading: Locator;
  readonly nightsBreakdown: Locator;
  readonly cleaningFee: Locator;
  readonly serviceFee: Locator;
  readonly totalPrice: Locator;

  // ─── Reserve / Cancel ───────────────────────────────────
  readonly reserveNowButton: Locator;
  readonly cancelButton: Locator;

  // ─── Booking Form (visible after Reserve Now) ──────────
  readonly firstnameInput: Locator;
  readonly lastnameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;

  // ─── Validation Errors ──────────────────────────────────
  readonly validationAlert: Locator;
  readonly validationErrors: Locator;

  // ─── Booking Confirmation ───────────────────────────────
  readonly confirmationHeading: Locator;
  readonly confirmationMessage: Locator;
  readonly confirmationDates: Locator;
  readonly returnHomeLink: Locator;

  // ─── Similar Rooms ──────────────────────────────────────
  readonly similarRoomsHeading: Locator;
  readonly similarRoomCards: Locator;
  readonly similarRoomViewDetailsLinks: Locator;

  // ─── Footer ─────────────────────────────────────────────
  readonly footer: Locator;

  constructor(page: Page, roomId = 1, checkin?: string, checkout?: string) {
    super(page);

    // Build dynamic URL based on room ID and optional dates
    let url = `/reservation/${roomId}`;
    if (checkin && checkout) {
      url += `?checkin=${checkin}&checkout=${checkout}`;
    }
    this.url = url;

    // Breadcrumb
    this.breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' });
    this.breadcrumbHome = this.breadcrumb.getByRole('link', { name: 'Home' });
    this.breadcrumbRooms = this.breadcrumb.getByRole('link', { name: 'Rooms' });
    this.breadcrumbRoomName = this.breadcrumb.locator('li').last();

    // Room Details
    this.roomTitle = page.getByRole('heading', { level: 1 });
    this.roomAccessibleBadge = page.locator('text=Accessible').first();
    this.roomGuestCount = page.locator('text=/Max \\d+ Guests/').first();
    this.roomImage = page.getByRole('img', { name: 'Room Image' });
    this.roomDescriptionHeading = page.getByRole('heading', { name: 'Room Description' });
    this.roomDescription = this.roomDescriptionHeading.locator('..').locator('p');
    this.roomFeaturesHeading = page.getByRole('heading', { name: 'Room Features' });
    this.roomFeatures = this.roomFeaturesHeading.locator('..').locator('div > div:last-child');
    this.roomPoliciesHeading = page.getByRole('heading', { name: 'Room Policies' });

    // Policies
    this.checkinCheckoutHeading = page.getByRole('heading', { name: 'Check-in & Check-out' });
    this.checkinTime = page.locator('strong:has-text("Check-in:")').locator('..');
    this.checkoutTime = page.locator('strong:has-text("Check-out:")').locator('..');
    this.earlyLatePolicy = page.locator('strong:has-text("Early/Late:")').locator('..');
    this.houseRulesHeading = page.getByRole('heading', { name: 'House Rules' });
    this.houseRules = this.houseRulesHeading.locator('..').getByRole('listitem');

    // Booking Panel
    this.bookThisRoomHeading = page.getByRole('heading', { name: 'Book This Room' });
    this.pricePerNight = this.bookThisRoomHeading.locator('..').locator('div').first();

    // Calendar
    this.calendarTodayButton = page.getByRole('button', { name: 'Today' });
    this.calendarBackButton = page.getByRole('button', { name: 'Back' });
    this.calendarNextButton = page.getByRole('button', { name: 'Next' });
    this.calendarMonthLabel = this.calendarTodayButton.locator('..').locator('..').locator('div').last();
    this.calendarTable = page.getByRole('table', { name: 'Month View' });
    this.calendarUnavailableMarkers = page.locator('[aria-label="Unavailable"]');

    // Price Summary
    this.priceSummaryHeading = page.getByRole('heading', { name: 'Price Summary' });
    this.nightsBreakdown = this.priceSummaryHeading.locator('..').locator('div').first();
    this.cleaningFee = page.locator('text=Cleaning fee').locator('..');
    this.serviceFee = page.locator('text=Service fee').locator('..');
    this.totalPrice = page.locator('text=Total').locator('..').locator('div').last();

    // Reserve / Cancel buttons
    this.reserveNowButton = page.getByRole('button', { name: 'Reserve Now' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Booking Form
    this.firstnameInput = page.getByRole('textbox', { name: 'Firstname' });
    this.lastnameInput = page.getByRole('textbox', { name: 'Lastname' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone' });

    // Validation Errors — .first() avoids resolving to a root-level empty alert
    this.validationAlert = page.locator('.alert.alert-danger').first();
    this.validationErrors = this.validationAlert.getByRole('listitem');

    // Booking Confirmation
    this.confirmationHeading = page.getByRole('heading', { name: 'Booking Confirmed' });
    this.confirmationMessage = page.locator('text=Your booking has been confirmed');
    this.confirmationDates = this.confirmationHeading.locator('..').locator('strong');
    this.returnHomeLink = page.getByRole('link', { name: 'Return home' });

    // Similar Rooms
    this.similarRoomsHeading = page.getByRole('heading', { name: 'Similar Rooms You Might Like' });
    this.similarRoomCards = this.similarRoomsHeading.locator('..').locator('div > div');
    this.similarRoomViewDetailsLinks = page.getByRole('link', { name: 'View Details' });

    // Footer
    this.footer = page.locator('footer');
  }

  // ─── Booking Form Actions ────────────────────────────────

  /** Open the booking form by clicking "Reserve Now" */
  async openBookingForm(): Promise<void> {
    await this.reserveNowButton.click();
    await this.firstnameInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  /** Cancel the booking form and return to calendar view */
  async cancelBookingForm(): Promise<void> {
    await this.cancelButton.click();
    await this.calendarTable.waitFor({ state: 'visible', timeout: 5000 });
  }

  /** Fill the booking form with provided data */
  async fillBookingForm(data: ReservationFormData): Promise<void> {
    await this.firstnameInput.fill(data.firstname);
    await this.lastnameInput.fill(data.lastname);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
  }

  /** Submit the booking form (click Reserve Now inside the form) */
  async submitBookingForm(): Promise<void> {
    await this.reserveNowButton.click();
  }

  /** Fill and submit the booking form in one step */
  async completeBooking(data: ReservationFormData): Promise<void> {
    await this.openBookingForm();
    await this.fillBookingForm(data);
    await this.submitBookingForm();
  }

  // ─── Validation Error Actions ────────────────────────────

  /** Get all validation error messages as an array of strings */
  async getValidationErrors(): Promise<string[]> {
    // Wait for at least one error listitem to appear (avoids false-positive
    // from the root-level `alert` that is always visible but empty).
    await this.validationErrors.first().waitFor({ state: 'visible', timeout: 10000 });
    return this.validationErrors.allTextContents();
  }

  // ─── Calendar Actions ────────────────────────────────────

  /** Navigate calendar forward by N months */
  async navigateCalendarForward(months = 1): Promise<void> {
    for (let i = 0; i < months; i++) {
      await this.calendarNextButton.click();
    }
  }

  /** Navigate calendar backward by N months */
  async navigateCalendarBack(months = 1): Promise<void> {
    for (let i = 0; i < months; i++) {
      await this.calendarBackButton.click();
    }
  }

  /** Reset calendar to current month */
  async navigateCalendarToday(): Promise<void> {
    await this.calendarTodayButton.click();
  }

  /** Get the current month label from the calendar (e.g., "February 2026") */
  async getCalendarMonthLabel(): Promise<string> {
    return (await this.calendarMonthLabel.textContent()) || '';
  }

  /** Get the count of unavailable date markers in the current calendar view */
  async getUnavailableCount(): Promise<number> {
    return this.calendarUnavailableMarkers.count();
  }

  // ─── Room Details Actions ────────────────────────────────

  /** Get the room title text (e.g., "Single Room") */
  async getRoomTitle(): Promise<string> {
    return (await this.roomTitle.textContent()) || '';
  }

  /** Get the list of room features (e.g., ["TV", "WiFi", "Safe"]) */
  async getRoomFeatures(): Promise<string[]> {
    return this.roomFeatures.allTextContents();
  }

  /** Get the list of house rules */
  async getHouseRules(): Promise<string[]> {
    return this.houseRules.allTextContents();
  }

  /** Get the price per night text (e.g., "£100") */
  async getPricePerNight(): Promise<string> {
    return (await this.pricePerNight.textContent()) || '';
  }

  /** Get the total price from the summary */
  async getTotalPrice(): Promise<string> {
    return (await this.totalPrice.textContent()) || '';
  }

  // ─── Similar Rooms Actions ───────────────────────────────

  /** Scroll to the similar rooms section and wait for cards to render */
  async scrollToSimilarRooms(): Promise<void> {
    await this.similarRoomsHeading.scrollIntoViewIfNeeded();
    await this.similarRoomViewDetailsLinks.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /** Get the count of similar room cards */
  async getSimilarRoomCount(): Promise<number> {
    return this.similarRoomViewDetailsLinks.count();
  }

  /** Get similar room names */
  async getSimilarRoomNames(): Promise<string[]> {
    const headings = this.similarRoomsHeading.locator('..').getByRole('heading', { level: 3 });
    return headings.allTextContents();
  }

  // ─── Confirmation Actions ────────────────────────────────

  /** Get the confirmed date range text (e.g., "2026-04-10 - 2026-04-15") */
  async getConfirmedDates(): Promise<string> {
    return (await this.confirmationDates.textContent()) || '';
  }

  // ─── API Intercept Helpers ───────────────────────────────

  /**
   * Intercept the POST /api/booking request and return the native Playwright Response.
   * Consistent with HomePage.waitForAvailabilitySearch — always use response.status().
   */
  async waitForBookingApiResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) => res.url().includes('/api/booking') && res.request().method() === 'POST',
      { timeout: 15000 }
    );
  }
}
