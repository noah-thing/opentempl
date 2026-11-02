// End to end: Generate tab with a real OpenAI key (from ~/.config/tavla/openai.key),
// one picture in editable text mode, then open it as a Magic layers design.
//   node qa/generate-e2e.mjs [lookId] [quality]     (needs the dev server on :5181)
import { chromium } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
const out = process.env.OUT || '/tmp/gen-e2e';
fs.mkdirSync(out, { recursive: true });
const look = process.argv[2] || 'bold-flat-colour';
const quality = process.argv[3] || 'medium';
const key = fs.readFileSync(os.homedir() + '/.config/tavla/openai.key', 'utf8').trim();
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(([k, q]) => localStorage.setItem('tavla.openai', JSON.stringify({ key: k, model: 'gpt-image-2.5-sunburst', quality: q })), [key, quality]);
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
p.on('requestfinished', async (r) => { if (r.url().includes('api.openai.com')) console.log('openai', r.method(), (await r.response())?.status()); });
p.on('requestfailed', (r) => { if (r.url().includes('api.openai.com')) console.log('openai failed', r.failure()?.errorText); });
await p.goto(`http://localhost:5181/#/generate?look=${look}`);
await p.waitForSelector('.brief');
await p.fill('.brief textarea >> nth=0', 'A pickle stand at the Saturday farmers market: jars of dill pickles, cucumbers, garlic and dill');
const inputs = p.locator('.brief .fld input:not([type=color])');
await inputs.nth(0).fill('Pickle Saturdays');
await inputs.nth(1).fill('Crunchy, sour, made on the farm');
await inputs.nth(2).fill('Every Saturday 8 to 14, Hötorget');
await p.selectOption('.actions select', '1');
const t0 = Date.now();
await p.click('.actions .btn-primary');
await p.waitForSelector('.result img, .studio-toast.is-error', { timeout: 300000 });
if (await p.$('.studio-toast.is-error')) {
  console.log('error:', await p.textContent('.studio-toast.is-error'));
  await p.screenshot({ path: `${out}/error.jpg`, type: 'jpeg', quality: 70 });
  process.exit(1);
}
console.log('generated in', Math.round((Date.now() - t0) / 1000), 's');
await p.screenshot({ path: `${out}/1-result.jpg`, type: 'jpeg', quality: 75, fullPage: true });
const src = await p.getAttribute('.result img', 'src');
const bytes = await p.evaluate(async (u) => Array.from(new Uint8Array(await (await fetch(u)).arrayBuffer())), src);
fs.writeFileSync(`${out}/picture.jpg`, Buffer.from(bytes));
// Magic layers without the paid repaint, so the local path is tested.
if (process.env.SUBJECT === '0') await p.locator('.layer-opts input >> nth=1').uncheck();
const repaint = p.locator('.layer-opts input >> nth=2');
if (process.env.REPAINT !== '1' && (await repaint.isChecked())) await repaint.uncheck();
await p.click('.result .btn-primary');
const tick = setInterval(async () => console.log('status:', await p.textContent('.studio-toast').catch(() => '-')), 10000);
await p.waitForURL(/#\/d\//, { timeout: 300000 });
clearInterval(tick);
await p.waitForTimeout(6000);
await p.screenshot({ path: `${out}/2-design.jpg`, type: 'jpeg', quality: 75 });
console.log('errors:', errs.slice(0, 5));
await b.close();
