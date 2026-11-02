// One off, run locally after the pages change: makes the 1200 by 630 share images with headless Chrome.
// Reads seo/og-manifest.json (written by build.mjs). Outputs apps/editor/public/seo/og/<name>.png.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'apps/editor/public');
const out = path.join(pub, 'seo/og');
fs.mkdirSync(out, { recursive: true });
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'seo/og-manifest.json'), 'utf8'));
const thumbs = JSON.parse(fs.readFileSync(path.join(root, 'seo/template-thumbs.json'), 'utf8'));
const font = 'file://' + path.join(pub, 'seo/fonts/host-grotesk-latin.woff2');
const mark = 'file://' + path.join(pub, 'mark-96.png');
const tpl = (id) => 'file://' + path.join(pub, 'seo/img/templates', id + '.webp');
// Generic pages show three template previews from different styles.
const trio = ['swiss-grid', 'riso-zine', 'y2k-chrome'].map((v) => thumbs[v]?.[0]?.id).filter(Boolean);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
const only = process.argv[2];

for (const [name, e] of Object.entries(manifest)) {
  if (only && name !== only) continue;
  const img = e.image ? 'file://' + path.join(pub, e.image) : null;
  const size = e.h1.length > 44 ? 54 : e.h1.length > 28 ? 64 : 76;
  const right = img
    ? `<div class="one"><img src="${img}"></div>`
    : `<div class="three">${trio.map((id, i) => `<img style="--i:${i}" src="${tpl(id)}">`).join('')}</div>`;
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:H;src:url(${font});font-weight:300 800}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0c0c0e;color:#f2f1ec;font-family:H,system-ui,sans-serif;display:flex;overflow:hidden}
.l{flex:1;padding:56px 0 56px 64px;display:flex;flex-direction:column;justify-content:space-between}
.b{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:600;letter-spacing:-.02em}.b img{width:34px;border-radius:8px}
.k{font-size:20px;color:#8fa2ff;margin-bottom:18px}
h1{font-size:${size}px;line-height:.98;letter-spacing:-.045em;font-weight:500;max-width:620px}
.r{width:440px;background:#2131f5;position:relative;display:flex;align-items:center;justify-content:center}
.one img{height:630px;width:420px;object-fit:cover;display:block}
.three{position:relative;width:100%;height:100%}.three img{position:absolute;width:210px;border-radius:2px;box-shadow:0 18px 40px -10px rgba(0,0,0,.5);left:calc(50px + var(--i) * 70px);top:calc(60px + var(--i) * 140px)}
.url{font-size:20px;color:#6c6c75}
</style><div class="l"><div class="b"><img src="${mark}">OpenTempl</div><div><div class="k">${e.kicker}</div><h1>${e.h1.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</h1></div><div class="url">opentempl.org</div></div><div class="r">${right}</div>`;
  const f = path.join(tmp, name + '.html');
  fs.writeFileSync(f, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--window-size=1200,630', '--virtual-time-budget=1500', `--screenshot=${path.join(out, name + '.png')}`, 'file://' + f], { stdio: 'ignore' });
}
console.log('og images', Object.keys(manifest).length);

// Shrink: the screenshots are about 280 KB each; a palette PNG is a third of that.
import sharp from 'sharp';
for (const f of fs.readdirSync(out).filter((x) => x.endsWith('.png'))) {
  const p = path.join(out, f);
  const buf = await sharp(p).png({ palette: true, quality: 82, effort: 8 }).toBuffer();
  fs.writeFileSync(p, buf);
}
