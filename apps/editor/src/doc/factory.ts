import { newId } from './design';
import type {
  ChartElement,
  DrawElement,
  ImageElement,
  ImageFilters,
  LineElement,
  QrElement,
  ShapeElement,
  ShapeKind,
  SvgElement,
  TableElement,
  VideoElement,
  Id,
  TextEffect,
  TextElement,
} from './types';

export const UI_FONT = 'Host Grotesk';

export const NO_EFFECT: TextEffect = { kind: 'none', color: '#0B0B0D', amount: 50, offset: 50, direction: 45 };

export const NO_FILTERS: ImageFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  blur: 0,
  vignette: 0,
  grain: 0,
  preset: 'none',
  duotone: null,
};

const base = { rotation: 0, opacity: 1 };

export function makeText(p: Partial<TextElement> = {}): TextElement {
  return {
    ...base,
    id: newId(),
    type: 'text',
    x: 0,
    y: 0,
    w: 400,
    h: 60,
    text: 'Add a little bit of body text',
    fontFamily: UI_FONT,
    fontSize: 32,
    fontWeight: 400,
    italic: false,
    underline: false,
    strike: false,
    color: '#0B0B0D',
    align: 'left',
    lineHeight: 1.3,
    letterSpacing: 0,
    uppercase: false,
    list: 'none',
    effect: NO_EFFECT,
    curve: 0,
    ...p,
  };
}

export const TEXT_PRESETS = {
  heading: { text: 'Add a heading', fontSize: 96, fontWeight: 700, lineHeight: 1.0, letterSpacing: -30, role: 'heading' as const },
  subheading: { text: 'Add a subheading', fontSize: 48, fontWeight: 500, lineHeight: 1.15, letterSpacing: -10, role: 'subheading' as const },
  body: { text: 'Add a little bit of body text', fontSize: 28, fontWeight: 400, lineHeight: 1.4, role: 'body' as const },
};

export function makeShape(shape: ShapeKind, p: Partial<ShapeElement> = {}): ShapeElement {
  return {
    ...base,
    id: newId(),
    type: 'shape',
    shape,
    x: 0,
    y: 0,
    w: 240,
    h: 240,
    fill: { type: 'solid', color: '#C9CCD6' },
    stroke: null,
    radius: 0,
    ...p,
  };
}

export function makeLine(p: Partial<LineElement> = {}): LineElement {
  return {
    ...base,
    id: newId(),
    type: 'line',
    x: 0,
    y: 0,
    w: 300,
    h: 24,
    color: '#0B0B0D',
    width: 4,
    dash: 'solid',
    start: 'none',
    end: 'none',
    curve: 0,
    ...p,
  };
}

export function makeImage(p: Partial<ImageElement> = {}): ImageElement {
  return {
    ...base,
    id: newId(),
    type: 'image',
    x: 0,
    y: 0,
    w: 400,
    h: 300,
    assetId: null,
    crop: { x: 0, y: 0, w: 1, h: 1 },
    filters: NO_FILTERS,
    radius: 0,
    mask: null,
    border: null,
    ...p,
  };
}

export function makeVideo(p: Partial<VideoElement> & { mediaId: Id }): VideoElement {
  return {
    ...base,
    id: newId(),
    type: 'video',
    x: 0,
    y: 0,
    w: 640,
    h: 360,
    posterId: null,
    mime: 'video/mp4',
    duration: 0,
    trimStart: 0,
    trimEnd: 0,
    muted: false,
    volume: 1,
    loop: true,
    radius: 0,
    ...p,
  };
}

export function makeSvg(svg: string, p: Partial<SvgElement> = {}): SvgElement {
  return { ...base, id: newId(), type: 'svg', x: 0, y: 0, w: 200, h: 200, svg, colors: {}, ...p };
}

export function makeDraw(p: Partial<DrawElement> = {}): DrawElement {
  return { ...base, id: newId(), type: 'draw', x: 0, y: 0, w: 10, h: 10, paths: [], w0: 10, h0: 10, ...p };
}

export function makeChart(kind: ChartElement['kind'], p: Partial<ChartElement> = {}): ChartElement {
  const pie = kind === 'pie' || kind === 'donut';
  const progress = kind === 'progress';
  return {
    ...base,
    id: newId(),
    type: 'chart',
    kind,
    x: 0,
    y: 0,
    w: progress ? 400 : 560,
    h: progress ? 400 : pie ? 400 : 360,
    labels: progress ? ['Done'] : pie ? ['Posters', 'Slides', 'Stickers', 'Other'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: progress
      ? [{ name: 'Progress', values: [72], color: '#2B3BFF' }]
      : pie
        ? [{ name: 'Share', values: [42, 28, 18, 12], color: '#2B3BFF' }]
        : [
            { name: 'This year', values: [12, 19, 15, 26, 31, 38], color: '#2B3BFF' },
            { name: 'Last year', values: [8, 11, 14, 13, 20, 22], color: '#FF4B39' },
          ],
    fontFamily: UI_FONT,
    textColor: '#0B0B0D',
    gridColor: '#D9D9DF',
    showLegend: !progress,
    showValues: false,
    showGrid: !pie && !progress,
    rounded: 6,
    ...p,
  };
}

export function makeQr(value: string, p: Partial<QrElement> = {}): QrElement {
  return { ...base, id: newId(), type: 'qr', x: 0, y: 0, w: 260, h: 260, value, color: '#0B0B0D', background: '#FFFFFF', margin: 2, ...p };
}

export function makeTable(rows = 4, cols = 3, p: Partial<TableElement> = {}): TableElement {
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (r === 0 ? `Column ${c + 1}` : '')),
  );
  return {
    ...base,
    id: newId(),
    type: 'table',
    x: 0,
    y: 0,
    w: cols * 180,
    h: rows * 56,
    rows,
    cols,
    cells,
    fontFamily: UI_FONT,
    fontSize: 20,
    textColor: '#0B0B0D',
    headerFill: '#0B0B0D',
    headerColor: '#FFFFFF',
    bodyFill: '#FFFFFF',
    stripeFill: '#F3F3F6',
    lineColor: '#D9D9DF',
    radius: 12,
    ...p,
  };
}
