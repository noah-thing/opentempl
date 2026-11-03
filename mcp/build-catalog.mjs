// Writes apps/editor/public/mcp/catalog.json: what the MCP server tells assistants about
// OpenTempl. Sizes, fonts, the art library, and for every template style the fonts and
// colours its templates actually use, measured from the packs rather than written by hand.
// Run: node mcp/build-catalog.mjs   (the Vercel build runs it after the template packs exist).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMATS } from '../apps/editor/src/doc/formats.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'apps/editor/public');
const index = JSON.parse(fs.readFileSync(path.join(pub, 'templates/index.json'), 'utf8'));
const fonts = JSON.parse(fs.readFileSync(path.join(root, 'apps/editor/src/fonts/google-fonts.json'), 'utf8'));

function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (b.toString('ascii', 0, 4) === 'RIFF') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === 'VP8L') { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  return null;
}

const KINDS = {
  photos: 'Photograph',
  art: 'Illustration or print made for a template',
  stickers: 'Sticker with a transparent background',
  backgrounds: 'Full page background',
  tex: 'Texture to lay over a page (try blend multiply or screen, low opacity)',
};
const library = [];
for (const [dir, kind] of Object.entries(KINDS)) {
  for (const f of fs.readdirSync(path.join(pub, 'library', dir)).sort()) {
    if (!/\.(jpe?g|png|webp)$/.test(f)) continue;
    const size = imageSize(path.join(pub, 'library', dir, f));
    if (!size) continue;
    library.push({ path: `${dir}/${f}`, kind, name: f.replace(/\.\w+$/, '').replace(/-/g, ' '), w: size[0], h: size[1] });
  }
}

const hex = (c) => {
  if (typeof c !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(c)) return null;
  let h = c.toLowerCase();
  if (h.length === 4) h = '#' + [...h.slice(1)].map((x) => x + x).join('');
  return h.slice(0, 7);
};

const styles = {};
for (const [vibe, info] of Object.entries(index.vibes)) {
  const pack = JSON.parse(fs.readFileSync(path.join(pub, 'templates', `${vibe}.json`), 'utf8'));
  const families = new Map();
  const colours = new Map();
  const bump = (m, k, n = 1) => k && m.set(k, (m.get(k) ?? 0) + n);
  const fill = (f) => {
    if (!f) return;
    if (f.type === 'solid') bump(colours, hex(f.color));
    if (f.stops) f.stops.forEach((s) => bump(colours, hex(s.color)));
  };
  for (const t of pack)
    for (const p of t.pages) {
      fill(p.background);
      for (const e of p.elements) {
        if (e.type === 'text') {
          bump(families, `${e.fontFamily}|${e.role === 'heading' || e.fontSize >= 72 ? 'display' : 'text'}`, e.text.length);
          bump(colours, hex(e.color));
        }
        if (e.type === 'shape') fill(e.fill);
        if (e.type === 'svg') for (const c of e.svg.match(/#[0-9a-fA-F]{6}\b/g) ?? []) bump(colours, hex(e.colors?.[c] ?? c));
      }
    }
  const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
  // Near twins (#111111 and #0e0e0e) count as one colour.
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const near = (a, b) => rgb(a).reduce((d, v, i) => d + Math.abs(v - rgb(b)[i]), 0) < 36;
  const distinct = (m, n) => [...m].sort((a, b) => b[1] - a[1]).map(([k]) => k).reduce((out, c) => (out.length < n && !out.some((o) => near(o, c)) ? [...out, c] : out), []);
  const fam = top(families, 12);
  const pick = (role) => [...new Set(fam.filter((f) => f.endsWith(role)).map((f) => f.split('|')[0]))].slice(0, 3);
  const best = index.templates.filter((t) => t.vibe === vibe).sort((a, b) => (b.score ?? 5) - (a.score ?? 5));
  styles[vibe] = {
    name: info.name,
    blurb: info.blurb,
    templates: best.length,
    displayFonts: pick('display'),
    textFonts: pick('text'),
    palette: distinct(colours, 8),
    best: best.slice(0, 5).map((t) => t.id),
  };
}

const catalog = {
  formats: FORMATS.map(({ id, name, group, width, height, note }) => ({ id, name, group, width, height, note })),
  fonts: [['Host Grotesk', 'sans', [300, 400, 500, 600, 700, 800], 1], ...fonts],
  styles,
  library,
};
fs.mkdirSync(path.join(pub, 'mcp'), { recursive: true });
fs.writeFileSync(path.join(pub, 'mcp/catalog.json'), JSON.stringify(catalog));
console.log(`mcp catalog: ${catalog.formats.length} formats, ${catalog.fonts.length} fonts, ${Object.keys(styles).length} styles, ${library.length} library images`);
