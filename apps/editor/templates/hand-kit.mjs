// Shared helpers for hand made vector art (my own file, not a vibe). Everything returns
// SVG markup strings built from wobbly paths so nothing looks ruler straight.
import { svg } from './kit.mjs';

export function R(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const f = (n) => Math.round(n * 10) / 10;
let UID = 0;
export const uid = (p = 'u') => `${p}${++UID}`;

// Catmull-Rom through points -> cubic bezier path
export function curve(pts, closed = false) {
  const n = pts.length;
  const g = (i) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const end = closed ? n : n - 1;
  for (let i = 0; i < end; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
export function jit(pts, amp, seed) {
  const r = R(seed);
  return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp]);
}
// add points along a polyline so jitter reads as wobble
export function dense(pts, step, closed = false) {
  const out = [];
  const m = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(1, Math.round(len / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}
export function blobPts(cx, cy, rx, ry, n = 10, amp = 0.08, seed = 1, rot = 0) {
  const r = R(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * amp;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return pts;
}
export const blob = (cx, cy, rx, ry, o = {}) => curve(blobPts(cx, cy, rx, ry, o.n ?? 10, o.amp ?? 0.08, o.seed ?? 1, o.rot ?? 0), true);
// fuzzy fur edge
export function fur(cx, cy, rx, ry, n = 28, depth = 0.09, seed = 1) {
  const r = R(seed);
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const k = i % 2 ? 1 - depth * (0.6 + r() * 0.8) : 1 + depth * 0.2 * r();
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return curve(pts, true);
}
export function star(cx, cy, r1, r2, n = 5, seed = 1, amp = 0.06, rot = -Math.PI / 2, smooth = false) {
  const r = R(seed);
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * Math.PI * 2;
    const rr = (i % 2 ? r2 : r1) * (1 + (r() - 0.5) * 2 * amp);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smooth ? curve(pts, true) : 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
}
export function rectD(x, y, w, h, o = {}) {
  const amp = o.amp ?? 2, step = o.step ?? 60;
  const pts = dense([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], step, true);
  return curve(jit(pts, amp, o.seed ?? 1), true);
}
export function lineD(x1, y1, x2, y2, o = {}) {
  const pts = dense([[x1, y1], [x2, y2]], o.step ?? 50);
  return curve(jit(pts, o.amp ?? 2, o.seed ?? 1), false);
}
export function polyD(pts, o = {}) {
  const d = dense(pts, o.step ?? 50, !!o.closed);
  return curve(o.amp === 0 ? d : jit(d, o.amp ?? 2, o.seed ?? 1), !!o.closed);
}
export function squig(x1, y1, x2, y2, waves = 4, amp = 10, seed = 1) {
  const pts = [];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  const r = R(seed);
  const n = waves * 2;
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = i === 0 || i === n ? 0 : i % 2 ? 1 : -1;
    const a = amp * (0.8 + r() * 0.4) * s;
    pts.push([x1 + (x2 - x1) * t + nx * a, y1 + (y2 - y1) * t + ny * a]);
  }
  return curve(pts, false);
}
export function spiral(cx, cy, r, turns = 3, seed = 1) {
  const pts = [];
  const rr = R(seed);
  const n = turns * 10;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * turns * Math.PI * 2;
    const k = r * t * (1 + (rr() - 0.5) * 0.06);
    pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]);
  }
  return curve(pts, false);
}
// zigzag hatching across a box, a scribbled fill
export function hatch(x, y, w, h, gap = 10, amp = 3, seed = 1, angle = 0) {
  const r = R(seed);
  const pts = [];
  let up = true;
  const diag = Math.hypot(w, h);
  for (let o = -diag / 2; o <= diag / 2; o += gap) {
    const a = [x + w / 2 + o, y - 6 + (r() - 0.5) * amp * 2];
    const b = [x + w / 2 + o + (r() - 0.5) * amp, y + h + 6 + (r() - 0.5) * amp * 2];
    if (up) pts.push(a, b); else pts.push(b, a);
    up = !up;
  }
  const rot = (p) => {
    const cx = x + w / 2, cy = y + h / 2, c = Math.cos(angle), s = Math.sin(angle);
    return [cx + (p[0] - cx) * c - (p[1] - cy) * s, cy + (p[0] - cx) * s + (p[1] - cy) * c];
  };
  return 'M' + pts.map(rot).map((p) => `${f(p[0])} ${f(p[1])}`).join('L');
}
// halftone dots: fn(x,y) -> 0..1 coverage
export function halftone(w, h, step, fn, angle = 0.4) {
  let d = '';
  const c = Math.cos(angle), s = Math.sin(angle);
  const diag = Math.hypot(w, h);
  for (let u = -diag; u < diag; u += step) {
    for (let v = -diag; v < diag; v += step) {
      const x = w / 2 + u * c - v * s, y = h / 2 + u * s + v * c;
      if (x < -step || y < -step || x > w + step || y > h + step) continue;
      const k = Math.max(0, Math.min(1, fn(x, y)));
      if (k < 0.04) continue;
      const r = (step / 2) * 1.05 * Math.sqrt(k);
      d += `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;
    }
  }
  return d;
}

// ---- svg string builders
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}="${v}"`).join(' ');
export const P = (d, o = {}) => `<path d="${d}" ${attrs(o)}/>`;
export const fl = (d, color, o = {}) => P(d, { fill: color, ...o });
export const sk = (d, color, w = 4, o = {}) => P(d, { fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...o });
export const both = (d, fill, color, w = 4, o = {}) => P(d, { fill, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...o });
export const circ = (cx, cy, r, fill, o = {}) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" ${attrs(o)}/>`;
export const g = (inner, o = {}) => `<g ${attrs(o)}>${inner}</g>`;
export const wrap = (w, h, inner, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;
// place an svg drawing: art(w, h, inner, x, y, element props)
export const art = (w, h, inner, x = 0, y = 0, p = {}, defs = '') => svg(wrap(w, h, inner, defs), x, y, w, h, p);

// rough edge filter (marker / ink bleed) and crayon grain filter; returns { id, def }
export function roughFilter(scale = 5, freq = 0.035, seed = 3) {
  const id = uid('rf');
  return { id, def: `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}"/></filter>` };
}
export function crayonFilter(seed = 5, hole = 0.5) {
  const id = uid('cf');
  return { id, def: `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed}" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="6" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + 7}" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 ${4.4 + hole * 2}" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>` };
}

// ---- faces and small doodles
export function face(cx, cy, s = 1, o = {}) {
  const c = o.color ?? '#111';
  const eye = o.eyes ?? 'dots';
  const mouth = o.mouth ?? 'smile';
  const gap = (o.gap ?? 26) * s;
  const ey = cy - (o.eyeLift ?? 0) * s;
  let out = '';
  const E = (x, y) => {
    if (eye === 'dots') return circ(x, y, 6 * s, c);
    if (eye === 'round') return circ(x, y, 13 * s, '#fff', { stroke: c, 'stroke-width': 4 * s }) + circ(x + 2 * s, y + 2 * s, 6 * s, c);
    if (eye === 'sleepy') return sk(`M${f(x - 10 * s)} ${f(y)}Q${f(x)} ${f(y + 10 * s)} ${f(x + 10 * s)} ${f(y)}`, c, 4 * s);
    if (eye === 'happy') return sk(`M${f(x - 10 * s)} ${f(y + 4 * s)}Q${f(x)} ${f(y - 10 * s)} ${f(x + 10 * s)} ${f(y + 4 * s)}`, c, 4 * s);
    if (eye === 'angry') return circ(x, y + 2 * s, 5 * s, c);
    if (eye === 'x') return sk(`M${f(x - 7 * s)} ${f(y - 7 * s)}L${f(x + 7 * s)} ${f(y + 7 * s)}M${f(x + 7 * s)} ${f(y - 7 * s)}L${f(x - 7 * s)} ${f(y + 7 * s)}`, c, 4 * s);
    return circ(x, y, 6 * s, c);
  };
  out += E(cx - gap, ey) + E(cx + gap, ey);
  if (eye === 'angry') out += sk(`M${f(cx - gap - 12 * s)} ${f(ey - 12 * s)}L${f(cx - gap + 10 * s)} ${f(ey - 5 * s)}M${f(cx + gap + 12 * s)} ${f(ey - 12 * s)}L${f(cx + gap - 10 * s)} ${f(ey - 5 * s)}`, c, 5 * s);
  const my = cy + (o.mouthDrop ?? 22) * s;
  if (mouth === 'smile') out += sk(`M${f(cx - 14 * s)} ${f(my)}Q${f(cx)} ${f(my + 16 * s)} ${f(cx + 14 * s)} ${f(my)}`, c, 4 * s);
  else if (mouth === 'o') out += `<ellipse cx="${f(cx)}" cy="${f(my + 4 * s)}" rx="${f(8 * s)}" ry="${f(10 * s)}" fill="${c}"/>`;
  else if (mouth === 'flat') out += sk(`M${f(cx - 10 * s)} ${f(my + 4 * s)}L${f(cx + 10 * s)} ${f(my + 3 * s)}`, c, 4 * s);
  else if (mouth === 'grin') out += fl(`M${f(cx - 22 * s)} ${f(my - 4 * s)}Q${f(cx)} ${f(my + 34 * s)} ${f(cx + 22 * s)} ${f(my - 4 * s)}Z`, c) + fl(`M${f(cx - 11 * s)} ${f(my + 10 * s)}Q${f(cx)} ${f(my + 2 * s)} ${f(cx + 11 * s)} ${f(my + 10 * s)}Q${f(cx)} ${f(my + 20 * s)} ${f(cx - 11 * s)} ${f(my + 10 * s)}Z`, o.tongue ?? '#F26');
  else if (mouth === 'cat') out += sk(`M${f(cx - 16 * s)} ${f(my)}Q${f(cx - 8 * s)} ${f(my + 12 * s)} ${f(cx)} ${f(my)}Q${f(cx + 8 * s)} ${f(my + 12 * s)} ${f(cx + 16 * s)} ${f(my)}`, c, 4 * s);
  else if (mouth === 'tongue') out += sk(`M${f(cx - 14 * s)} ${f(my)}Q${f(cx)} ${f(my + 14 * s)} ${f(cx + 14 * s)} ${f(my)}`, c, 4 * s) + fl(`M${f(cx - 5 * s)} ${f(my + 8 * s)}Q${f(cx)} ${f(my + 26 * s)} ${f(cx + 6 * s)} ${f(my + 8 * s)}Z`, o.tongue ?? '#F26');
  if (o.cheeks) out += circ(cx - gap - 14 * s, cy + 14 * s, 9 * s, o.cheeks, { opacity: 0.7 }) + circ(cx + gap + 14 * s, cy + 14 * s, 9 * s, o.cheeks, { opacity: 0.7 });
  return out;
}
export function sparkle(cx, cy, r, color, w = 4) {
  return sk(`M${f(cx)} ${f(cy - r)}L${f(cx)} ${f(cy + r)}M${f(cx - r)} ${f(cy)}L${f(cx + r)} ${f(cy)}`, color, w) + sk(`M${f(cx - r * 0.55)} ${f(cy - r * 0.55)}L${f(cx + r * 0.55)} ${f(cy + r * 0.55)}M${f(cx + r * 0.55)} ${f(cy - r * 0.55)}L${f(cx - r * 0.55)} ${f(cy + r * 0.55)}`, color, w * 0.8);
}
export function asterisk(cx, cy, r, n = 6, seed = 1) {
  const rr = R(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI + (rr() - 0.5) * 0.12;
    d += `M${f(cx - Math.cos(a) * r)} ${f(cy - Math.sin(a) * r)}L${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}`;
  }
  return d;
}
export function flowerD(cx, cy, r, petals = 6, seed = 1, depth = 0.55) {
  const rr = R(seed);
  const pts = [];
  for (let i = 0; i < petals * 2; i++) {
    const a = (i / (petals * 2)) * Math.PI * 2 + 0.3;
    const k = i % 2 ? depth * (0.9 + rr() * 0.2) : 1 + (rr() - 0.5) * 0.15;
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return curve(pts, true);
}
export function leafD(x, y, len, wid, angle = 0, seed = 1) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const T = (px, py) => [x + px * c - py * s, y + px * s + py * c];
  const r = R(seed);
  const w = wid * (0.9 + r() * 0.2);
  const pts = [T(0, 0), T(len * 0.3, -w * 0.9), T(len * 0.75, -w * 0.6), T(len, 0), T(len * 0.75, w * 0.6), T(len * 0.3, w * 0.9)];
  return curve(pts, true);
}
export function heartD(cx, cy, s) {
  return `M${f(cx)} ${f(cy + s * 0.9)}C${f(cx - s * 1.9)} ${f(cy - s * 0.2)} ${f(cx - s * 0.9)} ${f(cy - s * 1.4)} ${f(cx)} ${f(cy - s * 0.5)}C${f(cx + s * 0.9)} ${f(cy - s * 1.4)} ${f(cx + s * 1.9)} ${f(cy - s * 0.2)} ${f(cx)} ${f(cy + s * 0.9)}Z`;
}
