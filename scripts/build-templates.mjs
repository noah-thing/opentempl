// Builds the template packs the editor loads on demand.
//   node scripts/build-templates.mjs            every vibe
//   node scripts/build-templates.mjs riso-zine  one vibe (index is rebuilt from all packs)
// Reads apps/editor/templates/vibes/*.mjs, checks every template, resolves photo
// crops from the real image sizes and writes apps/editor/public/templates/
// <vibe>.json plus index.json (what the gallery lists).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const editor = path.join(root, 'apps/editor');
const srcDir = path.join(editor, 'templates/vibes');
const outDir = path.join(editor, 'public/templates');
const libDir = path.join(editor, 'public/library');
fs.mkdirSync(outDir, { recursive: true });

const fonts = new Map(JSON.parse(fs.readFileSync(path.join(editor, 'src/fonts/google-fonts.json'))).map((f) => [f[0], f]));
fonts.set('Host Grotesk', ['Host Grotesk', 'sans', [300, 400, 500, 600, 700, 800], 0]);
const VIBES = JSON.parse(fs.readFileSync(path.join(editor, 'templates/vibes.json')));
// How beautiful and hand made each template looks, 1 to 10 (art director's ranking); orders the gallery.
const scoresPath = path.join(editor, 'templates/scores.json');
const SCORES = fs.existsSync(scoresPath) ? JSON.parse(fs.readFileSync(scoresPath)) : {};

// Image size from the file header (png, jpeg, webp, gif).
const sizes = new Map();
function imageSize(file) {
  if (sizes.has(file)) return sizes.get(file);
  const b = fs.readFileSync(file);
  let s = null;
  if (b[0] === 0x89 && b[1] === 0x50) s = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  else if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) { s = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; break; }
      i += 2 + len;
    }
  } else if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') s = { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    else if (kind === 'VP8L') { const n = b.readUInt32LE(21); s = { w: 1 + (n & 0x3fff), h: 1 + ((n >> 14) & 0x3fff) }; }
    else s = { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  } else if (b.toString('ascii', 0, 3) === 'GIF') s = { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  sizes.set(file, s);
  return s;
}

function coverCrop(iw, ih, w, h) {
  const ir = iw / ih, br = w / h;
  if (ir > br) { const cw = br / ir; return { x: (1 - cw) / 2, y: 0, w: cw, h: 1 }; }
  const ch = ir / br;
  return { x: 0, y: (1 - ch) / 2, w: 1, h: ch };
}

const only = process.argv.slice(2);
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.mjs') && (!only.length || only.includes(f.replace(/\.mjs$/, ''))));
const problems = [];
const ids = new Set();

for (const f of files) {
  const vibe = f.replace(/\.mjs$/, '');
  let list;
  try {
    list = (await import(pathToFileURL(path.join(srcDir, f)).href + '?t=' + Date.now())).default;
  } catch (e) {
    problems.push(`${vibe}: does not load: ${e.message}`);
    continue;
  }
  if (!VIBES[vibe]) problems.push(`${vibe}: not listed in templates/vibes.json`);
  const out = [];
  for (const t of list) {
    const where = `${vibe}/${t.id}`;
    if (!t.id || !/^[a-z0-9-]+$/.test(t.id)) problems.push(`${where}: id must be kebab case`);
    if (ids.has(t.id)) problems.push(`${where}: duplicate id`);
    ids.add(t.id);
    if (!t.name) problems.push(`${where}: no name`);
    if (!t.width || !t.height) problems.push(`${where}: no size (format?)`);
    if (!t.pages?.length) problems.push(`${where}: no pages`);
    const fixImage = (assetId) => {
      if (!assetId?.startsWith('lib:')) return null;
      const file = path.join(libDir, assetId.slice(4));
      if (!fs.existsSync(file)) { problems.push(`${where}: missing library file ${assetId}`); return null; }
      return imageSize(file);
    };
    for (const p of t.pages ?? []) {
      if (p.background?.type === 'image') fixImage(p.background.assetId);
      for (const e of p.elements) {
        if (e.type === 'text') {
          // Korean or Japanese in a Latin only font would fall back to whatever the viewer's system has.
          const CJK_FONTS = /Noto (Sans|Serif) (KR|JP)|Black Han Sans|Do Hyeon|Dela Gothic|Zen |DotGothic|Rampart|Gothic A1|M PLUS|Jua|Gowun|Shippori|Yusei|Kosugi|Gugi|Sunflower/;
          if (!CJK_FONTS.test(e.fontFamily)) {
            const ko = /[\u3131-\u318E\uAC00-\uD7A3]/.test(e.text);
            const ja = /[\u3040-\u30FF\u4E00-\u9FFF]/.test(e.text);
            if (ko || ja) {
              e.fontFamily = ko ? 'Noto Sans KR' : 'Noto Sans JP';
              e.fontWeight = [100, 200, 300, 400, 500, 600, 700, 800, 900].reduce((b, w) => (Math.abs(w - e.fontWeight) < Math.abs(b - e.fontWeight) ? w : b), 400);
            }
          }
          const info = fonts.get(e.fontFamily);
          if (!info) problems.push(`${where}: unknown font "${e.fontFamily}"`);
          else if (!info[2].includes(e.fontWeight)) problems.push(`${where}: "${e.fontFamily}" has no weight ${e.fontWeight} (has ${info[2].join(', ')})`);
        }
        if (e.type === 'image') {
          const s = fixImage(e.assetId);
          if (e.crop === 'cover') e.crop = s ? coverCrop(s.w, s.h, e.w, e.h) : { x: 0, y: 0, w: 1, h: 1 };
        }
        for (const k of ['x', 'y', 'w', 'h']) if (typeof e[k] !== 'number' || Number.isNaN(e[k])) problems.push(`${where}: ${e.type} has bad ${k}`);
      }
    }
    out.push({ ...t, vibe });
  }
  fs.writeFileSync(path.join(outDir, `${vibe}.json.tmp`), JSON.stringify(out));
  fs.renameSync(path.join(outDir, `${vibe}.json.tmp`), path.join(outDir, `${vibe}.json`));
  console.log(`${vibe}: ${out.length} templates`);
}

// The index lists every pack on disk, so building one vibe keeps the others.
const index = { vibes: VIBES, templates: [] };
for (const f of fs.readdirSync(outDir).filter((f) => f.endsWith('.json') && f !== 'index.json')) {
  if (!VIBES[f.replace(/\.json$/, '')]) continue;
  const vibe = f.replace(/\.json$/, '');
  for (const t of JSON.parse(fs.readFileSync(path.join(outDir, f)))) {
    index.templates.push({ id: t.id, name: t.name, vibe, category: t.category, tags: t.tags ?? [], width: t.width, height: t.height, formatId: t.formatId, pages: t.pages.length, score: SCORES[t.id] ?? 5 });
  }
}
fs.writeFileSync(path.join(outDir, 'index.json.tmp' + process.pid), JSON.stringify(index));
fs.renameSync(path.join(outDir, 'index.json.tmp' + process.pid), path.join(outDir, 'index.json'));
console.log(`index: ${index.templates.length} templates in ${new Set(index.templates.map((t) => t.vibe)).size} vibes`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ' + p).join('\n'));
  process.exitCode = 1;
}
