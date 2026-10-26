import type { Asset } from '../doc/types';
import { db } from './db';

// The uploads library is shared by every design on this device, like Canva's
// Uploads tab. Placing an upload copies its bytes into the design so the file
// stays complete on its own.

const listeners = new Set<() => void>();

export function onUploadsChange(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export async function addUpload(asset: Asset) {
  await db.set('uploads', asset.id, { ...asset, addedAt: Date.now() });
  listeners.forEach((l) => l());
}

export async function listUploads(): Promise<(Asset & { addedAt: number })[]> {
  const all = await db.all<Asset & { addedAt: number }>('uploads');
  return all.map((r) => r.value).sort((a, b) => b.addedAt - a.addedAt);
}

export async function removeUpload(id: string) {
  await db.del('uploads', id);
  listeners.forEach((l) => l());
}
