// @ts-expect-error gifenc ships without types
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { DesignDoc } from '../doc/design';
import type { DesignSnapshot, Id } from '../doc/types';
import { pageAnimationLength } from '../render/animate';
import { pageSvg, rasterize } from './render';

// Animated GIF of pages and their entrance animations. 15 frames a second and
// at most 720 px on the long side keep files small enough to post anywhere.

const FPS = 15;

export async function renderGif(
  doc: DesignDoc,
  snap: DesignSnapshot,
  pageIds: Id[],
  opts: { onProgress?: (done: number, total: number) => void; loop?: boolean },
): Promise<Blob> {
  const scale = Math.min(1, 720 / Math.max(snap.meta.width, snap.meta.height));
  const width = Math.round(snap.meta.width * scale);
  const height = Math.round(snap.meta.height * scale);
  const gif = GIFEncoder();
  const plans = pageIds.map((id) => {
    const page = snap.pages[id];
    const animLen = pageAnimationLength(page.elementIds.map((e) => snap.elements[e]?.anim));
    return { id, animLen, hold: Math.max(page.duration * 1000, animLen + 600) };
  });
  const total = plans.reduce((a, p) => a + Math.ceil((Math.min(p.animLen, p.hold) / 1000) * FPS) + 1, 0);
  let n = 0;
  for (const plan of plans) {
    const frames = Math.ceil((plan.animLen / 1000) * FPS);
    for (let f = 0; f <= frames; f++) {
      const t = f === frames ? plan.animLen + 100 : (f / FPS) * 1000;
      const svg = await pageSvg(doc, snap, plan.id, { time: t, idPrefix: `g${n}-` });
      const canvas = await rasterize(svg, snap.meta.width, snap.meta.height, scale, '#FFFFFF');
      const data = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);
      // The last frame of a page holds for the rest of its duration.
      const delay = f === frames ? Math.max(100, plan.hold - plan.animLen) : 1000 / FPS;
      gif.writeFrame(index, width, height, { palette, delay, repeat: opts.loop === false ? -1 : 0 });
      n++;
      opts.onProgress?.(n, total);
      if (n % 4 === 0) await new Promise((r) => setTimeout(r, 0));
    }
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}
