import { db } from '../io/db';
import { FONTS } from './fonts';

// User supplied fonts: stored in IndexedDB and registered with FontFace so the
// canvas, measuring and exports can all use them.

interface CustomFont {
  family: string;
  bytes: Uint8Array;
}

let registered = false;

export async function registerCustomFonts() {
  if (registered) return;
  registered = true;
  const all = await db.all<CustomFont>('settings');
  for (const { key, value } of all) {
    if (!key.startsWith('font:')) continue;
    await registerFace(value.family, value.bytes);
  }
}

async function registerFace(family: string, bytes: Uint8Array) {
  const face = new FontFace(family, bytes as unknown as ArrayBuffer);
  await face.load();
  document.fonts.add(face);
  if (!FONTS.some((f) => f.family === family)) FONTS.unshift({ family, category: 'sans', weights: [400], italic: false });
}

export async function addCustomFont(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const family = file.name.replace(/\.(ttf|otf|woff2?)$/i, '').replace(/[-_]+/g, ' ').trim();
  await registerFace(family, bytes);
  await db.set('settings', `font:${family}`, { family, bytes });
  return family;
}

export async function listCustomFonts() {
  const all = await db.all<CustomFont>('settings');
  return all.filter((r) => r.key.startsWith('font:')).map((r) => r.value.family);
}
