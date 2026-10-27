import type { DesignSnapshot, Element, Fill, Id, Page } from '../doc/types';
import { parseSvg } from '../render/ElementView';

// Restyling a whole design at once: a palette swap that keeps the design's
// light and dark structure (colours are matched by brightness rank, so text
// stays readable on its background), and a font pairing for headings and body.

export interface Palette {
  name: string;
  colors: string[]; // five, any order
}

export const PALETTES: Palette[] = [
  { name: 'Harbour', colors: ['#0B1F33', '#1F4E6B', '#6FA3B8', '#E7D9C4', '#F6F1E8'] },
  { name: 'Fika', colors: ['#3B2416', '#8A5A3C', '#D9A86C', '#F3E2C7', '#FFF9F0'] },
  { name: 'Midsummer', colors: ['#1D3B2A', '#3E7C4F', '#F2C14E', '#F78764', '#FDF6E3'] },
  { name: 'Riso', colors: ['#0B0B0D', '#2B3BFF', '#FF4B39', '#FFE600', '#F4F1EA'] },
  { name: 'Lingonberry', colors: ['#3A0D12', '#8E1B2C', '#D94A56', '#F2C4C0', '#FBF3F1'] },
  { name: 'Fog', colors: ['#2E3338', '#5C6670', '#9AA5AE', '#D5DBDF', '#F2F4F5'] },
  { name: 'Tram', colors: ['#101010', '#3A3A3A', '#F5C400', '#F2EFE6', '#FFFFFF'] },
  { name: 'Pine and snow', colors: ['#0F2A24', '#24574A', '#7FA89A', '#DDE8E3', '#FBFDFC'] },
  { name: 'Night bus', colors: ['#0D0221', '#261447', '#F6019D', '#FF3864', '#2DE2E6'] },
  { name: 'Clay', colors: ['#3D2B24', '#A0522D', '#D98E5F', '#EAD2BE', '#F7EFE7'] },
  { name: 'Lilac hour', colors: ['#2A2440', '#5B4B8A', '#9AA2EA', '#E0DDF7', '#FAF9FF'] },
  { name: 'Mint print', colors: ['#0B3D2E', '#1E8F6A', '#3EDD8A', '#C9F5DE', '#F4FFF9'] },
  { name: 'Ink and paper', colors: ['#0B0B0D', '#3D3D45', '#8A8A96', '#E4E4E9', '#FFFFFF'] },
  { name: 'Saffron', colors: ['#2B1A05', '#B5531B', '#F29F05', '#F7D488', '#FFF8E7'] },
  { name: 'Sea glass', colors: ['#0E3B43', '#357266', '#A3BBAD', '#E4EFE9', '#F7FBF9'] },
  { name: 'Bubblegum', colors: ['#3F0D2E', '#C2185B', '#FF6FB5', '#FFD1E8', '#FFF5FA'] },
];

export interface FontPair {
  name: string;
  heading: string;
  headingWeight: number;
  body: string;
}

export const FONT_PAIRS: FontPair[] = [
  { name: 'Grotesk', heading: 'Host Grotesk', headingWeight: 700, body: 'Host Grotesk' },
  { name: 'Editorial', heading: 'Fraunces', headingWeight: 600, body: 'Source Sans 3' },
  { name: 'Swiss', heading: 'Archivo', headingWeight: 800, body: 'Archivo' },
  { name: 'Bookish', heading: 'Libre Caslon Text', headingWeight: 700, body: 'Crimson Pro' },
  { name: 'Friendly', heading: 'Fredoka', headingWeight: 600, body: 'Nunito' },
  { name: 'Workshop', heading: 'Space Grotesk', headingWeight: 700, body: 'Space Mono' },
  { name: 'Gallery', heading: 'Playfair Display', headingWeight: 700, body: 'Lato' },
  { name: 'Poster', heading: 'Bebas Neue', headingWeight: 400, body: 'Work Sans' },
  { name: 'Soft serif', heading: 'DM Serif Display', headingWeight: 400, body: 'DM Sans' },
  { name: 'Loud', heading: 'Unbounded', headingWeight: 800, body: 'Manrope' },
  { name: 'Studio', heading: 'Bricolage Grotesque', headingWeight: 700, body: 'Instrument Sans' },
  { name: 'Plex', heading: 'IBM Plex Sans', headingWeight: 600, body: 'IBM Plex Mono' },
];

const HEX = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
// Fields that can hold a hex string the user typed rather than a colour.
const SKIP = new Set(['id', 'text', 'cells', 'value', 'name', 'alt', 'notes', 'svg', 'source', 'path', 'link']);

export function luminance(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function eachHex(v: unknown, fn: (hex: string) => string): unknown {
  if (typeof v === 'string') return HEX.test(v) ? fn(v) : v;
  if (Array.isArray(v)) return v.map((x) => eachHex(x, fn));
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = SKIP.has(k) ? x : eachHex(x, fn);
    return out;
  }
  return v;
}

function svgShown(el: Element & { type: 'svg' }) {
  return parseSvg(el.svg).colors.map((c) => [c, el.colors[c] ?? (c === 'currentColor' ? '#0B0B0D' : c)] as const);
}

// An element without the colours it stores but does not show (a switched off
// text effect, an empty shadow), so they do not skew the brightness ranking.
function visible(el: Element): unknown {
  const copy: Record<string, unknown> = { ...el };
  if (el.type === 'text' && el.effect?.kind === 'none') delete copy.effect;
  if (!el.shadow) delete copy.shadow;
  return copy;
}

