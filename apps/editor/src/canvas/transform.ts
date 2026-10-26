import type { Element, ImageElement, LineElement, TextElement } from '../doc/types';
import { center, rotatePoint, snapAngle, type Point, type Rect } from '../lib/geom';

export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const HANDLE_DIRS: Record<Handle, [number, number]> = {
  nw: [-1, -1],
  n: [0, -1],
  ne: [1, -1],
  e: [1, 0],
  se: [1, 1],
  s: [0, 1],
  sw: [-1, 1],
  w: [-1, 0],
};

export function isCorner(h: Handle) {
  return h.length === 2;
}

// Which handles an element type shows. Text only resizes width from the sides.
export function handlesFor(el: Element | null, multi: boolean): Handle[] {
  if (multi) return ['nw', 'ne', 'se', 'sw'];
  if (!el) return [];
  if (el.type === 'line') return [];
  if (el.type === 'text') return el.curve ? ['nw', 'ne', 'se', 'sw'] : ['nw', 'ne', 'se', 'sw', 'e', 'w'];
  return ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
}

const MIN = 4;

// Resize a single (possibly rotated) element from a handle.
export function resizeElement(
  start: Element,
  handle: Handle,
  pointer: Point,
  opts: { shift: boolean; alt: boolean; assetSize?: { width: number; height: number } },
): Partial<Element> {
  const [hx, hy] = HANDLE_DIRS[handle];
  const c0 = center(start);
  const local = rotatePoint(pointer, c0, -start.rotation);
  const p = { x: local.x - c0.x, y: local.y - c0.y };
  const corner = isCorner(handle);
  const keepRatio =
    corner &&
    (start.type === 'text' || start.type === 'image' || start.type === 'svg' || start.type === 'qr' || start.type === 'draw'
      ? !opts.shift
      : opts.shift);

  // Anchor: the opposite handle, or the centre when alt is held.
  const ax = opts.alt ? 0 : (-hx * start.w) / 2;
  const ay = opts.alt ? 0 : (-hy * start.h) / 2;
  let w = start.w;
  let h = start.h;
  if (hx) w = Math.max(MIN, (p.x - ax) * hx);
  if (hy) h = Math.max(MIN, (p.y - ay) * hy);
  if (opts.alt) {
    if (hx) w = Math.max(MIN, Math.abs(p.x) * 2);
    if (hy) h = Math.max(MIN, Math.abs(p.y) * 2);
  }
  if (keepRatio) {
    const s = Math.max(w / start.w, h / start.h);
    w = start.w * s;
    h = start.h * s;
  }
  // New centre in local space, then back to the page.
  const ncx = opts.alt ? 0 : hx ? ax + (hx * w) / 2 : 0;
  const ncy = opts.alt ? 0 : hy ? ay + (hy * h) / 2 : 0;
  const nc = rotatePoint({ x: c0.x + ncx, y: c0.y + ncy }, c0, start.rotation);
  const box = { x: nc.x - w / 2, y: nc.y - h / 2, w, h };

  if (start.type === 'text') {
    const t = start as TextElement;
    if (corner) {
      const s = w / start.w;
      return { ...box, fontSize: Math.max(1, round2(t.fontSize * s)) } as Partial<TextElement>;
    }
    // Side handles change the wrap width only; height follows the text.
    const minW = t.fontSize * 0.6;
    const ww = Math.max(minW, w);
    const nc2 = rotatePoint({ x: c0.x + (hx ? ax + (hx * ww) / 2 : 0), y: c0.y }, c0, start.rotation);
    return { x: nc2.x - ww / 2, y: nc2.y - start.h / 2, w: ww } as Partial<TextElement>;
  }

  if (start.type === 'image' && !corner && opts.assetSize) {
    return { ...box, crop: recrop(start as ImageElement, box, handle, opts.assetSize) } as Partial<ImageElement>;
  }
  return box;
}

