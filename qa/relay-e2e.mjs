// Two isolated browsers share a design through the encrypted relay.
// A shares, B joins, B edits while A is closed, A reopens and gets B's edit.
// Also checks what the relay stored: ciphertext only.
//
// Needs the dev server on :5181. By default it runs against a local worker
// (cd sync && npx wrangler dev --port 8787) so the Durable Object's SQLite file
// can be inspected; set RELAY=wss://... to run against another relay instead.
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const { chromium } = await import(path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'));

const APP = 'http://localhost:5181';
const RELAY = process.env.RELAY ?? 'ws://127.0.0.1:8787';
const LOCAL = RELAY.startsWith('ws://127.0.0.1');
const STATE = path.join(import.meta.dirname, '../sync/.wrangler/state');
const SECRET_TITLE = 'Confidential roadmap for the Nordic launch';
const EDIT_TITLE = 'Edited by B while A was away';

let failures = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
  if (!ok) failures++;
};
const until = async (fn, ms = 20000, step = 250) => {
  const end = Date.now() + ms;
  for (;;) {
    const v = await fn().catch(() => false);
    if (v) return v;
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, step));
  }
};

const frames = { A: [], B: [] };
function watch(name, page) {
  page.on('pageerror', (e) => console.log(name, 'pageerror', e.message));
  page.on('websocket', (ws) => {
    if (!ws.url().includes('/v1/room/')) return;
    frames[name].push({ url: ws.url(), sent: [], received: [] });
    const rec = frames[name].at(-1);
    ws.on('framesent', (f) => rec.sent.push(Buffer.from(f.payload)));
    ws.on('framereceived', (f) => rec.received.push(Buffer.from(f.payload)));
  });
}
const prime = (ctx) => ctx.addInitScript((url) => localStorage.setItem('opentempl:relay', url), RELAY);

const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentempl-a-'));
const launchA = async () => {
  const ctx = await chromium.launchPersistentContext(userDir, { channel: 'chrome', headless: true, viewport: { width: 1400, height: 860 } });
  await prime(ctx);
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  watch('A', page);
  return { ctx, page };
};
const syncText = (page) => page.locator('.topbar .saved[role=status]').innerText();
const waitSynced = (page) => until(async () => (await syncText(page)).includes('Synced'));

const browserB = await chromium.launch({ channel: 'chrome', headless: true });
let A = await launchA();
const ctxB = await browserB.newContext({ viewport: { width: 1400, height: 860 } });
await prime(ctxB);
const pageB = await ctxB.newPage();
watch('B', pageB);

