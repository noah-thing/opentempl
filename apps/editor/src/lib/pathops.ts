import polygonClipping, { type MultiPolygon, type Ring } from 'polygon-clipping';
import type { ShapeElement } from '../doc/types';
import { newId } from '../doc/design';
import { elementPath } from '../render/shapes';

// Shape maths that needs a real outline: flattening curves to polygons (the
// browser measures them for us), boolean operations, and tight bounds.

export type BooleanOp = 'union' | 'subtract' | 'intersect' | 'exclude';

export const BOOLEAN_OPS: { op: BooleanOp; label: string }[] = [
  { op: 'union', label: 'Union' },
  { op: 'subtract', label: 'Subtract' },
  { op: 'intersect', label: 'Intersect' },
  { op: 'exclude', label: 'Exclude' },
];

const NS = 'http://www.w3.org/2000/svg';
let probe: SVGPathElement | null = null;

function probePath(d: string) {
  if (!probe) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden');
    probe = document.createElementNS(NS, 'path');
    svg.append(probe);
    document.body.append(svg);
  }
  probe.setAttribute('d', d);
  return probe;
}

// Straight edged subpaths keep their exact corners; curved ones are sampled
// every `step` units, which is finer than anyone sees at print size.
export function flattenPath(d: string, step = 1.25): Ring[] {
  const rings: Ring[] = [];
  for (const sub of d.match(/M[^M]*/g) ?? []) {
    const exact = polyline(sub);
    if (exact) {
      if (exact.length >= 3) rings.push(exact);
      continue;
    }
    const p = probePath(sub);
    const len = p.getTotalLength();
    if (len < 0.5) continue;
    const n = Math.max(24, Math.min(2000, Math.ceil(len / step)));
    const ring: Ring = [];
    for (let i = 0; i < n; i++) {
      const pt = p.getPointAtLength((len * i) / n);
      ring.push([pt.x, pt.y]);
    }
    rings.push(ring);
  }
  return rings;
}

function polyline(sub: string): Ring | null {
  if (/[^MLHVZ\d\s.,eE+-]/.test(sub)) return null;
  const ring: Ring = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of sub.matchAll(/([MLHVZ])([^MLHVZ]*)/g)) {
    const n = (args.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    if (cmd === 'H') for (const v of n) ring.push([(x = v), y]);
    else if (cmd === 'V') for (const v of n) ring.push([x, (y = v)]);
    else if (cmd === 'M' || cmd === 'L') for (let i = 0; i + 1 < n.length; i += 2) ring.push([(x = n[i]), (y = n[i + 1])]);
  }
  return ring;
}

// A shape's outline on the page: flips, then rotation about the centre, then position.
function pageGeometry(el: ShapeElement): MultiPolygon {
  const cx = el.w / 2;
  const cy = el.h / 2;
  const a = ((el.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const rings = flattenPath(elementPath(el)).map((ring) =>
    ring.map(([px, py]) => {
      const lx = (el.flipX ? 2 * cx - px : px) - cx;
      const ly = (el.flipY ? 2 * cy - py : py) - cy;
      return [el.x + cx + lx * cos - ly * sin, el.y + cy + lx * sin + ly * cos] as [number, number];
    }),
  );
  // Rings of one shape combine even odd, the same way they are painted.
  if (!rings.length) return [];
  return rings.slice(1).reduce<MultiPolygon>((acc, r) => polygonClipping.xor(acc, [[r]]), [[rings[0]]]);
}

// Combine shapes into one path. The bottom shape gives the style, like Figma,
// and subtract cuts everything above it out of the bottom one.
export function combineShapes(shapes: ShapeElement[], op: BooleanOp): ShapeElement | null {
  if (shapes.length < 2) return null;
  const geoms = shapes.map(pageGeometry);
  const [first, ...rest] = geoms;
  const out =
    op === 'union'
      ? polygonClipping.union(first, ...rest)
      : op === 'subtract'
        ? polygonClipping.difference(first, ...rest)
        : op === 'intersect'
          ? polygonClipping.intersection(first, ...rest)
          : polygonClipping.xor(first, ...rest);
  const pts = out.flat(2);
  if (!pts.length) return null;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const w = Math.max(1, Math.max(...xs) - x);
  const h = Math.max(1, Math.max(...ys) - y);
  const r = (n: number) => Math.round(n * 100) / 100;
  const d = out
    .flat()
    .map((ring) => 'M' + ring.slice(0, -1).map(([px, py]) => `${r(px - x)} ${r(py - y)}`).join(' L') + ' Z')
    .join(' ');
  const bottom = shapes[0];
  return {
    ...structuredClone(bottom),
    id: newId(),
    shape: 'path',
    x: r(x),
    y: r(y),
    w: r(w),
    h: r(h),
    rotation: 0,
    flipX: false,
    flipY: false,
    radius: 0,
    path: d,
    w0: r(w),
    h0: r(h),
    nodes: undefined,
    groupId: undefined,
    locked: false,
  };
}