// Side handles on a photo reveal more or less of it instead of stretching it.
function recrop(start: ImageElement, box: Rect, handle: Handle, size: { width: number; height: number }) {
  const ratio = size.width / size.height;
  // Current displayed image size in page units.
  let iw = start.w / start.crop.w;
  let ih = start.h / start.crop.h;
  // Edge of the visible window in image fractions.
  let { x, y } = start.crop;
  let cw = box.w / iw;
  let ch = box.h / ih;
  // When the window grows past the image, scale the image up to keep covering.
  const need = Math.max(cw, ch);
  if (need > 1) {
    iw = iw * need;
    ih = iw / ratio;
    cw = box.w / iw;
    ch = box.h / ih;
    // Keep the focus centred while scaling.
    x = (start.crop.x + start.crop.w / 2) - cw / 2;
    y = (start.crop.y + start.crop.h / 2) - ch / 2;
  } else {
    if (handle === 'w') x = start.crop.x + start.crop.w - cw;
    if (handle === 'n') y = start.crop.y + start.crop.h - ch;
  }
  x = Math.max(0, Math.min(1 - cw, x));
  y = Math.max(0, Math.min(1 - ch, y));
  return { x, y, w: cw, h: ch };
}

// Scale a group of elements uniformly inside their union box.
export function scaleGroup(starts: Element[], from: Rect, to: Rect): Record<string, Partial<Element>> {
  const s = to.w / from.w;
  const out: Record<string, Partial<Element>> = {};
  for (const el of starts) {
    const patch: Partial<Element> & Record<string, unknown> = {
      x: to.x + (el.x - from.x) * s,
      y: to.y + (el.y - from.y) * s,
      w: el.w * s,
      h: el.h * s,
    };
    if (el.type === 'text') patch.fontSize = round2(el.fontSize * s);
    if (el.type === 'line') patch.width = Math.max(0.5, round2(el.width * s));
    out[el.id] = patch;
  }
  return out;
}

export function groupResizeBox(from: Rect, handle: Handle, pointer: Point, alt: boolean): Rect {
  const [hx, hy] = HANDLE_DIRS[handle];
  const c = center(from);
  const ax = alt ? c.x : hx > 0 ? from.x : from.x + from.w;
  const ay = alt ? c.y : hy > 0 ? from.y : from.y + from.h;
  const sx = ((pointer.x - ax) * hx) / (alt ? from.w / 2 : from.w);
  const sy = ((pointer.y - ay) * hy) / (alt ? from.h / 2 : from.h);
  const s = Math.max(0.02, Math.max(sx, sy));
  const w = from.w * s;
  const h = from.h * s;
  const x = alt ? c.x - w / 2 : hx > 0 ? ax : ax - w;
  const y = alt ? c.y - h / 2 : hy > 0 ? ay : ay - h;
  return { x, y, w, h };
}

export function rotationFor(start: Element | Rect & { rotation?: number }, pointer: Point, startPointer: Point, shift: boolean) {
  const c = center(start);
  const a0 = Math.atan2(startPointer.y - c.y, startPointer.x - c.x);
  const a1 = Math.atan2(pointer.y - c.y, pointer.x - c.x);
  let deg = ((start as Element).rotation ?? 0) + ((a1 - a0) * 180) / Math.PI;
  deg = shift ? Math.round(deg / 15) * 15 : snapAngle(deg, 3, 45);
  deg = ((deg % 360) + 360) % 360;
  return Math.round(deg * 10) / 10;
}

// ---------- lines ----------
export function lineEnds(el: LineElement): [Point, Point] {
  const c = center(el);
  return [
    rotatePoint({ x: el.x, y: el.y + el.h / 2 }, c, el.rotation),
    rotatePoint({ x: el.x + el.w, y: el.y + el.h / 2 }, c, el.rotation),
  ];
}

export function lineFromEnds(el: LineElement, a: Point, b: Point, shift: boolean): Partial<LineElement> {
  let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  let len = Math.hypot(b.x - a.x, b.y - a.y);
  if (shift) {
    angle = Math.round(angle / 45) * 45;
  } else {
    const snapped = snapAngle(angle, 2.5, 45);
    if (snapped !== ((angle % 360) + 360) % 360) angle = snapped;
  }
  len = Math.max(2, len);
  const rad = (angle * Math.PI) / 180;
  const end = { x: a.x + Math.cos(rad) * len, y: a.y + Math.sin(rad) * len };
  const c = { x: (a.x + end.x) / 2, y: (a.y + end.y) / 2 };
  return {
    x: c.x - len / 2,
    y: c.y - el.h / 2,
    w: len,
    rotation: ((Math.round(angle * 10) / 10) % 360 + 360) % 360,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
