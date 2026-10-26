import type { Editor } from '../editor/Editor';
import { newId } from '../doc/design';
import type { Asset, Id } from '../doc/types';
import { makeSvg } from '../doc/factory';
import { parseSvg } from '../render/ElementView';
import type { Point } from '../lib/geom';
import { addUpload } from './uploads';

const MAX_SIDE = 3200;

// Decode an image file, downscale huge photos, and return bytes to store in the design.
export async function prepareImage(blob: Blob, name = 'image'): Promise<Asset> {
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  let bytes: Uint8Array;
  let mime = blob.type || 'image/png';
  let w = width;
  let h = height;
  if (scale < 1 || !/^image\/(png|jpeg|webp|gif)$/.test(mime)) {
    w = Math.round(width * scale);
    h = Math.round(height * scale);
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const keepAlpha = mime === 'image/png' || mime === 'image/webp' || mime === 'image/gif';
    mime = keepAlpha ? 'image/png' : 'image/jpeg';
    const out = await canvas.convertToBlob({ type: mime, quality: 0.9 });
    bytes = new Uint8Array(await out.arrayBuffer());
  } else {
    bytes = new Uint8Array(await blob.arrayBuffer());
  }
  bitmap.close();
  return { id: newId(), mime, width: w, height: h, name, bytes };
}

export function sanitizeSvg(svg: string): string | null {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) return null;
  root.querySelectorAll('script, foreignObject, iframe, object, embed').forEach((n) => n.remove());
  const walk = (el: globalThis.Element) => {
    for (const attr of [...el.attributes]) {
      const n = attr.name.toLowerCase();
      if (n.startsWith('on')) el.removeAttribute(attr.name);
      if ((n === 'href' || n === 'xlink:href') && !attr.value.startsWith('#') && !attr.value.startsWith('data:image/')) el.removeAttribute(attr.name);
    }
    [...el.children].forEach(walk);
  };
  walk(root);
  if (!root.getAttribute('viewBox')) {
    const w = parseFloat(root.getAttribute('width') || '0');
    const h = parseFloat(root.getAttribute('height') || '0');
    if (w && h) root.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  return new XMLSerializer().serializeToString(root);
}

export async function importFiles(editor: Editor, files: File[], opts: { at?: Point; replaceId?: Id | null } = {}) {
  let offset = 0;
  for (const file of files) {
    const at = opts.at ? { x: opts.at.x + offset, y: opts.at.y + offset } : undefined;
    offset += 32;
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const clean = sanitizeSvg(await file.text());
      if (!clean) {
        editor.toast(`Could not read ${file.name}`);
        continue;
      }
      const [, , vw, vh] = parseSvg(clean).viewBox.split(/[\s,]+/).map(Number);
      const el = editor.fitToPage(makeSvg(clean, { w: vw || 200, h: vh || 200, name: file.name }), 0.5);
      editor.add([el], { at });
      continue;
    }
    if (file.type.startsWith('image/')) {
      try {
        const asset = await prepareImage(file, file.name);
        editor.doc.addAsset(asset);
        addUpload(asset).catch(() => {});
        const target = opts.replaceId ? editor.s.elements[opts.replaceId] : null;
        if (target && (target.type === 'image') && files.length === 1) {
          editor.replaceImage(target.id, asset.id, asset.width, asset.height);
          editor.select([target.id]);
        } else editor.addImageAsset(asset.id, asset.width, asset.height, at);
      } catch {
        editor.toast(`Could not open ${file.name}`);
      }
      continue;
    }
    editor.toast(`${file.name} is not an image Tavla can place yet`);
  }
}

export function pickFiles(accept = 'image/*,.svg'): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;
    input.onchange = () => resolve([...(input.files ?? [])]);
    input.click();
  });
}

export async function assetFromUrl(url: string, name: string, credit?: string): Promise<Asset> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const asset = await prepareImage(await res.blob(), name);
  return { ...asset, credit };
}
