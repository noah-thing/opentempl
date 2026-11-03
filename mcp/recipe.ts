import type {
  Element,
  ElementType,
  Fill,
  PageTransition,
  ShapeKind,
  TextElement,
} from '../apps/editor/src/doc/types';

// A draft is a design written as steps: where it starts (a template, a format or a
// size) and the edits made since. The MCP server and the editor both replay the
// steps with this file, so the design an assistant describes is the one that opens.
// Only plain data in here: no DOM, no editor runtime, nothing that needs a browser.

export interface Draft {
  v: 1;
  title?: string;
  start: Start;
  ops: Op[];
}

export type Start = { template: string } | { format: string } | { width: number; height: number };

export interface WebImage {
  url: string;
  credit?: string;
  download?: string; // Unsplash download_location, reported when the design is opened
}

export interface DraftPage {
  id: string;
  name: string;
  background: Fill;
  notes: string;
  transition: PageTransition;
  duration: number;
  elements: Element[];
}

export interface Design {
  title: string;
  width: number;
  height: number;
  formatId?: string;
  pages: DraftPage[];
  images: Record<string, WebImage>; // asset id "web:N" -> where the editor fetches it
  cover: string[]; // image elements whose crop is set to fill the frame once the photo's size is known
  fit: Record<string, Fit>; // text that changed: shrink to its box, or grow the box
  orig: Record<string, string>; // the words a text box held before set_text: they mark the room it has
  resized: Record<string, { asked: number; got: number }>; // text set smaller than asked so it fits
  tpl: string[]; // text and pages still holding the template's own words or notes
  seq: number;
}

export type Fit = 'shrink' | 'grow' | 'none';

type Props = Record<string, unknown>;

