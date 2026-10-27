import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:5181/#/new?format=presentation', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.click('.rail :text("Elements")');
await page.waitForTimeout(500);
for (const t of ['Laptop', 'Phone']) { await page.click(`.shape-tile[title="${t}"]`); await page.waitForTimeout(300); await page.keyboard.press('Escape'); }
// fill the phone screen with a library photo: select the phone group then click a photo
await page.evaluate(() => { const e = window.__tavla; const scr = Object.values(e.s.elements).filter((x) => x.name === 'Screen'); e.select([scr[scr.length - 1].id]); });
await page.click('.rail :text("Photos")');
await page.waitForTimeout(1500);
await page.locator('.panel-body img').first().click();
await page.waitForTimeout(2500);
await page.keyboard.press('Escape');
await page.locator('.panel').screenshot({ path: '/tmp/dev-panel.png' }).catch(() => {});
await page.locator('.page-stage').first().screenshot({ path: '/tmp/devices.png' });
console.log(await page.evaluate(() => Object.values(window.__tavla.s.elements).filter((x) => x.name === 'Screen').map((x) => !!x.assetId).join(',')));
await browser.close();
