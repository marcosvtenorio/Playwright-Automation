import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage.js';

/**
 * Page Object for the /admin/branding tab.
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  B&B details                           │
 * │  Name: [textbox]                       │
 * │  Logo: [textbox]                       │
 * │  Description: [textbox]                │
 * ├─────────────────────────────────────────┤
 * │  Map details                           │
 * │  Latitude: [textbox]                   │
 * │  Longitude: [textbox]                  │
 * │  Directions: [textbox]                 │
 * ├─────────────────────────────────────────┤
 * │  Contact details                       │
 * │  Name: [textbox]                       │
 * │  Phone: [textbox]                      │
 * │  Email: [textbox]                       │
 * ├─────────────────────────────────────────┤
 * │  Address details                       │
 * │  Line 1: [textbox]                     │
 * │  Line 2: [textbox]                     │
 * │  Post Town: [textbox]                  │
 * │  County: [textbox]                     │
 * │  Post Code: [textbox]                  │
 * ├─────────────────────────────────────────┤
 * │  [Submit button]                       │
 * └─────────────────────────────────────────┘
 *
 * Business impact:
 * - Branding controls public-facing identity
 * - Broken branding = wrong info shown to guests → reputation damage
 */
export class AdminBrandingPage extends BasePage {
  protected readonly url = '/admin/branding';

  // ─── B&B Details ───────────────────────────────────────────
  readonly bnbNameInput: Locator;
  readonly logoInput: Locator;
  readonly descriptionInput: Locator;

  // ─── Map Details ───────────────────────────────────────────
  readonly latitudeInput: Locator;
  readonly longitudeInput: Locator;
  readonly directionsInput: Locator;

  // ─── Contact Details ───────────────────────────────────────
  readonly contactNameInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly contactEmailInput: Locator;

  // ─── Address Details ───────────────────────────────────────
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly postTownInput: Locator;
  readonly countyInput: Locator;
  readonly postCodeInput: Locator;

  // ─── Submit ─────────────────────────────────────────────────
  readonly submitButton: Locator;

  // ─── Alert Messages ─────────────────────────────────────────
  readonly alertMessage: Locator;

  constructor(page: Page) {
    super(page);

    // B&B details
    this.bnbNameInput = page.getByRole('textbox', { name: /Enter B&B name/i });
    this.logoInput = page.getByRole('textbox', { name: /Enter image url/i });
    this.descriptionInput = page.locator('textarea').first();

    // Map details
    this.latitudeInput = page.getByRole('textbox', { name: /Enter Latitude/i });
    this.longitudeInput = page.getByRole('textbox', { name: /Enter Longitude/i });
    this.directionsInput = page.locator('textarea').nth(1);

    // Contact details
    this.contactNameInput = page.getByRole('textbox', { name: /Enter Contact Name/i });
    this.contactPhoneInput = page.getByRole('textbox', { name: /Enter Phone Number/i });
    this.contactEmailInput = page.getByRole('textbox', { name: /Enter Email Address/i });

    // Address details
    this.addressLine1Input = page.getByRole('textbox', { name: /Enter Address Line 1/i });
    this.addressLine2Input = page.getByRole('textbox', { name: /Enter Address Line 2/i });
    this.postTownInput = page.getByRole('textbox', { name: /Enter Post Town/i });
    this.countyInput = page.getByRole('textbox', { name: /Enter County/i });
    this.postCodeInput = page.getByRole('textbox', { name: /Enter Post Code/i });

    // Submit
    this.submitButton = page.getByRole('button', { name: 'Submit' });

    // Alert
    this.alertMessage = page.getByRole('alert').first();
  }

  // ─── Form Actions ──────────────────────────────────────────

  /** Get all current branding values */
  async getCurrentBranding(): Promise<{
    bnbName: string;
    logo: string;
    description: string;
    latitude: string;
    longitude: string;
    directions: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    addressLine1: string;
    addressLine2: string;
    postTown: string;
    county: string;
    postCode: string;
  }> {
    return {
      bnbName: (await this.bnbNameInput.inputValue()) || '',
      logo: (await this.logoInput.inputValue()) || '',
      description: (await this.descriptionInput.inputValue()) || '',
      latitude: (await this.latitudeInput.inputValue()) || '',
      longitude: (await this.longitudeInput.inputValue()) || '',
      directions: (await this.directionsInput.inputValue()) || '',
      contactName: (await this.contactNameInput.inputValue()) || '',
      contactPhone: (await this.contactPhoneInput.inputValue()) || '',
      contactEmail: (await this.contactEmailInput.inputValue()) || '',
      addressLine1: (await this.addressLine1Input.inputValue()) || '',
      addressLine2: (await this.addressLine2Input.inputValue()) || '',
      postTown: (await this.postTownInput.inputValue()) || '',
      county: (await this.countyInput.inputValue()) || '',
      postCode: (await this.postCodeInput.inputValue()) || '',
    };
  }

  /** Submit the branding form */
  async submitBranding(): Promise<void> {
    await this.submitButton.click();
  }

  /** Get alert message text (if present) */
  async getAlertMessage(): Promise<string | null> {
    const isVisible = await this.alertMessage.isVisible().catch(() => false);
    if (!isVisible) return null;
    return await this.alertMessage.textContent();
  }
}