export type Op =
  | { op: 'set_text'; id: string; text: string; fit?: Fit }
  | { op: 'style'; id?: string; ids?: string[]; props: Props }
  | { op: 'set_image'; id: string; url?: string; library?: string; photo?: string; credit?: string; download?: string; fit?: 'cover' | 'contain' | 'tile' }
  | { op: 'add'; page: string; element: Props; below?: string }
  | { op: 'duplicate'; id: string; dx?: number; dy?: number; props?: Props }
  | { op: 'remove'; id?: string; ids?: string[] }
  | { op: 'recolor'; from?: string; to?: string; map?: Record<string, string> }
  | { op: 'align'; ids: string[]; to: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'; relative?: string }
  | { op: 'distribute'; ids: string[]; axis: 'horizontal' | 'vertical'; gap?: number }
  | { op: 'page'; id: string; background?: unknown; notes?: string; name?: string; transition?: string; duration?: number; hidden?: boolean }
  | { op: 'add_page'; copy?: string; after?: string; background?: unknown; name?: string }
  | { op: 'move_page'; id: string; to: number }
  | { op: 'arrange'; id: string; to: 'front' | 'back' | 'forward' | 'backward' }
  | { op: 'title'; title: string };

export class DraftError extends Error {}

// A template as stored in the packs (apps/editor/src/templates/index.ts has the same shape).
export interface TemplateDef {
  id: string;
  name: string;
  width: number;
  height: number;
  formatId?: string;
  pages: { background: Fill; elements: Element[]; name?: string; transition?: PageTransition; notes?: string }[];
}

export interface FormatInfo {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface Sources {
  template?: TemplateDef;
  format?: FormatInfo;
  fonts?: Set<string>; // known families; unknown ones are refused when given
  // How tall and wide text sets. The editor passes real measurements; without it they are estimated.
  measure?: (el: TextElement) => { height: number; width: number };
}

// ---------------------------------------------------------------- values

const SHAPES: ShapeKind[] = ['rect', 'ellipse', 'triangle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'star', 'star4', 'burst', 'heart', 'arrow', 'chevron', 'cross', 'speech', 'arch', 'pill', 'blob', 'flower', 'squircle', 'halfcircle', 'ticket', 'cloud', 'path'];
const PATTERNS = ['dots', 'grid', 'stripes', 'diagonal', 'checker', 'waves', 'crosses', 'pixels'];
const EFFECTS = ['none', 'shadow', 'lift', 'hollow', 'splice', 'outline', 'echo', 'glitch', 'neon', 'highlight'];
const ANIMS = ['none', 'fade', 'rise', 'drop', 'pop', 'wipe', 'pan', 'blur', 'typewriter', 'stomp', 'tumble'];
const TRANSITIONS = ['none', 'fade', 'slide', 'zoom', 'flip', 'circle'];
const CAPS = ['none', 'arrow', 'triangle', 'circle', 'square', 'bar', 'diamond'];
const BLENDS = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
const CHARTS = ['bar', 'column', 'line', 'area', 'pie', 'donut', 'progress'];
const PRESETS = ['none', 'warm', 'cool', 'mono', 'noir', 'fade', 'vivid', 'film', 'vintage', 'dream'];

// Names people use for shapes the editor calls something else.
const SHAPE_ALIAS: Record<string, ShapeKind> = { circle: 'ellipse', oval: 'ellipse', square: 'rect', rectangle: 'rect', rounded: 'squircle', polygon: 'hexagon', badge: 'burst', bubble: 'speech' };

export const ENUMS = { SHAPES, PATTERNS, EFFECTS, ANIMS, TRANSITIONS, CAPS, BLENDS, CHARTS };

const COLOR = /^(#[0-9a-f]{3,8}|transparent|[a-z]{3,20}|(rgb|hsl)a?\([\d\s.,%/]+\))$/i;
const PATH = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s+\-eE]+$/;

function fail(msg: string): never {
  throw new DraftError(msg);
}

const num = (v: unknown, what: string, min = -1e6, max = 1e6) => {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${what} must be a number`);
  return Math.min(max, Math.max(min, v));
};
const bool = (v: unknown, what: string) => (typeof v === 'boolean' ? v : fail(`${what} must be true or false`));
const str = (v: unknown, what: string, max = 4000) => {
  if (typeof v !== 'string') fail(`${what} must be text`);
  if (v.length > max) fail(`${what} is longer than ${max} characters`);
  return v;
};
const oneOf = <T extends string>(v: unknown, list: readonly T[], what: string): T =>
  list.includes(v as T) ? (v as T) : fail(`${what} must be one of: ${list.join(', ')}`);

export function color(v: unknown, what = 'colour'): string {
  if (typeof v !== 'string' || !COLOR.test(v.trim())) fail(`${what} must be a colour like #1B4DB1 (got ${JSON.stringify(v)})`);
  return v.trim();
}

// Colours compare by value: "#ABC", "#aabbcc" and "#AABBCCFF" are the same.
export function hexKey(c: string): string {
  let h = c.trim().toLowerCase();
  if (!/^#[0-9a-f]+$/.test(h)) return h;
  if (h.length === 4 || h.length === 5) h = '#' + [...h.slice(1)].map((x) => x + x).join('');
  if (h.length === 9 && h.endsWith('ff')) h = h.slice(0, 7);
  return h;
}

function url(v: unknown, what: string): string {
  const s = str(v, what, 2000);
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    fail(`${what} must be a full https:// address`);
  }
  if (u.protocol !== 'https:') fail(`${what} must use https`);
  return u.toString();
}

function link(v: unknown): string {
  const s = str(v, 'link', 2000);
  try {
    const u = new URL(s);
    if (['https:', 'http:', 'mailto:'].includes(u.protocol)) return u.toString();
  } catch {
    /* falls through */
  }
  fail('link must be an http, https or mailto address');
}

function stops(v: unknown, what: string) {
  if (!Array.isArray(v) || v.length < 2 || v.length > 12) fail(`${what} needs 2 to 12 colour stops`);
  return v.map((s, i) => {
    if (typeof s === 'string') return { offset: i / (v.length - 1), color: color(s, `${what} stop`) };
    const o = s as Props;
    return { offset: num(o.offset ?? i / (v.length - 1), `${what} offset`, 0, 1), color: color(o.color, `${what} stop`) };
  });
}

// A fill can be written short: "#F4C20D", or {"gradient": ["#f00", "#00f"], "angle": 90}.
export function fill(v: unknown, what = 'fill'): Fill {
  if (typeof v === 'string') return { type: 'solid', color: color(v, what) };
  if (!v || typeof v !== 'object') fail(`${what} must be a colour or a fill object`);
  const o = v as Props;
  if (o.gradient) return { type: 'linear', angle: num(o.angle ?? 180, `${what} angle`, -360, 360), stops: stops(o.gradient, what) };
  if (o.radial) return { type: 'radial', stops: stops(o.radial, what) };
  if (o.pattern)
    return {
      type: 'pattern',
      kind: oneOf(o.pattern, PATTERNS, `${what} pattern`) as never,
      color: color(o.color ?? '#0B0B0D', `${what} pattern colour`),
      background: color(o.background ?? '#FFFFFF', `${what} pattern background`),
      scale: num(o.scale ?? 1, `${what} scale`, 0.1, 10),
    };
  switch (o.type) {
    case 'solid':
      return { type: 'solid', color: color(o.color, what) };
    case 'linear':
      return { type: 'linear', angle: num(o.angle ?? 180, `${what} angle`, -360, 360), stops: stops(o.stops, what) };
    case 'radial':
      return { type: 'radial', stops: stops(o.stops, what) };
    case 'pattern':
      return fill({ ...o, pattern: o.kind }, what);
  }
  fail(`${what}: use a colour, {"gradient": [...], "angle": n}, {"radial": [...]} or {"pattern": "dots", "color", "background"}`);
}

function stroke(v: unknown, what = 'stroke') {
  if (v === null || v === false) return null;
  const o = v as Props;
  if (!o || typeof o !== 'object') fail(`${what} must be {"color", "width", "dash"} or null`);
  return { color: color(o.color ?? '#0B0B0D', `${what} colour`), width: num(o.width ?? 4, `${what} width`, 0, 400), dash: oneOf(o.dash ?? 'solid', ['solid', 'dash', 'dot'] as const, `${what} dash`) };
}

function shadow(v: unknown) {
  if (v === null || v === false) return null;
  const o = v as Props;
  if (!o || typeof o !== 'object') fail('shadow must be {"x", "y", "blur", "color"} or null');
  return { x: num(o.x ?? 0, 'shadow x', -500, 500), y: num(o.y ?? 8, 'shadow y', -500, 500), blur: num(o.blur ?? 24, 'shadow blur', 0, 500), color: color(o.color ?? 'rgba(0,0,0,0.3)', 'shadow colour') };
}

// ---------------------------------------------------------------- element fields

type Check = (v: unknown, el: Element, src: Sources) => unknown;

const ANY: Record<string, Check> = {
  x: (v) => num(v, 'x'),
  y: (v) => num(v, 'y'),
  w: (v) => num(v, 'w', 1, 40000),
  h: (v) => num(v, 'h', 1, 40000),
  rotation: (v) => num(v, 'rotation', -3600, 3600),
  opacity: (v) => num(v, 'opacity', 0, 1),
  hidden: (v) => bool(v, 'hidden'),
  flipX: (v) => bool(v, 'flipX'),
  flipY: (v) => bool(v, 'flipY'),
  link: (v) => (v === null || v === '' ? undefined : link(v)),
  alt: (v) => str(v, 'alt', 500),
  name: (v) => str(v, 'name', 120),
  shadow: (v) => shadow(v),
  blur: (v) => num(v, 'blur', 0, 200),
  blend: (v) => oneOf(v, BLENDS, 'blend'),
  locked: (v) => bool(v, 'locked'),
  anim: (v) => {
    if (v === null || v === 'none') return null;
    const o = (typeof v === 'string' ? { kind: v } : v) as Props;
    return { kind: oneOf(o.kind, ANIMS, 'anim kind'), delay: num(o.delay ?? 0, 'anim delay', 0, 60000), duration: num(o.duration ?? 600, 'anim duration', 50, 60000) };
  },
};

const font = (v: unknown, _el: Element, src: Sources) => {
  const f = str(v, 'fontFamily', 80);
  if (src.fonts && !src.fonts.has(f)) fail(`fontFamily "${f}" is not in the Google Fonts list; search_fonts finds the exact name`);
  return f;
};

const runs = (v: unknown) => {
  if (!Array.isArray(v)) fail('runs must be a list');
  return v.slice(0, 200).map((r: Props) => {
    const out: Props = { start: num(r.start, 'run start', 0, 1e5), end: num(r.end, 'run end', 0, 1e5) };
    if (r.fontWeight !== undefined) out.fontWeight = num(r.fontWeight, 'run fontWeight', 100, 1000);
    for (const k of ['italic', 'underline', 'strike']) if (r[k] !== undefined) out[k] = bool(r[k], `run ${k}`);
    if (r.color !== undefined) out.color = color(r.color, 'run colour');
    return out;
  });
};

const FIELDS: Partial<Record<ElementType, Record<string, Check>>> = {
  text: {
    text: (v) => str(v, 'text'),
    fontFamily: font,
    fontSize: (v) => num(v, 'fontSize', 4, 3000),
    fontWeight: (v) => num(v, 'fontWeight', 100, 1000),
    italic: (v) => bool(v, 'italic'),
    underline: (v) => bool(v, 'underline'),
    strike: (v) => bool(v, 'strike'),
    color: (v) => color(v),
    gradient: (v) => (v === null ? null : fill(v, 'gradient')),
    align: (v) => oneOf(v, ['left', 'center', 'right', 'justify'] as const, 'align'),
    lineHeight: (v) => num(v, 'lineHeight', 0.5, 5),
    letterSpacing: (v) => num(v, 'letterSpacing', -500, 3000),
    uppercase: (v) => bool(v, 'uppercase'),
    list: (v) => oneOf(v, ['none', 'bullet', 'number'] as const, 'list'),
    effect: (v, el) => {
      const cur = (el as TextElement).effect ?? { kind: 'none', color: '#0B0B0D', amount: 50, offset: 50, direction: 45 };
      const o = (typeof v === 'string' ? { kind: v } : v) as Props;
      return {
        kind: oneOf(o.kind ?? cur.kind, EFFECTS, 'effect kind'),
        color: color(o.color ?? cur.color, 'effect colour'),
        amount: num(o.amount ?? cur.amount, 'effect amount', 0, 100),
        offset: num(o.offset ?? cur.offset, 'effect offset', 0, 100),
        direction: num(o.direction ?? cur.direction, 'effect direction', -360, 360),
      };
    },
    curve: (v) => num(v, 'curve', -100, 100),
    role: (v) => oneOf(v, ['heading', 'subheading', 'body'] as const, 'role'),
    runs,
    valign: (v) => (v === 'middle' ? 'middle' : undefined),
  },
  shape: {
    shape: (v) => oneOf(SHAPE_ALIAS[v as string] ?? v, SHAPES, 'shape'),
    fill: (v) => fill(v),
    stroke: (v) => stroke(v),
    radius: (v) => num(v, 'radius', 0, 20000),
    path: (v) => {
      const d = str(v, 'path', 20000);
      if (!PATH.test(d)) fail('path must be SVG path data (M, L, C, Q, A, Z and numbers)');
      return d;
    },
    w0: (v) => num(v, 'w0', 0.01, 40000),
    h0: (v) => num(v, 'h0', 0.01, 40000),
  },
  line: {
    color: (v) => color(v),
    width: (v) => num(v, 'width', 0.5, 400),
    dash: (v) => oneOf(v, ['solid', 'dash', 'dot'] as const, 'dash'),
    start: (v) => oneOf(v, CAPS, 'start'),
    end: (v) => oneOf(v, CAPS, 'end'),
    curve: (v) => num(v, 'curve', -100, 100),
  },
  image: {
    crop: (v) => {
      const o = v as Props;
      return { x: num(o?.x, 'crop x', 0, 1), y: num(o?.y, 'crop y', 0, 1), w: num(o?.w, 'crop w', 0.01, 1), h: num(o?.h, 'crop h', 0.01, 1) };
    },
    filters: (v, el) => {
      const cur = el.type === 'image' ? el.filters : undefined;
      const o = v as Props;
      if (!o || typeof o !== 'object') fail('filters must be an object');
      const out: Props = { ...(cur ?? {}) };
      for (const k of ['brightness', 'contrast', 'saturation', 'temperature', 'tint']) if (o[k] !== undefined) out[k] = num(o[k], k, -100, 100);
      for (const k of ['blur', 'vignette', 'grain']) if (o[k] !== undefined) out[k] = num(o[k], k, 0, 100);
      if (o.preset !== undefined) out.preset = oneOf(o.preset, PRESETS, 'preset');
      if (o.duotone !== undefined) out.duotone = o.duotone === null ? null : (o.duotone as unknown[]).slice(0, 2).map((c) => color(c, 'duotone'));
      return out;
    },
    radius: (v) => num(v, 'radius', 0, 20000),
    mask: (v) => (v === null ? null : oneOf(SHAPE_ALIAS[v as string] ?? v, SHAPES, 'mask')),
    border: (v) => stroke(v, 'border'),
  },
  svg: {
    svg: (v) => {
      const s = str(v, 'svg', 120000);
      if (!/^\s*<svg[\s>]/i.test(s)) fail('svg must be one <svg> element');
      return s;
    },
    colors: (v, el) => {
      const o = v as Props;
      if (!o || typeof o !== 'object') fail('colors must map original colours to new ones');
      const out: Props = { ...(el.type === 'svg' ? el.colors : {}) };
      for (const [k, c] of Object.entries(o)) out[k] = color(c, `colors.${k}`);
      return out;
    },
  },
  qr: {
    value: (v) => str(v, 'value', 1500),
    color: (v) => color(v),
    background: (v) => color(v, 'background'),
    margin: (v) => num(v, 'margin', 0, 20),
  },
  chart: {
    kind: (v) => oneOf(v, CHARTS, 'kind'),
    labels: (v) => (Array.isArray(v) ? v.slice(0, 60).map((l) => str(String(l), 'label', 80)) : fail('labels must be a list')),
    series: (v) =>
      Array.isArray(v)
        ? v.slice(0, 12).map((s: Props) => ({
            name: str(s.name ?? '', 'series name', 80),
            values: Array.isArray(s.values) ? s.values.slice(0, 60).map((n) => num(n, 'series value')) : fail('series values must be a list of numbers'),
            color: color(s.color ?? '#2131F5', 'series colour'),
          }))
        : fail('series must be a list'),
    fontFamily: font,
    textColor: (v) => color(v),
    gridColor: (v) => color(v),
    showLegend: (v) => bool(v, 'showLegend'),
    showValues: (v) => bool(v, 'showValues'),
    showGrid: (v) => bool(v, 'showGrid'),
    rounded: (v) => num(v, 'rounded', 0, 100),
  },
  table: {
    cells: (v) => {
      if (!Array.isArray(v) || !v.length || v.length > 60) fail('cells must be 1 to 60 rows, each a list of text');
      const cols = Math.max(...v.map((r) => (Array.isArray(r) ? r.length : 0)));
      if (!cols || cols > 20) fail('each row needs 1 to 20 cells');
      return v.map((r: unknown[]) => Array.from({ length: cols }, (_, i) => str(String(r[i] ?? ''), 'cell', 500)));
    },
    fontFamily: font,
    fontSize: (v) => num(v, 'fontSize', 4, 400),
    textColor: (v) => color(v),
    headerFill: (v) => color(v),
    headerColor: (v) => color(v),
    bodyFill: (v) => color(v),
    stripeFill: (v) => (v === null ? null : color(v)),
    lineColor: (v) => color(v),
    radius: (v) => num(v, 'radius', 0, 2000),
  },
  draw: {
    paths: (v) =>
      Array.isArray(v)
        ? v.slice(0, 400).map((p: Props) => {
            const d = str(p.d, 'path d', 40000);
            if (!PATH.test(d)) fail('draw path d must be SVG path data');
            return { d, color: color(p.color ?? '#0B0B0D'), width: num(p.width ?? 6, 'path width', 0.5, 400), tool: oneOf(p.tool ?? 'pen', ['pen', 'marker', 'highlighter', 'glow'] as const, 'tool') };
          })
        : fail('paths must be a list'),
    w0: (v) => num(v, 'w0', 1, 40000),
    h0: (v) => num(v, 'h0', 1, 40000),
  },
};

// Friendly names an assistant may reach for, mapped to the field they mean.
const ALIAS: Record<string, string> = {
  font: 'fontFamily',
  size: 'fontSize',
  weight: 'fontWeight',
  line_height: 'lineHeight',
  letter_spacing: 'letterSpacing',
  width: 'w',
  height: 'h',
  colour: 'color',
  rotate: 'rotation',
  animation: 'anim',
};

function applyProps(el: Element, props: Props, src: Sources, where: string): Element {
  const fields = { ...ANY, ...(FIELDS[el.type] ?? {}) };
  const out = { ...el } as Props;
  if (el.type === 'line' && ['x1', 'y1', 'x2', 'y2'].some((k) => k in props)) {
    const ends = lineEnds(el);
    Object.assign(out, lineFromPoints({ ...ends, ...Object.fromEntries(['x1', 'y1', 'x2', 'y2'].filter((k) => k in props).map((k) => [k, props[k]])) }));
    props = Object.fromEntries(Object.entries(props).filter(([k]) => !['x1', 'y1', 'x2', 'y2'].includes(k)));
  }
  for (let [k, v] of Object.entries(props)) {
    // A line's "width" is its stroke, not its length.
    if (!(el.type === 'line' && k === 'width')) k = ALIAS[k] ?? k;
    const check = fields[k];
    if (!check) fail(`${where}: "${k}" is not a ${el.type} property. It takes: ${Object.keys(fields).join(', ')}`);
    try {
      out[k] = check(v, el, src);
    } catch (e) {
      fail(`${where}: ${(e as Error).message}`);
    }
  }
  if (el.type === 'table' && props.cells) {
    const cells = out.cells as string[][];
    out.rows = cells.length;
    out.cols = cells[0].length;
  }
  return out as unknown as Element;
}

// ---------------------------------------------------------------- new elements

const NO_EFFECT = { kind: 'none', color: '#0B0B0D', amount: 50, offset: 50, direction: 45 };
const NO_FILTERS = { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, blur: 0, vignette: 0, grain: 0, preset: 'none', duotone: null };

function blank(type: string, id: string, spec: Props): Props {
  const base = { id, rotation: 0, opacity: 1, x: 0, y: 0 };
  switch (type) {
    case 'text':
      return { ...base, type, w: 600, h: 80, text: '', fontFamily: 'Host Grotesk', fontSize: 48, fontWeight: 400, italic: false, underline: false, strike: false, color: '#0B0B0D', align: 'left', lineHeight: 1.2, letterSpacing: 0, uppercase: false, list: 'none', effect: NO_EFFECT, curve: 0 };
    case 'shape':
      return { ...base, type, shape: 'rect', w: 240, h: 240, fill: { type: 'solid', color: '#C9CCD6' }, stroke: null, radius: 0 };
    case 'line':
      return { ...base, type, w: 300, h: 24, color: '#0B0B0D', width: 4, dash: 'solid', start: 'none', end: 'none', curve: 0 };
    case 'image':
      return { ...base, type, w: 400, h: 300, assetId: null, crop: { x: 0, y: 0, w: 1, h: 1 }, filters: NO_FILTERS, radius: 0, mask: null, border: null };
    case 'svg':
      return { ...base, type, w: 200, h: 200, svg: '', colors: {} };
    case 'qr':
      return { ...base, type, w: 260, h: 260, value: 'https://opentempl.org', color: '#0B0B0D', background: '#FFFFFF', margin: 2 };
    case 'chart': {
      const kind = (spec.kind as string) ?? 'column';
      const round = kind === 'pie' || kind === 'donut' || kind === 'progress';
      return { ...base, type, kind, w: round ? 400 : 560, h: round ? 400 : 360, labels: [], series: [], fontFamily: 'Host Grotesk', textColor: '#0B0B0D', gridColor: '#D9D9DF', showLegend: kind !== 'progress', showValues: false, showGrid: !round, rounded: 6 };
    }
    case 'table':
      return { ...base, type, w: 540, h: 224, rows: 1, cols: 1, cells: [['']], fontFamily: 'Host Grotesk', fontSize: 20, textColor: '#0B0B0D', headerFill: '#0B0B0D', headerColor: '#FFFFFF', bodyFill: '#FFFFFF', stripeFill: '#F3F3F6', lineColor: '#D9D9DF', radius: 12 };
    case 'draw':
      return { ...base, type, w: 400, h: 400, paths: [], w0: 400, h0: 400 };
  }
  fail(`element type must be one of: text, shape, line, image, icon, svg, qr, chart, table, draw (got "${type}")`);
}

// ---------------------------------------------------------------- replay

function emptyPage(id: string): DraftPage {
  return { id, name: '', background: { type: 'solid', color: '#FFFFFF' }, notes: '', transition: 'none', duration: 5, elements: [] };
}

export function startDesign(draft: Draft, src: Sources): Design {
  const s = draft.start as Props;
  if (s.template) {
    const t = src.template;
    if (!t || t.id !== s.template) fail(`unknown template "${s.template}"`);
    const pages = t.pages.map((tp, i) => ({
      id: `p${i + 1}`,
      name: tp.name ?? '',
      background: tp.background,
      notes: tp.notes ?? '',
      transition: tp.transition ?? 'none',
      duration: 5,
      elements: tp.elements.map((e, j) => ({ ...structuredClone(e), id: `p${i + 1}-e${j + 1}`, locked: false }) as Element),
    }));
    // Words and notes the template came with, so leftovers can be pointed out later.
    const tpl = [...pages.flatMap((p) => p.elements.filter((e) => e.type === 'text' && e.text.trim()).map((e) => e.id)), ...pages.filter((p) => p.notes.trim()).map((p) => p.id)];
    return { title: draft.title ?? t.name, width: t.width, height: t.height, formatId: t.formatId, pages, images: {}, cover: [], fit: {}, orig: {}, resized: {}, tpl, seq: 0 };
  }
  if (s.format) {
    const f = src.format;
    if (!f || f.id !== s.format) fail(`unknown format "${s.format}"`);
    return { title: draft.title ?? f.name, width: f.width, height: f.height, formatId: f.id, pages: [emptyPage('p1')], images: {}, cover: [], fit: {}, orig: {}, resized: {}, tpl: [], seq: 0 };
  }
  const w = num(s.width, 'width', 16, 20000);
  const h = num(s.height, 'height', 16, 20000);
  return { title: draft.title ?? 'Untitled design', width: Math.round(w), height: Math.round(h), pages: [emptyPage('p1')], images: {}, cover: [], fit: {}, orig: {}, resized: {}, tpl: [], seq: 0 };
}

function findElement(d: Design, id: string) {
  for (const page of d.pages) {
    const i = page.elements.findIndex((e) => e.id === id);
    if (i >= 0) return { page, i, el: page.elements[i] };
  }
  return null;
}

function needElement(d: Design, id: unknown, where: string) {
  const hit = typeof id === 'string' ? findElement(d, id) : null;
  if (!hit) fail(`${where}: no element "${id}". Element ids look like p1-e3 or n2; get_design lists them`);
  return hit;
}

function needPage(d: Design, id: unknown, where: string) {
  const page = d.pages.find((p) => p.id === id);
  if (!page) fail(`${where}: no page "${id}". Pages are ${d.pages.map((p) => p.id).join(', ')}`);
  return page;
}

function nextPageId(d: Design) {
  return `p${Math.max(0, ...d.pages.map((p) => Number(p.id.slice(1)) || 0)) + 1}`;
}

// The asset an image op points at: a file in OpenTempl's library or a photo on the web.
function imageSource(d: Design, o: { url?: string; library?: string; credit?: string; download?: string }, where: string): string {
  if (o.library) {
    const path = str(o.library, 'library', 200).replace(/^\/+|^library\//g, '');
    if (!/^(photos|art|stickers|backgrounds|tex)\/[\w.-]+\.(jpe?g|png|webp)$/.test(path)) fail(`${where}: library must be a path from list_library, like "stickers/voxel-star.webp"`);
    return `lib:${path}`;
  }
  if (!o.url) fail(`${where}: give a url or a library path`);
  const u = url(o.url, `${where} url`);
  for (const [id, img] of Object.entries(d.images)) if (img.url === u) return id;
  const id = `web:${Object.keys(d.images).length + 1}`;
  d.images[id] = { url: u, credit: o.credit ? str(o.credit, 'credit', 200) : undefined, download: o.download ? url(o.download, 'download') : undefined };
  return id;
}

function recolorFill(f: Fill, from: string, to: string): Fill {
  if (f.type === 'solid') return hexKey(f.color) === from ? { ...f, color: to } : f;
  if (f.type === 'linear' || f.type === 'radial') return { ...f, stops: f.stops.map((s) => (hexKey(s.color) === from ? { ...s, color: to } : s)) };
  if (f.type === 'pattern') return { ...f, color: hexKey(f.color) === from ? to : f.color, background: hexKey(f.background) === from ? to : f.background };
  return f;
}

export function svgColors(svg: string): string[] {
  return [...new Set(svg.match(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g) ?? [])];
}

function recolorElement(el: Element, from: string, to: string): Element {
  const sw = (c: string | undefined) => (c && hexKey(c) === from ? to : c);
  const e = structuredClone(el) as Element & Props;
  if (e.shadow) e.shadow.color = sw(e.shadow.color)!;
  switch (e.type) {
    case 'text':
      e.color = sw(e.color)!;
      if (e.gradient) e.gradient = recolorFill(e.gradient, from, to);
      if (e.effect) e.effect.color = sw(e.effect.color)!;
      if (e.runs) e.runs = e.runs.map((r) => (r.color ? { ...r, color: sw(r.color) } : r));
      break;
    case 'shape':
      e.fill = recolorFill(e.fill, from, to);
      if (e.stroke) e.stroke.color = sw(e.stroke.color)!;
      break;
    case 'line':
      e.color = sw(e.color)!;
      break;
    case 'image':
      if (e.border) e.border.color = sw(e.border.color)!;
      if (e.filters.duotone) e.filters.duotone = e.filters.duotone.map((c) => sw(c)!) as [string, string];
      break;
    case 'svg':
      for (const c of svgColors(e.svg)) if (hexKey(e.colors[c] ?? c) === from) e.colors[c] = to;
      if (/currentColor/i.test(e.svg) && hexKey(e.colors.currentColor ?? '#0b0b0d') === from) e.colors.currentColor = to;
      break;
    case 'qr':
      e.color = sw(e.color)!;
      e.background = sw(e.background)!;
      break;
    case 'chart':
      e.textColor = sw(e.textColor)!;
      e.gridColor = sw(e.gridColor)!;
      e.series = e.series.map((s) => ({ ...s, color: sw(s.color)! }));
      break;
    case 'table':
      for (const k of ['textColor', 'headerFill', 'headerColor', 'bodyFill', 'lineColor'] as const) e[k] = sw(e[k])!;
      if (e.stripeFill) e.stripeFill = sw(e.stripeFill)!;
      break;
    case 'draw':
      e.paths = e.paths.map((p) => ({ ...p, color: sw(p.color)! }));
      break;
  }
  return e;
}

function lineFromPoints(spec: Props) {
  const x1 = num(spec.x1, 'x1');
  const y1 = num(spec.y1, 'y1');
  const x2 = num(spec.x2, 'x2');
  const y2 = num(spec.y2, 'y2');
  const len = Math.max(1, Math.hypot(x2 - x1, y2 - y1));
  const h = 24;
  // Stored as a box rotated about its centre; work back from the end points.
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return { x: cx - len / 2, y: cy - h / 2, w: len, h, rotation: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI };
}

export function lineEnds(el: { x: number; y: number; w: number; h: number; rotation: number }) {
  const a = (el.rotation * Math.PI) / 180;
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const dx = (Math.cos(a) * el.w) / 2;
  const dy = (Math.sin(a) * el.w) / 2;
  return { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy };
}

// ---------------------------------------------------------------- fitting text

// How much room some text takes, from character counts. Only used where real fonts are not at hand.
export function estimateText(e: TextElement) {
  const c = capacity({ ...e, h: 1 });
  const words = e.text.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 0);
  return { height: c.linesFor(e.text) * e.fontSize * e.lineHeight, width: Math.max(Math.min(e.w, c.charWidth * Math.max(...e.text.split('\n').map((l) => l.length))), words * c.charWidth) };
}

// "grow": the box follows the words. "shrink": the words keep the room the old ones had (often more
// than the stored box) and the type gets smaller until they fit. "none": left alone.
function fitText(d: Design, el: TextElement, src: Sources) {
  const mode = d.fit[el.id];
  if (!mode || mode === 'none') return;
  const measure = src.measure ?? estimateText;
  const at = (size: number) => measure({ ...el, fontSize: size });
  if (mode === 'grow') {
    el.h = Math.max(Math.ceil(at(el.fontSize).height), Math.ceil(el.fontSize * el.lineHeight));
    return;
  }
  const before = d.orig[el.id];
  const room = Math.max(el.h, before === undefined ? 0 : measure({ ...el, text: before }).height);
  const fits = (size: number) => {
    const m = at(size);
    return m.height <= room + 1 && m.width <= el.w + 1;
  };
  if (!fits(el.fontSize)) {
    let lo = el.fontSize * 0.25;
    let hi = el.fontSize;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    const got = Math.max(4, Math.floor(lo * 10) / 10);
    d.resized[el.id] = { asked: d.resized[el.id]?.asked ?? el.fontSize, got };
    el.fontSize = got;
  }
  el.h = Math.max(el.h, Math.ceil(at(el.fontSize).height));
}

// ---------------------------------------------------------------- many ids

// "p1-e10..p1-e40" names a run of elements; lists can mix single ids and runs.
function expandIds(d: Design, raw: unknown, where: string): string[] {
  const list = Array.isArray(raw) ? raw : [raw];
  const out: string[] = [];
  for (const item of list) {
    const id = str(item, 'id', 80);
    const m = id.match(/^(.*?)(\d+)\.\.(.*?)(\d+)$/);
    if (!m) {
      out.push(id);
      continue;
    }
    if (m[1] !== m[3]) fail(`${where}: a run like "${id}" must keep the same prefix at both ends`);
    const [a, b] = [Number(m[2]), Number(m[4])].sort((x, y) => x - y);
    const run = [];
    for (const p of d.pages) for (const e of p.elements) if (e.id.startsWith(m[1]) && /^\d+$/.test(e.id.slice(m[1].length)) && +e.id.slice(m[1].length) >= a && +e.id.slice(m[1].length) <= b) run.push(e.id);
    if (!run.length) fail(`${where}: no elements in "${id}"`);
    out.push(...run);
  }
  if (!out.length) fail(`${where}: give an id or a list of ids`);
  return out;
}

type Box = { x: number; y: number; w: number; h: number };
const union = (boxes: Box[]): Box => {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y };
};

function applyOp(d: Design, op: Op, src: Sources, n: number) {
  const where = `edit ${n + 1} (${(op as Props).op})`;
  const o = op as Props;
  switch (op.op) {
    case 'set_text': {
      const hit = needElement(d, op.id, where);
      if (hit.el.type !== 'text') fail(`${where}: ${op.id} is a ${hit.el.type}, not text`);
      if (!(op.id in d.orig)) d.orig[op.id] = hit.el.text;
      const el = { ...hit.el, text: str(op.text, 'text') };
      delete el.runs; // run offsets belong to the old text
      hit.page.elements[hit.i] = el;
      d.fit[op.id] = op.fit ? oneOf(op.fit, ['shrink', 'grow', 'none'] as const, 'fit') : (d.fit[op.id] ?? 'shrink');
      d.tpl = d.tpl.filter((t) => t !== op.id);
      fitText(d, el, src);
      return;
    }
    case 'style': {
      if (!op.props || typeof op.props !== 'object') fail(`${where}: props must be an object`);
      for (const id of expandIds(d, op.ids ?? op.id, where)) {
        const hit = needElement(d, id, where);
        const el = applyProps(hit.el, op.props, src, where);
        hit.page.elements[hit.i] = el;
        // A box given a height keeps it; any other change to how the text sets lets the box follow the text.
        if (el.type === 'text') {
          const keys = Object.keys(op.props).map((k) => ALIAS[k] ?? k);
          if (keys.includes('h')) d.fit[id] = 'none';
          else if (keys.some((k) => ['text', 'fontSize', 'fontFamily', 'fontWeight', 'w', 'letterSpacing', 'lineHeight', 'uppercase', 'list'].includes(k))) d.fit[id] = 'grow';
          if (keys.includes('fontSize')) delete d.resized[id];
          if (keys.includes('text')) d.tpl = d.tpl.filter((t) => t !== id);
          fitText(d, el, src);
        }
      }
      return;
    }
    case 'set_image': {
      const page = d.pages.find((p) => p.id === op.id);
      if (page) {
        page.background = { type: 'image', assetId: imageSource(d, op, where), fit: op.fit ?? 'cover', opacity: 1 };
        return;
      }
      const hit = needElement(d, op.id, where);
      if (hit.el.type === 'shape') {
        hit.page.elements[hit.i] = { ...hit.el, fill: { type: 'image', assetId: imageSource(d, op, where), fit: op.fit ?? 'cover', opacity: 1 } };
        return;
      }
      if (hit.el.type !== 'image') fail(`${where}: ${op.id} is a ${hit.el.type}; photos go into image frames, shapes or page backgrounds`);
      hit.page.elements[hit.i] = { ...hit.el, assetId: imageSource(d, op, where), crop: { x: 0, y: 0, w: 1, h: 1 } };
      if (!d.cover.includes(op.id)) d.cover.push(op.id);
      return;
    }
    case 'add': {
      const page = needPage(d, op.page, where);
      const spec = { ...(op.element ?? {}) } as Props;
      let type = String(spec.type ?? '');
      const id = `n${++d.seq}`;
      if (type === 'icon') {
        // The server swaps an icon name for its SVG before the draft is stored.
        if (typeof spec.svg !== 'string') fail(`${where}: icon "${spec.icon}" was not found; search_icons lists real names`);
        type = 'svg';
        spec.source = spec.icon;
        if (spec.color) spec.colors = { currentColor: spec.color };
        delete spec.icon;
        delete spec.color;
      }
      let el = blank(type, id, spec) as unknown as Element;
      if (type === 'line' && spec.x1 !== undefined) {
        Object.assign(el, lineFromPoints(spec));
        for (const k of ['x1', 'y1', 'x2', 'y2']) delete spec[k];
      }
      const image = type === 'image' && (spec.url || spec.library) ? { url: spec.url, library: spec.library, credit: spec.credit, download: spec.download } : null;
      const source = spec.source;
      for (const k of ['type', 'url', 'library', 'credit', 'download', 'source', 'fit']) delete spec[k];
      el = applyProps(el, spec, src, where);
      if (type === 'svg') {
        if (!(el as unknown as Props).svg) fail(`${where}: an svg element needs svg markup`);
        if (typeof source === 'string') (el as unknown as Props).source = source.slice(0, 120);
      }
      if (type === 'chart' && !(el as unknown as { series: unknown[] }).series.length) fail(`${where}: a chart needs labels and series`);
      if (image) {
        (el as unknown as Props).assetId = imageSource(d, image as never, where);
        d.cover.push(id);
      }
      if (type === 'text') {
        d.fit[id] = (o.element as Props).fit ? oneOf((o.element as Props).fit, ['shrink', 'grow', 'none'] as const, 'fit') : 'grow';
        fitText(d, el as TextElement, src);
      }
      const below = op.below ? page.elements.findIndex((e) => e.id === op.below) : -1;
      if (op.below && below < 0) fail(`${where}: no element "${op.below}" on ${page.id}`);
      page.elements.splice(below >= 0 ? below : page.elements.length, 0, el);
      return;
    }
    case 'duplicate': {
      const hit = needElement(d, op.id, where);
      const id = `n${++d.seq}`;
      let el = { ...structuredClone(hit.el), id, x: hit.el.x + (op.dx ?? 0), y: hit.el.y + (op.dy ?? 0) } as Element;
      delete (el as unknown as Props).groupId;
      if (op.props) el = applyProps(el, op.props, src, where);
      hit.page.elements.splice(hit.i + 1, 0, el);
      if (d.fit[op.id]) d.fit[id] = d.fit[op.id];
      if (op.id in d.orig) d.orig[id] = d.orig[op.id];
      if (d.cover.includes(op.id)) d.cover.push(id);
      if (d.tpl.includes(op.id) && !(op.props && 'text' in op.props)) d.tpl.push(id);
      if (el.type === 'text' && op.props) fitText(d, el, src);
      return;
    }
    case 'remove': {
      for (const id of expandIds(d, op.ids ?? op.id, where)) {
        const pi = d.pages.findIndex((p) => p.id === id);
        if (pi >= 0) {
          if (d.pages.length === 1) fail(`${where}: a design keeps at least one page`);
          d.pages.splice(pi, 1);
          continue;
        }
        const hit = needElement(d, id, where);
        hit.page.elements.splice(hit.i, 1);
      }
      return;
    }
    case 'recolor': {
      const pairs = op.map ? Object.entries(op.map) : [[op.from, op.to]];
      if (!pairs.length) fail(`${where}: give from and to, or a map of colours`);
      // All swaps read the colours as they were, so {"#000": "#fff", "#fff": "#000"} trades them.
      const swaps = pairs.map(([f, t]) => [hexKey(color(f, 'from')), color(t, 'to')] as const);
      const marks = swaps.map((_, i) => `#0000${String(i).padStart(2, '0')}fe`);
      for (const p of d.pages) {
        swaps.forEach(([f], i) => {
          p.background = recolorFill(p.background, f, marks[i]);
          p.elements = p.elements.map((e) => recolorElement(e, f, marks[i]));
        });
        swaps.forEach(([, t], i) => {
          p.background = recolorFill(p.background, marks[i], t);
          p.elements = p.elements.map((e) => recolorElement(e, marks[i], t));
        });
      }
      return;
    }
    case 'align': {
      const ids = expandIds(d, op.ids, where);
      const els = ids.map((id) => needElement(d, id, where).el);
      const rel = op.relative ?? (ids.length === 1 ? 'page' : 'selection');
      const target: Box = rel === 'page' ? { x: 0, y: 0, w: d.width, h: d.height } : rel === 'selection' ? union(els) : needElement(d, rel, where).el;
      const to = oneOf(op.to, ['left', 'center', 'right', 'top', 'middle', 'bottom'] as const, 'to');
      for (const el of els) {
        if (to === 'left') el.x = target.x;
        if (to === 'center') el.x = target.x + (target.w - el.w) / 2;
        if (to === 'right') el.x = target.x + target.w - el.w;
        if (to === 'top') el.y = target.y;
        if (to === 'middle') el.y = target.y + (target.h - el.h) / 2;
        if (to === 'bottom') el.y = target.y + target.h - el.h;
      }
      return;
    }
    case 'distribute': {
      const els = expandIds(d, op.ids, where).map((id) => needElement(d, id, where).el);
      if (els.length < 2) fail(`${where}: distribute needs two or more elements`);
      const horizontal = oneOf(op.axis, ['horizontal', 'vertical'] as const, 'axis') === 'horizontal';
      const pos = (e: Box) => (horizontal ? e.x : e.y);
      const size = (e: Box) => (horizontal ? e.w : e.h);
      els.sort((a, b) => pos(a) - pos(b));
      const first = els[0];
      const last = els[els.length - 1];
      const gap = op.gap !== undefined ? num(op.gap, 'gap', -10000, 10000) : (pos(last) + size(last) - pos(first) - els.reduce((t, e) => t + size(e), 0)) / (els.length - 1);
      let at = pos(first);
      for (const e of els) {
        if (horizontal) e.x = at;
        else e.y = at;
        at += size(e) + gap;
      }
      return;
    }
    case 'page': {
      const page = needPage(d, op.id, where);
      if (op.background !== undefined) page.background = fill(op.background, 'background');
      if (op.notes !== undefined) {
        page.notes = str(op.notes, 'notes', 8000);
        d.tpl = d.tpl.filter((t) => t !== page.id);
      }
      if (op.name !== undefined) page.name = str(op.name, 'name', 120);
      if (op.transition !== undefined) page.transition = oneOf(op.transition, TRANSITIONS, 'transition') as PageTransition;
      if (op.duration !== undefined) page.duration = num(op.duration, 'duration', 0.5, 120);
      if (op.hidden !== undefined) (page as unknown as Props).hidden = bool(op.hidden, 'hidden');
      return;
    }
    case 'add_page': {
      if (d.pages.length >= 60) fail(`${where}: 60 pages is the most a design made here can have`);
      const id = nextPageId(d);
      let page: DraftPage;
      if (op.copy) {
        const from = needPage(d, op.copy, where);
        const groups = new Map<string, string>();
        page = {
          ...structuredClone(from),
          id,
          elements: from.elements.map((e) => {
            const nid = `n${++d.seq}`;
            if (d.fit[e.id]) d.fit[nid] = d.fit[e.id];
            if (e.id in d.orig) d.orig[nid] = d.orig[e.id];
            if (d.cover.includes(e.id)) d.cover.push(nid);
            if (d.tpl.includes(e.id)) d.tpl.push(nid);
            const g = e.groupId ? (groups.get(e.groupId) ?? groups.set(e.groupId, `${e.groupId}-${id}`).get(e.groupId)) : undefined;
            return { ...structuredClone(e), id: nid, groupId: g } as Element;
          }),
        };
        if (d.tpl.includes(from.id)) d.tpl.push(id);
      } else page = emptyPage(id);
      if (op.background !== undefined) page.background = fill(op.background, 'background');
      if (op.name !== undefined) page.name = str(op.name, 'name', 120);
      const at = op.after ? d.pages.indexOf(needPage(d, op.after, where)) + 1 : d.pages.length;
      d.pages.splice(at, 0, page);
      return;
    }
    case 'move_page': {
      const page = needPage(d, op.id, where);
      const to = Math.round(num(op.to, 'to', 1, d.pages.length)) - 1;
      d.pages.splice(d.pages.indexOf(page), 1);
      d.pages.splice(to, 0, page);
      return;
    }
    case 'arrange': {
      const hit = needElement(d, op.id, where);
      const list = hit.page.elements;
      list.splice(hit.i, 1);
      const to = { front: list.length, back: 0, forward: Math.min(list.length, hit.i + 1), backward: Math.max(0, hit.i - 1) }[oneOf(op.to, ['front', 'back', 'forward', 'backward'] as const, 'to')];
      list.splice(to, 0, hit.el);
      return;
    }
    case 'title':
      d.title = str(op.title, 'title', 200);
      return;
  }
  fail(`${where}: unknown edit. Use set_text, style, set_image, add, duplicate, remove, recolor, align, distribute, page, add_page, move_page, arrange or title`);
}

export function buildDesign(draft: Draft, src: Sources): Design {
  const d = startDesign(draft, src);
  draft.ops.forEach((op, i) => applyOp(d, op, src, i));
  return d;
}

// Every library and web image a design needs, so the editor can fetch them.
export function assetIds(d: Design): string[] {
  const ids = new Set<string>();
  const add = (f: Fill) => f.type === 'image' && ids.add(f.assetId);
  for (const p of d.pages) {
    add(p.background);
    for (const e of p.elements) {
      if (e.type === 'image' && e.assetId) ids.add(e.assetId);
      if (e.type === 'shape') add(e.fill);
    }
  }
  return [...ids];
}

// ---------------------------------------------------------------- describing a design

const r = (n: number) => Math.round(n);

function fillText(f: Fill): string {
  switch (f.type) {
    case 'solid':
      return f.color;
    case 'linear':
      return `gradient ${f.angle}° ${f.stops.map((s) => s.color).join(' → ')}`;
    case 'radial':
      return `radial ${f.stops.map((s) => s.color).join(' → ')}`;
    case 'pattern':
      return `${f.kind} pattern ${f.color} on ${f.background}`;
    case 'image':
      return `image ${f.assetId}`;
  }
}

// Roughly how many characters fit on a line, and how many lines some words take.
export function capacity(e: TextElement) {
  const em = e.uppercase || e.text === e.text.toUpperCase() ? 0.68 : 0.52;
  const perLine = Math.max(1, Math.floor(e.w / (e.fontSize * em * (1 + e.letterSpacing / 1000))));
  const linesFor = (text: string) => text.split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(line.length / perLine)), 0);
  // Stored heights are often only a first line; the words already there show the real room.
  const lines = Math.max(1, Math.round(e.h / (e.fontSize * e.lineHeight)), linesFor(e.text));
  return { perLine, lines, linesFor, charWidth: e.fontSize * em * (1 + e.letterSpacing / 1000) };
}

