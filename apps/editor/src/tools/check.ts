import type { DesignSnapshot, Element, Id } from '../doc/types';
import { aabb } from '../lib/geom';
import { luminance } from './restyle';

// A read through the design for things that trip people up later: text that
// does not stand out from what is behind it, text too small to read, photos
// that will print soft, pictures without alt text, things off the page and
// empty text boxes. Pure, so it is easy to test and cheap to rerun.

export type IssueKind = 'contrast' | 'tiny' | 'soft' | 'alt' | 'offpage' | 'empty';

export interface Issue {
  kind: IssueKind;
  pageId: Id;
  id: Id;
  severity: 'fix' | 'look';
  text: string;
  fix?: { label: string; patch: Partial<Element> } | { label: string; remove: true };
}

const HEX = /^#[0-9A-Fa-f]{6}/;

export function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// The colour right behind an element's centre: the topmost solid shape or
// table under it, else the page. Photos give no answer (null).
function behind(snap: DesignSnapshot, pageId: Id, el: Element): string | null {
  const ids = snap.pages[pageId].elementIds;
  const c = { x: el.x + el.w / 2, y: el.y + el.h / 2 };
  for (let i = ids.indexOf(el.id) - 1; i >= 0; i--) {
    const u = snap.elements[ids[i]];
    if (!u || u.hidden) continue;
    const b = aabb(u);
    if (c.x < b.x || c.x > b.x + b.w || c.y < b.y || c.y > b.y + b.h) continue;
    if (u.type === 'shape') return u.fill.type === 'solid' && HEX.test(u.fill.color) && u.opacity > 0.6 ? u.fill.color : null;
    if (u.type === 'image' || u.type === 'video' || u.type === 'svg' || u.type === 'draw') return null;
  }
  const bg = snap.pages[pageId].background;
  return bg.type === 'solid' && HEX.test(bg.color) ? bg.color : null;
}

export function checkDesign(snap: DesignSnapshot, assetSize: (id: Id) => { width: number; height: number } | undefined): Issue[] {
  const out: Issue[] = [];
  const W = snap.meta.width;
  const H = snap.meta.height;
  const minSize = Math.max(10, Math.min(W, H) * 0.012);
  for (const pageId of snap.pageOrder) {
    const page = snap.pages[pageId];
    if (page.hidden) continue;
    for (const id of page.elementIds) {
      const el = snap.elements[id];
      if (!el || el.hidden) continue;
      const b = aabb(el);
      if (b.x > W || b.y > H || b.x + b.w < 0 || b.y + b.h < 0) {
        out.push({ kind: 'offpage', pageId, id, severity: 'look', text: `${label(el)} sits off the page, so it never shows`, fix: { label: 'Delete it', remove: true } });
        continue;
      }
      if (el.type === 'text') {
        if (!el.text.trim()) {
          out.push({ kind: 'empty', pageId, id, severity: 'look', text: 'An empty text box', fix: { label: 'Delete it', remove: true } });
          continue;
        }
        if (el.fontSize < minSize) out.push({ kind: 'tiny', pageId, id, severity: 'fix', text: `"${short(el.text)}" is ${Math.round(el.fontSize)} px, small to read at this size`, fix: { label: `Make it ${Math.ceil(minSize)} px`, patch: { fontSize: Math.ceil(minSize) } } });
        const back = behind(snap, pageId, el);
        if (back && HEX.test(el.color) && !el.gradient && el.opacity > 0.3) {
          const ratio = contrast(el.color, back);
          // WCAG: 3 for large text (24 px and up, or 19 px bold), 4.5 for the rest.
          const large = el.fontSize >= 24 || (el.fontSize >= 19 && el.fontWeight >= 700);
          const need = large ? 3 : 4.5;
          if (ratio < need) {
            const best = contrast('#FFFFFF', back) >= contrast('#0B0B0D', back) ? '#FFFFFF' : '#0B0B0D';
            out.push({ kind: 'contrast', pageId, id, severity: 'fix', text: `"${short(el.text)}" stands out ${ratio.toFixed(1)} to 1 from what is behind it; ${need} to 1 reads well`, fix: { label: best === '#FFFFFF' ? 'Make it white' : 'Make it ink', patch: { color: best } } });
          }
        }
      }
      if (el.type === 'image' && el.assetId) {
        const s = assetSize(el.assetId);
        if (s) {
          // Pixels of the photo per unit of page; a 2x export wants about 2.
          const density = Math.min((s.width * el.crop.w) / el.w, (s.height * el.crop.h) / el.h);
          if (density < 0.8) out.push({ kind: 'soft', pageId, id, severity: 'look', text: `A photo is stretched past its pixels (${Math.round(density * 100)}% sharp), it will look soft in print` });
        }
        if (!el.alt) out.push({ kind: 'alt', pageId, id, severity: 'look', text: 'A photo without alt text, so screen readers skip it' });
      }
      if (el.type === 'video' && !el.alt) out.push({ kind: 'alt', pageId, id, severity: 'look', text: 'A video without alt text' });
    }
  }
  return out;
}

function short(t: string) {
  const s = t.replace(/\s+/g, ' ').trim();
  return s.length > 28 ? s.slice(0, 27) + '…' : s;
}

function label(el: Element) {
  return el.type === 'text' ? `"${short(el.text)}"` : el.name ? `"${el.name}"` : `A ${el.type}`;
}
