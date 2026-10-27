import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1512, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:5181/#/new?format=instagram-post', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const ed = (fn, arg) => page.evaluate(fn, arg);
// 1. collage: add a grid via library, select group, dblclick a cell
await page.click('.rail :text("Elements")');
await page.waitForTimeout(400);
const grids = page.locator('.panel-body :text("Grids"), .panel-body :text("Photo grids"), .panel-body :text("Collage")');
console.log('grid section count', await grids.count());
// fall back: build a 3 cell collage through the editor API
await ed(() => {
  const e = window.__tavla;
  const mk = (x) => ({ id: 'c' + x, type: 'image', x: 100 + x * 300, y: 300, w: 280, h: 400, rotation: 0, opacity: 1, assetId: null, crop: { x: 0, y: 0, w: 1, h: 1 }, filters: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, blur: 0, vignette: 0, grain: 0, preset: 'none', duotone: null }, radius: 0, mask: null, border: null, groupId: 'g1' });
  e.add([mk(0), mk(1), mk(2)], { select: true });
});
await page.waitForTimeout(300);
const box = await page.locator('.page-stage').first().boundingBox();
const ids = await ed(() => Object.values(window.__tavla.s.elements).filter((x) => x.type === 'image').map((x) => x.id));
await ed((id) => window.__tavla.select([id]), ids[0]);
await page.waitForTimeout(200);
console.log('selected after group click', await ed(() => window.__tavla.state.selection.length));
const cell = await ed((id) => { const el = window.__tavla.s.elements[id]; return { x: el.x + el.w / 2, y: el.y + el.h / 2 }; }, ids[1]);
const z = await ed(() => window.__tavla.state.zoom);
await page.mouse.dblclick(box.x + cell.x * z, box.y + cell.y * z);
await page.waitForTimeout(300);
console.log('selected after dblclick', await ed(() => window.__tavla.state.selection), 'expected', ids[1]);
// 2. popover toggle: open spacing popover on text 4 times
await ed(() => window.__tavla.clearSelection());
await page.keyboard.press('t');
await page.mouse.click(box.x + 200, box.y + 100);
await page.keyboard.type('Hello world');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
const sp = page.locator('.ctxbar .tbtn[title^="Spacing"], .ctxbar .tbtn[title*="pacing"]').first();
const counts = [];
for (let i = 0; i < 4; i++) { await sp.click(); await page.waitForTimeout(250); counts.push(await page.locator('.popover').count()); }
console.log('popover counts', counts.join(','));
// 3. rich: Cmd+I then Cmd+U fast
await page.keyboard.press('Escape');
const t = await ed(() => Object.values(window.__tavla.s.elements).find((x) => x.type === 'text'));
await page.mouse.dblclick(box.x + (t.x + 20) * z, box.y + (t.y + t.h / 2) * z);
await page.waitForTimeout(300);
await page.keyboard.press('Meta+a');
await page.keyboard.press('Meta+i');
await page.keyboard.press('Meta+u');
await page.waitForTimeout(300);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
console.log('text after I+U', JSON.stringify(await ed(() => { const x = Object.values(window.__tavla.s.elements).find((x) => x.type === 'text'); return { italic: x.italic, underline: x.underline, runs: x.runs }; })));
// 4. pptx export in dev
await page.keyboard.press('Meta+e');
await page.waitForTimeout(500);
await page.click(':text("PowerPoint")');
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }).catch(() => null), page.click('button:has-text("Download")')]);
console.log('pptx download', dl ? dl.suggestedFilename() : 'none', await page.locator('.dialog .error, .dialog [role=alert]').count());
await browser.close();
