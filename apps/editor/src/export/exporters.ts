import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import * as Y from 'yjs';
import type { DesignDoc } from '../doc/design';
import type { Id } from '../doc/types';
import { canvasToBlob, pageSvg, rasterize, renderPageBlob } from './render';
import { renderAnimationVideo } from './video';

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'pdf' | 'svg' | 'tavla' | 'video';

export interface ExportOptions {
  format: ExportFormat;
  pageIds: Id[];
  scale: number; // 1 = design size
  transparent: boolean;
  quality: number; // 0..1 for jpg/webp
  pdfQuality: 'standard' | 'print';
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
    const update = Y.encodeStateAsUpdate(doc.ydoc);
    download(new Blob([TAVLA_MAGIC, update as BlobPart], { type: 'application/x-tavla' }), `${name}.tavla`);
    return;
  }

  if (opts.format === 'video') {
    const blob = await renderAnimationVideo(doc, snap, pages, { scale: opts.scale, onProgress: opts.onProgress });
    download(blob, `${name}.mp4`);
    return;
  }

  if (opts.format === 'pdf') {
    const w = snap.meta.width * 0.75;
    const h = snap.meta.height * 0.75;
    const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'pt', format: [w, h], compress: true });
    const scale = opts.pdfQuality === 'print' ? Math.max(2, 300 / 96) : 1.5;
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage([w, h], w > h ? 'landscape' : 'portrait');
      const svg = await pageSvg(doc, snap, pages[i]);
      const canvas = await rasterize(svg, snap.meta.width, snap.meta.height, scale, '#FFFFFF');
      const blob = await canvasToBlob(canvas, 'image/jpeg', opts.pdfQuality === 'print' ? 0.95 : 0.88);
      const buf = new Uint8Array(await blob.arrayBuffer());
      pdf.addImage(buf, 'JPEG', 0, 0, w, h, undefined, 'FAST');
      // Keep links clickable in the PDF.
      for (const id of snap.pages[pages[i]].elementIds) {
        const el = snap.elements[id];
        if (el?.link) pdf.link(el.x * 0.75, el.y * 0.75, el.w * 0.75, el.h * 0.75, { url: el.link });
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
export const TAVLA_MAGIC = new TextEncoder().encode('TAVLA1\n');

export function readTavlaFile(bytes: Uint8Array): Uint8Array | null {
  for (let i = 0; i < TAVLA_MAGIC.length; i++) if (bytes[i] !== TAVLA_MAGIC[i]) return null;
  return bytes.subarray(TAVLA_MAGIC.length);
}
