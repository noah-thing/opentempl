import { describe, expect, it } from 'vitest';
import { collectTargets, snapBox } from '../src/canvas/snap';
import { elementPath, pathToNodes, penPath, shapePath, SHAPE_KINDS, transformPath } from '../src/render/shapes';
import { animState } from '../src/render/animate';
import { charStyles } from '../src/text/layout';
import { aabb, rotatePoint, snapAngle } from '../src/lib/geom';
import { makeShape, makeText } from '../src/doc/factory';
import { checkDesign } from '../src/tools/check';

describe('geometry', () => {
  it('rotates a point around a centre', () => {
    const p = rotatePoint({ x: 10, y: 0 }, { x: 0, y: 0 }, 90);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(10);
  });
  it('grows the bounding box of a rotated square', () => {
    const b = aabb({ x: 0, y: 0, w: 100, h: 100, rotation: 45 });
    expect(b.w).toBeCloseTo(141.42, 1);
  });
  it('snaps angles near 45 degree steps only', () => {
    expect(snapAngle(43)).toBe(45);
    expect(snapAngle(30)).toBe(30);
  });
});

describe('smart guides', () => {
  const page = { w: 1000, h: 1000 };
  it('snaps a box to the page centre', () => {
    const t = collectTargets('p', page, []);
    const r = snapBox({ x: 447, y: 100, w: 100, h: 100 }, t, 6);
    expect(r.dx).toBe(3);
    expect(r.guides.some((g) => g.axis === 'x' && g.pos === 500)).toBe(true);
  });
  it('snaps to an equal gap between two neighbours', () => {
    const a = makeShape('rect', { x: 0, y: 0, w: 100, h: 100 });
    const b = makeShape('rect', { x: 400, y: 0, w: 100, h: 100 });
    const t = collectTargets('p', page, [a, b]);
    const r = snapBox({ x: 198, y: 0, w: 100, h: 100 }, t, 6);
    expect(198 + r.dx).toBe(200);
  });
  it('leaves a box alone when nothing is close', () => {
    const t = collectTargets('p', page, []);
    expect(snapBox({ x: 123, y: 321, w: 50, h: 50 }, t, 4).dx).toBe(0);
  });
});

describe('shapes', () => {
  it('draws every shape kind as a closed path', () => {
    for (const { kind } of SHAPE_KINDS) {
      const d = shapePath(kind, 200, 120, 10);
      expect(d.length).toBeGreaterThan(10);
      expect(d).not.toContain('NaN');
    }
  });
});

describe('animation', () => {
  it('starts hidden and ends at rest', () => {
    const anim = { kind: 'fade' as const, delay: 100, duration: 500 };
    expect(animState(anim, 0).opacity).toBe(0);
    expect(animState(anim, 700).opacity).toBe(1);
  });
  it('is idle without an animation', () => {
    expect(animState(null, 0).scale).toBe(1);
  });
});

describe('text runs', () => {
  it('styles characters inside a run and leaves the rest alone', () => {
    const t = makeText({ text: 'Open studio', fontWeight: 400, runs: [{ start: 5, end: 11, fontWeight: 700, color: '#FF4B39' }] });
    const { styles, index } = charStyles(t, t.text.length);
    expect(styles[index[0]].fontWeight).toBe(400);
    expect(styles[index[6]].fontWeight).toBe(700);
    expect(styles[index[6]].color).toBe('#FF4B39');
  });
});

