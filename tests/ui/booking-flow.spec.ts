import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';

/**
 * Home Page Structure & Room Display Tests
 *
 * Strategy:
 * - Verify critical page sections load correctly (branding, rooms, booking widget)
 * - Validate room information is displayed with business-relevant details
 * - Test navigation elements for accessibility
 *
 * Business impact:
 * - If the home page doesn't load or rooms aren't visible, guests can't book → revenue loss
 * - Broken navigation means users can't reach key sections
 */

test.describe('Home Page Structure', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForPageLoad();
  });

  test('BF01 - valid: should display hotel branding in the navbar', async () => {
    await expect(homePage.navbar).toBeVisible();
    await expect(homePage.navbarBrand).toBeVisible();
    await expect(homePage.navbarBrand).toHaveText('Shady Meadows B&B');
  });

  test('BF02 - valid: should display navigation links for key sections', async () => {
    const navTexts = await homePage.getNavLinkTexts();

    expect(navTexts).toContain('Rooms');
    expect(navTexts).toContain('Booking');
    expect(navTexts).toContain('Contact');
    expect(navTexts).toContain('Admin');
  });

  test('BF03 - valid: should display the hero section with welcome heading', async () => {
    await expect(homePage.heroHeading).toBeVisible();
    await expect(homePage.heroBookNowLink).toBeVisible();
  });

  test('BF04 - valid: should display the booking availability widget', async () => {
    await expect(homePage.bookingSection).toBeVisible();
    await expect(homePage.checkAvailabilityButton).toBeVisible();
    await expect(homePage.checkAvailabilityButton).toHaveText('Check Availability');
  });

  test('BF05 - valid: should display room cards with names, prices, and book links', async () => {
    await homePage.scrollToRooms();

    await expect(homePage.roomsSectionHeading).toHaveText('Our Rooms');

    // Wait for at least one room card to render (cards load async after navbar)
    await homePage.roomCards.first().waitFor({ state: 'visible', timeout: 10000 });

    const roomCount = await homePage.getRoomCount();
    expect(roomCount).toBeGreaterThanOrEqual(1);

    const roomNames = await homePage.getRoomNames();
    expect(roomNames.length).toBeGreaterThanOrEqual(1);

    // Each room card should display a price
    const roomPrices = await homePage.getRoomPrices();
    expect(roomPrices.length).toBe(roomCount);

    // Each room card should have a "Book now" link
    const bookLinksCount = await homePage.bookNowLinks.count();
    expect(bookLinksCount).toBe(roomCount);
  });

  test('BF06 - valid: should display the location section with contact information', async () => {
    await expect(homePage.locationSection).toBeVisible();
    await expect(homePage.contactInfoCard).toBeVisible();
    await expect(homePage.contactInfoCard).toContainText('Address');
    await expect(homePage.contactInfoCard).toContainText('Phone');
    await expect(homePage.contactInfoCard).toContainText('Email');
  });

  test('BF07 - valid: should display the contact form section', async () => {
    await homePage.scrollToContact();

    await expect(homePage.contactSection).toBeVisible();
    await expect(homePage.contactNameInput).toBeVisible();
    await expect(homePage.contactEmailInput).toBeVisible();
    await expect(homePage.contactPhoneInput).toBeVisible();
    await expect(homePage.contactSubjectInput).toBeVisible();
    await expect(homePage.contactMessageInput).toBeVisible();
    await expect(homePage.contactSubmitButton).toBeVisible();
  });

  test('BF08 - valid: should display the footer with business information', async () => {
    await expect(homePage.footer).toBeVisible();
    await expect(homePage.footer).toContainText('Shady Meadows B&B');
  });
});
