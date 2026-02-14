import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import {
  createValidContact,
  createMinBoundaryContact,
  createMaxBoundaryContact,
  createEmptyContact,
  createBelowMinContact,
  createAboveMaxContact,
} from '../fixtures/contact.data.js';

/**
 * Contact Form Validation Tests
 *
 * Strategy:
 * - Boundary Value Analysis: min, max, nominal, below-min, above-max
 * - Happy paths: valid submissions → success message with user's name
 * - Negative paths: each validation rule group tested explicitly
 *
 * Validation rules (discovered from manual analysis):
 * - Name: required
 * - Email: required, must be well-formed
 * - Phone: required, 11–21 characters
 * - Subject: required, 5–100 characters
 * - Message: required, 20–2000 characters
 *
 * Business impact:
 * - Contact form is the primary way guests reach the B&B
 * - Broken validation = spam (email service costs money and time) or lost inquiries
 */

test.describe('Contact Form Validation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForPageLoad();
    await homePage.scrollToContact();
  });

  test('CT01 - valid: should submit successfully with minimum boundary values', async () => {
    const contact = createMinBoundaryContact();

    // Validate exact boundary lengths (minimums)
    expect(contact.subject.length).toBe(5);  // minimum allowed
    expect(contact.message.length).toBe(20); // minimum allowed

    await homePage.submitContactForm(contact);

    await expect(homePage.contactSuccessMessage).toBeVisible({ timeout: 15000 });
    await expect(homePage.contactSuccessMessage).toContainText(contact.name);
  });

  test('CT02 - valid: should submit successfully with maximum boundary values', async () => {
    const contact = createMaxBoundaryContact();

    // Validate repeatToLength function: exact boundary lengths
    expect(contact.subject.length).toBe(100);  // maximum allowed
    expect(contact.message.length).toBe(2000); // maximum allowed

    await homePage.submitContactForm(contact);

    await expect(homePage.contactSuccessMessage).toBeVisible({ timeout: 15000 });
    await expect(homePage.contactSuccessMessage).toContainText(contact.name);
  });

  test('CT03 - valid: should submit successfully with nominal values', async () => {
    const contact = createValidContact();
    
    await homePage.submitContactForm(contact);

    await expect(homePage.contactSuccessMessage).toBeVisible({ timeout: 15000 });
    await expect(homePage.contactSuccessMessage).toContainText(contact.name);
  });

  test('CT04 - invalid: should show errors for empty fields', async () => {
    const contact = createEmptyContact();

    await homePage.submitContactForm(contact);

    const errors = await homePage.getContactErrors();

    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some(e => e.includes('may not be blank'))).toBe(true);
  });

  test('CT05 - invalid: should show errors for below-minimum and invalid format', async () => {
    const contact = createBelowMinContact();

    // Validate exact boundary lengths (below minimum)
    expect(contact.phone.length).toBe(10);  // below 11 minimum
    expect(contact.subject.length).toBe(2);  // below 5 minimum
    expect(contact.message.length).toBe(5);  // below 20 minimum

    await homePage.submitContactForm(contact);

    const errors = await homePage.getContactErrors();

    // Validate expected errors appear
    expect(errors.some(e => e.includes('must be a well-formed email address'))).toBe(true);
    expect(errors.some(e => e.includes('Phone must be between 11 and 21 characters'))).toBe(true);
    expect(errors.some(e => e.includes('Subject must be between 5 and 100 characters'))).toBe(true);
    expect(errors.some(e => e.includes('Message must be between 20 and 2000 characters'))).toBe(true);

    // Validate that valid field (Name) does NOT produce an error
    expect(errors.some(e => e.toLowerCase().includes('name'))).toBe(false);
  });

  test('CT06 - invalid: should show errors for above-maximum values', async () => {
    const contact = createAboveMaxContact();

    // Validate repeatToLength function: exact overflow lengths
    expect(contact.subject.length).toBe(101);  // above 100 maximum
    expect(contact.message.length).toBe(2001);  // above 2000 maximum

    await homePage.submitContactForm(contact);

    const errors = await homePage.getContactErrors();

    expect(errors.some(e => e.includes('Phone must be between 11 and 21 characters'))).toBe(true);
    expect(errors.some(e => e.includes('Subject must be between 5 and 100 characters'))).toBe(true);
    expect(errors.some(e => e.includes('Message must be between 20 and 2000 characters'))).toBe(true);

    // Validate that valid fields (Name, Email) do NOT produce errors
    expect(errors.some(e => e.toLowerCase().includes('name'))).toBe(false);
    expect(errors.some(e => e.toLowerCase().includes('email'))).toBe(false);
  });
});
