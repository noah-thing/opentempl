import type { Element, Id } from '../doc/types';
import { aabb, type Rect } from '../lib/geom';
import type { Guide } from '../editor/state';

// Smart guides. Given the box being moved, find the nearest alignment on each
// axis among page edges, page centre, other elements and ruler guides, plus
// equal gaps between neighbours. Returns the snapped offset and guides to draw.

interface Target {
  pos: number;
  kind: Guide['kind'];
  span: [number, number]; // extent on the other axis, for drawing the guide
}

export interface SnapResult {
  dx: number;
  dy: number;
  guides: Guide[];
}

export function collectTargets(
  pageId: Id,
  page: { w: number; h: number },
  others: Element[],
  rulerGuides?: { x: number[]; y: number[] },
) {
  const xs: Target[] = [
    { pos: 0, kind: 'page', span: [0, page.h] },
    { pos: page.w / 2, kind: 'page', span: [0, page.h] },
    { pos: page.w, kind: 'page', span: [0, page.h] },
  ];
  const ys: Target[] = [
    { pos: 0, kind: 'page', span: [0, page.w] },
    { pos: page.h / 2, kind: 'page', span: [0, page.w] },
    { pos: page.h, kind: 'page', span: [0, page.w] },
  ];
  for (const g of rulerGuides?.x ?? []) xs.push({ pos: g, kind: 'page', span: [0, page.h] });
  for (const g of rulerGuides?.y ?? []) ys.push({ pos: g, kind: 'page', span: [0, page.w] });
  const boxes: Rect[] = [];
  for (const o of others) {
    if (o.hidden) continue;
    const b = aabb(o);
    boxes.push(b);
    xs.push({ pos: b.x, kind: 'edge', span: [b.y, b.y + b.h] });
    xs.push({ pos: b.x + b.w / 2, kind: 'center', span: [b.y, b.y + b.h] });
    xs.push({ pos: b.x + b.w, kind: 'edge', span: [b.y, b.y + b.h] });
    ys.push({ pos: b.y, kind: 'edge', span: [b.x, b.x + b.w] });
    ys.push({ pos: b.y + b.h / 2, kind: 'center', span: [b.x, b.x + b.w] });
    ys.push({ pos: b.y + b.h, kind: 'edge', span: [b.x, b.x + b.w] });
  }
  return { pageId, xs, ys, boxes };
}

export type Targets = ReturnType<typeof collectTargets>;

export function snapBox(box: Rect, t: Targets, threshold: number, axes: { x?: boolean; y?: boolean } = { x: true, y: true }): SnapResult {
  const guides: Guide[] = [];
  let dx = 0;
  let dy = 0;

  const best = (edges: number[], targets: Target[]) => {
    let hit: { d: number; target: Target; edge: number } | null = null;
    for (const e of edges)
      for (const tg of targets) {
        const d = tg.pos - e;
        if (Math.abs(d) <= threshold && (!hit || Math.abs(d) < Math.abs(hit.d))) hit = { d, target: tg, edge: e };
      }
    return hit;
  };

  if (axes.x !== false) {
    const hx = best([box.x, box.x + box.w / 2, box.x + box.w], t.xs);
    if (hx) dx = hx.d;
  }
  if (axes.y !== false) {
    const hy = best([box.y, box.y + box.h / 2, box.y + box.h], t.ys);
    if (hy) dy = hy.d;
  }

  // Equal spacing: if the box sits between two neighbours on an axis, snap so
  // the gaps match, and also match an existing gap between other neighbours.
  const gap = equalGap(box, t.boxes, threshold);
  if (gap.dx !== null && (dx === 0 || Math.abs(gap.dx) < Math.abs(dx))) dx = gap.dx;
  if (gap.dy !== null && (dy === 0 || Math.abs(gap.dy) < Math.abs(dy))) dy = gap.dy;

  const moved = { x: box.x + dx, y: box.y + dy, w: box.w, h: box.h };
  // Draw every guide that now lines up exactly.
  const eps = 0.5;
  for (const e of [moved.x, moved.x + moved.w / 2, moved.x + moved.w])
    for (const tg of t.xs)
      if (Math.abs(tg.pos - e) < eps)
        guides.push({
          pageId: t.pageId,
          axis: 'x',
          pos: tg.pos,
          from: Math.min(tg.span[0], moved.y),
          to: Math.max(tg.span[1], moved.y + moved.h),
          kind: tg.kind,
        });
  for (const e of [moved.y, moved.y + moved.h / 2, moved.y + moved.h])
    for (const tg of t.ys)
      if (Math.abs(tg.pos - e) < eps)
        guides.push({
          pageId: t.pageId,
          axis: 'y',
          pos: tg.pos,
          from: Math.min(tg.span[0], moved.x),
          to: Math.max(tg.span[1], moved.x + moved.w),
          kind: tg.kind,
        });
  guides.push(...gapGuides(moved, t.boxes, t.pageId));
  return { dx, dy, guides: dedupe(guides) };
}