function describe(e: Element, d: Design): string {
  const box = `at ${r(e.x)},${r(e.y)} size ${r(e.w)}×${r(e.h)}${e.rotation ? ` rot ${r(e.rotation)}°` : ''}${e.opacity < 1 ? ` opacity ${e.opacity}` : ''}${e.hidden ? ' HIDDEN' : ''}`;
  switch (e.type) {
    case 'text': {
      const t = e.text.length > 160 ? e.text.slice(0, 157) + '...' : e.text;
      const c = capacity(e);
      const fx = e.effect && e.effect.kind !== 'none' ? ` effect ${e.effect.kind}` : '';
      return `text${e.role ? ` (${e.role})` : ''} ${JSON.stringify(t)} · ${e.fontFamily} ${e.fontWeight}${e.italic ? ' italic' : ''} ${r(e.fontSize)}px ${e.gradient ? fillText(e.gradient) : e.color} ${e.align}${e.uppercase ? ' caps' : ''}${e.letterSpacing ? ` tracking ${e.letterSpacing}` : ''} lh ${e.lineHeight}${fx}${e.curve ? ` curve ${e.curve}` : ''} · ${box} · fits ~${c.perLine} chars × ${c.lines} line${c.lines > 1 ? 's' : ''}`;
    }
    case 'shape':
      return `shape ${e.shape} ${fillText(e.fill)}${e.stroke ? ` stroke ${e.stroke.width}px ${e.stroke.color}` : ''}${e.radius ? ` radius ${e.radius}` : ''} · ${box}`;
    case 'line': {
      const p = lineEnds(e);
      return `line from ${r(p.x1)},${r(p.y1)} to ${r(p.x2)},${r(p.y2)} · ${e.width}px ${e.color} ${e.dash}${e.start !== 'none' || e.end !== 'none' ? ` caps ${e.start}/${e.end}` : ''}${e.opacity < 1 ? ` opacity ${e.opacity}` : ''}`;
    }
    case 'image': {
      const src = !e.assetId ? 'EMPTY frame' : e.assetId.startsWith('web:') ? `photo ${d.images[e.assetId]?.url ?? ''}` : `library ${e.assetId.slice(4)}`;
      return `image ${src}${e.mask ? ` mask ${e.mask}` : ''}${e.radius ? ` radius ${e.radius}` : ''}${e.filters.preset !== 'none' ? ` filter ${e.filters.preset}` : ''}${e.filters.duotone ? ` duotone ${e.filters.duotone.join('/')}` : ''} · ${box}`;
    }
    case 'svg': {
      const cols = svgColors(e.svg).map((c) => e.colors[c] ?? c);
      if (/currentColor/i.test(e.svg)) cols.push(e.colors.currentColor ?? '#0B0B0D');
      return `${e.source ? `icon ${e.source}` : 'vector art'} colours ${[...new Set(cols)].slice(0, 8).join(' ') || 'none'} · ${box}`;
    }
    case 'qr':
      return `qr ${JSON.stringify(e.value)} ${e.color} on ${e.background} · ${box}`;
    case 'chart':
      return `chart ${e.kind} labels ${JSON.stringify(e.labels)} series ${e.series.map((s) => `${s.name}: ${s.values.join(',')} ${s.color}`).join('; ')} · ${box}`;
    case 'table':
      return `table ${e.rows}×${e.cols} first row ${JSON.stringify(e.cells[0])} · ${box}`;
    case 'draw':
      return `drawing ${e.paths.length} strokes · ${box}`;
    case 'video':
      return `video · ${box}`;
  }
}

