// One shared headless Chrome that renders pack templates for everyone building
// them, so parallel builders don't each start a browser.
//   node qa/tpl-render-server.mjs        (port 4422, needs the dev server on 5181)
// qa/tpl-shot.mjs sends its work here when this is running.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const { chromium } = await import(path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'));

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DEV = process.env.DEV || 'http://localhost:5181';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 2400, height: 1600 } });
const pages = [await ctx.newPage(), await ctx.newPage()];
const free = [...pages];
const waiting = [];
const take = () => (free.length ? Promise.resolve(free.pop()) : new Promise((r) => waiting.push(r)));
const give = (p) => (waiting.length ? waiting.shift()(p) : free.push(p));

async function shoot(page, vibe, id, scale, files) {
  await page.goto('about:blank');
  await page.goto(`${DEV}/#/render?vibe=${vibe}&id=${id}&scale=${scale}`);
  await page.waitForSelector('body[data-ready]', { timeout: 30000 }).catch(() => {});
  const stages = await page.$$('.render-page');
  const out = [];
  for (let i = 0; i < stages.length; i++) {
    const f = files(i);
    if (!f) continue;
    await stages[i].screenshot({ path: f, ...(f.endsWith('.jpg') ? { type: 'jpeg', quality: 82 } : {}) });
    out.push(f);
  }
  return out;
}

async function job({ vibe, ids, thumbs }) {
  const pack = JSON.parse(fs.readFileSync(path.join(root, `apps/editor/public/templates/${vibe}.json`)));
  const shots = path.join(root, `apps/editor/templates/shots/${vibe}`);
  const thumbDir = path.join(root, 'apps/editor/public/templates/thumbs');
  fs.mkdirSync(shots, { recursive: true });
  fs.mkdirSync(thumbDir, { recursive: true });
  const result = [];
  for (const id of ids?.length ? ids : pack.map((t) => t.id)) {
    const t = pack.find((x) => x.id === id);
    if (!t) { result.push(`${id}: not in pack`); continue; }
    const page = await take();
    try {
      const scale = Math.min(1, 1100 / Math.max(t.width, t.height));
      const out = await shoot(page, vibe, id, scale, (i) => `${shots}/${id}${i ? '-' + (i + 1) : ''}.png`);
      if (thumbs) await shoot(page, vibe, id, 480 / t.width, (i) => (i ? null : `${thumbDir}/${id}.jpg`)).catch(() => {});
      result.push(...out);
    } catch (e) {
      result.push(`${id}: ${e.message}`);
    } finally {
      give(page);
    }
  }
  return result;
}

http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    try {
      const out = await job(JSON.parse(body || '{}'));
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(out));
    } catch (e) {
      res.writeHead(500).end(String(e));
    }
  });
}).listen(4422, '127.0.0.1', () => console.log('template renderer on :4422'));
