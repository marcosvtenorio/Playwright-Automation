import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage.js';

/**
 * Page Object for the /admin/report tab.
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  Calendar View                          │
 * │  [Today] [Back] [Next]  Month Year     │
 * │  ┌───────────────────────────────────┐ │
 * │  │ Sun Mon Tue Wed Thu Fri Sat       │ │
 * │  │  1   2   3   4   5   6   7        │ │
 * │  │  [Booking: Name - Room: ID]       │ │
 * │  │  8   9  10  11  12  13  14        │ │
 * │  └───────────────────────────────────┘ │
 * └─────────────────────────────────────────┘
 *
 * Business impact:
 * - Report shows all bookings in calendar view
 * - Broken report = staff can't see occupancy → overbooking risk
 */
export class AdminReportPage extends BasePage {
  protected readonly url = '/admin/report';

  // ─── Calendar Controls ─────────────────────────────────────
  readonly todayButton: Locator;
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly monthLabel: Locator;

  // ─── Calendar Table ─────────────────────────────────────────
  readonly calendarTable: Locator;
  readonly calendarCells: Locator;
  readonly bookingMarkers: Locator;

  constructor(page: Page) {
    super(page);

    // Calendar controls
    this.todayButton = page.getByRole('button', { name: 'Today' });
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    // Month label is in a generic element with text like "February 2026"
    this.monthLabel = page.locator('text=/^\\w+ \\d{4}$/').first();

    // Calendar table - use more specific selector
    this.calendarTable = page.getByRole('table', { name: 'Month View' });
    // Calendar cells are buttons inside td elements (cells with day numbers)
    this.calendarCells = this.calendarTable.locator('td').locator('button');
    // Booking markers are generic elements (not buttons) that contain "Room:"
    // They appear as separate generic elements within the table, not inside the button cells
    this.bookingMarkers = this.calendarTable.locator('generic').filter({ hasText: /Room:/ });
  }

  // ─── Calendar Actions ────────────────────────────────────────

  /** Navigate calendar forward by N months */
  async navigateForward(months = 1): Promise<void> {
    for (let i = 0; i < months; i++) {
      await this.nextButton.click();
    }
  }

  /** Navigate calendar backward by N months */
  async navigateBackward(months = 1): Promise<void> {
    for (let i = 0; i < months; i++) {
      await this.backButton.click();
    }
  }

  /** Reset calendar to current month */
  async navigateToToday(): Promise<void> {
    await this.todayButton.click();
  }

  /** Get current month label (e.g., "February 2026") */
  async getMonthLabel(): Promise<string> {
    return (await this.monthLabel.textContent()) || '';
  }

  /** Get count of booking markers visible in current month */
  async getBookingCount(): Promise<number> {
    return await this.bookingMarkers.count();
  }

  /** Get all booking text (e.g., "James Dean - Room: 101") */
  async getBookingTexts(): Promise<string[]> {
    return await this.bookingMarkers.allTextContents();
  }
}

