import { chromium } from 'playwright';
import fs from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:5181/#/new?template=open-studio', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const stats = await page.evaluate(async () => {
  const { TONES, renderTone } = await import('/src/tools/tones.ts');
  const out = [];
  for (const t of TONES) {
    const t0 = performance.now();
    const blob = await renderTone(t);
    const ms = Math.round(performance.now() - t0);
    const ctx = new OfflineAudioContext(2, 1, 48000);
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    const d = buf.getChannelData(0);
    let peak = 0, sum = 0;
    for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; sum += v * v; }
    const b64 = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(',')[1]); fr.readAsDataURL(blob); });
    out.push({ id: t.id, ms, seconds: buf.duration.toFixed(1), peak: peak.toFixed(2), rmsDb: (20 * Math.log10(Math.sqrt(sum / d.length))).toFixed(1), b64 });
  }
  return out;
});
for (const s of stats) { fs.writeFileSync(`/tmp/tone-${s.id}.wav`, Buffer.from(s.b64, 'base64')); delete s.b64; }
console.log(JSON.stringify(stats));
await page.click('.rail :text("Audio")');
await page.waitForTimeout(400);
await page.click('.tone:has-text("Tram")');
await page.waitForTimeout(4000);
console.log('track now', await page.evaluate(() => window.__tavla.s.meta.soundtrack?.name));
await page.locator('.panel').screenshot({ path: '/tmp/tones-panel.png' });
await browser.close();