// Every colour the pages use, keyed upper case without alpha.
export function designColors(snap: DesignSnapshot, pageIds: Id[]): string[] {
  const seen = new Set<string>();
  const note = (h: string) => (seen.add(h.slice(0, 7).toUpperCase()), h);
  for (const pid of pageIds) {
    const page = snap.pages[pid];
    eachHex(page.background, note);
    for (const id of page.elementIds) {
      const el = snap.elements[id];
      if (!el || el.type === 'image' || el.type === 'video') continue;
      if (el.type === 'svg') svgShown(el).forEach(([, shown]) => HEX.test(shown) && note(shown));
      else eachHex(visible(el), note);
    }
  }
  return [...seen];
}

// Map each design colour to the palette colour at the same brightness rank.
export function paletteMap(colors: string[], palette: string[]): Map<string, string> {
  const from = [...colors].sort((a, b) => luminance(a) - luminance(b));
  const to = [...palette].sort((a, b) => luminance(a) - luminance(b));
  const map = new Map<string, string>();
  from.forEach((c, i) => {
    const k = from.length === 1 ? to.length - 1 : Math.round((i / (from.length - 1)) * (to.length - 1));
    map.set(c, to[k]);
  });
  return map;
}

export function recolor(snap: DesignSnapshot, pageIds: Id[], palette: string[]) {
  const map = paletteMap(designColors(snap, pageIds), palette);
  const swap = (h: string) => (map.get(h.slice(0, 7).toUpperCase()) ?? h.slice(0, 7)) + h.slice(7);
  const elements: Record<Id, Partial<Element>> = {};
  const pages: Record<Id, Partial<Page>> = {};
  for (const pid of pageIds) {
    const page = snap.pages[pid];
    pages[pid] = { background: eachHex(page.background, swap) as Fill };
    for (const id of page.elementIds) {
      const el = snap.elements[id];
      if (!el || el.type === 'image' || el.type === 'video') continue;
      if (el.type === 'svg') {
        const colors: Record<string, string> = { ...el.colors };
        for (const [orig, shown] of svgShown(el)) if (HEX.test(shown)) colors[orig] = swap(shown);
        elements[id] = { colors } as Partial<Element>;
      } else {
        const next = eachHex(el, swap) as Element;
        const patch: Record<string, unknown> = {};
        for (const k of Object.keys(next) as (keyof Element)[]) if (JSON.stringify(next[k]) !== JSON.stringify(el[k])) patch[k] = next[k];
        if (Object.keys(patch).length) elements[id] = patch as Partial<Element>;
      }
    }
  }
  return { elements, pages };
}

// Headings: anything marked as a heading, or set large for its page.
export function refont(snap: DesignSnapshot, pageIds: Id[], pair: FontPair, nearest: (family: string, weight: number) => number) {
  const elements: Record<Id, Partial<Element>> = {};
  for (const pid of pageIds) {
    const texts = snap.pages[pid].elementIds.map((id) => snap.elements[id]).filter((e): e is Element & { type: 'text' } => e?.type === 'text');
    const top = Math.max(0, ...texts.map((t) => t.fontSize));
    for (const t of texts) {
      const heading = t.role === 'heading' || t.role === 'subheading' || t.fontSize >= Math.max(40, top * 0.55);
      const family = heading ? pair.heading : pair.body;
      const weight = nearest(family, heading ? pair.headingWeight : t.fontWeight);
      elements[t.id] = {
        fontFamily: family,
        fontWeight: weight,
        runs: t.runs?.map((r) => (r.fontWeight ? { ...r, fontWeight: nearest(family, r.fontWeight) } : r)),
      } as Partial<Element>;
    }
  }
  return elements;
}

// Five colours from a photo: k-means on a small copy, then spread by brightness.
export async function paletteFromImage(url: string): Promise<string[]> {
  const img = await createImageBitmap(await (await fetch(url)).blob());
  const s = 64;
  const c = new OffscreenCanvas(s, s);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, s, s);
  img.close();
  const d = ctx.getImageData(0, 0, s, s).data;
  const px: [number, number, number][] = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) px.push([d[i], d[i + 1], d[i + 2]]);
  if (!px.length) return PALETTES[0].colors;
  // Start the centres spread across the brightness range, then refine.
  const byLight = [...px].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let centres = [0.04, 0.27, 0.5, 0.73, 0.96].map((q) => [...byLight[Math.floor(q * (byLight.length - 1))]] as [number, number, number]);
  for (let it = 0; it < 12; it++) {
    const sums = centres.map(() => [0, 0, 0, 0]);
    for (const p of px) {
      let best = 0;
      let bd = Infinity;
      centres.forEach((cc, k) => {
        const dd = (p[0] - cc[0]) ** 2 + (p[1] - cc[1]) ** 2 + (p[2] - cc[2]) ** 2;
        if (dd < bd) {
          bd = dd;
          best = k;
        }
      });
      const sm = sums[best];
      sm[0] += p[0];
      sm[1] += p[1];
      sm[2] += p[2];
      sm[3]++;
    }
    centres = centres.map((cc, k) => (sums[k][3] ? [sums[k][0] / sums[k][3], sums[k][1] / sums[k][3], sums[k][2] / sums[k][3]] : cc)) as typeof centres;
  }
  const hex = centres.map((cc) => '#' + cc.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase());
  return [...new Set(hex)];
}
