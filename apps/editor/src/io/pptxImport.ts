import JSZip from 'jszip';
import { createDesign } from './designs';
import { newId } from '../doc/design';
import { makeImage, makeLine, makeShape, makeText } from '../doc/factory';
import { fontInfo } from '../fonts/fonts';
import type { Asset, DesignSnapshot, Element, Fill, Page, ShapeKind, TextElement, TextRun } from '../doc/types';

// Import a PowerPoint file as a new design: one page per slide, with text as
// editable text (runs keep bold, italic and colour), shapes as OpenTempl shapes,
// pictures with their crop, slide backgrounds and the speaker notes.
// Placeholders without their own position borrow it from the slide layout or
// the master, the way PowerPoint does. Charts, SmartArt and tables are skipped.

const EMU = 9525; // EMU per CSS pixel
const PT = 96 / 72;

const NS = {
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  p: 'http://schemas.openxmlformats.org/presentationml/2006/main',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
};

// Office fonts and the free fonts drawn to the same widths.
const FONT_SUBS: Record<string, string> = {
  calibri: 'Carlito',
  'calibri light': 'Carlito',
  cambria: 'Caladea',
  arial: 'Arimo',
  helvetica: 'Arimo',
  'helvetica neue': 'Arimo',
  'times new roman': 'Tinos',
  times: 'Tinos',
  'courier new': 'Cousine',
  georgia: 'Gelasio',
  'segoe ui': 'Open Sans',
  'century gothic': 'Questrial',
  'trebuchet ms': 'Fira Sans',
  verdana: 'DejaVu Sans',
};

const PRESETS: Record<string, ShapeKind> = {
  rect: 'rect',
  roundRect: 'rect',
  ellipse: 'ellipse',
  triangle: 'triangle',
  rtTriangle: 'triangle',
  diamond: 'diamond',
  pentagon: 'pentagon',
  homePlate: 'chevron',
  chevron: 'chevron',
  hexagon: 'hexagon',
  octagon: 'octagon',
  star5: 'star',
  star4: 'star4',
  star8: 'burst',
  star12: 'burst',
  heart: 'heart',
  rightArrow: 'arrow',
  plus: 'cross',
  wedgeRoundRectCallout: 'speech',
  wedgeRectCallout: 'speech',
  cloud: 'cloud',
  flowChartTerminator: 'pill',
  flowChartProcess: 'rect',
  flowChartDecision: 'diamond',
  flowChartAlternateProcess: 'rect',
  blockArc: 'arch',
};

interface Ctx {
  zip: JSZip;
  theme: Record<string, string>;
  fonts: { major: string; minor: string };
  assets: Asset[];
  media: Map<string, Asset | null>;
}

