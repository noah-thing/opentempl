import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const maker = await browser.newPage();
await maker.setContent(`<html><body style="margin:0;font-family:Helvetica,Arial,sans-serif">
<div style="padding:48px">
<h1 style="font-size:44px;margin:0 0 12px;color:#2B3BFF">Quarterly field notes</h1>
<p style="font-family:Times New Roman,serif;font-size:18px;line-height:1.5;width:520px;margin:0 0 24px;color:#222">The ferry left at seven and the islands came up one by one out of the fog. We counted forty two boats in the harbour and nobody was in a hurry.</p>
<div style="background:#0B0B0D;color:#fff;padding:20px 24px;font-size:24px;font-weight:bold;width:420px">White on black, bold</div>
<p style="font-size:14px;color:#FF4B39;margin-top:24px">Small red footnote at the bottom</p>
</div></body></html>`);
await maker.pdf({ path: '/tmp/test.pdf', format: 'A4', printBackground: true });
await maker.screenshot({ path: '/tmp/pdf-source.png' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:5181/#/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('.home-top :text("Open file")')]);
await chooser.setFiles('/tmp/test.pdf');
await page.waitForURL(/#\/d\//, { timeout: 30000 });
await page.waitForTimeout(3500);
const texts = await page.evaluate(() => Object.values(window.__tavla.s.elements).filter((e) => e.type === 'text').map((t) => ({ text: t.text.slice(0, 50), font: t.fontFamily, size: t.fontSize, w: t.fontWeight, color: t.color, lines: t.text.split('\n').length, lh: t.lineHeight })));
console.log(JSON.stringify(texts, null, 1));
await page.locator('.page-stage').first().screenshot({ path: '/tmp/pdf-import.png' });
await browser.close();
