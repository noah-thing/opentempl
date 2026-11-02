import { createDesign } from './designs';
import { newId } from '../doc/design';
import { makeImage, makeText } from '../doc/factory';
import type { Asset, DesignSnapshot, Element, Page, TextElement } from '../doc/types';

// Import a PDF as a new design, one OpenTempl page per PDF page.
//
// With `editable` (the default) the text comes in as real text boxes: the page
// is drawn once with its text and once without, the text-free drawing becomes
// a locked background, and every line of text is rebuilt on top in a font
// with the same widths (Arimo for Helvetica and Arial, Tinos for Times,
// Cousine for Courier). The colour of each line is read from the difference
// between the two drawings. Without `editable`, pages come in as pictures.

const PX = 96 / 72; // PDF points to CSS pixels
const SHARP = 2; // background resolution, in multiples of the page size

interface Face {
  family: string;
  ascent: number;
  descent: number;
}

const FACES: Record<'sans' | 'serif' | 'mono', Face> = {
  sans: { family: 'Arimo', ascent: 0.905, descent: 0.212 },
  serif: { family: 'Tinos', ascent: 0.891, descent: 0.216 },
  mono: { family: 'Cousine', ascent: 0.833, descent: 0.3 },
};

interface Run {
  str: string;
  x: number; // left, CSS px
  base: number; // baseline, CSS px
  w: number;
  size: number;
  font: string; // pdf.js font id
}

interface Line extends Run {
  face: Face;
  weight: number;
  italic: boolean;
  color: string;
}

export async function importPdf(file: File, opts: { editable?: boolean; onProgress?: (done: number, total: number) => void } = {}): Promise<string> {
  const editable = opts.editable !== false;
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  // fontExtraProperties keeps font names (Helvetica-Bold and so on), which tell weight and style.
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), fontExtraProperties: true }).promise;
  const first = await pdf.getPage(1);
  const v1 = first.getViewport({ scale: PX });
  const W = Math.round(v1.width);
  const H = Math.round(v1.height);
  const assets: Asset[] = [];
  const pages: Record<string, Page> = {};
  const elements: Record<string, Element> = {};
  const pageOrder: string[] = [];
  const count = Math.min(pdf.numPages, 200);

  for (let i = 1; i <= count; i++) {
    const p = await pdf.getPage(i);
    const vp = p.getViewport({ scale: PX * SHARP });
    const full = await draw(p, vp, true);
    const ids: string[] = [];
    let background = full;
    let lines: Line[] = [];
    if (editable) {
      const bare = await draw(p, vp, false);
      const text = await p.getTextContent();
      const styles = text.styles as Record<string, { fontFamily: string }>;
      const runs: Run[] = [];
      for (const it of text.items as { str: string; transform: number[]; width: number; fontName: string }[]) {
        if (!('str' in it) || !it.str) continue;
        const m = pdfjs.Util.transform(vp.transform, it.transform);
        // Rotated text stays in the background drawing (see draw()).
        if (Math.abs(m[1]) > 0.01 || Math.abs(m[2]) > 0.01) continue;
        const size = Math.hypot(m[2], m[3]) / SHARP;
        if (size < 3) continue;
        runs.push({ str: it.str, x: m[4] / SHARP, base: m[5] / SHARP, w: (it.width * PX), size, font: it.fontName });
      }
      lines = joinRuns(runs).map((r) => {
        const style = styles[r.font]?.fontFamily ?? '';
        const name = `${r.font} ${style} ${fontNameOf(p, r.font)}`;
        return { ...r, ...classify(name), color: inkOf(full, bare, r) };
      });
      // Only use the text-free drawing when there was text to rebuild.
      if (lines.length) background = bare;
    }
    const blob = await new Promise<Blob>((r) => background.toBlob((b) => r(b!), 'image/jpeg', 0.9));
    const asset: Asset = { id: newId(), mime: 'image/jpeg', width: background.width, height: background.height, name: `${file.name} page ${i}`, bytes: new Uint8Array(await blob.arrayBuffer()) };
    assets.push(asset);
    const pw = Math.round(vp.width / SHARP);
    const ph = Math.round(vp.height / SHARP);
    const img = makeImage({ assetId: asset.id, x: 0, y: 0, w: (pw / pw) * W, h: (ph / pw) * W, locked: true, name: `PDF page ${i}` });
    elements[img.id] = img;
    ids.push(img.id);
    const k = W / pw; // later pages of another size are scaled to the first page's width
    for (const box of toBoxes(lines)) {
      const t = scaleText(box, k);
      elements[t.id] = t;
      ids.push(t.id);
    }
    const pid = newId();
    pages[pid] = { id: pid, name: '', background: { type: 'solid', color: '#FFFFFF' }, elementIds: ids, notes: '', transition: 'none', duration: 5 };
    pageOrder.push(pid);
    opts.onProgress?.(i, count);
  }
  const now = Date.now();
  const snapshot: DesignSnapshot = {
    meta: { id: '', title: file.name.replace(/\.pdf$/i, ''), width: W, height: H, unit: 'px', createdAt: now, updatedAt: now },
    pageOrder,
    pages,
    elements,
  };
  return createDesign({ snapshot, assets });
}

