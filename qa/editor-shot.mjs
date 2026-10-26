import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 960 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:5181/#/new?template=fika-poster', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
// Select the headline and open the font panel, like someone mid edit.
const box = await page.locator('.page-stage').boundingBox();
await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.72);
await page.waitForTimeout(400);
await page.click('.font-pick');
await page.waitForTimeout(1800);
await page.screenshot({ path: '/Users/noahmalekani/tavla/apps/site/public/shots/editor.png' });
await browser.close();
