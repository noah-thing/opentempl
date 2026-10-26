export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const DEG = Math.PI / 180;

export function rotatePoint(p: Point, c: Point, deg: number): Point {
  const a = deg * DEG;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * cos - dy * sin, y: c.y + dx * sin + dy * cos };
}

export function center(b: Rect): Point {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export function corners(b: Box): Point[] {
  const c = center(b);
  return [
    { x: b.x, y: b.y },
    { x: b.x + b.w, y: b.y },
    { x: b.x + b.w, y: b.y + b.h },
    { x: b.x, y: b.y + b.h },
  ].map((p) => rotatePoint(p, c, b.rotation));
}

export function aabb(b: Box): Rect {
  if (!b.rotation) return { x: b.x, y: b.y, w: b.w, h: b.h };
  const pts = corners(b);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export function unionRects(rects: Rect[]): Rect | null {
  if (!rects.length) return null;
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const r of rects) {
    x1 = Math.min(x1, r.x);
    y1 = Math.min(y1, r.y);
    x2 = Math.max(x2, r.x + r.w);
    y2 = Math.max(y2, r.y + r.h);
  }
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

export function rectsIntersect(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInBox(p: Point, b: Box): boolean {
  const local = rotatePoint(p, center(b), -b.rotation);
  return local.x >= b.x && local.x <= b.x + b.w && local.y >= b.y && local.y <= b.y + b.h;
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function round(v: number, step = 0.01) {
  return Math.round(v / step) * step;
}

export function normalizeAngle(deg: number) {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

// Snap an angle to multiples of 45 degrees when close (within tolerance).
export function snapAngle(deg: number, tolerance = 4, step = 45) {
  const a = normalizeAngle(deg);
  const nearest = Math.round(a / step) * step;
  return Math.abs(nearest - a) <= tolerance ? nearest % 360 : a;
}
