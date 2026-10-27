import type { Editor } from '../editor/Editor';
import type { Element, Id, ShapeKind } from '../doc/types';
import { makeImage, makeShape, makeSvg, makeText } from '../doc/factory';
import { cloneElement } from '../doc/design';
import { assetFromUrl } from '../io/upload';
import type { Point } from '../lib/geom';
import { unionRects, aabb } from '../lib/geom';

// Items in side panels are draggable onto pages and clickable to add. They are
// described as plain data so drag and drop can carry them in dataTransfer.

export const LIBRARY_MIME = 'application/x-tavla-item';

export type LibraryItem =
  | { kind: 'shape'; shape: ShapeKind; color?: string }
  | { kind: 'svg'; svg: string; name: string; w?: number; h?: number; source?: string }
  | { kind: 'photo'; url: string; credit?: string; name: string; w: number; h: number }
  | { kind: 'elements'; elements: Element[] } // combos, text presets, frames, stickers built from elements
  | { kind: 'text'; patch: Partial<import('../doc/types').TextElement> };

export function dragProps(item: LibraryItem | (() => LibraryItem)) {
  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      const it = typeof item === 'function' ? item() : item;
      e.dataTransfer.setData(LIBRARY_MIME, JSON.stringify(it));
      e.dataTransfer.effectAllowed = 'copy';
    },
  };
}

const photoCache = new Map<string, Promise<import('../doc/types').Asset>>();

export async function placePhoto(editor: Editor, item: Extract<LibraryItem, { kind: 'photo' }>, at?: Point, replaceId?: Id | null) {
  let p = photoCache.get(item.url);
  if (!p) {
    p = assetFromUrl(item.url, item.name, item.credit);
    photoCache.set(item.url, p);
  }
  try {
    editor.toast('Placing photo');
    const asset = await p;
    if (!editor.doc.getAsset(asset.id)) editor.doc.addAsset(asset);
    const target = replaceId ? editor.s.elements[replaceId] : null;
    if (target?.type === 'image') {
      editor.replaceImage(target.id, asset.id, asset.width, asset.height);
      editor.select([target.id]);
    } else editor.addImageAsset(asset.id, asset.width, asset.height, at);
    editor.ui.set({ toast: null });
  } catch {
    photoCache.delete(item.url);
    editor.toast('That photo could not be downloaded. Check your connection.');
  }
}

export function addLibraryItem(editor: Editor, item: LibraryItem, at?: Point, overId?: Id | null) {
  switch (item.kind) {
    case 'shape': {
      const wide: Partial<Record<string, [number, number]>> = { pill: [360, 140], halfcircle: [320, 160], ticket: [360, 200], speech: [320, 260], arch: [240, 320], arrow: [320, 200], chevron: [300, 200] };
      const [w, h] = wide[item.shape] ?? [240, 240];
      const s = makeShape(item.shape, { w, h, fill: { type: 'solid', color: item.color ?? '#2B3BFF' } });
      editor.add([editor.fitToPage(s, 0.3)], { at });
      break;
    }
    case 'svg': {
      const el = makeSvg(item.svg, { w: item.w ?? 200, h: item.h ?? 200, name: item.name, source: item.source });
      editor.add([editor.fitToPage(el, 0.3)], { at });
      break;
    }
    case 'photo':
      placePhoto(editor, item, at, overId);
      break;
    case 'text': {
      const t = makeText({ ...item.patch, w: Math.min(editor.s.meta.width * 0.8, (item.patch.w as number) ?? 900) });
      const placed = editor.add([t], { at });
      if (placed?.[0]) editor.fitText(placed[0].id);
      break;
    }
    case 'elements': {
      // Scale combos so they feel the same size on any page format.
      const groups = new Map<Id, Id>();
      const els = item.elements.map((e) => cloneElement(e, groups));
      const b = unionRects(els.map((e) => aabb(e)))!;
      const target = Math.min(editor.s.meta.width, editor.s.meta.height) * 0.6;
      const s = Math.min(1.6, target / Math.max(b.w, b.h));
      const scaled = els.map((e) => {
        const out: Element = { ...e, x: (e.x - b.x) * s, y: (e.y - b.y) * s, w: e.w * s, h: e.h * s } as Element;
        if (out.type === 'text') out.fontSize = Math.round(out.fontSize * s * 10) / 10;
        if (out.type === 'line') out.width = out.width * s;
        return out;
      });
      // Image placeholders inside combos become empty frames.
      const fixed = scaled.map((e) => (e.type === 'image' && !e.assetId ? { ...makeImage(), ...e } : e));
      editor.add(fixed as Element[], { at });
      break;
    }
  }
}

export function dropLibraryItem(editor: Editor, item: LibraryItem, at: Point, overId: Id | null) {
  addLibraryItem(editor, item, at, overId);
}
