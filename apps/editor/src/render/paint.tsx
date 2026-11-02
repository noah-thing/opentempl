import type { Fill, ImageFilters } from '../doc/types';
import { COBALT } from '../doc/colors';

// Gradient and pattern definitions. Each paint gets an id derived from the
// element id so pages can be stacked into one SVG without collisions.

export function fillDef(id: string, fill: Fill, w: number, h: number, assetUrl: (id: string) => string | undefined) {
  if (fill.type === 'linear') {
    const a = ((fill.angle - 90) * Math.PI) / 180;
    const x = Math.cos(a) / 2;
    const y = Math.sin(a) / 2;
    return (
      <linearGradient id={id} x1={0.5 - x} y1={0.5 - y} x2={0.5 + x} y2={0.5 + y}>
        {fill.stops.map((s, i) => (
          <stop key={i} offset={s.offset} stopColor={s.color} />
        ))}
      </linearGradient>
    );
  }
  if (fill.type === 'radial') {
    return (
      <radialGradient id={id} cx="0.5" cy="0.5" r="0.7">
        {fill.stops.map((s, i) => (
          <stop key={i} offset={s.offset} stopColor={s.color} />
        ))}
      </radialGradient>
    );
  }
  if (fill.type === 'pattern') return patternDef(id, fill);
  if (fill.type === 'image') {
    const url = assetUrl(fill.assetId);
    if (!url) return null;
    if (fill.fit === 'tile') {
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width={Math.min(w, h) / 3} height={Math.min(w, h) / 3}>
          <image href={url} width={Math.min(w, h) / 3} height={Math.min(w, h) / 3} preserveAspectRatio="xMidYMid slice" opacity={fill.opacity} />
        </pattern>
      );
    }
    return (
      <pattern id={id} patternUnits="userSpaceOnUse" width={w} height={h}>
        <image
          href={url}
          width={w}
          height={h}
          preserveAspectRatio={fill.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
          opacity={fill.opacity}
        />
      </pattern>
    );
  }
  return null;
}

// Repeating patterns, drawn in a cell of `scale` design units.
export function patternDef(id: string, f: Extract<Fill, { type: 'pattern' }>) {
  const s = Math.max(4, f.scale);
  const c = f.color;
  let body: React.ReactNode = null;
  switch (f.kind) {
    case 'dots':
      body = <circle cx={s / 2} cy={s / 2} r={s * 0.18} fill={c} />;
      break;
    case 'grid':
      body = <path d={`M${s} 0 V${s} M0 ${s} H${s}`} stroke={c} strokeWidth={Math.max(1, s * 0.06)} fill="none" />;
      break;
    case 'stripes':
      body = <rect y={0} width={s} height={s / 2} fill={c} />;
      break;
    case 'diagonal':
      body = <path d={`M0 ${s} L${s} 0 M${-s / 2} ${s / 2} L${s / 2} ${-s / 2} M${s / 2} ${s * 1.5} L${s * 1.5} ${s / 2}`} stroke={c} strokeWidth={s * 0.18} />;
      break;
    case 'checker':
      body = (
        <>
          <rect width={s / 2} height={s / 2} fill={c} />
          <rect x={s / 2} y={s / 2} width={s / 2} height={s / 2} fill={c} />
        </>
      );
      break;
    case 'waves':
      body = <path d={`M0 ${s * 0.5} Q${s * 0.25} ${s * 0.2} ${s * 0.5} ${s * 0.5} T${s} ${s * 0.5}`} stroke={c} strokeWidth={s * 0.1} fill="none" />;
      break;
    case 'crosses':
      body = <path d={`M${s * 0.5} ${s * 0.3} V${s * 0.7} M${s * 0.3} ${s * 0.5} H${s * 0.7}`} stroke={c} strokeWidth={s * 0.08} strokeLinecap="round" />;
      break;
    case 'pixels':
      body = (
        <>
          <rect x={0} y={0} width={s / 4} height={s / 4} fill={c} />
          <rect x={s / 2} y={s / 4} width={s / 4} height={s / 4} fill={c} />
          <rect x={s / 4} y={s * 0.75} width={s / 4} height={s / 4} fill={c} />
        </>
      );
      break;
  }
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={s} height={s}>
      <rect width={s} height={s} fill={f.background} />
      {body}
    </pattern>
  );
}

export const PATTERNS: { kind: import('../doc/types').PatternKind; label: string }[] = [
  { kind: 'dots', label: 'Dots' },
  { kind: 'grid', label: 'Grid' },
  { kind: 'stripes', label: 'Stripes' },
  { kind: 'diagonal', label: 'Diagonal' },
  { kind: 'checker', label: 'Checker' },
  { kind: 'waves', label: 'Waves' },
  { kind: 'crosses', label: 'Crosses' },
  { kind: 'pixels', label: 'Pixels' },
];

export function fillRef(id: string, fill: Fill) {
  return fill.type === 'solid' ? fill.color : `url(#${id})`;
}

