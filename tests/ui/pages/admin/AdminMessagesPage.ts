import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage.js';

/**
 * Page Object for the /admin/message tab.
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  Messages List                         │
 * │  Name | Subject | [X]                  │
 * │  ──────────────────────────────────── │
 * │  James Dean | Booking enquiry | [X]    │
 * │  Marcos | Subject... | [X]            │
 * │  ...                                   │
 * └─────────────────────────────────────────┘
 *
 * Business impact:
 * - Messages are guest inquiries — broken = lost customer communication
 * - Badge count must match actual messages
 */
export class AdminMessagesPage extends BasePage {
  protected readonly url = '/admin/message';
  protected readonly readyLocator = this.page.locator('p').filter({ hasText: 'Name' }).first();

  // ─── Messages List ─────────────────────────────────────────
  readonly messagesList: Locator;
  readonly messageItems: Locator;
  readonly deleteMessageButtons: Locator;

  // ─── Message Badge ──────────────────────────────────────────
  readonly messagesBadge: Locator;

  constructor(page: Page) {
    super(page);

    // Messages list container - verify by checking if header "Name" is visible
    // The actual container structure may vary, so we check for the header presence
    this.messagesList = page.locator('p').filter({ hasText: 'Name' }).first();
    // Message items: divs that contain a delete button (×) - this excludes the header
    // Each message item is a div with at least one paragraph and a delete button
    this.messageItems = page.locator('div').filter({ 
      has: page.locator('button').filter({ hasText: '×' }) 
    });
    this.deleteMessageButtons = page.locator('button').filter({ hasText: '×' });

    // Badge in navigation (e.g., "Messages 10")
    this.messagesBadge = page.locator('text=/Messages \\d+/').first();
  }

  // ─── Message List Actions ───────────────────────────────────

  /** Get count of messages */
  async getMessageCount(): Promise<number> {
    // Count divs that have a delete button (×) - this excludes the header
    return await this.messageItems.count();
  }

  /** Get message names (first column) */
  async getMessageNames(): Promise<string[]> {
    // Names are in the first paragraph of each message item
    const items = await this.messageItems.all();
    const names: string[] = [];
    for (const item of items) {
      const paragraphs = await item.locator('p').all();
      if (paragraphs.length > 0) {
        const text = await paragraphs[0].textContent();
        if (text && text.trim().length > 0 && text.trim() !== 'Name') {
          names.push(text.trim());
        }
      }
    }
    return names;
  }

  /** Get message subjects (second column) */
  // NOTE: This method is currently unused but kept for potential future tests.
  async getMessageSubjects(): Promise<string[]> {
    const items = await this.messageItems.all();
    const subjects: string[] = [];
    for (const item of items) {
      const paragraphs = await item.locator('p').all();
      if (paragraphs.length > 1) {
        const text = await paragraphs[1].textContent();
        if (text) subjects.push(text.trim());
      }
    }
    return subjects;
  }

  /** Delete a message by its index (0-based) */
  // NOTE: This method is currently unused but kept for potential future delete message tests.
  async deleteMessageByIndex(index: number): Promise<void> {
    const deleteButtons = await this.deleteMessageButtons.all();
    if (deleteButtons[index]) {
      await deleteButtons[index].click();
    }
  }

  // ─── Badge Actions ──────────────────────────────────────────

  /** Get the badge count (e.g., "10" from "Messages 10") */
  async getBadgeCount(): Promise<number | null> {
    const badgeText = await this.messagesBadge.textContent();
    if (!badgeText) return null;
    const match = badgeText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }
}

