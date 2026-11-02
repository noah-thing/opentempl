// Two separate browser contexts join the same live room and edit together.
import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const DSF = 2;
const a = await (await browser.newContext({ viewport: { width: 1400, height: 860 }, deviceScaleFactor: DSF })).newPage();
const b = await (await browser.newContext({ viewport: { width: 1400, height: 860 }, deviceScaleFactor: DSF })).newPage();
for (const [n, p] of [['A', a], ['B', b]]) { p.on('pageerror', (e) => console.log(n, 'pageerror', e.message)); p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log(n, m.type(), m.text().slice(0, 200))); }
await a.goto('http://localhost:5181/#/new?template=open-studio', { waitUntil: 'networkidle' });
await a.waitForTimeout(3000);
await a.click('.topbar >> text=Share');
await a.click('text=Start a live session');
await a.waitForTimeout(500);
const link = await a.inputValue('.dialog input[readonly]');
console.log('link', link);
await b.goto(link, { waitUntil: 'networkidle' });
let synced = false;
for (let i = 0; i < 30 && !synced; i++) {
  await b.waitForTimeout(1000);
  synced = (await b.$$('.page-stage g[data-id]')).length > 3;
}
console.log('B received design:', synced, 'url', b.url());
await b.screenshot({ path: '/tmp/collab-b0.png' });
// A moves the cursor and edits the title; B should see both.
await a.keyboard.press('Escape');
await a.mouse.move(900, 400);
await a.mouse.move(920, 420);
await a.fill('.topbar .title', 'Edited by A');
await b.waitForTimeout(2500);
console.log('B title:', await b.inputValue('.topbar .title'));
console.log('B sees cursor:', (await b.$$('.peer-cursor')).length);
await a.mouse.move(700, 300); await a.mouse.move(720, 330);
await b.waitForTimeout(1500);
await b.click('.icon-btn[title=Comments]');
await b.waitForTimeout(400);
await b.click('text=Add a comment');
const bb = await b.locator('.page-stage').boundingBox();
await b.mouse.click(bb.x + bb.width * 0.7, bb.y + bb.height * 0.55);
await b.waitForTimeout(400);
await b.keyboard.type('Love the cursor. Bigger?');
await b.keyboard.press('Enter');
await b.waitForTimeout(800);
await b.screenshot({ path: '/tmp/collab-b.png' });
await browser.close();
