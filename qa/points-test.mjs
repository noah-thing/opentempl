import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:5181/#/new?format=instagram-post', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const id = await page.evaluate(async () => {
  const e = window.__tavla;
  const { makeShape } = await import('/src/doc/factory.ts');
  const s = makeShape('heart', { x: 300, y: 300, w: 480, h: 420, fill: { type: 'solid', color: '#FF3C8E' }, rotation: 15 });
  e.add([s], { select: true });
  return e.state.selection[0];
});
await page.waitForTimeout(300);
await page.click('.ctxbar :text("Edit points")');
await page.waitForTimeout(300);
console.log('pen layer', await page.locator('.pen-layer').count(), 'nodes', await page.evaluate((i) => window.__tavla.s.elements[i].nodes?.length, id));
const box = await page.locator('.page-stage').first().boundingBox();
await page.screenshot({ path: '/tmp/points1.png', clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
// drag the top middle anchor (the heart dip) upward
const z = await page.evaluate(() => window.__tavla.state.zoom);
const pts = await page.evaluate(() => [...document.querySelectorAll('.pen-layer rect')].map((r) => r.getBoundingClientRect()).map((r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 })));
const top = pts.reduce((a, b) => (b.y < a.y ? b : a));
// the dip is the anchor closest to the middle top: pick the anchor nearest to the shape centre x with smallest y among the middle third
const mid = pts.filter((p) => Math.abs(p.x - (box.x + 540 * z)) < 120 * z).sort((a, b) => a.y - b.y)[0] ?? top;
await page.mouse.move(mid.x, mid.y); await page.mouse.down(); await page.mouse.move(mid.x, mid.y - 90, { steps: 6 }); await page.mouse.up();
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
const el = await page.evaluate((i) => window.__tavla.s.elements[i], id);
console.log('after edit', { shape: el.shape, rotation: el.rotation, nodes: el.nodes.length, h: Math.round(el.h) });
await page.screenshot({ path: '/tmp/points2.png', clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
await page.keyboard.press('Meta+z');
await page.waitForTimeout(200);
console.log('undo ->', await page.evaluate((i) => Math.round(window.__tavla.s.elements[i].h), id));
await browser.close();
