import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const [,, out, w = '1512', h = '900'] = process.argv;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
const logs = [];
page.on('pageerror', (e) => logs.push('pageerror ' + e.message));
page.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
await page.goto('http://localhost:5182/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
// Reveal everything for a full page capture.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in'));
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: true });
console.log(logs.join('\n'));
await browser.close();
