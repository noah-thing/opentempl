// One off, run locally: makes the small WebP images the static pages use.
// Sources: Look samples (public/looks/samples), template previews (apps/editor/templates/shots, not in git),
// the maker avatar. Outputs are committed under apps/editor/public/seo/img so the Vercel build needs no sharp.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'apps/editor/public');
const out = path.join(pub, 'seo/img');
for (const d of ['looks', 'templates', 'misc']) fs.mkdirSync(path.join(out, d), { recursive: true });

const looks = JSON.parse(fs.readFileSync(path.join(pub, 'looks/looks.json'), 'utf8'));
let n = 0;
for (const l of looks) {
  const src = path.join(pub, 'looks/samples', l.id + '.jpg');
  if (!fs.existsSync(src)) { console.log('no sample for', l.id); continue; }
  for (const w of [480, 900]) {
    await sharp(src).resize({ width: w }).webp({ quality: 74 }).toFile(path.join(out, 'looks', `${l.id}-${w}.webp`));
    n++;
  }
}

const index = JSON.parse(fs.readFileSync(path.join(pub, 'templates/index.json'), 'utf8'));
const shots = path.join(root, 'apps/editor/templates/shots');
const picks = {};
for (const t of index.templates) (picks[t.vibe] ??= []).push(t);
const chosen = {};
for (const [vibe, list] of Object.entries(picks)) {
  list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.id.localeCompare(b.id));
  chosen[vibe] = [];
  for (const t of list.slice(0, 12)) {
    const src = path.join(shots, vibe, t.id + '.png');
    if (!fs.existsSync(src)) continue;
    const meta = await sharp(src).metadata();
    await sharp(src).resize({ width: 420 }).webp({ quality: 78 }).toFile(path.join(out, 'templates', `${t.id}.webp`));
    chosen[vibe].push({ id: t.id, name: t.name, category: t.category, w: 420, h: Math.round((420 * meta.height) / meta.width) });
    n++;
  }
}
fs.writeFileSync(path.join(root, 'seo/template-thumbs.json'), JSON.stringify(chosen, null, 1));
await sharp(path.join(root, 'apps/editor/src/assets/fsconfig.jpg')).resize(72, 72).webp({ quality: 85 }).toFile(path.join(out, 'misc/fsconfig.webp'));
console.log('images', n, 'vibes with thumbs', Object.keys(chosen).length);
