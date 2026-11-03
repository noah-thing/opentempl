import { assetIds, buildDesign, type Design, type Draft, type Sources } from '../../../../mcp/recipe';
import type { Asset, DesignSnapshot, Element, Page } from '../doc/types';
import { formatById } from '../doc/formats';
import { findTemplate, libUrl } from '../templates';
import { prepareImage } from '../io/upload';
import { ensureFont, fontsVersion } from '../fonts/fonts';
import { layoutText } from '../text/layout';
import { DRAFTS_URL } from '../links';

// Turns a draft (a design written as steps by an assistant) into a real design:
// replays the steps, fetches every photo into the design, and sets changed text
// to fit its box with the real fonts, which only a browser can measure.

export interface DraftRecord {
  id: string;
  version: number;
  draft: Draft;
}

export async function fetchDraft(id: string): Promise<DraftRecord> {
  if (!/^[A-Za-z0-9]{12}$/.test(id)) throw new Error('This link is not a design link.');
  const res = await fetch(`${DRAFTS_URL}/v1/drafts/${id}`);
  if (res.status === 404) throw new Error('This design has expired or the link is wrong.');
  if (!res.ok) throw new Error('Could not reach the design. Try again in a moment.');
  return res.json();
}

export async function sourcesFor(draft: Draft): Promise<Sources> {
  const s = draft.start as { template?: string; format?: string };
  const template = s.template ? await findTemplate(s.template) : undefined;
  return { template, format: s.format ? formatById(s.format) : undefined };
}

function coverCrop(iw: number, ih: number, w: number, h: number) {
  const ir = iw / ih;
  const br = w / h;
  if (ir > br) {
    const cw = br / ir;
    return { x: (1 - cw) / 2, y: 0, w: cw, h: 1 };
  }
  const ch = ir / br;
  return { x: 0, y: (1 - ch) / 2, w: 1, h: ch };
}

async function fetchAsset(id: string, d: Design, opts: { reportDownloads: boolean }): Promise<Asset | null> {
  const web = d.images[id];
  const src = web ? web.url : id.startsWith('lib:') ? libUrl(id) : null;
  if (!src) return null;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!/^image\/(png|jpeg|webp|gif|avif)$/.test(blob.type) && !/\.(jpe?g|png|webp)(\?|$)/i.test(src)) return null;
    const a = await prepareImage(blob, src.split('/').pop()?.split('?')[0] ?? 'image');
    if (web?.download && opts.reportDownloads) fetch(`/api/unsplash?download=${encodeURIComponent(web.download)}`).catch(() => {});
    return { ...a, id, credit: web ? web.credit : 'OpenTempl library' };
  } catch {
    // Some hosts refuse to share their images with other sites; the frame stays empty.
    return null;
  }
}

// "grow" lets the box follow the words. "shrink" keeps the room the old words had
// (their height, which is often more than the stored box) and sets the type smaller
// until the new words fit it.
function fitText(el: Extract<Element, { type: 'text' }>, mode: string, version: number, before?: string) {
  const measure = (size: number) => layoutText({ ...el, fontSize: size }, version);
  if (mode === 'grow') {
    el.h = Math.max(Math.ceil(measure(el.fontSize).height), Math.ceil(el.fontSize * el.lineHeight));
    return;
  }
  if (mode !== 'shrink') return;
  const room = Math.max(el.h, before === undefined ? 0 : layoutText({ ...el, text: before }, version).height);
  const fits = (size: number) => {
    const l = measure(size);
    return l.height <= room + 1 && l.maxLineWidth <= el.w + 1;
  };
  if (!fits(el.fontSize)) {
    let lo = el.fontSize * 0.25;
    let hi = el.fontSize;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    el.fontSize = Math.max(4, Math.floor(lo * 10) / 10);
  }
  el.h = Math.max(el.h, Math.ceil(measure(el.fontSize).height));
}

export interface Built {
  snapshot: DesignSnapshot;
  assets: Asset[];
  missing: string[]; // photos that could not be fetched
}

export async function buildDraft(draft: Draft, opts: { reportDownloads?: boolean } = {}): Promise<Built> {
  const d = buildDesign(draft, await sourcesFor(draft));
  const missing: string[] = [];
  const assets = (await Promise.all(assetIds(d).map((id) => fetchAsset(id, d, { reportDownloads: !!opts.reportDownloads })))).filter((a): a is Asset => !!a);
  const byId = new Map(assets.map((a) => [a.id, a]));

  const fonts = new Map<string, Set<number>>();
  for (const p of d.pages)
    for (const e of p.elements)
      if (e.type === 'text' || e.type === 'chart' || e.type === 'table') {
        const set = fonts.get(e.fontFamily) ?? new Set<number>();
        set.add(e.type === 'text' ? e.fontWeight : 400);
        fonts.set(e.fontFamily, set);
      }
  await Promise.all([...fonts].flatMap(([f, ws]) => [...ws].map((w) => ensureFont(f, w))));
  await document.fonts.ready;
  const version = fontsVersion();

  const pageOrder: string[] = [];
  const pages: Record<string, Page> = {};
  const elements: Record<string, Element> = {};
  for (const p of d.pages) {
    for (const e of p.elements) {
      const el = structuredClone(e);
      if (el.type === 'image' && el.assetId && !el.assetId.startsWith('lib:') && !el.assetId.startsWith('web:')) el.assetId = null;
      if (el.type === 'image' && el.assetId) {
        const a = byId.get(el.assetId);
        if (!a) {
          missing.push(d.images[el.assetId]?.url ?? el.assetId);
          el.assetId = null;
        } else if (d.cover.includes(el.id)) el.crop = coverCrop(a.width, a.height, el.w, el.h);
      }
      if (el.type === 'text' && d.fit[el.id]) fitText(el, d.fit[el.id], version, d.orig[el.id]);
      elements[el.id] = el;
    }
    const bg = p.background.type === 'image' && !byId.has(p.background.assetId) ? ({ type: 'solid', color: '#FFFFFF' } as const) : p.background;
    pages[p.id] = { id: p.id, name: p.name, background: bg, elementIds: p.elements.map((e) => e.id), notes: p.notes, transition: p.transition, duration: p.duration, hidden: (p as { hidden?: boolean }).hidden };
    pageOrder.push(p.id);
  }
  const now = Date.now();
  return {
    snapshot: { meta: { id: '', title: d.title, width: d.width, height: d.height, unit: 'px', createdAt: now, updatedAt: now, formatId: d.formatId }, pageOrder, pages, elements },
    assets,
    missing,
  };
}
