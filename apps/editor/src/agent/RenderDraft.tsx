import { useEffect } from 'react';
import * as Y from 'yjs';
import { DesignDoc } from '../doc/design';
import { renderPageBlob } from '../export/render';
import type { Draft } from '../../../../mcp/recipe';
import { buildDraft } from './draft';

// #/mcp-render: a blank page the preview service drives in a headless browser.
// It exposes one function that builds a draft and draws its pages through the
// same export path as the editor, so a preview is exactly what the person gets.

declare global {
  interface Window {
    opentemplRender?: (draft: Draft, opts: { pages?: string[]; maxSide?: number; quality?: number; zoom?: { x: number; y: number; w: number; h: number } }) => Promise<{ pages: { id: string; jpg: string }[]; missing: string[] }>;
  }
}

async function toBase64(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function RenderDraft() {
  useEffect(() => {
    window.opentemplRender = async (draft, opts) => {
      const built = await buildDraft(draft);
      const doc = new DesignDoc(new Y.Doc());
      doc.load(built.snapshot, built.assets);
      const snap = built.snapshot;
      const max = Math.min(2400, Math.max(200, opts.maxSide ?? 1000));
      const scale = Math.min(1, max / Math.max(snap.meta.width, snap.meta.height));
      const ids = opts.pages?.length ? snap.pageOrder.filter((p) => opts.pages!.includes(p)) : snap.pageOrder;
      const pages = [];
      const z = opts.zoom;
      for (const id of ids) {
        if (!z) {
          const blob = await renderPageBlob(doc, snap, id, { type: 'jpg', scale, quality: opts.quality ?? 0.85 });
          pages.push({ id, jpg: await toBase64(blob) });
          continue;
        }
        // A close look at one region: drawn sharper than the page preview, then cut out.
        const W = snap.meta.width;
        const H = snap.meta.height;
        const box = { x: Math.max(0, z.x), y: Math.max(0, z.y), w: Math.min(z.w, W - Math.max(0, z.x)), h: Math.min(z.h, H - Math.max(0, z.y)) };
        const s = Math.min(4, max / Math.max(box.w, box.h), 5000 / Math.max(W, H));
        const full = await renderPageBlob(doc, snap, id, { type: 'png', scale: s });
        const bmp = await createImageBitmap(full, Math.round(box.x * s), Math.round(box.y * s), Math.max(1, Math.round(box.w * s)), Math.max(1, Math.round(box.h * s)));
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        c.getContext('2d')!.drawImage(bmp, 0, 0);
        pages.push({ id, jpg: await toBase64(await c.convertToBlob({ type: 'image/jpeg', quality: 0.9 })) });
      }
      doc.destroy();
      return { pages, missing: built.missing };
    };
    document.body.setAttribute('data-ready', 'yes');
  }, []);
  return null;
}