export async function importPptx(file: File, onProgress?: (done: number, total: number) => void): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const xml = async (path: string) => {
    const f = zip.file(path);
    return f ? new DOMParser().parseFromString(await f.async('text'), 'application/xml') : null;
  };
  const pres = await xml('ppt/presentation.xml');
  if (!pres) throw new Error('This file is not a PowerPoint presentation');
  const size = first(pres, 'p', 'sldSz');
  const W = Math.round(num(size, 'cx', 9144000) / EMU);
  const H = Math.round(num(size, 'cy', 5143500) / EMU);
  const presRels = await rels(zip, 'ppt/presentation.xml');
  const slidePaths = all(pres, 'p', 'sldId').map((s) => presRels[s.getAttributeNS(NS.r, 'id') ?? ''] ?? '').filter(Boolean);

  const themeDoc = await xml('ppt/theme/theme1.xml');
  const ctx: Ctx = { zip, theme: readTheme(themeDoc), fonts: readThemeFonts(themeDoc), assets: [], media: new Map() };

  const pages: Record<string, Page> = {};
  const elements: Record<string, Element> = {};
  const pageOrder: string[] = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const path = slidePaths[i];
    const slide = await xml(path);
    if (!slide) continue;
    const slideRels = await rels(zip, path);
    const layoutPath = Object.values(slideRels).find((t) => t.includes('slideLayouts/')) ?? '';
    const layout = layoutPath ? await xml(layoutPath) : null;
    const layoutRels = layoutPath ? await rels(zip, layoutPath) : {};
    const masterPath = Object.values(layoutRels).find((t) => t.includes('slideMasters/')) ?? '';
    const master = masterPath ? await xml(masterPath) : null;
    const masterRels = masterPath ? await rels(zip, masterPath) : {};

    const ids: string[] = [];
    const add = (els: Element[]) => els.forEach((e) => ((elements[e.id] = e), ids.push(e.id)));
    let background: Fill = { type: 'solid', color: '#FFFFFF' };
    // The first slide, layout or master with a background decides it.
    for (const [doc, r] of [
      [slide, slideRels],
      [layout, layoutRels],
      [master, masterRels],
    ] as const) {
      const bg = doc ? first(doc, 'p', 'bg') : null;
      if (!bg) continue;
      const color = fillColor(bg, ctx.theme);
      if (color) background = { type: 'solid', color };
      const blip = first(bg, 'a', 'blip');
      if (blip) {
        const asset = await mediaAsset(ctx, r[blip.getAttributeNS(NS.r, 'embed') ?? ''] ?? '');
        if (asset) add([makeImage({ assetId: asset.id, x: 0, y: 0, w: W, h: H, locked: true, name: 'Slide background' })]);
      }
      break;
    }
    const tree = first(slide, 'p', 'spTree');
    if (tree) add(await walk(tree, ctx, slideRels, { layout, master }, { x: 0, y: 0, sx: 1, sy: 1 }));

    // Speaker notes.
    let notes = '';
    const notesPath = Object.values(slideRels).find((t) => t.includes('notesSlides/'));
    if (notesPath) {
      const nd = await xml(notesPath);
      if (nd)
        notes = all(nd, 'p', 'sp')
          .filter((sp) => first(sp, 'p', 'ph')?.getAttribute('type') === 'body')
          .map((sp) => all(sp, 'a', 'p').map((p) => all(p, 'a', 't').map((t) => t.textContent).join('')).join('\n'))
          .join('\n')
          .trim();
    }
    const pid = newId();
    pages[pid] = { id: pid, name: '', background, elementIds: ids, notes, transition: 'none', duration: 5 };
    pageOrder.push(pid);
    onProgress?.(i + 1, slidePaths.length);
  }
  const now = Date.now();
  const snapshot: DesignSnapshot = {
    meta: { id: '', title: file.name.replace(/\.pptx$/i, ''), width: W, height: H, unit: 'px', createdAt: now, updatedAt: now },
    pageOrder,
    pages,
    elements,
  };
  return createDesign({ snapshot, assets: ctx.assets });
}

interface Frame {
  x: number;
  y: number;
  sx: number;
  sy: number;
}

async function walk(tree: Element_, ctx: Ctx, r: Record<string, string>, inherit: { layout: Document | null; master: Document | null }, f: Frame): Promise<Element[]> {
  const out: Element[] = [];
  for (const node of Array.from(tree.children)) {
    const tag = node.localName;
    if (tag === 'grpSp') {
      // Groups map their child space onto their own box.
      const x = first(node, 'a', 'xfrm');
      const off = x ? first(x, 'a', 'off') : null;
      const ext = x ? first(x, 'a', 'ext') : null;
      const choff = x ? first(x, 'a', 'chOff') : null;
      const chext = x ? first(x, 'a', 'chExt') : null;
      const sx = ext && chext ? num(ext, 'cx', 1) / Math.max(1, num(chext, 'cx', 1)) : 1;
      const sy = ext && chext ? num(ext, 'cy', 1) / Math.max(1, num(chext, 'cy', 1)) : 1;
      const inner: Frame = {
        x: f.x + f.sx * (num(off, 'x', 0) / EMU) - f.sx * sx * (num(choff, 'x', 0) / EMU),
        y: f.y + f.sy * (num(off, 'y', 0) / EMU) - f.sy * sy * (num(choff, 'y', 0) / EMU),
        sx: f.sx * sx,
        sy: f.sy * sy,
      };
      const gid = newId();
      const kids = await walk(node, ctx, r, inherit, inner);
      kids.forEach((k) => (k.groupId = k.groupId ?? gid));
      out.push(...kids);
    } else if (tag === 'sp' || tag === 'cxnSp') out.push(...shapeOf(node, ctx, inherit, f, tag === 'cxnSp'));
    else if (tag === 'pic') {
      const box = boxOf(node, inherit, f);
      const blip = first(node, 'a', 'blip');
      const asset = blip ? await mediaAsset(ctx, r[blip.getAttributeNS(NS.r, 'embed') ?? ''] ?? '') : null;
      if (!box || !asset) continue;
      const src = first(node, 'a', 'srcRect');
      const crop = src
        ? { x: num(src, 'l', 0) / 1e5, y: num(src, 't', 0) / 1e5, w: 1 - (num(src, 'l', 0) + num(src, 'r', 0)) / 1e5, h: 1 - (num(src, 't', 0) + num(src, 'b', 0)) / 1e5 }
        : { x: 0, y: 0, w: 1, h: 1 };
      const geom = first(node, 'a', 'prstGeom')?.getAttribute('prst');
      out.push(makeImage({ ...box, assetId: asset.id, crop, mask: geom === 'ellipse' ? 'ellipse' : null, name: attr(first(node, 'p', 'cNvPr'), 'name') }));
    }
  }
  return out;
}

