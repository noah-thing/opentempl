import type { Asset, DesignSnapshot, Element, Fill, Page } from '../doc/types';
import { newId } from '../doc/design';
import { prepareImage } from '../io/upload';
import { DEFS } from './defs';
import { DEFS2 } from './defs2';
import { DEFS3 } from './defs3';

// Templates are plain data. Images point at the bundled library with ids like
// "lib:photos/coffee.jpg"; building a template fetches those files and copies
// them into the new design, so it never depends on the network again.

export interface TemplatePage {
  background: Fill;
  elements: Element[];
  name?: string;
  transition?: Page['transition'];
  notes?: string;
}

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  formatId?: string;
  pages: TemplatePage[];
}

export interface Template extends TemplateDef {
  build: () => Promise<{ snapshot: DesignSnapshot; assets: Asset[] }>;
}

export function libUrl(assetId: string, thumb = false) {
  const path = assetId.slice(4);
  if (thumb && path.startsWith('photos/')) return `${import.meta.env.BASE_URL}library/thumbs/${path.slice(7)}`;
  return `${import.meta.env.BASE_URL}library/${path}`;
}

function assetIds(def: TemplateDef) {
  const ids = new Set<string>();
  for (const p of def.pages) {
    if (p.background.type === 'image') ids.add(p.background.assetId);
    for (const e of p.elements) if (e.type === 'image' && e.assetId) ids.add(e.assetId);
  }
  return [...ids].filter((id) => id.startsWith('lib:'));
}

export function makeTemplate(def: TemplateDef): Template {
  return {
    ...def,
    build: async () => {
      const assets: Asset[] = [];
      for (const id of assetIds(def)) {
        try {
          const blob = await (await fetch(libUrl(id))).blob();
          const a = await prepareImage(blob, id.split('/').pop() ?? 'image');
          assets.push({ ...a, id, credit: 'OpenTempl library' });
        } catch {
          /* missing library file: the frame stays empty */
        }
      }
      const pageOrder: string[] = [];
      const pages: Record<string, Page> = {};
      const elements: Record<string, Element> = {};
      for (const tp of def.pages) {
        const pid = newId();
        const ids: string[] = [];
        for (const e of tp.elements) {
          const id = newId();
          elements[id] = { ...structuredClone(e), id };
          ids.push(id);
        }
        pages[pid] = { id: pid, name: tp.name ?? '', background: tp.background, elementIds: ids, notes: tp.notes ?? '', transition: tp.transition ?? 'none', duration: 5 };
        pageOrder.push(pid);
      }
      const now = Date.now();
      return {
        snapshot: {
          meta: { id: '', title: def.name, width: def.width, height: def.height, unit: 'px', createdAt: now, updatedAt: now, formatId: def.formatId },
          pageOrder,
          pages,
          elements,
        },
        assets,
      };
    },
  };
}

export const TEMPLATES: Template[] = [...DEFS, ...DEFS2, ...DEFS3].map(makeTemplate);

export function templateById(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}

// Built in templates first, then the packs in public/templates.
export async function findTemplate(id: string): Promise<Template | undefined> {
  return templateById(id) ?? (await import('./packs')).loadPackTemplate(id);
}
