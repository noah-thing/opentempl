import type { Editor } from '../editor/Editor';
import { newId } from '../doc/design';
import type { Asset, Id } from '../doc/types';
import { makeSvg, makeVideo } from '../doc/factory';
import { grabFrame, loadVideo, putMedia } from './media';
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
    if (file.type.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|oga|flac|opus)$/i.test(file.name)) {
      await importSoundtrack(editor, file);
      continue;
    }
    if (file.type.startsWith('video/') || /\.(mp4|m4v|mov|webm)$/i.test(file.name)) {
      await importVideo(editor, file, at);
      continue;
    }
    editor.toast(`${file.name} is not an image or video Tavla can place yet`);
  }
}

const MAX_VIDEO = 500 * 1024 * 1024;
const PEAKS = 160;

// A song or voice over becomes the design's soundtrack (one per design).
export async function importSoundtrack(editor: Editor, file: File) {
  if (file.size > MAX_VIDEO) return editor.toast(`${file.name} is over 500 MB`);
  try {
    const ctx = new OfflineAudioContext(1, 1, 44100);
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());
    const data = buf.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / PEAKS));
    const raw: number[] = [];
    for (let i = 0; i < PEAKS; i++) {
      let m = 0;
      for (let j = i * step; j < Math.min(data.length, (i + 1) * step); j += 16) m = Math.max(m, Math.abs(data[j]));
      raw.push(m);
    }
    const top = Math.max(0.0001, ...raw);
    const mediaId = newId();
    await putMedia(mediaId, file);
    editor.doc.setMeta({
      soundtrack: {
        mediaId,
        name: file.name.replace(/\.[a-z0-9]+$/i, ''),
        mime: file.type || 'audio/mpeg',
        duration: buf.duration,
        trimStart: 0,
        // A replaced track keeps the volume and fade that were set for the last one.
        volume: editor.s.meta.soundtrack?.volume ?? 0.8,
        fadeOut: editor.s.meta.soundtrack?.fadeOut ?? true,
        peaks: raw.map((v) => Math.round((v / top) * 100) / 100),
      },
    });
    editor.ui.set({ panel: 'audio' });
    editor.toast(`${file.name} now plays under the design`);
  } catch {
    editor.toast(`Could not read ${file.name} as sound`);
  }
}

async function importVideo(editor: Editor, file: File, at?: Point) {
  if (file.size > MAX_VIDEO) return editor.toast(`${file.name} is over 500 MB. Trim it first, then bring it in.`);
  editor.toast(`Bringing in ${file.name}`);
  const url = URL.createObjectURL(file);
  try {
    const v = await loadVideo(url);
    const duration = await realDuration(v);
    const poster = await prepareImage(await grabFrame(v, Math.min(0.05, duration / 2)), `${file.name} poster`);
    const mediaId = newId();
    await putMedia(mediaId, file);
    editor.doc.addAsset(poster);
    const el = makeVideo({
      mediaId,
      posterId: poster.id,
      mime: file.type || 'video/mp4',
      duration,
      trimEnd: duration,
      w: v.videoWidth || 640,
      h: v.videoHeight || 360,
      name: file.name,
    } as Parameters<typeof makeVideo>[0]);
    editor.add([editor.fitToPage(el, 0.7)], { at });
    // A page plays at least as long as the clip on it, like Canva's video pages.
    const pid = editor.state.activePageId;
    if (pid && editor.s.pages[pid] && editor.s.pages[pid].duration < duration) editor.doc.updatePage(pid, { duration: Math.ceil(duration * 10) / 10 });
  } catch {
    editor.toast(`Could not play ${file.name} in this browser`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Recorded webm files often report an infinite duration until you seek to the end.
async function realDuration(v: HTMLVideoElement): Promise<number> {
  if (Number.isFinite(v.duration) && v.duration > 0) return v.duration;
  await new Promise<void>((resolve) => {
    v.ondurationchange = () => Number.isFinite(v.duration) && resolve();
    v.currentTime = 1e9;
    setTimeout(resolve, 3000);
  });
  const d = Number.isFinite(v.duration) ? v.duration : v.currentTime;
  v.currentTime = 0;
  return d || 1;
}

export function pickFiles(accept = 'image/*,.svg,video/*,audio/*'): Promise<File[]> {
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
