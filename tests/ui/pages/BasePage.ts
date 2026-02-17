import { Locator, Page } from '@playwright/test';

/**
 * Base Page Object providing shared navigation and utility methods.
 * All page objects extend this class — no raw selectors in tests.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}
  /** Override in subclasses with a locator that signals the page is ready */
  protected abstract readonly readyLocator: Locator;
  protected abstract readonly url: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.readyLocator.waitFor({ state: 'visible', timeout: 15000 });
  }
}

