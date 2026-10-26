import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import type { DesignDoc } from '../doc/design';
import type { DesignSnapshot, Id } from '../doc/types';
import { pageAnimationLength } from '../render/animate';
import { pageSvg, rasterize } from './render';

// Renders pages with their entrance animations into an MP4, frame by frame, with
// WebCodecs. Frames after the last animation are reused, so still pages are cheap.

const FPS = 30;

export async function renderAnimationVideo(
  doc: DesignDoc,
  snap: DesignSnapshot,
  pageIds: Id[],
  opts: { scale: number; onProgress?: (done: number, total: number) => void },
): Promise<Blob> {
  if (typeof VideoEncoder === 'undefined') throw new Error('This browser cannot encode video. Try Chrome, Edge or Safari 17+.');
  const long = Math.max(snap.meta.width, snap.meta.height) * opts.scale;
  const fit = Math.min(1, 1920 / long);
  const scale = opts.scale * fit;
  const width = even(snap.meta.width * scale);
  const height = even(snap.meta.height * scale);

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: 'avc', width, height, frameRate: FPS }, fastStart: 'in-memory' });
  let failed: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? undefined),
    error: (e) => (failed = e),
  });
  const codec = width * height > 1920 * 1080 ? 'avc1.640033' : 'avc1.640028';
  encoder.configure({ codec, width, height, bitrate: Math.round(width * height * 6), framerate: FPS });

  const plans = pageIds.map((id) => {
    const page = snap.pages[id];
    const animLen = pageAnimationLength(page.elementIds.map((e) => snap.elements[e]?.anim));
    const ms = Math.max(page.duration * 1000, animLen + 800);
    return { id, frames: Math.round((ms / 1000) * FPS), animLen, transition: page.transition };
  });
  const total = plans.reduce((a, p) => a + p.frames, 0);
  let n = 0;
  let previous: HTMLCanvasElement | null = null;
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d')!;

  for (const plan of plans) {
    let still: HTMLCanvasElement | null = null;
    for (let f = 0; f < plan.frames; f++) {
      if (failed) throw failed;
      const t = (f / FPS) * 1000;
      let canvas: HTMLCanvasElement;
      if (still && t > plan.animLen + 50) canvas = still;
      else {
        const svg = await pageSvg(doc, snap, plan.id, { time: t, idPrefix: `v${n}-` });
        canvas = await rasterize(svg, snap.meta.width, snap.meta.height, scale, '#FFFFFF');
        if (t > plan.animLen + 50) still = canvas;
      }
      ctx.globalAlpha = 1;
      ctx.drawImage(canvas, 0, 0, width, height);
      // Cross fade from the previous page for pages with a fade transition.
      if (previous && plan.transition !== 'none' && t < 450) {
        ctx.globalAlpha = 1 - t / 450;
        ctx.drawImage(previous, 0, 0, width, height);
        ctx.globalAlpha = 1;
      }
      const frame = new VideoFrame(out, { timestamp: Math.round((n * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
      encoder.encode(frame, { keyFrame: n % (FPS * 2) === 0 });
      frame.close();
      n++;
      if (n % 5 === 0) opts.onProgress?.(n, total);
      // Let the encoder drain so memory stays flat on long videos.
      if (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    }
    previous = still ?? previous;
  }
  await encoder.flush();
  muxer.finalize();
  opts.onProgress?.(total, total);
  return new Blob([target.buffer], { type: 'video/mp4' });
}

function even(n: number) {
  return Math.max(2, Math.round(n / 2) * 2);
}
