import type { PenNode, ShapeElement, ShapeKind } from '../doc/types';

// Every shape is a path inside a w x h box, so it stretches like Canva's shapes
// and can double as an image mask.

const f = (n: number) => Math.round(n * 100) / 100;

function poly(points: [number, number][]) {
  return 'M' + points.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z';
}

function regular(n: number, w: number, h: number, rot = -90) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    pts.push([w / 2 + (w / 2) * Math.cos(a), h / 2 + (h / 2) * Math.sin(a)]);
  }
  return pts;
}

function starPoints(n: number, w: number, h: number, inner: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 1 : inner;
    const a = ((-90 + (180 / n) * i) * Math.PI) / 180;
    pts.push([w / 2 + (w / 2) * r * Math.cos(a), h / 2 + (h / 2) * r * Math.sin(a)]);
  }
  return pts;
}

// Rounded polygon: corners eased with quadratic curves of radius r.
function roundedPoly(points: [number, number][], r: number) {
  if (r <= 0) return poly(points);
  const n = points.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(v1[0], v1[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = [p1[0] + (v1[0] / l1) * rr, p1[1] + (v1[1] / l1) * rr];
    const b = [p1[0] + (v2[0] / l2) * rr, p1[1] + (v2[1] / l2) * rr];
    d += `${i === 0 ? 'M' : 'L'}${f(a[0])} ${f(a[1])} Q${f(p1[0])} ${f(p1[1])} ${f(b[0])} ${f(b[1])} `;
  }
  return d + 'Z';
}

function roundRect(w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  if (!rr) return `M0 0 H${f(w)} V${f(h)} H0 Z`;
  return `M${f(rr)} 0 H${f(w - rr)} A${f(rr)} ${f(rr)} 0 0 1 ${f(w)} ${f(rr)} V${f(h - rr)} A${f(rr)} ${f(rr)} 0 0 1 ${f(w - rr)} ${f(h)} H${f(rr)} A${f(rr)} ${f(rr)} 0 0 1 0 ${f(h - rr)} V${f(rr)} A${f(rr)} ${f(rr)} 0 0 1 ${f(rr)} 0 Z`;
}

function ellipse(w: number, h: number) {
  const rx = w / 2;
  const ry = h / 2;
  return `M0 ${f(ry)} A${f(rx)} ${f(ry)} 0 1 0 ${f(w)} ${f(ry)} A${f(rx)} ${f(ry)} 0 1 0 0 ${f(ry)} Z`;
}

export function shapePath(kind: ShapeKind, w: number, h: number, radius = 0): string {
  switch (kind) {
    case 'rect':
      return roundRect(w, h, radius);
    case 'pill':
      return roundRect(w, h, Math.min(w, h) / 2);
    case 'squircle': {
      // Superellipse-ish: four cubic curves with long handles.
      const k = 0.92;
      return `M${f(w / 2)} 0 C${f(w * k)} 0 ${f(w)} ${f(h * (1 - k))} ${f(w)} ${f(h / 2)} C${f(w)} ${f(h * k)} ${f(w * k)} ${f(h)} ${f(w / 2)} ${f(h)} C${f(w * (1 - k))} ${f(h)} 0 ${f(h * k)} 0 ${f(h / 2)} C0 ${f(h * (1 - k))} ${f(w * (1 - k))} 0 ${f(w / 2)} 0 Z`;
    }
    case 'ellipse':
      return ellipse(w, h);
    case 'halfcircle':
      return `M0 ${f(h)} A${f(w / 2)} ${f(h)} 0 0 1 ${f(w)} ${f(h)} Z`;
    case 'triangle':
      return roundedPoly([[w / 2, 0], [w, h], [0, h]], radius);
    case 'diamond':
      return roundedPoly([[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]], radius);
    case 'pentagon':
      return roundedPoly(regular(5, w, h), radius);
    case 'hexagon':
      return roundedPoly(regular(6, w, h, 0), radius);
    case 'octagon':
      return roundedPoly(regular(8, w, h, 22.5), radius);
    case 'star':
      return roundedPoly(starPoints(5, w, h, 0.45), radius);
    case 'star4':
      return roundedPoly(starPoints(4, w, h, 0.32), radius);
    case 'burst':
      return roundedPoly(starPoints(14, w, h, 0.78), radius);
    case 'arrow':
      return roundedPoly(
        [[0, h * 0.3], [w * 0.62, h * 0.3], [w * 0.62, 0], [w, h / 2], [w * 0.62, h], [w * 0.62, h * 0.7], [0, h * 0.7]],
        radius,
      );
    case 'chevron':
      return roundedPoly([[0, 0], [w * 0.7, 0], [w, h / 2], [w * 0.7, h], [0, h], [w * 0.3, h / 2]], radius);
    case 'cross': {
      const t = 0.32;
      return roundedPoly(
        [
          [w * t, 0], [w * (1 - t), 0], [w * (1 - t), h * t], [w, h * t], [w, h * (1 - t)], [w * (1 - t), h * (1 - t)],
          [w * (1 - t), h], [w * t, h], [w * t, h * (1 - t)], [0, h * (1 - t)], [0, h * t], [w * t, h * t],
        ],
        radius,
      );
    }
    case 'heart':
      return `M${f(w / 2)} ${f(h * 0.95)} C${f(w * 0.12)} ${f(h * 0.68)} ${f(-w * 0.02)} ${f(h * 0.42)} ${f(w * 0.06)} ${f(h * 0.22)} C${f(w * 0.15)} ${f(h * 0.02)} ${f(w * 0.42)} ${f(-h * 0.01)} ${f(w / 2)} ${f(h * 0.2)} C${f(w * 0.58)} ${f(-h * 0.01)} ${f(w * 0.85)} ${f(h * 0.02)} ${f(w * 0.94)} ${f(h * 0.22)} C${f(w * 1.02)} ${f(h * 0.42)} ${f(w * 0.88)} ${f(h * 0.68)} ${f(w / 2)} ${f(h * 0.95)} Z`;
    case 'speech': {
      const r = Math.min(radius || Math.min(w, h) * 0.18, w / 4, h / 4);
      const bh = h * 0.8;
      return `M${f(r)} 0 H${f(w - r)} Q${f(w)} 0 ${f(w)} ${f(r)} V${f(bh - r)} Q${f(w)} ${f(bh)} ${f(w - r)} ${f(bh)} H${f(w * 0.36)} L${f(w * 0.18)} ${f(h)} L${f(w * 0.22)} ${f(bh)} H${f(r)} Q0 ${f(bh)} 0 ${f(bh - r)} V${f(r)} Q0 0 ${f(r)} 0 Z`;
    }
    case 'arch':
      return `M0 ${f(h)} V${f(w / 2)} A${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(w)} ${f(w / 2)} V${f(h)} Z`;
    case 'ticket': {
      const n = Math.min(w, h) * 0.12;
      return `M0 0 H${f(w)} V${f(h / 2 - n)} A${f(n)} ${f(n)} 0 0 0 ${f(w)} ${f(h / 2 + n)} V${f(h)} H0 V${f(h / 2 + n)} A${f(n)} ${f(n)} 0 0 0 0 ${f(h / 2 - n)} Z`;
    }
    case 'flower': {
      // Six round petals around the centre.
      const petals = 6;
      let d = '';
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < petals; i++) {
        const a1 = ((i / petals) * 360 - 90) * (Math.PI / 180);
        const a2 = (((i + 1) / petals) * 360 - 90) * (Math.PI / 180);
        const p1 = [cx + (w / 2) * 0.62 * Math.cos(a1), cy + (h / 2) * 0.62 * Math.sin(a1)];
        const p2 = [cx + (w / 2) * 0.62 * Math.cos(a2), cy + (h / 2) * 0.62 * Math.sin(a2)];
        const am = (a1 + a2) / 2;
        const c1 = [cx + (w / 2) * 1.18 * Math.cos(am - 0.35), cy + (h / 2) * 1.18 * Math.sin(am - 0.35)];
        const c2 = [cx + (w / 2) * 1.18 * Math.cos(am + 0.35), cy + (h / 2) * 1.18 * Math.sin(am + 0.35)];
        d += `${i === 0 ? `M${f(p1[0])} ${f(p1[1])}` : ''} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
      }
      return d + ' Z';
    }
    case 'cloud':
      return `M${f(w * 0.25)} ${f(h * 0.9)} C${f(w * 0.05)} ${f(h * 0.9)} ${f(-w * 0.02)} ${f(h * 0.6)} ${f(w * 0.14)} ${f(h * 0.5)} C${f(w * 0.08)} ${f(h * 0.22)} ${f(w * 0.36)} ${f(h * 0.08)} ${f(w * 0.48)} ${f(h * 0.24)} C${f(w * 0.56)} ${f(-h * 0.04)} ${f(w * 0.92)} ${f(h * 0.06)} ${f(w * 0.84)} ${f(h * 0.4)} C${f(w * 1.04)} ${f(h * 0.46)} ${f(w * 1.02)} ${f(h * 0.9)} ${f(w * 0.78)} ${f(h * 0.9)} Z`;
    case 'blob':
      return `M${f(w * 0.52)} ${f(h * 0.02)} C${f(w * 0.78)} ${f(h * 0.0)} ${f(w * 0.98)} ${f(h * 0.2)} ${f(w * 0.97)} ${f(h * 0.48)} C${f(w * 0.96)} ${f(h * 0.76)} ${f(w * 0.74)} ${f(h * 0.99)} ${f(w * 0.46)} ${f(h * 0.97)} C${f(w * 0.2)} ${f(h * 0.95)} ${f(w * 0.01)} ${f(h * 0.74)} ${f(w * 0.03)} ${f(h * 0.46)} C${f(w * 0.05)} ${f(h * 0.2)} ${f(w * 0.26)} ${f(h * 0.04)} ${f(w * 0.52)} ${f(h * 0.02)} Z`;
    default:
      return roundRect(w, h, radius);
  }
}

// Scale and move a path. Relative commands only scale; arcs keep their flags.
export function transformPath(d: string, sx: number, sy: number, dx = 0, dy = 0): string {
  let out = '';
  for (const [, cmd, args] of d.matchAll(/([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g)) {
    const n = (args.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    const abs = cmd === cmd.toUpperCase();
    const ox = abs ? dx : 0;
    const oy = abs ? dy : 0;
    const k = cmd.toUpperCase();
    let m: number[];
    if (k === 'Z') m = [];
    else if (k === 'H') m = n.map((v) => v * sx + ox);
    else if (k === 'V') m = n.map((v) => v * sy + oy);
    else if (k === 'A')
      m = n.map((v, i) => {
        const j = i % 7;
        if (j === 0) return Math.abs(v * sx);
        if (j === 1) return Math.abs(v * sy);
        if (j === 5) return v * sx + ox;
        if (j === 6) return v * sy + oy;
        return v;
      });
    else m = n.map((v, i) => (i % 2 === 0 ? v * sx + ox : v * sy + oy));
    out += cmd + m.map(f).join(' ') + ' ';
  }
  return out.trim();
}

// The outline of a shape element at a given size.
export function elementPath(el: ShapeElement, w = el.w, h = el.h): string {
  if (el.shape === 'path' && el.path) return transformPath(el.path, w / (el.w0 || w), h / (el.h0 || h));
  return shapePath(el.shape, w, h, el.radius);
}

// Pen anchors to a path. Segments with no handles on either end stay straight.
export function penPath(nodes: PenNode[], closed: boolean): string {
  if (!nodes.length) return '';
  let d = `M${f(nodes[0].x)} ${f(nodes[0].y)}`;
  const seg = (a: PenNode, b: PenNode) => {
    if (!a.hx && !a.hy && !b.hx && !b.hy) return ` L${f(b.x)} ${f(b.y)}`;
    return ` C${f(a.x + a.hx)} ${f(a.y + a.hy)} ${f(b.x - b.hx)} ${f(b.y - b.hy)} ${f(b.x)} ${f(b.y)}`;
  };
  for (let i = 1; i < nodes.length; i++) d += seg(nodes[i - 1], nodes[i]);
  if (closed && nodes.length > 2) d += seg(nodes[nodes.length - 1], nodes[0]) + ' Z';
  return d;
}

export const SHAPE_KINDS: { kind: ShapeKind; label: string }[] = [
  { kind: 'rect', label: 'Square' },
  { kind: 'pill', label: 'Pill' },
  { kind: 'squircle', label: 'Squircle' },
  { kind: 'ellipse', label: 'Circle' },
  { kind: 'halfcircle', label: 'Half circle' },
  { kind: 'arch', label: 'Arch' },
  { kind: 'triangle', label: 'Triangle' },
  { kind: 'diamond', label: 'Diamond' },
  { kind: 'pentagon', label: 'Pentagon' },
  { kind: 'hexagon', label: 'Hexagon' },
  { kind: 'octagon', label: 'Octagon' },
  { kind: 'star', label: 'Star' },
  { kind: 'star4', label: 'Sparkle' },
  { kind: 'burst', label: 'Burst' },
  { kind: 'heart', label: 'Heart' },
  { kind: 'arrow', label: 'Arrow' },
  { kind: 'chevron', label: 'Chevron' },
  { kind: 'cross', label: 'Plus' },
  { kind: 'speech', label: 'Speech bubble' },
  { kind: 'ticket', label: 'Ticket' },
  { kind: 'flower', label: 'Flower' },
  { kind: 'cloud', label: 'Cloud' },
  { kind: 'blob', label: 'Blob' },
];
