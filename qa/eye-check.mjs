import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
page.on('console', (m) => console.log('console', m.type(), m.text()));
await page.goto('http://localhost:5182/#yours', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.evaluate(() => document.querySelector('#yours').scrollIntoView());
await page.waitForTimeout(2500);
console.log(await page.evaluate(() => { const c = document.querySelector('[data-eye] canvas'); return c ? `${c.width}x${c.height}` : 'no canvas'; }));
for (let i = 0; i < 20; i++) { await page.mouse.move(200 + i * 5, 150 + i * 3); await page.waitForTimeout(30); }
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/site-eye.png' });
await browser.close();