export function fillCss(fill: Fill): string {
  if (fill.type === 'solid') return fill.color;
  if (fill.type === 'linear')
    return `linear-gradient(${fill.angle}deg, ${fill.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`;
  if (fill.type === 'radial')
    return `radial-gradient(circle, ${fill.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`;
  if (fill.type === 'pattern') return fill.background;
  return '#ffffff';
}

// ---------- photo filters ----------

export const FILTER_PRESETS: Record<string, Partial<ImageFilters>> = {
  none: {},
  Fika: { temperature: 22, saturation: -8, contrast: 6, brightness: 4, grain: 18 },
  Skärgård: { temperature: -18, saturation: 10, contrast: 8, tint: -6 },
  Midnatt: { brightness: -14, contrast: 22, saturation: -30, temperature: -20, vignette: 40 },
  Kodak: { temperature: 16, contrast: 14, saturation: 18, grain: 26 },
  Tidning: { saturation: -100, contrast: 30, grain: 30 },
  Silver: { saturation: -100, brightness: 8, contrast: -6 },
  Neon: { saturation: 60, contrast: 18, tint: 20 },
  Mjölk: { brightness: 16, contrast: -22, saturation: -18 },
  Rost: { temperature: 40, tint: 10, saturation: 12, contrast: 10 },
  Frost: { temperature: -40, brightness: 10, saturation: -20 },
  Kiosk: { contrast: 34, saturation: 40, vignette: 30 },
};

export const DUOTONES: [string, string][] = [
  ['#0B0B0D', COBALT],
  [COBALT, '#FFE600'],
  ['#FF4B39', '#FFE9E2'],
  ['#1B1240', '#FF3C8E'],
  ['#0B3D2E', '#3EDD8A'],
  ['#3A2A00', '#FFE600'],
];

export function combinedFilters(f: ImageFilters): ImageFilters {
  const p = FILTER_PRESETS[f.preset] ?? {};
  const add = (k: keyof ImageFilters) => ((f[k] as number) ?? 0) + (((p[k] as number) ?? 0));
  return {
    ...f,
    brightness: add('brightness'),
    contrast: add('contrast'),
    saturation: add('saturation'),
    temperature: add('temperature'),
    tint: add('tint'),
    blur: add('blur'),
    vignette: add('vignette'),
    grain: add('grain'),
  };
}

export function filtersActive(f: ImageFilters) {
  const c = combinedFilters(f);
  return !!(c.brightness || c.contrast || c.saturation || c.temperature || c.tint || c.blur || c.duotone || c.grain);
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
}

export function ImageFilterDef({ id, filters, w, h }: { id: string; filters: ImageFilters; w: number; h: number }) {
  const c = combinedFilters(filters);
  const b = c.brightness / 100; // -1..1
  const k = 1 + c.contrast / 100; // 0..2
  const s = Math.max(0, 1 + c.saturation / 100);
  const t = c.temperature / 100;
  const tint = c.tint / 100;
  const intercept = 0.5 - 0.5 * k + b * 0.5;
  const blur = (c.blur / 100) * Math.min(w, h) * 0.04;
  return (
    <filter id={id} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values={String(s)} result="sat" />
      <feComponentTransfer in="sat" result="bc">
        <feFuncR type="linear" slope={k * (1 + t * 0.18)} intercept={intercept + t * 0.04} />
        <feFuncG type="linear" slope={k * (1 - tint * 0.12)} intercept={intercept + tint * -0.02} />
        <feFuncB type="linear" slope={k * (1 - t * 0.18)} intercept={intercept - t * 0.04} />
      </feComponentTransfer>
      {c.duotone ? (
        <>
          <feColorMatrix in="bc" type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" result="gray" />
          <feComponentTransfer in="gray" result="tone">
            {(['R', 'G', 'B'] as const).map((ch, i) => {
              const a = hexRgb(c.duotone![0])[i];
              const z = hexRgb(c.duotone![1])[i];
              const Fn = ch === 'R' ? 'feFuncR' : ch === 'G' ? 'feFuncG' : 'feFuncB';
              return <Fn key={ch} type="table" tableValues={`${a} ${z}`} />;
            })}
          </feComponentTransfer>
        </>
      ) : (
        <feOffset in="bc" dx="0" dy="0" result="tone" />
      )}
      {blur > 0 ? <feGaussianBlur in="tone" stdDeviation={blur} edgeMode="duplicate" result="blurred" /> : <feOffset in="tone" result="blurred" />}
      {c.grain > 0 ? (
        <>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values={`0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.33 0.33 0.33 0 ${-0.5 + (c.grain / 100) * 0.35}`} result="grainA" />
          <feComposite in="grainA" in2="blurred" operator="in" result="grainIn" />
          <feBlend in="grainIn" in2="blurred" mode="overlay" />
        </>
      ) : null}
    </filter>
  );
}