function overlapY(a: Rect, b: Rect) {
  return a.y < b.y + b.h && a.y + a.h > b.y;
}
function overlapX(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x;
}

function equalGap(box: Rect, boxes: Rect[], threshold: number) {
  let dx: number | null = null;
  let dy: number | null = null;
  const left = boxes.filter((b) => overlapY(b, box) && b.x + b.w <= box.x + threshold).sort((a, b) => b.x + b.w - (a.x + a.w))[0];
  const right = boxes.filter((b) => overlapY(b, box) && b.x >= box.x + box.w - threshold).sort((a, b) => a.x - b.x)[0];
  if (left && right) {
    const target = (left.x + left.w + right.x) / 2 - box.w / 2;
    if (Math.abs(target - box.x) <= threshold) dx = target - box.x;
  }
  const top = boxes.filter((b) => overlapX(b, box) && b.y + b.h <= box.y + threshold).sort((a, b) => b.y + b.h - (a.y + a.h))[0];
  const bottom = boxes.filter((b) => overlapX(b, box) && b.y >= box.y + box.h - threshold).sort((a, b) => a.y - b.y)[0];
  if (top && bottom) {
    const target = (top.y + top.h + bottom.y) / 2 - box.h / 2;
    if (Math.abs(target - box.y) <= threshold) dy = target - box.y;
  }
  return { dx, dy };
}

function gapGuides(box: Rect, boxes: Rect[], pageId: Id): Guide[] {
  const out: Guide[] = [];
  const left = boxes.filter((b) => overlapY(b, box) && b.x + b.w <= box.x + 0.5).sort((a, b) => b.x + b.w - (a.x + a.w))[0];
  const right = boxes.filter((b) => overlapY(b, box) && b.x >= box.x + box.w - 0.5).sort((a, b) => a.x - b.x)[0];
  if (left && right) {
    const g1 = box.x - (left.x + left.w);
    const g2 = right.x - (box.x + box.w);
    if (Math.abs(g1 - g2) < 0.6 && g1 > 1) {
      const y = box.y + box.h / 2;
      out.push({ pageId, axis: 'y', pos: y, from: left.x + left.w, to: box.x, kind: 'gap', label: String(Math.round(g1)) });
      out.push({ pageId, axis: 'y', pos: y, from: box.x + box.w, to: right.x, kind: 'gap', label: String(Math.round(g2)) });
    }
  }
  const top = boxes.filter((b) => overlapX(b, box) && b.y + b.h <= box.y + 0.5).sort((a, b) => b.y + b.h - (a.y + a.h))[0];
  const bottom = boxes.filter((b) => overlapX(b, box) && b.y >= box.y + box.h - 0.5).sort((a, b) => a.y - b.y)[0];
  if (top && bottom) {
    const g1 = box.y - (top.y + top.h);
    const g2 = bottom.y - (box.y + box.h);
    if (Math.abs(g1 - g2) < 0.6 && g1 > 1) {
      const x = box.x + box.w / 2;
      out.push({ pageId, axis: 'x', pos: x, from: top.y + top.h, to: box.y, kind: 'gap', label: String(Math.round(g1)) });
      out.push({ pageId, axis: 'x', pos: x, from: box.y + box.h, to: bottom.y, kind: 'gap', label: String(Math.round(g2)) });
    }
  }
  return out;
}

function dedupe(g: Guide[]) {
  const seen = new Set<string>();
  return g.filter((x) => {
    const k = `${x.axis}${Math.round(x.pos * 2)}${x.kind}${x.label ?? ''}${x.kind === 'gap' ? x.from : ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