type Element_ = globalThis.Element;

function shapeOf(sp: Element_, ctx: Ctx, inherit: { layout: Document | null; master: Document | null }, f: Frame, connector: boolean): Element[] {
  const box = boxOf(sp, inherit, f);
  if (!box) return [];
  const spPr = first(sp, 'p', 'spPr');
  const out: Element[] = [];
  const name = attr(first(sp, 'p', 'cNvPr'), 'name');
  const geom = spPr ? first(spPr, 'a', 'prstGeom')?.getAttribute('prst') ?? '' : '';
  const ln = spPr ? first(spPr, 'a', 'ln') : null;
  const lineColor = ln && first(ln, 'a', 'noFill') ? null : ((ln && fillColor(ln, ctx.theme)) ?? (connector || geom === 'line' ? '#0B0B0D' : null));
  const lineW = ln ? Math.max(1, num(ln, 'w', 12700) / EMU) : 0;

  if (connector || geom === 'line' || geom.startsWith('straightConnector') || geom.startsWith('bentConnector')) {
    // A line runs corner to corner of its box; flips choose which corners.
    const flipH = first(sp, 'a', 'xfrm')?.getAttribute('flipH') === '1';
    const flipV = first(sp, 'a', 'xfrm')?.getAttribute('flipV') === '1';
    const ax = box.x + (flipH ? box.w : 0);
    const ay = box.y + (flipV ? box.h : 0);
    const bx = box.x + (flipH ? 0 : box.w);
    const by = box.y + (flipV ? 0 : box.h);
    const len = Math.max(2, Math.hypot(bx - ax, by - ay));
    const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    const tail = ln ? first(ln, 'a', 'tailEnd')?.getAttribute('type') : null;
    const head = ln ? first(ln, 'a', 'headEnd')?.getAttribute('type') : null;
    const cap = (t: string | null | undefined) => (t && t !== 'none' ? (t === 'oval' ? 'circle' : t === 'diamond' ? 'diamond' : 'arrow') : 'none');
    out.push(
      makeLine({ x: (ax + bx) / 2 - len / 2, y: (ay + by) / 2 - 12, w: len, h: 24, rotation: ((ang % 360) + 360) % 360, color: lineColor ?? '#0B0B0D', width: lineW || 2, start: cap(head), end: cap(tail), name }),
    );
    return out;
  }

  // Shapes styled by the theme (PowerPoint's default blue boxes) name their colours in p:style.
  const style = Array.from(sp.children).find((c) => c.localName === 'style') ?? null;
  const styleColor = (ref: string) => {
    const r = style ? first(style, 'a', ref) : null;
    const v = r && num(r, 'idx', 0) > 0 ? first(r, 'a', 'schemeClr')?.getAttribute('val') : null;
    return v ? (ctx.theme[v] ?? null) : null;
  };
  const noFill = spPr ? Array.from(spPr.children).some((c) => c.localName === 'noFill') : false;
  const fill = noFill ? null : ((spPr && fillColor(spPr, ctx.theme, true)) ?? styleColor('fillRef'));
  if (fill || lineColor) {
    const kind = PRESETS[geom] ?? 'rect';
    out.push(
      makeShape(kind, {
        ...box,
        fill: fill ? { type: 'solid', color: fill } : { type: 'solid', color: 'transparent' },
        stroke: lineColor ? { color: lineColor, width: lineW, dash: 'solid' } : null,
        radius: geom === 'roundRect' ? Math.min(box.w, box.h) * 0.1667 : 0,
        name,
      }),
    );
  }
  const fontRef = style ? first(style, 'a', 'fontRef') : null;
  const fontScheme = fontRef ? first(fontRef, 'a', 'schemeClr')?.getAttribute('val') : null;
  const text = textOf(sp, ctx, inherit, box, fontScheme ? (ctx.theme[fontScheme] ?? ctx.theme[{ tx1: 'dk1', bg1: 'lt1' }[fontScheme] ?? '']) : undefined);
  if (text) out.push(text);
  return out;
}

