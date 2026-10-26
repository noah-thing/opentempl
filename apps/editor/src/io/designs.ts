import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { DesignDoc, newId } from '../doc/design';
import type { Asset, DesignMeta, DesignSnapshot } from '../doc/types';
import { db } from './db';
import { thumbnail } from '../export/render';
import { readTavlaFile } from '../export/exporters';

// Design library: every design is its own Y.Doc persisted in IndexedDB, plus a
// small index entry (title, size, dates) and a thumbnail for the home screen.

export interface DesignEntry {
  id: string;
  title: string;
  width: number;
  height: number;
  formatId?: string;
  createdAt: number;
  updatedAt: number;
  pages: number;
  starred?: boolean;
  folder?: string;
}

const listeners = new Set<() => void>();
export function onDesignsChange(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const notify = () => listeners.forEach((l) => l());

const dbName = (id: string) => `tavla-design-${id}`;

export async function listDesigns(): Promise<DesignEntry[]> {
  const all = await db.all<DesignEntry>('designs');
  return all.map((r) => r.value).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getThumb(id: string): Promise<Blob | undefined> {
  return db.get<Blob>('thumbs', id);
}

export async function createDesign(init: { snapshot?: DesignSnapshot; assets?: Asset[]; meta?: Partial<DesignMeta> }): Promise<string> {
  const id = newId();
  const ydoc = new Y.Doc();
  const doc = new DesignDoc(ydoc);
  const now = Date.now();
  const meta: DesignMeta = {
    id,
    title: 'Untitled design',
    width: 1080,
    height: 1080,
    unit: 'px',
    createdAt: now,
    updatedAt: now,
    ...(init.snapshot?.meta ?? {}),
    ...(init.meta ?? {}),
  };
  meta.id = id;
  meta.createdAt = now;
  meta.updatedAt = now;
  if (init.snapshot) doc.load({ ...init.snapshot, meta }, init.assets ?? []);
  else {
    doc.load({ meta, pageOrder: [], pages: {}, elements: {} });
    doc.ydoc.transact(() => {
      doc.addPage();
    }, 'load');
  }
  const persistence = new IndexeddbPersistence(dbName(id), ydoc);
  await persistence.whenSynced;
  await saveEntry(doc);
  await persistence.destroy();
  ydoc.destroy();
  notify();
  return id;
}

export async function saveEntry(doc: DesignDoc) {
  const m = doc.snapshot.meta;
  const prev = await db.get<DesignEntry>('designs', m.id);
  const entry: DesignEntry = {
    id: m.id,
    title: m.title,
    width: m.width,
    height: m.height,
    formatId: m.formatId,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt ?? Date.now(),
    pages: doc.snapshot.pageOrder.length,
    starred: prev?.starred,
    folder: prev?.folder,
  };
  await db.set('designs', m.id, entry);
  try {
    const first = doc.snapshot.pageOrder[0];
    if (first) await db.set('thumbs', m.id, await thumbnail(doc, doc.toSnapshot(), first));
  } catch {
    /* thumbnails are best effort */
  }
  notify();
}

export async function updateEntry(id: string, patch: Partial<DesignEntry>) {
  const prev = await db.get<DesignEntry>('designs', id);
  if (!prev) return;
  await db.set('designs', id, { ...prev, ...patch });
  notify();
}

export interface OpenDesign {
  doc: DesignDoc;
  persistence: IndexeddbPersistence;
  close: () => Promise<void>;
}

export async function openDesign(id: string): Promise<OpenDesign | null> {
  const entry = await db.get<DesignEntry>('designs', id);
  const ydoc = new Y.Doc();
  const persistence = new IndexeddbPersistence(dbName(id), ydoc);
  await persistence.whenSynced;
  const doc = new DesignDoc(ydoc);
  if (!doc.snapshot.pageOrder.length) {
    if (!entry) {
      await persistence.destroy();
      return null;
    }
    doc.ydoc.transact(() => doc.addPage(), 'load');
  }
  // Keep the index and thumbnail fresh while editing, without hammering storage.
  let timer = 0;
  let lastThumb = 0;
  const onUpdate = (_u: Uint8Array, origin: unknown) => {
    if (origin === 'load') return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (Date.now() - lastThumb > 4000) {
        lastThumb = Date.now();
        saveEntry(doc);
      }
    }, 1200);
  };
  ydoc.on('update', onUpdate);
  return {
    doc,
    persistence,
    close: async () => {
      window.clearTimeout(timer);
      ydoc.off('update', onUpdate);
      await saveEntry(doc).catch(() => {});
      await persistence.destroy();
      doc.destroy();
    },
  };
}

export async function deleteDesign(id: string) {
  await db.del('designs', id);
  await db.del('thumbs', id);
  indexedDB.deleteDatabase(dbName(id));
  notify();
}

export async function duplicateDesign(id: string): Promise<string | null> {
  const open = await openDesign(id);
  if (!open) return null;
  const snap = open.doc.toSnapshot();
  const assets: Asset[] = [];
  open.doc.assets.forEach((a) => assets.push(a));
  await open.close();
  return createDesign({ snapshot: { ...snap, meta: { ...snap.meta, title: `${snap.meta.title} copy` } }, assets });
}

export async function importTavla(file: File): Promise<string | null> {
  const bytes = readTavlaFile(new Uint8Array(await file.arrayBuffer()));
  if (!bytes) return null;
  const tmp = new Y.Doc();
  Y.applyUpdate(tmp, bytes);
  const doc = new DesignDoc(tmp);
  const snap = doc.toSnapshot();
  const assets: Asset[] = [];
  doc.assets.forEach((a) => assets.push(a));
  doc.destroy();
  return createDesign({ snapshot: snap, assets });
}
