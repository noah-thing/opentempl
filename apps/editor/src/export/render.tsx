import { renderToStaticMarkup } from 'react-dom/server';
import type { DesignSnapshot, Element, Id, Page } from '../doc/types';
import type { DesignDoc } from '../doc/design';
import { PageView } from '../render/PageView';
import { ElementView } from '../render/ElementView';
import { aabb } from '../lib/geom';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { embeddedFontCss, ensureFont, fontsVersion } from '../fonts/fonts';

// Turns pages into standalone SVG strings (fonts and images inlined) and then
// into pixels. Everything OpenTempl exports goes through here, thumbnails included.

const dataUrlCache = new WeakMap<Uint8Array, string>();

function bytesToDataUrl(bytes: Uint8Array, mime: string) {
  const hit = dataUrlCache.get(bytes);
  if (hit) return hit;
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  const url = `data:${mime};base64,${btoa(bin)}`;
  dataUrlCache.set(bytes, url);
  return url;
}

export function fontsUsed(page: Page, elements: Record<Id, Element>) {
  const set = new Set<string>();
  for (const id of page.elementIds) {
    const el = elements[id];
    if (!el) continue;
    if (el.type === 'text' || el.type === 'chart' || el.type === 'table') set.add(el.fontFamily);
  }
  return [...set];
}

export interface PageSvgOptions {
  transparent?: boolean;
  embedFonts?: boolean;
  idPrefix?: string;
  time?: number; // render entrance animations at this moment
  bleed?: number; // extra design units drawn around the page, for print
  videoFrames?: Record<Id, string>; // video clips: the frame to show, as data URLs
}

export async function pageSvg(doc: DesignDoc, snap: DesignSnapshot, pageId: Id, opts: PageSvgOptions = {}) {
  const page = snap.pages[pageId];
  const families = fontsUsed(page, snap.elements);
  await Promise.all(families.map((f) => ensureFont(f)));
  const css = opts.embedFonts === false ? '' : (await Promise.all(families.map((f) => embeddedFontCss(f)))).join('\n');
  const env: RenderEnv = {
    assetUrl: (id) => {
      const a = doc.getAsset(id);
      return a ? bytesToDataUrl(a.bytes, a.mime) : undefined;
    },
    assetSize: (id) => {
      const a = doc.getAsset(id);
      return a ? { width: a.width, height: a.height } : undefined;
    },
    fontsVersion: fontsVersion(),
    mode: 'export',
    time: opts.time,
    videoFrame: opts.videoFrames ? (id) => opts.videoFrames![id] : undefined,
    idPrefix: opts.idPrefix ?? `p${snap.pageOrder.indexOf(pageId)}-`,
  };
  const p = opts.transparent ? { ...page, background: { type: 'solid' as const, color: 'transparent' } } : page;
  const elements = opts.bleed ? extendIntoBleed(page, snap.elements, snap.meta.width, snap.meta.height, opts.bleed) : snap.elements;
  let markup = renderToStaticMarkup(
    <RenderContext.Provider value={env}>
      <PageView page={p} elements={elements} width={snap.meta.width} height={snap.meta.height} />
    </RenderContext.Provider>,
  );
  if (opts.bleed) {
    // Widen the view so anything running off the page edge prints into the bleed.
    const b = opts.bleed;
    const W = snap.meta.width;
    const H = snap.meta.height;
    markup = markup
      .replace(/viewBox="[^"]*"/, `viewBox="${-b} ${-b} ${W + 2 * b} ${H + 2 * b}"`)
      .replace(/width="[^"]*" height="[^"]*"/, `width="${W + 2 * b}" height="${H + 2 * b}"`)
      .replace(/<rect width="([\d.]+)" height="([\d.]+)" fill=/, `<rect x="${-b}" y="${-b}" width="${W + 2 * b}" height="${H + 2 * b}" fill=`);
  }
  if (css) markup = markup.replace(/<svg([^>]*)>/, `<svg$1><style>${css.replace(/<\/style/g, '')}</style>`);
  return markup;
}

export function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function rasterize(svg: string, width: number, height: number, scale: number, background?: string) {
  const img = await loadSvgImage(svg);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d')!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, quality),
  );
}

