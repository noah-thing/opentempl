import { createDesign } from './designs';
import { newId } from '../doc/design';
import { makeImage } from '../doc/factory';
import type { Asset, DesignSnapshot, Element, Page } from '../doc/types';

// Import a PDF as a new design: one Tavla page per PDF page, each holding the
// page as a locked picture so you can write, draw and present on top of it.

export async function importPdf(file: File, onProgress?: (done: number, total: number) => void): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const first = await pdf.getPage(1);
  const v1 = first.getViewport({ scale: 96 / 72 });
  const W = Math.round(v1.width);
  const H = Math.round(v1.height);
  const assets: Asset[] = [];
  const pages: Record<string, Page> = {};
  const elements: Record<string, Element> = {};
  const pageOrder: string[] = [];
  const count = Math.min(pdf.numPages, 200);
  for (let i = 1; i <= count; i++) {
    const p = await pdf.getPage(i);
    const vp = p.getViewport({ scale: (96 / 72) * 2 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    await p.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', 0.9));
    const asset: Asset = { id: newId(), mime: 'image/jpeg', width: canvas.width, height: canvas.height, name: `${file.name} page ${i}`, bytes: new Uint8Array(await blob.arrayBuffer()) };
    assets.push(asset);
    const img = makeImage({ assetId: asset.id, x: 0, y: 0, w: W, h: H, locked: true, name: `PDF page ${i}` });
    elements[img.id] = img;
    const pid = newId();
    pages[pid] = { id: pid, name: '', background: { type: 'solid', color: '#FFFFFF' }, elementIds: [img.id], notes: '', transition: 'none', duration: 5 };
    pageOrder.push(pid);
    onProgress?.(i, count);
  }
  const now = Date.now();
  const snapshot: DesignSnapshot = {
    meta: { id: '', title: file.name.replace(/\.pdf$/i, ''), width: W, height: H, unit: 'px', createdAt: now, updatedAt: now },
    pageOrder,
    pages,
    elements,
  };
  return createDesign({ snapshot, assets });
}