// A makes a design from a template and shares it.
await A.page.goto(`${APP}/#/new?template=open-studio`, { waitUntil: 'networkidle' });
await until(async () => (await A.page.$$('.page-stage g[data-id]')).length > 3);
await A.page.fill('.topbar .title', SECRET_TITLE);
const elementsA = (await A.page.$$('.page-stage g[data-id]')).length;
await A.page.click('.topbar >> text=Share');
await A.page.click('.dialog >> text=Copy link');
await A.page.waitForSelector('.dialog input[readonly]');
const link = await A.page.inputValue('.dialog input[readonly]');
const designId = link.match(/#\/join\/([^?]+)/)[1];
check('share link has a join route and a room key', /#\/join\/[^?]+\?room=[\w-]{20,}/.test(link), link.replace(/room=.*/, 'room=…'));
check('A reaches Synced', await waitSynced(A.page), await syncText(A.page));
await A.page.keyboard.press('Escape');

// B joins on a fresh device.
await pageB.goto(link, { waitUntil: 'networkidle' });
check('B receives the title', await until(async () => (await pageB.inputValue('.topbar .title')) === SECRET_TITLE));
check('B receives the elements', await until(async () => (await pageB.$$('.page-stage g[data-id]')).length === elementsA), '', `${elementsA} elements`);
check('B reaches Synced', await waitSynced(pageB));
const readTitle = () => pageB.evaluate(
  (id) =>
    new Promise((res) => {
      const r = indexedDB.open('tavla');
      r.onsuccess = () => {
        const g = r.result.transaction('designs').objectStore('designs').get(id);
        g.onsuccess = () => res(g.result?.title ?? null);
        g.onerror = () => res(null);
      };
    }),
  designId,
);
check('B has the design in local IndexedDB', await until(async () => (await readTitle()) === SECRET_TITLE, 10000), String(await readTitle()));

// A closes. B edits alone.
await A.ctx.close();
await pageB.fill('.topbar .title', EDIT_TITLE);
check('B syncs the edit while A is closed', await waitSynced(pageB));

// A reopens the design from the library path, with no room in the URL.
A = await launchA();
await A.page.goto(`${APP}/#/d/${designId}`, { waitUntil: 'networkidle' });
check('A gets B\'s edit after reopening', await until(async () => (await A.page.inputValue('.topbar .title')) === EDIT_TITLE));
check('A shows Synced', await waitSynced(A.page));

// What did the relay see and keep?
const all = [...frames.A, ...frames.B].flatMap((f) => [...f.sent, ...f.received]);
const needles = [SECRET_TITLE, EDIT_TITLE, 'open-studio', 'fontFamily', 'pageOrder'].flatMap((n) => [Buffer.from(n, 'utf8'), Buffer.from(n, 'utf16le')]);
check('no WebSocket frame contains readable design text', all.length > 4 && !all.some((b) => needles.some((n) => b.includes(n))), `${all.length} frames`);
const wsUrl = frames.A[0]?.url ?? '';
check('room id in the URL is a SHA-256 sized hex string and not the key', /\/v1\/room\/[0-9a-f]{64}$/.test(wsUrl) && !link.includes(wsUrl.split('/').pop()));

let dbFile = null;
if (LOCAL) {
  const find = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.sqlite')).map((f) => path.join(dir, String(f))) : []);
  dbFile = find(STATE).find((f) => {
    try {
      return Number(execFileSync('sqlite3', [f, 'select count(*) from log'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString()) > 0;
    } catch {
      return false;
    }
  });
  check('found the Durable Object SQLite file', !!dbFile, dbFile?.replace(os.homedir(), '~'));
  if (dbFile) {
    const rows = Number(execFileSync('sqlite3', [dbFile, 'select count(*) from log']).toString());
    const dump = execFileSync('sqlite3', [dbFile, 'select hex(blob) from log'], { maxBuffer: 1 << 28 }).toString().split('\n').filter(Boolean).map((h) => Buffer.from(h, 'hex'));
    check('relay stored rows', rows > 0, `${rows} rows, ${dump.reduce((n, b) => n + b.length, 0)} bytes`);
    check('relay rows hold no readable design text', !dump.some((b) => needles.some((n) => b.includes(n))));
    // Ciphertext should look random: byte entropy close to 8 bits on the biggest row.
    const big = dump.sort((a, b) => b.length - a.length)[0];
    const counts = new Array(256).fill(0);
    for (const x of big) counts[x]++;
    const entropy = -counts.reduce((s, c) => (c ? s + (c / big.length) * Math.log2(c / big.length) : s), 0);
    check('largest stored row looks like ciphertext', entropy > 7.9 || big.length < 2000, `entropy ${entropy.toFixed(3)} bits/byte over ${big.length} bytes`);
  }
}

// Stop sharing deletes the room.
await A.page.click('.topbar >> text=Share');
await A.page.screenshot({ path: path.join(os.tmpdir(), 'opentempl-share-dialog.png') });
await A.page.click('.dialog >> text=Stop sharing');
check('A is told the encrypted copy is deleted', await until(async () => (await A.page.locator('.toast').allInnerTexts()).join(' ').includes('encrypted copy is deleted'), 8000));
check('B is told sharing ended', await until(async () => (await syncText(pageB)).includes('Sharing ended')), await syncText(pageB));
if (LOCAL && dbFile) {
  const left = Number(execFileSync('sqlite3', [dbFile, 'select count(*) from log']).toString());
  const tomb = execFileSync('sqlite3', [dbFile, "select v from meta where k='deleted'"]).toString().trim();
  check('relay log is empty after Stop sharing', left === 0 && tomb === '1', `rows ${left}, tombstone ${tomb}`);
}
const gone = await A.page.evaluate((id) => localStorage.getItem(`opentempl:room:${id}`), designId);
check('A forgot the room key locally', gone === null);

await A.ctx.close();
await browserB.close();
fs.rmSync(userDir, { recursive: true, force: true });
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