type PdfPage = Awaited<ReturnType<Awaited<ReturnType<typeof import('pdfjs-dist').getDocument>['promise']>['getPage']>>;
type Viewport = ReturnType<PdfPage['getViewport']>;

// Draw a page; without text, upright glyphs are skipped (rotated ones stay,
// because they are not rebuilt as text boxes).
async function draw(p: PdfPage, vp: Viewport, withText: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(vp.width);
  canvas.height = Math.round(vp.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  if (!withText) {
    const fill = ctx.fillText.bind(ctx);
    const stroke = ctx.strokeText.bind(ctx);
    const upright = () => {
      const m = ctx.getTransform();
      return Math.abs(m.b) < 1e-3 && Math.abs(m.c) < 1e-3;
    };
    ctx.fillText = (...a: Parameters<CanvasRenderingContext2D['fillText']>) => (upright() ? undefined : fill(...a));
    ctx.strokeText = (...a: Parameters<CanvasRenderingContext2D['strokeText']>) => (upright() ? undefined : stroke(...a));
  }
  await p.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
  return canvas;
}

function fontNameOf(p: PdfPage, id: string): string {
  try {
    const f = p.commonObjs.has(id) ? (p.commonObjs.get(id) as { name?: string }) : null;
    return f?.name ?? '';
  } catch {
    return '';
  }
}

function classify(name: string): { face: Face; weight: number; italic: boolean } {
  const face = /courier|mono|consol|menlo|code/i.test(name) ? FACES.mono : /times|serif(?!-?sans)|georgia|garamond|minion|cambria|book|roman/i.test(name) && !/sans/i.test(name) ? FACES.serif : FACES.sans;
  const weight = /black|heavy/i.test(name) ? 800 : /bold|semibold|demi/i.test(name) ? 700 : /medium/i.test(name) ? 500 : /light|thin/i.test(name) ? 300 : 400;
  return { face, weight, italic: /italic|oblique/i.test(name) };
}

// pdf.js splits lines into many runs (often per word). Join neighbours on the
// same baseline in the same font into one line.
function joinRuns(runs: Run[]): Run[] {
  const out: Run[] = [];
  for (const r of runs) {
    const prev = out[out.length - 1];
    const gap = prev ? r.x - (prev.x + prev.w) : 0;
    if (prev && prev.font === r.font && Math.abs(prev.size - r.size) < prev.size * 0.03 && Math.abs(prev.base - r.base) < prev.size * 0.2 && gap > -prev.size * 0.5 && gap < prev.size * 0.8) {
      const space = gap > prev.size * 0.12 && !prev.str.endsWith(' ') && !r.str.startsWith(' ') ? ' ' : '';
      prev.str += space + r.str;
      prev.w = r.x + r.w - prev.x;
    } else out.push({ ...r, str: r.str });
  }
  return out.map((r) => ({ ...r, str: r.str.replace(/\s+$/, '') })).filter((r) => r.str.trim());
}

// The text colour: the most different pixel between the drawings with and
// without text, inside the line's box. Averages the strongest few so edge
// antialiasing does not wash it out.
function inkOf(full: HTMLCanvasElement, bare: HTMLCanvasElement, r: Run): string {
  const x0 = Math.max(0, Math.floor(r.x * SHARP));
  const y0 = Math.max(0, Math.floor((r.base - r.size * 0.8) * SHARP));
  const w = Math.max(1, Math.min(full.width - x0, Math.ceil(r.w * SHARP)));
  const h = Math.max(1, Math.min(full.height - y0, Math.ceil(r.size * SHARP)));
  if (w <= 0 || h <= 0) return '#0B0B0D';
  const a = full.getContext('2d')!.getImageData(x0, y0, w, h).data;
  const b = bare.getContext('2d')!.getImageData(x0, y0, w, h).data;
  const hits: [number, number, number, number][] = [];
  for (let i = 0; i < a.length; i += 4 * 3) {
    const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    if (d > 60) hits.push([d, a[i], a[i + 1], a[i + 2]]);
  }
  if (!hits.length) return '#0B0B0D';
  hits.sort((p, q) => q[0] - p[0]);
  const top = hits.slice(0, Math.max(3, Math.ceil(hits.length * 0.2)));
  const avg = [1, 2, 3].map((k) => Math.round(top.reduce((s, h2) => s + h2[k], 0) / top.length));
  return '#' + avg.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Lines that sit under each other in the same style become one paragraph box.
interface Box {
  lines: Line[];
  lh: number; // line height as a multiple of the font size
}

function toBoxes(lines: Line[]): Box[] {
  const boxes: Box[] = [];
  for (const l of lines) {
    const b = boxes[boxes.length - 1];
    const last = b?.lines[b.lines.length - 1];
    if (b && last && same(last, l) && Math.abs(last.x - l.x) < 3) {
      const g = (l.base - last.base) / l.size;
      if (g > 0.95 && g < 2 && (b.lines.length === 1 || Math.abs(g - b.lh) < 0.08)) {
        b.lh = b.lines.length === 1 ? g : b.lh;
        b.lines.push(l);
        continue;
      }
    }
    boxes.push({ lines: [l], lh: 1.2 });
  }
  return boxes;
}

function same(a: Line, b: Line) {
  return a.font === b.font && Math.abs(a.size - b.size) < a.size * 0.03 && a.color === b.color;
}

function scaleText(box: Box, k: number): TextElement {
  const l0 = box.lines[0];
  const size = l0.size * k;
  const lh = Math.round(box.lh * 100) / 100;
  // Same baseline maths as OpenTempl's own text layout, run backwards.
  const offset = ((lh - (l0.face.ascent + l0.face.descent)) / 2 + l0.face.ascent) * size;
  const width = Math.max(...box.lines.map((l) => l.w)) * k;
  return makeText({
    text: box.lines.map((l) => l.str).join('\n'),
    x: round(l0.x * k),
    y: round(l0.base * k - offset),
    // A little slack so a substitute font never wraps a line the PDF kept whole.
    w: round(width * 1.06 + size * 0.3),
    h: round(size * lh * box.lines.length),
    fontFamily: l0.face.family,
    fontSize: round(size),
    fontWeight: l0.weight,
    italic: l0.italic,
    color: l0.color,
    lineHeight: lh,
    name: l0.str.slice(0, 40),
  });
}

const round = (n: number) => Math.round(n * 100) / 100;
