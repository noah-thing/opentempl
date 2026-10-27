import type { Element, Id, LineElement } from '../doc/types';
import { aabb, center, type Point } from '../lib/geom';
import { lineEnds } from './transform';

// Connectors are ordinary lines whose ends stick to elements. Each stuck end
// sits on the edge of its element, aimed at the other end, with a small gap
// so arrowheads never bury themselves in the shape.

export function canConnect(el: Element | undefined): el is Element {
  return !!el && el.type !== 'line' && !el.hidden;
}

// Where a line aimed from the element's centre towards `toward` leaves the element.
export function edgePoint(el: Element, toward: Point, gap: number): Point {
  const box = aabb(el);
  const c = center(box);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.001) return c;
  const rx = box.w / 2;
  const ry = box.h / 2;
  const round = el.type === 'shape' && el.shape === 'ellipse' && !el.rotation;
  const t = round ? 1 / Math.hypot(dx / rx, dy / ry) : Math.min(rx / Math.abs(dx || 1e-9), ry / Math.abs(dy || 1e-9));
  const reach = Math.min(1, t + gap / dist);
  return { x: c.x + dx * reach, y: c.y + dy * reach };
}

export function connectorGap(line: LineElement) {
  return 4 + line.width;
}

// The geometry a connector should have now, or null when it is not stuck to anything.
export function connectorPatch(line: LineElement, elements: Record<Id, Element>): Partial<LineElement> | null {
  const A = line.from ? elements[line.from] : undefined;
  const B = line.to ? elements[line.to] : undefined;
  if (!canConnect(A) && !canConnect(B)) return null;
  const [a0, b0] = lineEnds(line);
  const gap = connectorGap(line);
  const aim = { a: canConnect(A) ? center(aabb(A)) : a0, b: canConnect(B) ? center(aabb(B)) : b0 };
  const a = canConnect(A) ? edgePoint(A, aim.b, gap) : a0;
  const b = canConnect(B) ? edgePoint(B, aim.a, gap) : b0;
  return lineBetween(line, a, b);
}

export function lineBetween(line: LineElement, a: Point, b: Point): Partial<LineElement> {
  const len = Math.max(2, Math.hypot(b.x - a.x, b.y - a.y));
  const angle = (((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI) % 360 + 360) % 360;
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    x: r((a.x + b.x) / 2 - len / 2),
    y: r((a.y + b.y) / 2 - line.h / 2),
    w: r(len),
    rotation: r(angle),
  };
}

// Every connector on the same page whose geometry no longer matches its elements.
export function staleConnectors(elements: Record<Id, Element>): Record<Id, Partial<LineElement>> {
  const out: Record<Id, Partial<LineElement>> = {};
  for (const el of Object.values(elements)) {
    if (el.type !== 'line' || (!el.from && !el.to)) continue;
    const p = connectorPatch(el, elements);
    if (!p) continue;
    const off =
      Math.abs((p.x ?? el.x) - el.x) > 0.05 ||
      Math.abs((p.y ?? el.y) - el.y) > 0.05 ||
      Math.abs((p.w ?? el.w) - el.w) > 0.05 ||
      Math.abs((((p.rotation ?? el.rotation) - el.rotation + 540) % 360) - 180) > 0.05;
    if (off) out[el.id] = p;
  }
  return out;
}
