import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import * as Y from 'yjs';
import type { DesignDoc } from '../doc/design';
import type { Id } from '../doc/types';
import { canvasToBlob, pageSvg, rasterize, renderPageBlob } from './render';
import { renderAnimationVideo } from './video';
import { renderGif } from './gif';
import { getMedia } from '../io/media';

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'pdf' | 'svg' | 'tavla' | 'video' | 'gif' | 'pptx';

export interface ExportOptions {
  format: ExportFormat;
  pageIds: Id[];
  scale: number; // 1 = design size
  transparent: boolean;
  quality: number; // 0..1 for jpg/webp
  pdfQuality: 'standard' | 'print';
  bleed?: boolean; // 3 mm bleed with crop marks, for print shops
  onProgress?: (done: number, total: number) => void;
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function safeName(title: string) {
  return (title || 'Untitled design').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 80) || 'design';
}

export async function exportDesign(doc: DesignDoc, opts: ExportOptions) {
  const snap = doc.toSnapshot();
  const name = safeName(snap.meta.title);
  const pages = opts.pageIds.length ? opts.pageIds : snap.pageOrder;
  const total = pages.length;
  const progress = (i: number) => opts.onProgress?.(i, total);

  if (opts.format === 'tavla') {
    download(await writeTavlaFile(doc), `${name}.tavla`);
    return;
  }

  if (opts.format === 'pptx') {
    const { exportPptx } = await import('./pptx');
    download(await exportPptx(doc, snap, pages, opts.onProgress), `${name}.pptx`);
    return;
  }

  if (opts.format === 'gif') {
    download(await renderGif(doc, snap, pages, { onProgress: opts.onProgress }), `${name}.gif`);
    return;
  }

  if (opts.format === 'video') {
    const blob = await renderAnimationVideo(doc, snap, pages, { scale: opts.scale, onProgress: opts.onProgress });
    download(blob, `${name}.mp4`);
    return;
  }

  if (opts.format === 'pdf') {
    // 3 mm of bleed plus 7 mm of slug for crop marks, in design units (96 dpi).
    const bleed = opts.bleed ? 11.34 : 0;
    const slug = opts.bleed ? 26.46 : 0;
    const w = (snap.meta.width + 2 * (bleed + slug)) * 0.75;
    const h = (snap.meta.height + 2 * (bleed + slug)) * 0.75;
    const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'pt', format: [w, h], compress: true });
    const scale = opts.pdfQuality === 'print' ? Math.max(2, 300 / 96) : 1.5;
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage([w, h], w > h ? 'landscape' : 'portrait');
      const svg = await pageSvg(doc, snap, pages[i], { bleed });
      const bw = snap.meta.width + 2 * bleed;
      const bh = snap.meta.height + 2 * bleed;
      const canvas = await rasterize(svg, bw, bh, scale, '#FFFFFF');
      const blob = await canvasToBlob(canvas, 'image/jpeg', opts.pdfQuality === 'print' ? 0.95 : 0.88);
      const buf = new Uint8Array(await blob.arrayBuffer());
      pdf.addImage(buf, 'JPEG', slug * 0.75, slug * 0.75, bw * 0.75, bh * 0.75, undefined, 'FAST');
      if (opts.bleed) {
        // Crop marks at the trim edges, outside the bleed.
        const o = (slug + bleed) * 0.75;
        const tw = snap.meta.width * 0.75;
        const th = snap.meta.height * 0.75;
        const m = slug * 0.75 - 4;
        pdf.setLineWidth(0.25);
        pdf.setDrawColor(0, 0, 0);
        for (const x of [o, o + tw]) {
          pdf.line(x, 0, x, m);
          pdf.line(x, h - m, x, h);
        }
        for (const y of [o, o + th]) {
          pdf.line(0, y, m, y);
          pdf.line(w - m, y, w, y);
        }
      }
      // Keep links clickable in the PDF.
      const off = (slug + bleed) * 0.75;
      for (const id of snap.pages[pages[i]].elementIds) {
        const el = snap.elements[id];
        if (el?.link) pdf.link(off + el.x * 0.75, off + el.y * 0.75, el.w * 0.75, el.h * 0.75, { url: el.link });
      }
      progress(i + 1);
    }
    download(pdf.output('blob'), `${name}.pdf`);
    return;
  }

  if (opts.format === 'svg') {
    if (pages.length === 1) {
      const svg = await pageSvg(doc, snap, pages[0], { transparent: opts.transparent });
      download(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`);
      return;
    }
    const zip = new JSZip();
    for (let i = 0; i < pages.length; i++) {
      zip.file(`${name} ${i + 1}.svg`, await pageSvg(doc, snap, pages[i], { transparent: opts.transparent }));
      progress(i + 1);
    }
    download(await zip.generateAsync({ type: 'blob' }), `${name}.zip`);
    return;
  }

  // Raster formats.
  const blobs: Blob[] = [];
  for (let i = 0; i < pages.length; i++) {
    blobs.push(
      await renderPageBlob(doc, snap, pages[i], {
        type: opts.format,
        scale: opts.scale,
        transparent: opts.transparent,
        quality: opts.quality,
      }),
    );
    progress(i + 1);
  }
  const ext = opts.format;
  if (blobs.length === 1) {
    download(blobs[0], `${name}.${ext}`);
    return;
  }
  const zip = new JSZip();
  blobs.forEach((b, i) => zip.file(`${name} ${String(i + 1).padStart(2, '0')}.${ext}`, b));
  download(await zip.generateAsync({ type: 'blob' }), `${name}.zip`);
}

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