export async function renderPageBlob(
  doc: DesignDoc,
  snap: DesignSnapshot,
  pageId: Id,
  opts: { type: 'png' | 'jpg' | 'webp'; scale: number; transparent?: boolean; quality?: number },
) {
  const svg = await pageSvg(doc, snap, pageId, { transparent: opts.transparent && opts.type !== 'jpg' });
  const canvas = await rasterize(svg, snap.meta.width, snap.meta.height, opts.scale, opts.type === 'jpg' ? '#FFFFFF' : undefined);
  const mime = opts.type === 'jpg' ? 'image/jpeg' : opts.type === 'webp' ? 'image/webp' : 'image/png';
  return canvasToBlob(canvas, mime, opts.quality);
}

export async function thumbnail(doc: DesignDoc, snap: DesignSnapshot, pageId: Id, maxSide = 480) {
  const scale = Math.min(1, maxSide / Math.max(snap.meta.width, snap.meta.height));
  const svg = await pageSvg(doc, snap, pageId, { idPrefix: 'thumb-' });
  const canvas = await rasterize(svg, snap.meta.width, snap.meta.height, scale);
  return canvasToBlob(canvas, 'image/webp', 0.82);
}

// Anything that touches a page edge grows into the bleed so trimming never
// shows a sliver of background. Photos keep their scale and reveal more image.
function extendIntoBleed(page: Page, elements: Record<Id, Element>, W: number, H: number, b: number) {
  const out: Record<Id, Element> = { ...elements };
  const near = (a: number, c: number) => Math.abs(a - c) < 1;
  for (const id of page.elementIds) {
    const el = elements[id];
    if (!el || el.rotation) continue;
    const l = near(el.x, 0) || el.x < 0;
    const t = near(el.y, 0) || el.y < 0;
    const r = near(el.x + el.w, W) || el.x + el.w > W;
    const btm = near(el.y + el.h, H) || el.y + el.h > H;
    if (!(l || t || r || btm) || el.type === 'text' || el.type === 'line') continue;
    const x = l ? Math.min(el.x, -b) : el.x;
    const y = t ? Math.min(el.y, -b) : el.y;
    const w = (r ? Math.max(el.x + el.w, W + b) : el.x + el.w) - x;
    const h = (btm ? Math.max(el.y + el.h, H + b) : el.y + el.h) - y;
    const next = { ...el, x, y, w, h } as Element;
    if (next.type === 'image' && el.type === 'image') {
      const iw = el.w / el.crop.w;
      const ih = el.h / el.crop.h;
      let cw = w / iw;
      let ch = h / ih;
      let cx = el.crop.x - (el.x - x) / iw;
      let cy = el.crop.y - (el.y - y) / ih;
      const over = Math.max(cw, ch, 1);
      if (over > 1) {
        cw /= over;
        ch /= over;
      }
      cx = Math.max(0, Math.min(1 - cw, cx));
      cy = Math.max(0, Math.min(1 - ch, cy));
      next.crop = { x: cx, y: cy, w: cw, h: ch };
    }
    out[id] = next;
  }
  return out;
}

// A single element as a standalone SVG cropped to its bounds (for PPTX export
// of anything PowerPoint cannot draw natively).
export async function elementSvg(doc: DesignDoc, snap: DesignSnapshot, id: Id) {
  const el = snap.elements[id];
  const b = aabb(el);
  const pad = el.shadow ? el.shadow.blur + Math.max(Math.abs(el.shadow.x), Math.abs(el.shadow.y)) : el.type === 'text' && el.effect.kind !== 'none' ? el.fontSize * 0.4 : 2;
  const fams = 'fontFamily' in el ? [el.fontFamily, 'Host Grotesk'] : [];
  await Promise.all(fams.map((f) => ensureFont(f)));
  const css = (await Promise.all(fams.map((f) => embeddedFontCss(f)))).join('\n');
  const env: RenderEnv = {
    assetUrl: (a) => {
      const asset = doc.getAsset(a);
      return asset ? bytesToDataUrl(asset.bytes, asset.mime) : undefined;
    },
    assetSize: () => undefined,
    fontsVersion: fontsVersion(),
    mode: 'export',
    idPrefix: `el-${id}-`,
  };
  const box = { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
  let markup = renderToStaticMarkup(
    <RenderContext.Provider value={env}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} width={box.w} height={box.h}>
        <ElementView el={{ ...el, anim: null }} />
      </svg>
    </RenderContext.Provider>,
  );
  if (css) markup = markup.replace(/<svg([^>]*)>/, `<svg$1><style>${css}</style>`);
  return { svg: markup, box };
}
