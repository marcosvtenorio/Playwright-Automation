const { chromium } = require('playwright');

const TARGET_URL = 'https://automationintesting.online/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('🔍 Navigating to:', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // ─── Page Title ───────────────────────────────────────
  const title = await page.title();
  console.log('\n📄 Page Title:', title);

  // ─── All headings ─────────────────────────────────────
  console.log('\n═══ HEADINGS ═══');
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  for (const h of headings) {
    const tag = await h.evaluate(el => el.tagName);
    const text = (await h.textContent())?.trim();
    if (text) console.log(`  ${tag}: "${text}"`);
  }

  // ─── All images ───────────────────────────────────────
  console.log('\n═══ IMAGES ═══');
  const allImages = await page.locator('img').all();
  console.log(`  Total images on page: ${allImages.length}`);
  for (const img of allImages) {
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt');
    const cls = await img.getAttribute('class');
    console.log(`    img: src="${src}", alt="${alt}", class="${cls}"`);
  }

  // ─── Elements with data-testid ─────────────────────────
  console.log('\n═══ ELEMENTS WITH DATA-TESTID ═══');
  const testIdElements = await page.locator('[data-testid]').all();
  console.log('  Elements with data-testid:');
  for (const el of testIdElements) {
    const testId = await el.getAttribute('data-testid');
    const tag = await el.evaluate(el => el.tagName);
    const type = await el.getAttribute('type');
    const placeholder = await el.getAttribute('placeholder');
    const name = await el.getAttribute('name');
    console.log(`    data-testid="${testId}" | tag=${tag} | type=${type} | name=${name} | placeholder=${placeholder}`);
  }

  // ─── All input/textarea fields on page ─────────────────
  console.log('\n═══ ALL INPUT/TEXTAREA FIELDS ═══');
  const allInputs = await page.locator('input, textarea, select').all();
  for (const input of allInputs) {
    const tag = await input.evaluate(el => el.tagName);
    const type = await input.getAttribute('type');
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const cls = await input.getAttribute('class');
    const placeholder = await input.getAttribute('placeholder');
    const testId = await input.getAttribute('data-testid');
    console.log(`    ${tag}: id="${id}" name="${name}" type="${type}" class="${cls}" placeholder="${placeholder}" data-testid="${testId}"`);
  }

  // ─── All buttons on page ──────────────────────────────
  console.log('\n═══ ALL BUTTONS ═══');
  const allButtons = await page.locator('button').all();
  for (const btn of allButtons) {
    const text = (await btn.textContent())?.trim();
    const id = await btn.getAttribute('id');
    const cls = await btn.getAttribute('class');
    const visible = await btn.isVisible();
    const type = await btn.getAttribute('type');
    if (visible) {
      console.log(`  button: id="${id}" class="${cls}" text="${text}" type="${type}"`);
    }
  }

  // ─── All links ────────────────────────────────────────
  console.log('\n═══ ALL LINKS ═══');
  const allLinks = await page.locator('a').all();
  for (const link of allLinks) {
    const text = (await link.textContent())?.trim();
    const href = await link.getAttribute('href');
    const visible = await link.isVisible();
    if (visible && text) {
      console.log(`  a: href="${href}" text="${text}"`);
    }
  }

  console.log('\n✅ Home page analysis complete!');
  await browser.close();
})();

