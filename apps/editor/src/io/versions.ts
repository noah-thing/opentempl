import * as Y from 'yjs';
import { DesignDoc } from '../doc/design';
import { db } from './db';
import type { DesignSnapshot } from '../doc/types';

// Version history: full snapshots of the Y.Doc, kept per design. Tavla saves one
// automatically every 10 minutes of editing, and on demand from the File menu.

export interface Version {
  id: string;
  designId: string;
  at: number;
  label: string;
  update: Uint8Array;
  pages: number;
}

export async function saveVersion(doc: DesignDoc, label = 'Autosave') {
  const v: Version = {
    id: `${doc.snapshot.meta.id}:${Date.now()}`,
    designId: doc.snapshot.meta.id,
    at: Date.now(),
    label,
    update: Y.encodeStateAsUpdate(doc.ydoc),
    pages: doc.snapshot.pageOrder.length,
  };
  await db.set('versions', v.id, v);
  // Keep the newest 40 per design.
  const all = (await listVersions(v.designId)).slice(40);
  await Promise.all(all.map((x) => db.del('versions', x.id)));
  return v;
}

export async function listVersions(designId: string): Promise<Version[]> {
  const all = await db.all<Version>('versions');
  return all
    .map((r) => r.value)
    .filter((v) => v.designId === designId)
    .sort((a, b) => b.at - a.at);
}

export function versionSnapshot(v: Version): { snapshot: DesignSnapshot; doc: DesignDoc } {
  const ydoc = new Y.Doc();
  Y.applyUpdate(ydoc, v.update);
  const doc = new DesignDoc(ydoc);
  return { snapshot: doc.toSnapshot(), doc };
}

export async function restoreVersion(target: DesignDoc, v: Version) {
  await saveVersion(target, 'Before restoring');
  const { snapshot, doc } = versionSnapshot(v);
  const assets: import('../doc/types').Asset[] = [];
  doc.assets.forEach((a) => assets.push(a));
  target.load({ ...snapshot, meta: { ...snapshot.meta, id: target.snapshot.meta.id, title: target.snapshot.meta.title } }, assets);
  doc.destroy();
}

export function startAutoVersions(doc: DesignDoc) {
  let dirty = false;
  const onUpdate = (_: Uint8Array, origin: unknown) => {
    if (origin !== 'load') dirty = true;
  };
  doc.ydoc.on('update', onUpdate);
  const t = window.setInterval(() => {
    if (!dirty) return;
    dirty = false;
    saveVersion(doc).catch(() => {});
  }, 10 * 60 * 1000);
  return () => {
    window.clearInterval(t);
    doc.ydoc.off('update', onUpdate);
  };
}
