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
    opentemplRender?: (draft: Draft, opts: { pages?: string[]; maxSide?: number; quality?: number }) => Promise<{ pages: { id: string; jpg: string }[]; missing: string[] }>;
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
      for (const id of ids) {
        const blob = await renderPageBlob(doc, snap, id, { type: 'jpg', scale, quality: opts.quality ?? 0.85 });
        pages.push({ id, jpg: await toBase64(blob) });
      }
      doc.destroy();
      return { pages, missing: built.missing };
    };
    document.body.setAttribute('data-ready', 'yes');
  }, []);
  return null;
}
