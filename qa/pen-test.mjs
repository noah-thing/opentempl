import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('console', m.text()));
await page.goto('http://localhost:5181/#/new?format=instagram-post', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const box = await page.locator('.page-stage').first().boundingBox();
const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
const shapes = () => page.evaluate(() => [...document.querySelectorAll('.page-stage [data-id] path[fill-rule="evenodd"]')].length);

// 1. Pen: three corners and one curve, closed by clicking the first point.
await page.keyboard.press('p');
await page.waitForTimeout(200);
console.log('pen layer:', await page.locator('.pen-layer').count());
let [x, y] = at(0.2, 0.2); await page.mouse.click(x, y);
[x, y] = at(0.5, 0.15); await page.mouse.click(x, y);
[x, y] = at(0.6, 0.45); await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 60, y + 40, { steps: 5 }); await page.mouse.up();
[x, y] = at(0.25, 0.5); await page.mouse.click(x, y);
[x, y] = at(0.2, 0.2); await page.mouse.click(x, y);
await page.waitForTimeout(300);
console.log('after close: tool layer', await page.locator('.pen-layer').count(), 'path shapes', await shapes(), 'ctx edit points', await page.locator('.ctxbar :text("Edit points")').count());
await page.locator('.page-stage').first().screenshot({ path: '/tmp/pen1.png' });

// 2. Edit points: drag the first anchor.
await page.locator('.ctxbar :text("Edit points")').click();
await page.waitForTimeout(200);
[x, y] = at(0.2, 0.2); await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 50, y - 30, { steps: 5 }); await page.mouse.up();
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
const d1 = await page.evaluate(() => document.querySelector('.page-stage [data-id] path[fill-rule="evenodd"]')?.getAttribute('d'));
console.log('edited d:', d1?.slice(0, 80));

// 3. Combine: two overlapping rects via R tool, then subtract.
await page.keyboard.press('Escape');
for (const [a, b] of [[0.3, 0.6], [0.45, 0.7]]) {
  await page.keyboard.press('r');
  [x, y] = at(a, b); await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 180, y + 140, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(200);
}
await page.keyboard.press('Escape');
[x, y] = at(0.28, 0.58);
await page.mouse.move(x, y); await page.mouse.down(); [x, y] = at(0.75, 0.95); await page.mouse.move(x, y, { steps: 8 }); await page.mouse.up();
await page.waitForTimeout(300);
console.log('selected', await page.evaluate(() => document.querySelector('.ctxbar')?.textContent?.slice(0, 40)));
console.log('combine buttons', await page.locator('.ctxbar [title^="Subtract"]').count());
await page.locator('.ctxbar [title^="Subtract"]').click();
await page.waitForTimeout(300);
console.log('path shapes after subtract', await shapes());
const d2 = await page.evaluate(() => [...document.querySelectorAll('.page-stage [data-id] path[fill-rule="evenodd"]')].map((p) => p.getAttribute('d')).pop());
console.log('subtract d:', d2);
await page.keyboard.press('Meta+z');
await page.waitForTimeout(300);
console.log('after undo path shapes', await shapes());
await page.locator('.page-stage').first().screenshot({ path: '/tmp/pen2.png' });
await browser.close();
