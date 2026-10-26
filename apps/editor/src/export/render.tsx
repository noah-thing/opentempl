import { renderToStaticMarkup } from 'react-dom/server';
import type { DesignSnapshot, Element, Id, Page } from '../doc/types';
import type { DesignDoc } from '../doc/design';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { embeddedFontCss, ensureFont, fontsVersion } from '../fonts/fonts';

// Turns pages into standalone SVG strings (fonts and images inlined) and then
// into pixels. Everything Tavla exports goes through here, thumbnails included.

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
  set.add('Host Grotesk');
  return [...set];
}

export interface PageSvgOptions {
  transparent?: boolean;
  embedFonts?: boolean;
  idPrefix?: string;
  time?: number; // render entrance animations at this moment
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
    idPrefix: opts.idPrefix ?? `p${snap.pageOrder.indexOf(pageId)}-`,
  };
  const p = opts.transparent ? { ...page, background: { type: 'solid' as const, color: 'transparent' } } : page;
  let markup = renderToStaticMarkup(
    <RenderContext.Provider value={env}>
      <PageView page={p} elements={snap.elements} width={snap.meta.width} height={snap.meta.height} />
    </RenderContext.Provider>,
  );
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
