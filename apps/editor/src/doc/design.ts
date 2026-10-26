import * as Y from 'yjs';
import { nanoid } from 'nanoid';
import type { Asset, DesignMeta, DesignSnapshot, Element, Id, Page } from './types';

// A live design. The Y.Doc is the source of truth; `snapshot` is an immutable
// plain copy that React reads. Every local edit goes through `transact` so it
// lands in the undo history and reaches collaborators as one update.

export const LOCAL = 'local';

type Listener = () => void;

export interface Snapshot extends DesignSnapshot {
  elementPage: Record<Id, Id>; // element id -> page id
  version: number;
}

export function newId(): Id {
  return nanoid(10);
}

export class DesignDoc {
  readonly ydoc: Y.Doc;
  readonly meta: Y.Map<unknown>;
  readonly pageOrder: Y.Array<Id>;
  readonly pages: Y.Map<Y.Map<unknown>>;
  readonly elements: Y.Map<Y.Map<unknown>>;
  readonly assets: Y.Map<Asset>;
  readonly undo: Y.UndoManager;
  snapshot: Snapshot;
  private listeners = new Set<Listener>();
  private assetUrls = new Map<Id, string>();

  constructor(ydoc = new Y.Doc()) {
    this.ydoc = ydoc;
    this.meta = ydoc.getMap('meta');
    this.pageOrder = ydoc.getArray('pageOrder');
    this.pages = ydoc.getMap('pages');
    this.elements = ydoc.getMap('elements');
    this.assets = ydoc.getMap('assets');
    this.undo = new Y.UndoManager([this.meta, this.pageOrder, this.pages, this.elements], {
      trackedOrigins: new Set([LOCAL]),
      captureTimeout: 450,
    });
    this.snapshot = this.readAll();

    this.elements.observeDeep((events) => {
      const changed = new Set<Id>();
      for (const ev of events) {
        if (ev.target === this.elements) ev.changes.keys.forEach((_, k) => changed.add(k));
        else if (ev.path.length > 0) changed.add(String(ev.path[0]));
      }
      const elements = { ...this.snapshot.elements };
      changed.forEach((id) => {
        const y = this.elements.get(id);
        if (y) elements[id] = y.toJSON() as Element;
        else delete elements[id];
      });
      this.commit({ elements });
    });
    this.pages.observeDeep((events) => {
      const changed = new Set<Id>();
      for (const ev of events) {
        if (ev.target === this.pages) ev.changes.keys.forEach((_, k) => changed.add(k));
        else if (ev.path.length > 0) changed.add(String(ev.path[0]));
      }
      const pages = { ...this.snapshot.pages };
      changed.forEach((id) => {
        const y = this.pages.get(id);
        if (y) pages[id] = y.toJSON() as Page;
        else delete pages[id];
      });
      this.commit({ pages, elementPage: indexElementPages(pages) });
    });
    this.pageOrder.observe(() => this.commit({ pageOrder: this.pageOrder.toArray() }));
    this.meta.observe(() => this.commit({ meta: this.meta.toJSON() as DesignMeta }));
    this.assets.observe(() => this.commit({}));
  }

  private readAll(): Snapshot {
    const pages: Record<Id, Page> = {};
    this.pages.forEach((y, id) => (pages[id] = y.toJSON() as Page));
    const elements: Record<Id, Element> = {};
    this.elements.forEach((y, id) => (elements[id] = y.toJSON() as Element));
    return {
      meta: this.meta.toJSON() as DesignMeta,
      pageOrder: this.pageOrder.toArray(),
      pages,
      elements,
      elementPage: indexElementPages(pages),
      version: (this.snapshot?.version ?? 0) + 1,
    };
  }

