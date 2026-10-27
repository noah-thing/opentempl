import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
const ok = (name, v) => console.log(v ? 'PASS' : 'FAIL', name);
await page.goto('http://localhost:5181/#/new?format=ig-post', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
// 1 popover twice
await page.click('.topbar >> text=File'); await page.waitForTimeout(200);
await page.click('.topbar >> text=File'); await page.waitForTimeout(200);
await page.click('.topbar >> text=File'); await page.waitForTimeout(300);
ok('popover opens three times without crash', (await page.$$('.topbar')).length === 1 && (await page.$$('.menu')).length === 1);
await page.keyboard.press('Escape');
// 2 text tool
const box = await page.locator('.page-stage').boundingBox();
await page.keyboard.press('t');
await page.mouse.click(box.x + 80, box.y + 120);
await page.waitForTimeout(300);
await page.keyboard.type('Hello there');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
ok('text tool types', await page.evaluate(() => [...document.querySelectorAll('.page-stage text')].some((t) => t.textContent.includes('Hello there'))));
// 3 openverse
await page.click('.rail-item:has-text("Photos")');
await page.waitForTimeout(500);
await page.click('.chip:has-text("coffee")');
await page.waitForTimeout(4000);
ok('openverse results', (await page.$$('.panel-body .tile img')).length > 5);
// 4 esc closes dialogs
await page.keyboard.press('Shift+?');
await page.waitForTimeout(300);
const had = (await page.$$('.dialog')).length;
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
ok('esc closes shortcuts', had === 1 && (await page.$$('.dialog')).length === 0);
// 5 context menu on empty canvas
await page.mouse.click(box.x + 100, box.y + 140);
await page.mouse.click(box.x + box.width - 40, box.y + box.height - 40, { button: 'right' });
await page.waitForTimeout(300);
ok('empty canvas menu', await page.evaluate(() => document.querySelector('.menu')?.textContent.includes('Page background')));
await page.keyboard.press('Escape');
console.log(errs.length ? 'ERRORS ' + errs.join(' | ') : 'no page errors');
await browser.close();
