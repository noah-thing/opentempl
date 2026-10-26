// Render every template in the real editor and save the page as an image for the site.
import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const out = process.env.OUT || '/tmp/tplshots';
import fs from 'node:fs'; fs.mkdirSync(out, { recursive: true });
const ids = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1800, height: 1400 }, deviceScaleFactor: 2 });
for (const id of ids) {
  await page.goto(`http://localhost:5181/#/new?template=${id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await page.evaluate(() => document.querySelectorAll('.page-head, .ctxbar-row, .add-page').forEach((n) => (n.style.visibility = 'hidden')));
  const stages = await page.$$('.page-stage');
  for (let i = 0; i < Math.min(stages.length, 4); i++) {
    await stages[i].screenshot({ path: `${out}/tpl-${id}${i ? '-' + (i + 1) : ''}.png` });
  }
  console.log(id, stages.length);
}
await browser.close();
