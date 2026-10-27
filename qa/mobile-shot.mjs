import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const [,, url, out, ...steps] = process.argv;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
for (const s of steps) {
  const [cmd, arg] = s.split('::');
  if (cmd === 'tap') await page.tap(arg);
  if (cmd === 'wait') await page.waitForTimeout(Number(arg));
  if (cmd === 'shot') await page.screenshot({ path: arg });
}
await page.screenshot({ path: out });
await browser.close();