// Position and size, with rotation and flips. Placeholders without a frame of
// their own borrow it from the layout, then the master.
function boxOf(node: Element_, inherit: { layout: Document | null; master: Document | null }, f: Frame) {
  let xfrm = first(node, 'a', 'xfrm');
  if (!xfrm || !first(xfrm, 'a', 'off')) {
    const ph = first(node, 'p', 'ph');
    if (ph) xfrm = placeholder(inherit.layout, ph) ?? placeholder(inherit.master, ph);
  }
  if (!xfrm) return null;
  const off = first(xfrm, 'a', 'off');
  const ext = first(xfrm, 'a', 'ext');
  if (!off || !ext) return null;
  return {
    x: f.x + (num(off, 'x', 0) / EMU) * f.sx,
    y: f.y + (num(off, 'y', 0) / EMU) * f.sy,
    w: Math.max(1, (num(ext, 'cx', 0) / EMU) * f.sx),
    h: Math.max(1, (num(ext, 'cy', 0) / EMU) * f.sy),
    rotation: num(xfrm, 'rot', 0) / 60000,
    flipX: xfrm.getAttribute('flipH') === '1',
    flipY: xfrm.getAttribute('flipV') === '1',
  };
}

function placeholder(doc: Document | null, ph: Element_): Element_ | null {
  if (!doc) return null;
  const type = ph.getAttribute('type') ?? 'body';
  const idx = ph.getAttribute('idx');
  for (const sp of all(doc, 'p', 'sp')) {
    const q = first(sp, 'p', 'ph');
    if (!q) continue;
    const qt = q.getAttribute('type') ?? 'body';
    const sameType = qt === type || (type === 'ctrTitle' && qt === 'title') || (type === 'subTitle' && qt === 'body');
    if ((idx && q.getAttribute('idx') === idx) || sameType) {
      const x = first(sp, 'a', 'xfrm');
      if (x && first(x, 'a', 'off')) return x;
    }
  }
  return null;
}

