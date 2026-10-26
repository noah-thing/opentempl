// QA: drive the editor in headless Chromium and save screenshots.
// usage: node shot.mjs <script.json-ish steps via argv>
import { chromium } from '/Users/noahmalekani/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const [,, url, out, ...steps] = process.argv;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 2 });
const logs = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
for (const s of steps) {
  const [cmd, ...rest] = s.split('::');
  const arg = rest.join('::');
  if (cmd === 'click') await page.click(arg, { timeout: 8000 });
  else if (cmd === 'wait') await page.waitForTimeout(Number(arg));
  else if (cmd === 'eval') console.log('eval =>', JSON.stringify(await page.evaluate(arg)));
  else if (cmd === 'key') await page.keyboard.press(arg);
  else if (cmd === 'type') await page.keyboard.type(arg);
  else if (cmd === 'goto') { await page.goto(arg, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200); }
  else if (cmd === 'shot') await page.screenshot({ path: arg });
  else if (cmd === 'dbl') { const [x, y] = arg.split(',').map(Number); await page.mouse.dblclick(x, y); }
  else if (cmd === 'download') { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click(arg)]); const p = '/tmp/dl-' + d.suggestedFilename(); await d.saveAs(p); console.log('downloaded', p); }
  else if (cmd === 'mouse') { const [x, y] = arg.split(',').map(Number); await page.mouse.click(x, y); }
  else if (cmd === 'drag') { const [x1, y1, x2, y2] = arg.split(',').map(Number); await page.mouse.move(x1, y1); await page.mouse.down(); await page.mouse.move((x1+x2)/2, (y1+y2)/2, { steps: 5 }); await page.mouse.move(x2, y2, { steps: 5 }); await page.mouse.up(); }
}
await page.screenshot({ path: out });
console.log('url:', page.url());
console.log(logs.slice(0, 30).join('\n'));
await browser.close();
