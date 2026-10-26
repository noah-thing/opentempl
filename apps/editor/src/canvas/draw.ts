import type { Point } from '../lib/geom';

// Turn raw pointer samples into a smooth path: drop points closer than 1.5 units,
// then draw quadratic curves through the midpoints (the classic smoothing trick).
export function smoothPath(raw: Point[]): string {
  const pts: Point[] = [];
  for (const p of raw) {
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 1.5) pts.push(p);
  }
  if (!pts.length) return '';
  if (pts.length === 1) return `M${r(pts[0].x)} ${r(pts[0].y)} l0.01 0`;
  let d = `M${r(pts[0].x)} ${r(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${r(pts[i].x)} ${r(pts[i].y)} ${r(mx)} ${r(my)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${r(last.x)} ${r(last.y)}`;
  return d;
}

const r = (n: number) => Math.round(n * 10) / 10;