function textOf(sp: Element_, ctx: Ctx, inherit: { layout: Document | null; master: Document | null }, box: ReturnType<typeof boxOf>, defaultColor?: string): TextElement | null {
  const body = first(sp, 'p', 'txBody');
  if (!body || !box) return null;
  const ph = first(sp, 'p', 'ph');
  const phType = ph?.getAttribute('type') ?? (ph ? 'body' : null);
  const isTitle = phType === 'title' || phType === 'ctrTitle';
  // Default size: the master's title or body style, else Office's own defaults.
  const masterStyle = inherit.master ? first(inherit.master, 'p', isTitle ? 'titleStyle' : phType ? 'bodyStyle' : 'otherStyle') : null;
  const masterSz = masterStyle ? first(masterStyle, 'a', 'defRPr')?.getAttribute('sz') : null;
  const defaultPt = masterSz ? +masterSz / 100 : isTitle ? 44 : phType ? 28 : 18;
  const scale = num(first(body, 'a', 'normAutofit'), 'fontScale', 100000) / 100000;

  let text = '';
  const runs: TextRun[] = [];
  let base: { size: number; weight: number; italic: boolean; color: string; font: string; spc: number } | null = null;
  let align: TextElement['align'] = isTitle && phType === 'ctrTitle' ? 'center' : 'left';
  const paras = all(body, 'a', 'p');
  paras.forEach((p, pi) => {
    const pPr = first(p, 'a', 'pPr');
    const algn = pPr?.getAttribute('algn');
    if (pi === 0 && algn) align = algn === 'ctr' ? 'center' : algn === 'r' ? 'right' : algn === 'just' ? 'justify' : 'left';
    if (pi > 0) text += '\n';
    for (const r of Array.from(p.children).filter((c) => c.localName === 'r' || c.localName === 'br' || c.localName === 'fld')) {
      if (r.localName === 'br') {
        text += '\n';
        continue;
      }
      const t = first(r, 'a', 't')?.textContent ?? '';
      if (!t) continue;
      const rPr = first(r, 'a', 'rPr');
      const style = {
        size: (rPr?.getAttribute('sz') ? +rPr.getAttribute('sz')! / 100 : defaultPt) * scale,
        weight: rPr?.getAttribute('b') === '1' ? 700 : 400,
        italic: rPr?.getAttribute('i') === '1',
        color: (rPr && fillColor(rPr, ctx.theme)) ?? defaultColor ?? ctx.theme.dk1 ?? '#0B0B0D',
        font: fontFor(rPr ? first(rPr, 'a', 'latin')?.getAttribute('typeface') : null, isTitle, ctx),
        spc: num(rPr, 'spc', 0) / 100, // points
      };
      if (!base) base = style;
      const start = text.length;
      text += t;
      const diff: TextRun = { start, end: text.length };
      if (style.weight !== base.weight) diff.fontWeight = style.weight;
      if (style.italic !== base.italic) diff.italic = style.italic;
      if (style.color !== base.color) diff.color = style.color;
      if (rPr?.getAttribute('u') && rPr.getAttribute('u') !== 'none') diff.underline = true;
      if (Object.keys(diff).length > 2) runs.push(diff);
    }
  });
  if (!text.trim() || !base) return null;
  const b = base as { size: number; weight: number; italic: boolean; color: string; font: string; spc: number };
  // Line spacing: a percentage of single spacing (about 1.2 em in PowerPoint) or exact points.
  const lnSpc = first(paras[0], 'a', 'lnSpc');
  const pct = lnSpc ? first(lnSpc, 'a', 'spcPct') : null;
  const pts = lnSpc ? first(lnSpc, 'a', 'spcPts') : null;
  const lh = pct ? 1.2 * (num(pct, 'val', 100000) / 100000) : pts ? num(pts, 'val', 0) / 100 / b.size : 1.2;
  // Text insets: 0.1 inch left and right, 0.05 inch top and bottom by default.
  const bodyPr = first(body, 'a', 'bodyPr');
  const lIns = num(bodyPr, 'lIns', 91440) / EMU;
  const tIns = num(bodyPr, 'tIns', 45720) / EMU;
  const rIns = num(bodyPr, 'rIns', 91440) / EMU;
  const bIns = num(bodyPr, 'bIns', 45720) / EMU;
  // Vertical anchoring: estimate the wrapped height (about half an em per
  // character), then sit the text in the middle or at the bottom.
  const px = b.size * PT;
  const width = Math.max(20, box.w - lIns - rIns);
  const perLine = Math.max(1, Math.floor(width / (px * 0.5)));
  const lines = text.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(l.length / perLine)), 0);
  const estH = lines * px * lh;
  const anchor = bodyPr?.getAttribute('anchor') ?? (phType && !isTitle ? 't' : phType ? 'ctr' : 'ctr');
  const y = anchor === 'ctr' ? box.y + (box.h - estH) / 2 : anchor === 'b' ? box.y + box.h - bIns - estH : box.y + tIns;
  return makeText({
    text,
    runs: runs.length ? runs : undefined,
    x: box.x + lIns,
    y,
    w: width,
    h: estH,
    rotation: box.rotation,
    fontFamily: b.font,
    fontSize: Math.round(b.size * PT * 10) / 10,
    fontWeight: b.weight,
    italic: b.italic,
    color: b.color,
    align,
    lineHeight: Math.round(Math.max(0.6, Math.min(3, lh)) * 100) / 100,
    letterSpacing: Math.round((b.spc / b.size) * 1000),
    name: text.slice(0, 40),
  });
}

function fontFor(typeface: string | null | undefined, title: boolean, ctx: Ctx): string {
  let name = typeface ?? '';
  if (name === '+mj-lt') name = ctx.fonts.major;
  if (name === '+mn-lt' || !name) name = title ? ctx.fonts.major : ctx.fonts.minor;
  const sub = FONT_SUBS[name.toLowerCase()];
  if (sub) return sub;
  return fontInfo(name) ? name : 'Arimo';
}

