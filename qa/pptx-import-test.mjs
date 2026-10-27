import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:5181/#/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('.home-top :text("Open file")')]);
await chooser.setFiles('/tmp/test.pptx');
await page.waitForURL(/#\/d\//, { timeout: 30000 });
await page.waitForTimeout(3500);
const info = await page.evaluate(() => {
  const s = window.__tavla.s;
  return { size: [s.meta.width, s.meta.height], pages: s.pageOrder.map((pid) => ({ notes: s.pages[pid].notes, els: s.pages[pid].elementIds.map((id) => { const e = s.elements[id]; return e.type + (e.type === 'text' ? `:${e.text.replace(/\n/g, ' | ')}:${e.fontFamily}:${Math.round(e.fontSize)}:${e.color}${e.runs ? ':runs' + e.runs.length : ''}` : e.type === 'shape' ? `:${e.shape}:${e.fill.color}` : ''); }) })) };
});
console.log(JSON.stringify(info, null, 1));
await page.evaluate(() => window.__tavla.ui.set({ view: 'grid' }));
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/pptx-import.png' });
await browser.close();
