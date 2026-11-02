// Screenshots of the main UI states, for the redesign: Home, editor with text
// selected, editor with a photo selected, a panel open, Generate, dialogs.
//   node qa/ui-shots.mjs <outDir> [theme]      (dev server on :5181)
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs';
const { chromium } = await import(path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'));
const out = process.argv[2] || '/tmp/ui'; const theme = process.argv[3];
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme === 'light' ? 'light' : 'dark' });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 72 }); };
await p.goto('http://localhost:5181/#/'); await p.waitForTimeout(2500); await shot('1-home');
await p.mouse.wheel(0, 900); await shot('2-home-scrolled');
await p.goto('http://localhost:5181/#/new?template=swiss-lecture-poster'); await p.waitForURL(/#\/d\//, { timeout: 30000 }); await p.waitForTimeout(3000); await shot('3-editor');
const text = await p.$('.page-stage [data-type="text"], .page-stage text');
const box = await p.$('.page-stage'); const bb = await box.boundingBox();
await p.mouse.click(bb.x + bb.width * 0.25, bb.y + bb.height * 0.6); await shot('4-editor-text-selected');
await p.mouse.click(bb.x + bb.width * 0.3, bb.y + bb.height * 0.2); await shot('5-editor-shape-selected');
await p.keyboard.press('Escape');
for (const [i, label] of [['6', 'Elements'], ['7', 'Text'], ['8', 'Photos']]) {
  const btn = p.locator(`.rail button:has-text("${label}")`).first();
  if (await btn.count()) { await btn.click(); await shot(`${i}-panel-${label.toLowerCase()}`); }
}
await p.goto('http://localhost:5181/#/generate?look=bold-flat-colour'); await p.waitForTimeout(2500); await shot('9-generate');
console.log(errs.slice(0, 5));
await b.close();