// The first colour under a node: srgbClr, or a theme colour looked up in the theme.
function fillColor(node: Element_, theme: Record<string, string>, direct = false): string | null {
  const solid = direct ? Array.from(node.children).find((c) => c.localName === 'solidFill') : first(node, 'a', 'solidFill');
  const grad = !solid && direct ? Array.from(node.children).find((c) => c.localName === 'gradFill') : null;
  const holder = solid ?? grad;
  if (!holder) return null;
  const srgb = first(holder, 'a', 'srgbClr');
  if (srgb) return '#' + (srgb.getAttribute('val') ?? '000000').toUpperCase();
  const scheme = first(holder, 'a', 'schemeClr')?.getAttribute('val');
  if (scheme) return theme[scheme] ?? theme[{ tx1: 'dk1', bg1: 'lt1', tx2: 'dk2', bg2: 'lt2' }[scheme] ?? ''] ?? null;
  const sys = first(holder, 'a', 'sysClr');
  if (sys) return '#' + (sys.getAttribute('lastClr') ?? '000000').toUpperCase();
  return null;
}

function readTheme(doc: Document | null): Record<string, string> {
  const out: Record<string, string> = {};
  const scheme = doc ? first(doc, 'a', 'clrScheme') : null;
  if (!scheme) return out;
  for (const c of Array.from(scheme.children)) {
    const v = first(c, 'a', 'srgbClr')?.getAttribute('val') ?? first(c, 'a', 'sysClr')?.getAttribute('lastClr');
    if (v) out[c.localName] = '#' + v.toUpperCase();
  }
  return out;
}

function readThemeFonts(doc: Document | null) {
  const major = doc ? first(first(doc, 'a', 'majorFont') ?? doc.documentElement, 'a', 'latin')?.getAttribute('typeface') : null;
  const minor = doc ? first(first(doc, 'a', 'minorFont') ?? doc.documentElement, 'a', 'latin')?.getAttribute('typeface') : null;
  return { major: major || 'Calibri Light', minor: minor || 'Calibri' };
}

async function mediaAsset(ctx: Ctx, path: string): Promise<Asset | null> {
  if (!path) return null;
  if (ctx.media.has(path)) return ctx.media.get(path)!;
  const f = ctx.zip.file(path);
  let asset: Asset | null = null;
  if (f && /\.(png|jpe?g|gif|webp|bmp)$/i.test(path)) {
    const bytes = await f.async('uint8array');
    const mime = /\.png$/i.test(path) ? 'image/png' : /\.gif$/i.test(path) ? 'image/gif' : /\.webp$/i.test(path) ? 'image/webp' : /\.bmp$/i.test(path) ? 'image/bmp' : 'image/jpeg';
    try {
      const bmp = await createImageBitmap(new Blob([bytes as BlobPart], { type: mime }));
      asset = { id: newId(), mime, width: bmp.width, height: bmp.height, name: path.split('/').pop() ?? 'image', bytes };
      bmp.close();
      ctx.assets.push(asset);
    } catch {
      asset = null;
    }
  }
  ctx.media.set(path, asset);
  return asset;
}

// Relationship targets of a part, resolved to zip paths.
async function rels(zip: JSZip, part: string): Promise<Record<string, string>> {
  const dir = part.slice(0, part.lastIndexOf('/'));
  const file = `${dir}/_rels/${part.slice(part.lastIndexOf('/') + 1)}.rels`;
  const f = zip.file(file);
  if (!f) return {};
  const doc = new DOMParser().parseFromString(await f.async('text'), 'application/xml');
  const out: Record<string, string> = {};
  for (const r of Array.from(doc.getElementsByTagName('Relationship'))) {
    const target = r.getAttribute('Target') ?? '';
    out[r.getAttribute('Id') ?? ''] = target.startsWith('/') ? target.slice(1) : normal(`${dir}/${target}`);
  }
  return out;
}

function normal(path: string) {
  const out: string[] = [];
  for (const s of path.split('/')) {
    if (s === '..') out.pop();
    else if (s !== '.') out.push(s);
  }
  return out.join('/');
}

function first(node: Document | Element_ | null, ns: keyof typeof NS, name: string): Element_ | null {
  return node ? (node.getElementsByTagNameNS(NS[ns], name)[0] ?? null) : null;
}

function all(node: Document | Element_, ns: keyof typeof NS, name: string): Element_[] {
  return Array.from(node.getElementsByTagNameNS(NS[ns], name));
}

function num(node: Element_ | null, name: string, fallback: number) {
  const v = node?.getAttribute(name);
  return v === null || v === undefined || v === '' ? fallback : Number(v);
}

function attr(node: Element_ | null, name: string) {
  return node?.getAttribute(name) ?? undefined;
}
