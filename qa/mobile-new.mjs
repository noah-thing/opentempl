import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:5181/#/new?template=open-studio', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
for (const p of ['styles', 'audio', 'check']) {
  await page.evaluate((x) => window.__tavla.ui.set({ panel: x }), p);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `/tmp/m-${p}.png` });
}
await browser.close();
