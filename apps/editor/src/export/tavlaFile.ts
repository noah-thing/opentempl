import * as Y from 'yjs';
import type { DesignDoc } from '../doc/design';
import type { Id } from '../doc/types';
import { getMedia } from '../io/media';

// Files start with a short marker so Tavla can tell its files from random binaries.
// TAVLA1 is the design alone. TAVLA2 adds video clips: a little-endian length,
// a JSON header naming each clip, the design, then the clips' bytes in order.
export const TAVLA_MAGIC = new TextEncoder().encode('TAVLA1\n');
const TAVLA2_MAGIC = new TextEncoder().encode('TAVLA2\n');

interface TavlaHeader {
  update: number;
  media: { id: Id; mime: string; size: number }[];
}

export async function writeTavlaFile(doc: DesignDoc): Promise<Blob> {
  const update = Y.encodeStateAsUpdate(doc.ydoc);
  const track = doc.snapshot.meta.soundtrack;
  const ids = [...new Set([...Object.values(doc.snapshot.elements).flatMap((e) => (e.type === 'video' ? [e.mediaId] : [])), ...(track ? [track.mediaId] : [])])];
  const media = (await Promise.all(ids.map(async (id) => ({ id, blob: await getMedia(id) })))).filter((m): m is { id: Id; blob: Blob } => !!m.blob);
  if (!media.length) return new Blob([TAVLA_MAGIC, update as BlobPart], { type: 'application/x-tavla' });
  const header: TavlaHeader = { update: update.length, media: media.map((m) => ({ id: m.id, mime: m.blob.type, size: m.blob.size })) };
  const hb = new TextEncoder().encode(JSON.stringify(header));
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, hb.length, true);
  return new Blob([TAVLA2_MAGIC, len, hb, update as BlobPart, ...media.map((m) => m.blob)], { type: 'application/x-tavla' });
}

export function readTavlaFile(bytes: Uint8Array): { update: Uint8Array; media: { id: Id; blob: Blob }[] } | null {
  const starts = (m: Uint8Array) => m.every((b, i) => bytes[i] === b);
  if (starts(TAVLA_MAGIC)) return { update: bytes.subarray(TAVLA_MAGIC.length), media: [] };
  if (!starts(TAVLA2_MAGIC)) return null;
  let at = TAVLA2_MAGIC.length;
  const hlen = new DataView(bytes.buffer, bytes.byteOffset + at, 4).getUint32(0, true);
  at += 4;
  const header = JSON.parse(new TextDecoder().decode(bytes.subarray(at, at + hlen))) as TavlaHeader;
  at += hlen;
  const update = bytes.subarray(at, at + header.update);
  at += header.update;
  const media = header.media.map((m) => {
    const blob = new Blob([bytes.slice(at, at + m.size)], { type: m.mime });
    at += m.size;
    return { id: m.id, blob };
  });
  return { update, media };
}
