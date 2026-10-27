import { describe, expect, it } from 'vitest';
import { collectTargets, snapBox } from '../src/canvas/snap';
import { shapePath, SHAPE_KINDS } from '../src/render/shapes';
import { animState } from '../src/render/animate';
import { charStyles } from '../src/text/layout';
import { aabb, rotatePoint, snapAngle } from '../src/lib/geom';
import { makeShape, makeText } from '../src/doc/factory';

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
