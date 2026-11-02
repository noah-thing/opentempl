// Bakes the hero bloom's colour grid from a reference pin: a small grid of
// palette indices, not the image itself (the image is hotlinked with credit).
//   node scripts/hero-bloom.mjs <pin image url> <look id> <author> <pin url>
import fs from 'node:fs';
import sharp from 'sharp';
const [src, look, author, pin] = process.argv.slice(2);
const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
const meta = await sharp(buf).metadata();
// Scans often carry a white margin; find it so the page shows only the cover.
const { info } = await sharp(buf).trim({ background: '#ffffff', threshold: 40 }).toBuffer({ resolveWithObject: true });
const crop = { left: -(info.trimOffsetLeft ?? 0), top: -(info.trimOffsetTop ?? 0), width: info.width, height: info.height };
const W = 22, H = Math.round((W * crop.height) / crop.width);
// Inks come from the full picture (halftone dots stay pure there); each cell then
// takes the ink most of its own pixels are closest to, so dots never average to grey.
const S = 8;
const raw = await sharp(buf).extract(crop).resize(W * S, H * S, { fit: 'fill' }).removeAlpha().raw().toBuffer();
const px = [];
for (let i = 0; i < raw.length; i += 3) px.push([raw[i], raw[i + 1], raw[i + 2]]);
const d = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const near = (c) => inks.reduce((b, m, i) => (d(m, c) < d(inks[b], c) ? i : b), 0);
// INKS="#hex,#hex" pins the inks by hand when k-means blends halftone dots.
const fixed = process.env.INKS?.includes('#') ? process.env.INKS.split(',').map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))) : null;
const k = fixed ? fixed.length : Number(process.env.INKS || 4), sample = px.filter((_, i) => i % 7 === 0), inks = fixed ?? [sample[0]];
while (!fixed && inks.length < k) inks.push(sample.reduce((f, c) => (Math.min(...inks.map((m) => d(m, c))) > Math.min(...inks.map((m) => d(m, f))) ? c : f)));
for (let r = 0; r < (fixed ? 0 : 12); r++) {
  const s = inks.map(() => [0, 0, 0, 0]);
  for (const c of sample) { const j = near(c); s[j][0] += c[0]; s[j][1] += c[1]; s[j][2] += c[2]; s[j][3]++; }
  s.forEach((t, j) => t[3] && (inks[j] = [t[0] / t[3], t[1] / t[3], t[2] / t[3]]));
}
const hex = inks.map((c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''));
let grid = '';
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const votes = new Array(k).fill(0);
    for (let v = 0; v < S; v++) for (let u = 0; u < S; u++) votes[near(px[(y * S + v) * W * S + x * S + u])]++;
    grid += votes.indexOf(Math.max(...votes));
  }
const out = { look, src, pin, author, width: meta.width, height: meta.height, crop, cols: W, rows: H, inks: hex, grid };
fs.writeFileSync(new URL('../apps/editor/public/looks/hero-bloom.json', import.meta.url), JSON.stringify(out));
console.log(hex, W, H);