  private commit(patch: Partial<Snapshot>) {
    this.snapshot = { ...this.snapshot, ...patch, version: this.snapshot.version + 1 };
    this.listeners.forEach((l) => l());
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  getSnapshot = () => this.snapshot;

  transact(fn: () => void) {
    this.ydoc.transact(fn, LOCAL);
  }

  // ---------- meta ----------
  setMeta(patch: Partial<DesignMeta>) {
    this.transact(() => {
      for (const [k, v] of Object.entries(patch)) this.meta.set(k, v);
      this.meta.set('updatedAt', Date.now());
    });
  }

  // ---------- pages ----------
  private writePage(page: Page) {
    const y = new Y.Map<unknown>();
    for (const [k, v] of Object.entries(page)) {
      if (k === 'elementIds') {
        const arr = new Y.Array<Id>();
        arr.push(v as Id[]);
        y.set(k, arr);
      } else y.set(k, v);
    }
    this.pages.set(page.id, y);
  }

  addPage(partial: Partial<Page> = {}, index = this.pageOrder.length): Id {
    const page: Page = {
      id: newId(),
      name: '',
      background: { type: 'solid', color: '#FFFFFF' },
      elementIds: [],
      notes: '',
      transition: 'none',
      duration: 5,
      ...partial,
    };
    this.transact(() => {
      this.writePage(page);
      this.pageOrder.insert(Math.min(index, this.pageOrder.length), [page.id]);
    });
    return page.id;
  }

  updatePage(id: Id, patch: Partial<Omit<Page, 'id' | 'elementIds'>>) {
    const y = this.pages.get(id);
    if (!y) return;
    this.transact(() => {
      for (const [k, v] of Object.entries(patch)) y.set(k, v);
    });
  }

  duplicatePage(id: Id): Id | null {
    const page = this.snapshot.pages[id];
    if (!page) return null;
    const idx = this.snapshot.pageOrder.indexOf(id);
    const groupMap = new Map<Id, Id>();
    const els = page.elementIds
      .map((eid) => this.snapshot.elements[eid])
      .filter(Boolean)
      .map((el) => cloneElement(el, groupMap));
    let newPage: Id = '';
    this.transact(() => {
      const { id: _old, elementIds: _ids, ...rest } = structuredClone(page);
      newPage = this.addPage(rest, idx + 1);
      for (const el of els) this.addElement(newPage, el);
    });
    return newPage;
  }

  deletePage(id: Id) {
    const page = this.snapshot.pages[id];
    if (!page || this.snapshot.pageOrder.length <= 1) return;
    this.transact(() => {
      page.elementIds.forEach((eid) => this.elements.delete(eid));
      const i = this.pageOrder.toArray().indexOf(id);
      if (i >= 0) this.pageOrder.delete(i, 1);
      this.pages.delete(id);
    });
  }

  movePage(id: Id, to: number) {
    const from = this.pageOrder.toArray().indexOf(id);
    if (from < 0 || from === to) return;
    this.transact(() => {
      this.pageOrder.delete(from, 1);
      this.pageOrder.insert(Math.max(0, Math.min(to, this.pageOrder.length)), [id]);
    });
  }

  // ---------- elements ----------
  addElement(pageId: Id, el: Element, index?: number) {
    const page = this.pages.get(pageId);
    if (!page) return;
    this.transact(() => {
      const y = new Y.Map<unknown>();
      for (const [k, v] of Object.entries(el)) if (v !== undefined) y.set(k, v);
      this.elements.set(el.id, y);
      const ids = page.get('elementIds') as Y.Array<Id>;
      ids.insert(index === undefined ? ids.length : Math.min(index, ids.length), [el.id]);
    });
  }

  addElements(pageId: Id, els: Element[]) {
    this.transact(() => els.forEach((el) => this.addElement(pageId, el)));
  }

  updateElement(id: Id, patch: Partial<Element>) {
    const y = this.elements.get(id);
    if (!y) return;
    this.transact(() => {
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) y.delete(k);
        else if (!sameValue(y.get(k), v)) y.set(k, v);
      }
    });
  }

  updateElements(patches: Record<Id, Partial<Element>>) {
    this.transact(() => {
      for (const [id, p] of Object.entries(patches)) this.updateElement(id, p);
    });
  }

  deleteElements(ids: Id[]) {
    this.transact(() => {
      for (const id of ids) {
        const pageId = this.snapshot.elementPage[id];
        const page = pageId ? this.pages.get(pageId) : undefined;
        if (page) {
          const arr = page.get('elementIds') as Y.Array<Id>;
          const i = arr.toArray().indexOf(id);
          if (i >= 0) arr.delete(i, 1);
        }
        this.elements.delete(id);
      }
    });
  }

  // Move elements to a new position in the stacking order of their page.
  reorder(ids: Id[], mode: 'front' | 'back' | 'forward' | 'backward') {
    const byPage = new Map<Id, Id[]>();
    ids.forEach((id) => {
      const p = this.snapshot.elementPage[id];
      if (p) byPage.set(p, [...(byPage.get(p) ?? []), id]);
    });
    this.transact(() => {
      byPage.forEach((moving, pageId) => {
        const yPage = this.pages.get(pageId);
        if (!yPage) return;
        const arr = yPage.get('elementIds') as Y.Array<Id>;
        const order = arr.toArray();
        const set = new Set(moving);
        let next = order.slice();
        if (mode === 'front') next = [...order.filter((i) => !set.has(i)), ...order.filter((i) => set.has(i))];
        else if (mode === 'back') next = [...order.filter((i) => set.has(i)), ...order.filter((i) => !set.has(i))];
        else if (mode === 'forward') {
          for (let i = next.length - 2; i >= 0; i--)
            if (set.has(next[i]) && !set.has(next[i + 1])) [next[i], next[i + 1]] = [next[i + 1], next[i]];
        } else {
          for (let i = 1; i < next.length; i++)
            if (set.has(next[i]) && !set.has(next[i - 1])) [next[i], next[i - 1]] = [next[i - 1], next[i]];
        }
        if (next.join() === order.join()) return;
        arr.delete(0, arr.length);
        arr.insert(0, next);
      });
    });
  }

  setPageOrderForElement(id: Id, toIndex: number) {
    const pageId = this.snapshot.elementPage[id];
    const yPage = pageId ? this.pages.get(pageId) : undefined;
    if (!yPage) return;
    const arr = yPage.get('elementIds') as Y.Array<Id>;
    const order = arr.toArray().filter((i) => i !== id);
    order.splice(Math.max(0, Math.min(toIndex, order.length)), 0, id);
    this.transact(() => {
      arr.delete(0, arr.length);
      arr.insert(0, order);
    });
  }

  moveElementsToPage(ids: Id[], pageId: Id) {
    const target = this.pages.get(pageId);
    if (!target) return;
    this.transact(() => {
      for (const id of ids) {
        const from = this.snapshot.elementPage[id];
        if (from === pageId) continue;
        const yFrom = from ? this.pages.get(from) : undefined;
        if (yFrom) {
          const arr = yFrom.get('elementIds') as Y.Array<Id>;
          const i = arr.toArray().indexOf(id);
          if (i >= 0) arr.delete(i, 1);
        }
        (target.get('elementIds') as Y.Array<Id>).push([id]);
      }
    });
  }

  // ---------- assets ----------
  addAsset(asset: Asset) {
    // Assets are not part of undo; they are content addressed enough by id.
    this.ydoc.transact(() => this.assets.set(asset.id, asset), 'asset');
  }

  getAsset(id: Id | null | undefined): Asset | undefined {
    return id ? this.assets.get(id) : undefined;
  }

  assetUrl(id: Id | null | undefined): string | undefined {
    if (!id) return undefined;
    const cached = this.assetUrls.get(id);
    if (cached) return cached;
    const a = this.assets.get(id);
    if (!a) return undefined;
    const url = URL.createObjectURL(new Blob([a.bytes as BlobPart], { type: a.mime }));
    this.assetUrls.set(id, url);
    return url;
  }

  // ---------- whole design ----------
  load(snap: DesignSnapshot, assets: Asset[] = []) {
    this.ydoc.transact(() => {
      for (const [k, v] of Object.entries(snap.meta)) this.meta.set(k, v);
      this.pageOrder.delete(0, this.pageOrder.length);
      this.pages.forEach((_, k) => this.pages.delete(k));
      this.elements.forEach((_, k) => this.elements.delete(k));
      for (const id of snap.pageOrder) {
        const p = snap.pages[id];
        if (!p) continue;
        this.writePage(p);
        for (const eid of p.elementIds) {
          const el = snap.elements[eid];
          if (!el) continue;
          const y = new Y.Map<unknown>();
          for (const [k, v] of Object.entries(el)) if (v !== undefined) y.set(k, v);
          this.elements.set(eid, y);
        }
      }
      this.pageOrder.push(snap.pageOrder.filter((id) => snap.pages[id]));
      for (const a of assets) this.assets.set(a.id, a);
    }, 'load');
    this.undo.clear();
  }

  toSnapshot(): DesignSnapshot {
    const { meta, pageOrder, pages, elements } = this.snapshot;
    return structuredClone({ meta, pageOrder, pages, elements });
  }

  destroy() {
    this.assetUrls.forEach((u) => URL.revokeObjectURL(u));
    this.undo.destroy();
    this.ydoc.destroy();
  }
}

function indexElementPages(pages: Record<Id, Page>) {
  const out: Record<Id, Id> = {};
  for (const p of Object.values(pages)) for (const e of p.elementIds) out[e] = p.id;
  return out;
}

function sameValue(a: unknown, b: unknown) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

// Copy an element with a fresh id. Elements that shared a group keep sharing
// a (new) group, so duplicating a grouped selection stays grouped.
export function cloneElement(el: Element, groupMap = new Map<Id, Id>()): Element {
  const copy = structuredClone(el);
  copy.id = newId();
  if (copy.groupId) {
    if (!groupMap.has(copy.groupId)) groupMap.set(copy.groupId, newId());
    copy.groupId = groupMap.get(copy.groupId);
  }
  return copy;
}
