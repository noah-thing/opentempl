import list from './google-fonts.json';

export type FontCategory = 'sans' | 'serif' | 'display' | 'hand' | 'mono';

export interface FontInfo {
  family: string;
  category: FontCategory;
  weights: number[];
  italic: boolean;
}

export const FONTS: FontInfo[] = (list as [string, FontCategory, number[], number][]).map(
  ([family, category, weights, italic]) => ({ family, category, weights, italic: !!italic }),
);

const byFamily = new Map(FONTS.map((f) => [f.family, f]));

export function fontInfo(family: string): FontInfo | undefined {
  return byFamily.get(family);
}

// Weight names as they appear in the type menu.
export const WEIGHT_NAMES: Record<number, string> = {
  100: 'Thin',
  200: 'Extra light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semibold',
  700: 'Bold',
  800: 'Extra bold',
  900: 'Black',
};

export function nearestWeight(family: string, weight: number) {
  const info = byFamily.get(family);
  if (!info) return weight;
  return info.weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), info.weights[0]);
}

function cssUrl(family: string) {
  const info = byFamily.get(family);
  const weights = info?.weights.length ? info.weights : [400, 700];
  const axes = info?.italic
    ? `ital,wght@${[...weights.map((w) => `0,${w}`), ...weights.map((w) => `1,${w}`)].join(';')}`
    : `wght@${weights.join(';')}`;
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:${axes}&display=swap`;
}

const requested = new Map<string, Promise<void>>();
let version = 0;
const listeners = new Set<() => void>();

export function fontsVersion() {
  return version;
}

export function onFontsChange(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function bump() {
  version++;
  listeners.forEach((l) => l());
}

// Load a family from Google Fonts (all weights). Resolves once the requested
// face is usable for measuring, so text layout can re-run.
export function ensureFont(family: string, weight = 400, italic = false): Promise<void> {
  const key = family;
  let p = requested.get(key);
  if (!p) {
    p = new Promise<void>((resolve) => {
      if (!byFamily.has(family)) return resolve();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl(family);
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
    requested.set(key, p);
  }
  return p.then(async () => {
    const spec = `${italic ? 'italic ' : ''}${weight} 32px "${family}"`;
    if (document.fonts.check(spec)) return;
    try {
      await document.fonts.load(spec);
    } catch {
      /* offline: fall back silently */
    }
    bump();
  });
}

export function preloadFonts(families: Iterable<string>) {
  return Promise.all([...new Set(families)].map((f) => ensureFont(f)));
}

// Preview fonts in the font menu without loading every weight: only the text
// needed to draw the family name.
const previewed = new Set<string>();
export function previewFont(family: string) {
  if (previewed.has(family)) return;
  previewed.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}&text=${encodeURIComponent(family)}&display=swap`;
  document.head.appendChild(link);
}

// ---------- export embedding ----------
const embedded = new Map<string, Promise<string>>();

async function toDataUrl(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

// CSS with @font-face rules whose sources are inlined as data URLs, so an SVG
// drawn into a canvas (which cannot fetch) still has its fonts.
export function embeddedFontCss(family: string): Promise<string> {
  let p = embedded.get(family);
  if (!p) {
    p = (async () => {
      if (!byFamily.has(family)) return '';
      try {
        const css = await (await fetch(cssUrl(family))).text();
        // Only keep latin and latin-ext subsets to keep exports small.
        const blocks = css.split('/*').filter((b) => /latin/.test(b.slice(0, 40)) || !b.includes('*/'));
        const kept = blocks.length ? blocks.map((b) => '/*' + b).join('') : css;
        const urls = [...kept.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]);
        let out = kept;
        for (const u of new Set(urls)) out = out.split(u).join(await toDataUrl(u));
        return out;
      } catch {
        return '';
      }
    })();
    embedded.set(family, p);
  }
  return p;
}
