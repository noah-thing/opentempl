// The Tavla document model. Everything a design contains is plain JSON so it
// can live inside a Y.Doc, travel between peers and be exported as a file.

export type Id = string;

export interface GradientStop {
  offset: number; // 0..1
  color: string;
}

export type Fill =
  | { type: 'solid'; color: string }
  | { type: 'linear'; angle: number; stops: GradientStop[] }
  | { type: 'radial'; stops: GradientStop[] }
  | { type: 'image'; assetId: Id; fit: 'cover' | 'contain' | 'tile'; opacity: number }
  | { type: 'pattern'; kind: PatternKind; color: string; background: string; scale: number };

export type PatternKind = 'dots' | 'grid' | 'stripes' | 'diagonal' | 'checker' | 'waves' | 'crosses' | 'pixels';

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  color: string;
}

export type AnimationKind =
  | 'none'
  | 'fade'
  | 'rise'
  | 'drop'
  | 'pop'
  | 'wipe'
  | 'pan'
  | 'blur'
  | 'typewriter'
  | 'stomp'
  | 'tumble';

export interface ElementAnimation {
  kind: AnimationKind;
  delay: number; // ms after the page appears
  duration: number; // ms
}

interface BaseElement {
  id: Id;
  name?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number; // degrees, clockwise, around the box centre
  opacity: number; // 0..1
  locked?: boolean;
  hidden?: boolean;
  flipX?: boolean;
  flipY?: boolean;
  groupId?: Id;
  link?: string;
  alt?: string; // alternative text for screen readers and exports
  shadow?: Shadow | null;
  blur?: number; // layer blur in px
  blend?: string; // css mix-blend-mode
  anim?: ElementAnimation | null;
}

export type TextEffectKind =
  | 'none'
  | 'shadow'
  | 'lift'
  | 'hollow'
  | 'splice'
  | 'outline'
  | 'echo'
  | 'glitch'
  | 'neon'
  | 'highlight';

export interface TextEffect {
  kind: TextEffectKind;
  color: string;
  amount: number; // 0..100, meaning depends on kind
  offset: number; // 0..100
  direction: number; // degrees
}

// A styled range inside a text box, [start, end) in characters.
export interface TextRun {
  start: number;
  end: number;
  fontWeight?: number;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  color: string;
  gradient?: Fill | null; // optional gradient fill for the glyphs
  align: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number; // multiple of font size
  letterSpacing: number; // in 1/1000 em, like Canva and most type tools
  uppercase: boolean;
  list: 'none' | 'bullet' | 'number';
  effect: TextEffect;
  curve: number; // -100..100, 0 = straight
  role?: 'heading' | 'subheading' | 'body';
  runs?: TextRun[];
}

export type ShapeKind =
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'star4'
  | 'burst'
  | 'heart'
  | 'arrow'
  | 'chevron'
  | 'cross'
  | 'speech'
  | 'arch'
  | 'pill'
  | 'blob'
  | 'flower'
  | 'squircle'
  | 'halfcircle'
  | 'ticket'
  | 'cloud';

export interface Stroke {
  color: string;
  width: number;
  dash: 'solid' | 'dash' | 'dot';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeKind;
  fill: Fill;
  stroke: Stroke | null;
  radius: number; // corner radius for rect like shapes
}

export type LineCap = 'none' | 'arrow' | 'triangle' | 'circle' | 'square' | 'bar' | 'diamond';

// A line is stored as a box: x,y is the start point, w is the length,
// rotation is the angle. h is the hit area height (the stroke sits in the middle).
export interface LineElement extends BaseElement {
  type: 'line';
  color: string;
  width: number;
  dash: 'solid' | 'dash' | 'dot';
  start: LineCap;
  end: LineCap;
  curve: number; // -100..100 bend
}

export interface ImageFilters {
  brightness: number; // -100..100
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  blur: number; // 0..100
  vignette: number; // 0..100
  grain: number; // 0..100
  preset: string; // name of a filter preset, 'none' when unset
  duotone: [string, string] | null;
}

export interface Crop {
  // Fractions of the natural image size: which part of the image shows in the box.
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  assetId: Id | null; // null = empty frame waiting for a photo
  crop: Crop;
  filters: ImageFilters;
  radius: number;
  mask: ShapeKind | null;
  border: Stroke | null;
}

export interface SvgElement extends BaseElement {
  type: 'svg';
  svg: string; // sanitised markup of a single <svg>
  colors: Record<string, string>; // original colour -> replacement
  source?: string; // iconify id or library id, for attribution
}

export interface DrawPath {
  d: string; // path in the element's own coordinate space (0..w0, 0..h0)
  color: string;
  width: number;
  tool: 'pen' | 'marker' | 'highlighter' | 'glow';
}

export interface DrawElement extends BaseElement {
  type: 'draw';
  paths: DrawPath[];
  w0: number; // size the paths were drawn at, so the element can scale
  h0: number;
}

export type ChartKind = 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut' | 'progress';

export interface ChartSeries {
  name: string;
  values: number[];
  color: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  kind: ChartKind;
  labels: string[];
  series: ChartSeries[];
  fontFamily: string;
  textColor: string;
  gridColor: string;
  showLegend: boolean;
  showValues: boolean;
  showGrid: boolean;
  rounded: number;
}

export interface QrElement extends BaseElement {
  type: 'qr';
  value: string;
  color: string;
  background: string;
  margin: number;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  cells: string[][];
  fontFamily: string;
  fontSize: number;
  textColor: string;
  headerFill: string;
  headerColor: string;
  bodyFill: string;
  stripeFill: string | null;
  lineColor: string;
  radius: number;
}

export type Element =
  | TextElement
  | ShapeElement
  | LineElement
  | ImageElement
  | SvgElement
  | DrawElement
  | ChartElement
  | QrElement
  | TableElement;

export type ElementType = Element['type'];

export type PageTransition = 'none' | 'fade' | 'slide' | 'zoom' | 'flip' | 'circle';

export interface Page {
  id: Id;
  name: string;
  background: Fill;
  elementIds: Id[]; // bottom to top
  notes: string;
  transition: PageTransition;
  duration: number; // seconds a page shows when playing as a video or autoplay
  hidden?: boolean; // skipped when presenting and exporting
}

export interface DesignMeta {
  id: Id;
  title: string;
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  createdAt: number;
  updatedAt: number;
  formatId?: string;
}

export interface Asset {
  id: Id;
  mime: string;
  width: number;
  height: number;
  name: string;
  bytes: Uint8Array;
  credit?: string;
}

// Plain snapshot of a whole design, used by renderers, exports and templates.
export interface DesignSnapshot {
  meta: DesignMeta;
  pageOrder: Id[];
  pages: Record<Id, Page>;
  elements: Record<Id, Element>;
}

export interface CommentReply {
  author: string;
  color: string;
  text: string;
  at: number;
}

// A pinned comment on a page, at a point in design units.
export interface Comment {
  id: Id;
  pageId: Id;
  x: number;
  y: number;
  author: string;
  color: string;
  text: string;
  at: number;
  resolved: boolean;
  replies: CommentReply[];
}

export interface BrandKit {
  colors: string[];
  fonts: { heading: string; subheading: string; body: string };
  logos: Id[];
}