export function palette(d: Design): { color: string; uses: number }[] {
  const count = new Map<string, number>();
  const add = (c?: string | null) => c && /^#/.test(c) && count.set(hexKey(c), (count.get(hexKey(c)) ?? 0) + 1);
  const addFill = (f: Fill) => (f.type === 'solid' ? add(f.color) : f.type === 'linear' || f.type === 'radial' ? f.stops.forEach((s) => add(s.color)) : f.type === 'pattern' ? (add(f.color), add(f.background)) : 0);
  for (const p of d.pages) {
    addFill(p.background);
    for (const e of p.elements) {
      const x = e;
      if (x.type === 'text') add(x.color);
      if (x.type === 'shape') (addFill(x.fill), add(x.stroke?.color));
      if (x.type === 'line') add(x.color);
      if (x.type === 'svg') svgColors(x.svg).forEach((c) => add(x.colors[c] ?? c));
      if (x.type === 'qr') (add(x.color), add(x.background));
    }
  }
  return [...count].map(([color, uses]) => ({ color, uses })).sort((a, b) => b.uses - a.uses);
}

export function outline(d: Design, opts: { pages?: string[] } = {}): string {
  const lines = [`"${d.title}" · ${d.width}×${d.height}px${d.formatId ? ` (${d.formatId})` : ''} · ${d.pages.length} page${d.pages.length > 1 ? 's' : ''}`];
  const fonts = new Set<string>();
  for (const p of d.pages) for (const e of p.elements) if (e.type === 'text') fonts.add(`${e.fontFamily}`);
  lines.push(`Palette: ${palette(d).slice(0, 14).map((p) => `${p.color}×${p.uses}`).join(' ')}`);
  if (fonts.size) lines.push(`Fonts: ${[...fonts].join(', ')}`);
  for (const p of d.pages) {
    if (opts.pages && !opts.pages.includes(p.id)) continue;
    lines.push('');
    lines.push(`Page ${p.id}${p.name ? ` "${p.name}"` : ''} · background ${fillText(p.background)}${p.transition !== 'none' ? ` · transition ${p.transition}` : ''}${p.notes ? ` · notes ${JSON.stringify(p.notes.slice(0, 80))}` : ''}`);
    if (!p.elements.length) lines.push('  (empty)');
    // Listed bottom to top, the order they are drawn in. Runs of look alike pieces (a grid of
    // squares, a row of dots) are folded into one line.
    const rows = p.elements.map((e) => ({ e, text: describe(e, d), kind: e.type === 'text' ? e.id : describe({ ...e, x: 0, y: 0 }, d) }));
    for (let i = 0; i < rows.length; ) {
      let j = i;
      while (j + 1 < rows.length && rows[j + 1].kind === rows[i].kind) j++;
      if (j - i >= 3) {
        const first = rows[i].e;
        lines.push(`  ${first.id} .. ${rows[j].e.id}  ${j - i + 1} alike: ${rows[i].text} (first; the others repeat it elsewhere)`);
      } else for (let k = i; k <= j; k++) lines.push(`  ${rows[k].e.id}  ${rows[k].text}`);
      i = j + 1;
    }
  }
  return lines.join('\n');
}

// What the assistant should know after an edit: text set smaller than asked, and template words left in.
export function notices(d: Design): string[] {
  const out: string[] = [];
  const all = new Map(d.pages.flatMap((p) => p.elements.map((e) => [e.id, e] as const)));
  for (const [id, r] of Object.entries(d.resized)) {
    const e = all.get(id);
    if (e?.type === 'text') out.push(`${id} is set at ${Math.round(r.got)}px instead of ${Math.round(r.asked)}px so the words fit the room the old ones had. Shorten it, widen the box, or style a fontSize to set it yourself.`);
  }
  const left = d.tpl.filter((id) => all.has(id) || d.pages.some((p) => p.id === id));
  if (left.length) {
    const sample = left.slice(0, 10).map((id) => {
      const e = all.get(id);
      return e?.type === 'text' ? `${id} ${JSON.stringify(e.text.length > 40 ? e.text.slice(0, 37) + '...' : e.text)}` : `${id} notes`;
    });
    out.push(`Still the template's own words (change, remove or keep on purpose): ${sample.join(', ')}${left.length > 10 ? ` and ${left.length - 10} more` : ''}.`);
  }
  return out;
}
