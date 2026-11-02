// The template kit: small helpers that write OpenTempl elements as plain JSON.
// Template sources live in templates/vibes/<vibe>.mjs and export an array of
// tpl(...) results; scripts/build-templates.mjs turns them into lazy packs in
// public/templates. Every helper takes design units (px at the page size) and
// an optional bag of overrides that is spread last, so anything in
// src/doc/types.ts can be set directly.

export const FORMATS = {
  post: { width: 1080, height: 1350, formatId: 'ig-post' },
  square: { width: 1080, height: 1080, formatId: 'ig-square' },
  story: { width: 1080, height: 1920, formatId: 'story' },
  poster: { width: 1123, height: 1587, formatId: 'a3-poster' },
  flyer: { width: 559, height: 794, formatId: 'a5-flyer' },
  a4: { width: 794, height: 1123, formatId: 'a4' },
  slide: { width: 1920, height: 1080, formatId: 'slides' },
  pin: { width: 1000, height: 1500, formatId: 'pinterest' },
  thumb: { width: 1280, height: 720, formatId: 'yt-thumb' },
  card: { width: 1004, height: 650, formatId: 'business-card' },
  postcard: { width: 559, height: 397, formatId: 'postcard' },
  invite: { width: 480, height: 673, formatId: 'invite' },
  banner: { width: 1200, height: 400, formatId: 'email-header' },
  cover: { width: 1640, height: 624, formatId: 'fb-cover' },
  og: { width: 1200, height: 630, formatId: 'og-image' },
};

export const NO_EFFECT = { kind: 'none', color: '#0B0B0D', amount: 50, offset: 50, direction: 45 };
export const NO_FILTERS = { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, blur: 0, vignette: 0, grain: 0, preset: 'none', duotone: null };

const base = { rotation: 0, opacity: 1 };

// Fills
export const solid = (color) => ({ type: 'solid', color });
export const linear = (angle, ...colors) => ({ type: 'linear', angle, stops: colors.map((c, i) => (typeof c === 'string' ? { offset: i / (colors.length - 1), color: c } : c)) });
export const radial = (...colors) => ({ type: 'radial', stops: colors.map((c, i) => (typeof c === 'string' ? { offset: i / (colors.length - 1), color: c } : c)) });
// kind: dots grid stripes diagonal checker waves crosses pixels
export const pattern = (kind, color, background, scale = 1) => ({ type: 'pattern', kind, color, background, scale });
// A library image as the page background: lib('tex/riso-grain.jpg')
export const imageFill = (path, p = {}) => ({ type: 'image', assetId: libId(path), fit: 'cover', opacity: 1, ...p });

const libId = (path) => (path.startsWith('lib:') ? path : `lib:${path}`);

// Text. h is estimated here; the editor refits text heights when a template opens.
export function T(text, x, y, w, p = {}) {
  const fontSize = p.size ?? p.fontSize ?? 32;
  const lineHeight = p.lh ?? p.lineHeight ?? 1.2;
  const { size, lh, weight, font, ls, upper, ...rest } = p;
  return {
    ...base,
    type: 'text',
    x, y, w,
    h: Math.ceil(fontSize * lineHeight * String(text).split('\n').length),
    text: String(text),
    fontFamily: font ?? p.fontFamily ?? 'Host Grotesk',
    fontSize,
    fontWeight: weight ?? p.fontWeight ?? 400,
    italic: false, underline: false, strike: false,
    color: '#0B0B0D',
    align: 'left',
    lineHeight,
    letterSpacing: ls ?? p.letterSpacing ?? 0,
    uppercase: upper ?? p.uppercase ?? false,
    list: 'none',
    effect: NO_EFFECT,
    curve: 0,
    ...rest,
  };
}

// Shapes: rect ellipse triangle diamond pentagon hexagon octagon star star4 burst heart
// arrow chevron cross speech arch pill blob flower squircle halfcircle ticket cloud
export function S(shape, x, y, w, h, fill, p = {}) {
  return {
    ...base,
    type: 'shape',
    shape,
    x, y, w, h,
    fill: typeof fill === 'string' ? solid(fill) : fill ?? solid('#0B0B0D'),
    stroke: null,
    radius: 0,
    ...p,
  };
}
export const rect = (x, y, w, h, fill, p) => S('rect', x, y, w, h, fill, p);
export const circle = (x, y, d, fill, p) => S('ellipse', x, y, d, d, fill, p);
export const stroke = (color, width = 2, dash = 'solid') => ({ color, width, dash });

// A free vector path drawn in its own box 0..w0 x 0..h0 (SVG path syntax), stretched to w x h.
export function path(d, x, y, w, h, fill, p = {}) {
  return S('path', x, y, w, h, fill, { path: d, w0: p.w0 ?? w, h0: p.h0 ?? h, ...p });
}

// Lines go from (x1,y1) to (x2,y2). caps: none arrow triangle circle square bar diamond
export function L(x1, y1, x2, y2, color = '#0B0B0D', width = 2, p = {}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const h = Math.max(24, width * 2);
  return {
    ...base,
    type: 'line',
    x: (x1 + x2) / 2 - len / 2,
    y: (y1 + y2) / 2 - h / 2,
    w: len, h,
    rotation: ((angle % 360) + 360) % 360,
    color, width, dash: 'solid', start: 'none', end: 'none', curve: 0,
    ...p,
  };
}

// Images from the bundled library (public/library/...). crop 'cover' is resolved
// at build time from the file's real size. mask can be any shape kind.
export function img(path, x, y, w, h, p = {}) {
  return {
    ...base,
    type: 'image',
    x, y, w, h,
    assetId: libId(path),
    crop: 'cover',
    filters: { ...NO_FILTERS, ...(p.filters ?? {}) },
    radius: 0,
    mask: null,
    border: null,
    ...p,
    ...(p.filters ? { filters: { ...NO_FILTERS, ...p.filters } } : {}),
  };
}
// An empty photo frame the user fills in.
export function frame(x, y, w, h, p = {}) {
  return { ...img('x', x, y, w, h, p), assetId: null, crop: { x: 0, y: 0, w: 1, h: 1 } };
}
// A texture laid over everything: img('tex/paper.jpg', ...) with a blend mode.
export function overlay(path, W, H, blend = 'multiply', opacity = 1, p = {}) {
  return img(path, 0, 0, W, H, { blend, opacity, name: 'Texture', ...p });
}

// Inline vector art: one <svg> with a viewBox. Colours in it can be recoloured in the editor.
export function svg(markup, x, y, w, h, p = {}) {
  return { ...base, type: 'svg', x, y, w, h, svg: markup.trim(), colors: {}, ...p };
}

export function qr(value, x, y, size, color = '#0B0B0D', background = '#FFFFFF', p = {}) {
  return { ...base, type: 'qr', x, y, w: size, h: size, value, color, background, margin: 1, ...p };
}

export function page(background, elements, p = {}) {
  return { background: typeof background === 'string' ? solid(background) : background, elements: elements.flat(Infinity).filter(Boolean), ...p };
}

// tpl({ id, name, format: 'post', category, tags, pages: [page(...)] })
export function tpl({ id, name, format, category, tags = [], pages, width, height, formatId }) {
  const f = FORMATS[format] ?? {};
  return {
    id,
    name,
    category: category ?? 'Design',
    tags,
    width: width ?? f.width,
    height: height ?? f.height,
    formatId: formatId ?? f.formatId,
    pages,
  };
}
