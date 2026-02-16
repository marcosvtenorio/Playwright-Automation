import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage.js';

/**
 * Page Object for the /admin/rooms tab.
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  Rooms List (table)                    │
 * │  Room # | Type | Accessible | Price | Details | [X] │
 * ├─────────────────────────────────────────┤
 * │  Create Room Form                      │
 * │  Room #: [textbox]                     │
 * │  Type: [dropdown: Single/Twin/Double/Family/Suite] │
 * │  Accessible: [dropdown: true/false]    │
 * │  Price: [textbox]                      │
 * │  Features: [checkboxes: WiFi, TV, Radio, Refreshments, Safe, Views] │
 * │  [Create button]                       │
 * └─────────────────────────────────────────┘
 *
 * Business impact:
 * - Rooms are the hotel inventory — broken CRUD = can't manage availability
 * - Creating invalid rooms → broken booking flow
 */
export class AdminRoomsPage extends BasePage {
  protected readonly url = '/admin/rooms';

  // ─── Rooms List ────────────────────────────────────────────
  readonly roomsContainer: Locator;
  readonly roomRows: Locator;
  readonly deleteRoomButtons: Locator;

  // ─── Create Room Form ───────────────────────────────────────
  readonly roomNumberInput: Locator;
  readonly roomTypeSelect: Locator;
  readonly accessibleSelect: Locator;
  readonly priceInput: Locator;
  readonly wifiCheckbox: Locator;
  readonly tvCheckbox: Locator;
  readonly radioCheckbox: Locator;
  readonly refreshmentsCheckbox: Locator;
  readonly safeCheckbox: Locator;
  readonly viewsCheckbox: Locator;
  readonly createButton: Locator;

  // ─── Success/Error Messages ─────────────────────────────────
  readonly alertMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Rooms list container - verify by checking if header "Room #" is visible
    // The actual container structure may vary, so we check for the header presence
    this.roomsContainer = page.locator('p').filter({ hasText: 'Room #' }).first();
    // Room rows: divs that contain a paragraph with room number (3-4 digits) AND a delete button (×)
    this.roomRows = page.locator('div').filter({ has: page.locator('p[id^="roomName"]') }).filter({ has: page.locator('button').filter({ hasText: '×' }) });
    this.deleteRoomButtons = page.locator('button').filter({ hasText: '×' });

    // Create room form - the first textbox is the room number input
    // Use a more specific selector: textbox that is not inside a select or other complex element
    this.roomNumberInput = page.locator('input[type="text"]').first();
    this.roomTypeSelect = page.locator('select').first();
    this.accessibleSelect = page.locator('select').nth(1);
    // Price is the second textbox (after room number)
    this.priceInput = page.locator('input[type="text"]').nth(1);
    this.wifiCheckbox = page.getByRole('checkbox', { name: 'WiFi' });
    this.tvCheckbox = page.getByRole('checkbox', { name: 'TV' });
    this.radioCheckbox = page.getByRole('checkbox', { name: 'Radio' });
    this.refreshmentsCheckbox = page.getByRole('checkbox', { name: 'Refreshments' });
    this.safeCheckbox = page.getByRole('checkbox', { name: 'Safe' });
    this.viewsCheckbox = page.getByRole('checkbox', { name: 'Views' });
    this.createButton = page.getByRole('button', { name: 'Create' });

    // Alert messages - errors appear in a generic container with paragraphs after form submission
    // NOTE: This locator is complex because the app doesn't use role="alert" for room validation errors.
    // The error messages appear in a generic div with paragraphs (unlike BrandingPage which uses role="alert").
    // This is a necessary "workaround" until the app adds semantic HTML attributes.
    this.alertMessage = page.locator('div').filter({ has: page.locator('p').filter({ hasText: /Room name|must be|greater than or equal/i }) }).first();
  }

  // ─── Room List Actions ─────────────────────────────────────

  /** Get count of rooms in the list */
  async getRoomCount(): Promise<number> {
    // Count paragraphs with room numbers (3-4 digits) that are NOT in the form
    // Room numbers have IDs like "roomName101", "roomName102", etc.
    const roomNumberParagraphs = await this.page.locator('p[id^="roomName"]').filter({ hasText: /^\d{3,4}$/ }).count();
    return roomNumberParagraphs;
  }

  /** Get room numbers from the list */
  async getRoomNumbers(): Promise<string[]> {
    // Get room numbers from paragraphs with IDs like "roomName101"
    const roomNumberParagraphs = await this.page.locator('p[id^="roomName"]').filter({ hasText: /^\d{3,4}$/ }).all();
    const numbers: string[] = [];
    for (const p of roomNumberParagraphs) {
      const text = await p.textContent();
      if (text && /^\d{3,4}$/.test(text.trim())) {
        numbers.push(text.trim());
      }
    }
    return numbers;
  }

  /** Delete a room by its row index (0-based) */
  // NOTE: This method is currently unused but kept for potential future delete room tests.
  async deleteRoomByIndex(index: number): Promise<void> {
    const deleteButtons = await this.deleteRoomButtons.all();
    if (deleteButtons[index]) {
      await deleteButtons[index].click();
    }
  }

  // ─── Create Room Actions ───────────────────────────────────

  /** Fill the create room form */
  // NOTE: type is string (not union type) to allow backend flexibility for future room types
  async fillRoomForm(data: {
    roomNumber: string;
    type: string; // Valid values: 'Single', 'Twin', 'Double', 'Family', 'Suite' (but flexible for future types)
    accessible: boolean;
    price: string;
    features?: string[];
  }): Promise<void> {
    await this.roomNumberInput.fill(data.roomNumber);
    await this.roomTypeSelect.selectOption(data.type);
    await this.accessibleSelect.selectOption(data.accessible ? 'true' : 'false');
    await this.priceInput.fill(data.price);

    // Uncheck all first, then check selected features
    if (data.features) {
      await this.wifiCheckbox.setChecked(data.features.includes('WiFi'));
      await this.tvCheckbox.setChecked(data.features.includes('TV'));
      await this.radioCheckbox.setChecked(data.features.includes('Radio'));
      await this.refreshmentsCheckbox.setChecked(data.features.includes('Refreshments'));
      await this.safeCheckbox.setChecked(data.features.includes('Safe'));
      await this.viewsCheckbox.setChecked(data.features.includes('Views'));
    }
  }

  /** Submit the create room form */
  // NOTE: type is string (not union type) to allow backend flexibility for future room types
  async createRoom(data: {
    roomNumber: string;
    type: string; // Valid values: 'Single', 'Twin', 'Double', 'Family', 'Suite' (but flexible for future types)
    accessible: boolean;
    price: string;
    features?: string[];
  }): Promise<void> {
    await this.fillRoomForm(data);
    await this.createButton.click();
  }

  // ─── Validation Helpers ────────────────────────────────────

  /** Get alert message text (if present) */
  async getAlertMessage(): Promise<string | null> {
    // Error messages appear as paragraphs in a generic container after the form
    // Look for paragraphs with error text near the form
    const errorContainer = this.page.locator('div').filter({ 
      has: this.page.locator('p').filter({ hasText: /Room name|must be|greater than or equal/i }) 
    }).first();
    
    const isVisible = await errorContainer.isVisible().catch(() => false);
    if (!isVisible) return null;
    
    // Get all error paragraphs and combine their text
    const errorParagraphs = errorContainer.locator('p');
    const count = await errorParagraphs.count();
    if (count === 0) return null;
    
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errorParagraphs.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    
    return texts.join(' ');
  }
}

