// Home hero at three widths: node qa/hero-shot.mjs <outDir>   (dev server on :5181)
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs';
const { chromium } = await import(path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'));
const out = process.argv[2] || '/tmp/hero'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [name, w, h, dpr] of [['desk', 1440, 900, 1], ['wide', 1920, 1080, 1], ['small', 1180, 760, 1], ['phone', 390, 844, 2]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: 'dark' });
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:5181/#/'); await p.waitForTimeout(2200);
  await p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 78 });
  await p.close();
}
console.log(errs.slice(0, 5));
await b.close();