describe('vector paths', () => {
  it('stretches a path with its box, arcs included', () => {
    expect(transformPath('M0 0 L10 0 L10 20 Z', 2, 0.5)).toBe('M0 0 L20 0 L20 10 Z');
    expect(transformPath('M0 5 A5 5 0 0 1 10 5', 2, 1)).toBe('M0 5 A10 5 0 0 1 20 5');
  });
  it('moves absolute points but only scales relative ones', () => {
    expect(transformPath('M1 1 l2 2', 1, 1, 10, 10)).toBe('M11 11 l2 2');
  });
  it('keeps corners straight and turns handles into curves', () => {
    const corners = [{ x: 0, y: 0, hx: 0, hy: 0 }, { x: 10, y: 0, hx: 0, hy: 0 }, { x: 10, y: 10, hx: 0, hy: 0 }];
    expect(penPath(corners, true)).toBe('M0 0 L10 0 L10 10 L0 0 Z');
    const curve = [{ x: 0, y: 0, hx: 5, hy: 0 }, { x: 10, y: 10, hx: 0, hy: 5 }];
    expect(penPath(curve, false)).toBe('M0 0 C5 0 10 5 10 10');
  });
  it('stretches a pen shape through elementPath', () => {
    const el = makeShape('path', { w: 200, h: 100, w0: 100, h0: 100, path: 'M0 0 L100 0 L100 100 Z' });
    expect(elementPath(el)).toBe('M0 0 L200 0 L200 100 Z');
  });
});

describe('shapes to pen points', () => {
  it('turns a plain rectangle into its four corners', () => {
    const n = pathToNodes(shapePath('rect', 100, 50, 0))!;
    expect(n.map((p) => [p.x, p.y])).toEqual([[0, 0], [100, 0], [100, 50], [0, 50]]);
  });
  it('turns an ellipse into four smooth points with the classic handle length', () => {
    const n = pathToNodes(shapePath('ellipse', 200, 100))!;
    expect(n.length).toBe(4);
    for (const p of n) expect(p.ix).toBeUndefined();
    const right = n.find((p) => Math.abs(p.x - 200) < 0.01)!;
    expect(Math.abs(right.hy)).toBeCloseTo(50 * 0.5523, 1);
  });
  it('gives a rounded rectangle eight points', () => {
    expect(pathToNodes(shapePath('rect', 100, 100, 20))!.length).toBe(8);
  });
  it('handles every built in shape without NaN', () => {
    for (const { kind } of SHAPE_KINDS) {
      const n = pathToNodes(shapePath(kind, 200, 120, 10));
      if (!n) continue;
      expect(penPath(n, true)).not.toContain('NaN');
    }
  });
});

describe('design check', () => {
  const page = (els: import('../src/doc/types').Element[], bg = '#FFFFFF') => ({
    meta: { id: 'd', title: 't', width: 1080, height: 1080, unit: 'px' as const, createdAt: 0, updatedAt: 0 },
    pageOrder: ['p'],
    pages: { p: { id: 'p', name: '', background: { type: 'solid' as const, color: bg }, elementIds: els.map((e) => e.id), notes: '', transition: 'none' as const, duration: 5 } },
    elements: Object.fromEntries(els.map((e) => [e.id, e])),
  });
  it('flags pale text on white and offers ink', () => {
    const t = makeText({ text: 'Hello', x: 100, y: 100, w: 300, h: 40, fontSize: 20, color: '#DDDDDD' });
    const issues = checkDesign(page([t]), () => undefined);
    const c = issues.find((i) => i.kind === 'contrast')!;
    expect(c).toBeTruthy();
    expect((c.fix as { patch: { color: string } }).patch.color).toBe('#0B0B0D');
  });
  it('reads text against the shape behind it', () => {
    const s = makeShape('rect', { x: 0, y: 0, w: 600, h: 600, fill: { type: 'solid', color: '#0B0B0D' } });
    const t = makeText({ text: 'Dark on dark', x: 100, y: 100, w: 300, h: 40, fontSize: 40, color: '#222222' });
    expect(checkDesign(page([s, t]), () => undefined).some((i) => i.kind === 'contrast')).toBe(true);
    const ok = makeText({ ...t, id: 't2', color: '#FFFFFF' });
    expect(checkDesign(page([s, ok]), () => undefined).some((i) => i.kind === 'contrast')).toBe(false);
  });
  it('finds things off the page and empty boxes', () => {
    const off = makeShape('rect', { x: 2000, y: 0, w: 100, h: 100 });
    const empty = makeText({ text: '  ', x: 10, y: 10, w: 100, h: 40 });
    const kinds = checkDesign(page([off, empty]), () => undefined).map((i) => i.kind);
    expect(kinds).toContain('offpage');
    expect(kinds).toContain('empty');
  });
});
