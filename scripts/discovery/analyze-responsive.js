const { chromium } = require('playwright');

const TARGET_URL = 'https://automationintesting.online/';

const VIEWPORTS = [
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Tablet',  width: 768,  height: 1024 },
  { name: 'Mobile',  width: 375,  height: 667 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📱 ${vp.name} (${vp.width}x${vp.height})`);
    console.log('═'.repeat(60));

    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // ─── Navbar: hamburger vs full links ─────────────────
    const navbarToggler = page.locator('.navbar-toggler');
    const togglerVisible = await navbarToggler.isVisible().catch(() => false);
    console.log(`\n🍔 Navbar hamburger visible: ${togglerVisible}`);

    const navLinks = await page.locator('.nav-link').all();
    const visibleNavLinks = [];
    for (const link of navLinks) {
      if (await link.isVisible()) {
        visibleNavLinks.push((await link.textContent())?.trim());
      }
    }
    console.log(`  Visible nav links (${visibleNavLinks.length}): ${visibleNavLinks.join(', ') || '(none — collapsed)'}`);

    // If hamburger exists, try clicking it
    if (togglerVisible) {
      await navbarToggler.click();
      await page.waitForTimeout(500);
      const expandedLinks = [];
      for (const link of navLinks) {
        if (await link.isVisible()) {
          expandedLinks.push((await link.textContent())?.trim());
        }
      }
      console.log(`  After hamburger click (${expandedLinks.length}): ${expandedLinks.join(', ')}`);
    }

    // ─── Hero section ────────────────────────────────────
    const heroHeading = page.getByRole('heading', { name: 'Welcome to Shady Meadows B&B' });
    const heroVisible = await heroHeading.isVisible().catch(() => false);
    console.log(`\n🏠 Hero heading visible: ${heroVisible}`);

    const heroBookNow = page.getByRole('link', { name: 'Book Now', exact: true });
    const bookNowVisible = await heroBookNow.isVisible().catch(() => false);
    console.log(`  Hero "Book Now" link visible: ${bookNowVisible}`);

    // ─── Booking widget ──────────────────────────────────
    const bookingSection = page.locator('#booking');
    const bookingVisible = await bookingSection.isVisible().catch(() => false);
    console.log(`\n📅 Booking section visible: ${bookingVisible}`);

    // ─── Rooms ───────────────────────────────────────────
    const roomCards = page.locator('.room-card');
    const roomCount = await roomCards.count();
    console.log(`\n🛏️  Room cards count: ${roomCount}`);

    // Check room card layout (width hints if stacked or side-by-side)
    if (roomCount > 0) {
      const firstBox = await roomCards.first().boundingBox();
      const allBoxes = [];
      for (let i = 0; i < roomCount; i++) {
        const box = await roomCards.nth(i).boundingBox();
        if (box) allBoxes.push(box);
      }
      const allSameX = allBoxes.every(b => Math.abs(b.x - allBoxes[0].x) < 10);
      console.log(`  Cards stacked vertically: ${allSameX}`);
      if (firstBox) console.log(`  First card width: ${firstBox.width}px`);
    }

    // ─── Contact form ────────────────────────────────────
    const contactSection = page.locator('#contact');
    const contactVisible = await contactSection.isVisible().catch(() => false);
    console.log(`\n📧 Contact section visible: ${contactVisible}`);

    const submitBtn = page.getByRole('button', { name: 'Submit' });
    const submitVisible = await submitBtn.isVisible().catch(() => false);
    console.log(`  Submit button visible: ${submitVisible}`);

    // ─── Footer ──────────────────────────────────────────
    const footer = page.locator('footer');
    const footerVisible = await footer.isVisible().catch(() => false);
    console.log(`\n🦶 Footer visible: ${footerVisible}`);

    // ─── Key element dimensions ──────────────────────────
    console.log(`\n📐 Key dimensions:`);
    for (const sel of ['.navbar', '#rooms', '#contact', 'footer']) {
      const box = await page.locator(sel).first().boundingBox().catch(() => null);
      if (box) console.log(`  ${sel}: ${Math.round(box.width)}x${Math.round(box.height)} at (${Math.round(box.x)},${Math.round(box.y)})`);
    }

    await page.close();
  }

  console.log('\n✅ Responsive analysis complete!');
  await browser.close();
})();

