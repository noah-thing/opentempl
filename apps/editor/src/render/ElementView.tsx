import { memo, useMemo } from 'react';
import QRCode from 'qrcode';
import type {
  ChartElement,
  DrawElement,
  Element,
  ImageElement,
  LineCap,
  LineElement,
  QrElement,
  ShapeElement,
  SvgElement,
  TableElement,
  TextElement,
} from '../doc/types';
import { layoutText } from '../text/layout';
import { ImageFilterDef, fillDef, fillRef, filtersActive, combinedFilters } from './paint';
import { useRenderEnv } from './RenderContext';
import { shapePath } from './shapes';
import { ChartView } from './ChartView';
import { animState } from './animate';

export const ElementView = memo(function ElementView({ el }: { el: Element }) {
  const env = useRenderEnv();
  if (el.hidden && env.mode !== 'thumb') return null;
  if (env.hiddenIds?.has(el.id)) return null;
  const uid = (env.idPrefix ?? '') + el.id;
  const cx = el.w / 2;
  const cy = el.h / 2;
  const sx = el.flipX ? -1 : 1;
  const sy = el.flipY ? -1 : 1;
  const transform =
    `translate(${el.x} ${el.y})` +
    (el.rotation ? ` rotate(${el.rotation} ${cx} ${cy})` : '') +
    (el.flipX || el.flipY ? ` translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})` : '');
  const filterId = el.shadow || el.blur ? `fx-${uid}` : undefined;
  const st = env.time !== undefined && el.anim && el.anim.kind !== 'none' ? animState(el.anim, env.time) : null;
  const animTransform = st
    ? `translate(${st.tx * el.w} ${st.ty * el.h}) translate(${cx} ${cy}) rotate(${st.rotate}) scale(${st.scale}) translate(${-cx} ${-cy})`
    : undefined;
  const revealId = st && st.reveal < 1 ? `rv-${uid}` : undefined;

  return (
    <g
      transform={transform}
      opacity={el.opacity}
      style={el.blend ? { mixBlendMode: el.blend as React.CSSProperties['mixBlendMode'] } : undefined}
      data-id={el.id}
      role={el.alt ? 'img' : undefined}
      aria-label={el.alt || undefined}
    >
      {el.alt ? <title>{el.alt}</title> : null}
      {filterId ? (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {el.blur ? <feGaussianBlur stdDeviation={el.blur} /> : null}
            {el.shadow ? (
              <feDropShadow dx={el.shadow.x} dy={el.shadow.y} stdDeviation={el.shadow.blur / 2} floodColor={el.shadow.color} floodOpacity={1} />
            ) : null}
          </filter>
        </defs>
      ) : null}
      {revealId ? (
        <defs>
          <clipPath id={revealId}>
            <rect x={-el.w} y={-el.h} width={el.w + el.w * 2 * st!.reveal} height={el.h * 3} />
          </clipPath>
        </defs>
      ) : null}
      <g
        transform={animTransform}
        opacity={st ? st.opacity : undefined}
        clipPath={revealId ? `url(#${revealId})` : undefined}
        style={st && st.blur > 0.1 ? { filter: `blur(${st.blur}px)` } : undefined}
      >
        <g filter={filterId ? `url(#${filterId})` : undefined}>
          <Body el={el} uid={uid} />
        </g>
      </g>
    </g>
  );
});

function Body({ el, uid }: { el: Element; uid: string }) {
  switch (el.type) {
    case 'text':
      return <TextView el={el} uid={uid} />;
    case 'shape':
      return <ShapeView el={el} uid={uid} />;
    case 'line':
      return <LineView el={el} />;
    case 'image':
      return <ImageView el={el} uid={uid} />;
    case 'svg':
      return <SvgView el={el} />;
    case 'draw':
      return <DrawView el={el} uid={uid} />;
    case 'chart':
      return <ChartView el={el as ChartElement} />;
    case 'qr':
      return <QrView el={el} />;
    case 'table':
      return <TableView el={el} />;
    default:
      return null;
  }
}

// ---------------- shapes ----------------

function ShapeView({ el, uid }: { el: ShapeElement; uid: string }) {
  const env = useRenderEnv();
  const d = shapePath(el.shape, el.w, el.h, el.radius);
  const fid = `fill-${uid}`;
  const stroke = el.stroke && el.stroke.width > 0 ? el.stroke : null;
  const clip = `clip-${uid}`;
  return (
    <>
      <defs>
        {fillDef(fid, el.fill, el.w, el.h, env.assetUrl)}
        {stroke ? (
          <clipPath id={clip}>
            <path d={d} />
          </clipPath>
        ) : null}
      </defs>
      <path d={d} fill={fillRef(fid, el.fill)} />
      {stroke ? (
        // Stroke drawn twice as wide and clipped so it sits inside the shape, like Canva borders.
        <path
          d={d}
          fill="none"
          stroke={stroke.color}
          strokeWidth={stroke.width * 2}
          clipPath={`url(#${clip})`}
          strokeDasharray={dashArray(stroke.dash, stroke.width)}
          strokeLinecap={stroke.dash === 'dot' ? 'round' : 'butt'}
        />
      ) : null}
    </>
  );
}

function dashArray(dash: 'solid' | 'dash' | 'dot', width: number) {
  if (dash === 'dash') return `${width * 3} ${width * 2}`;
  if (dash === 'dot') return `0.01 ${width * 2}`;
  return undefined;
}

// ---------------- lines ----------------

function capPath(cap: LineCap, x: number, y: number, angle: number, width: number, color: string, key: string) {
  if (cap === 'none') return null;
  const s = Math.max(width * 3.2, 10);
  const t = `translate(${x} ${y}) rotate(${(angle * 180) / Math.PI})`;
  switch (cap) {
    case 'arrow':
      return <path key={key} transform={t} d={`M${-s} ${-s * 0.6} L0 0 L${-s} ${s * 0.6}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
    case 'triangle':
      return <path key={key} transform={t} d={`M${-s * 1.1} ${-s * 0.62} L${width * 0.3} 0 L${-s * 1.1} ${s * 0.62} Z`} fill={color} />;
    case 'circle':
      return <circle key={key} transform={t} r={s * 0.5} fill={color} />;
    case 'square':
      return <rect key={key} transform={t} x={-s * 0.5} y={-s * 0.5} width={s} height={s} fill={color} />;
    case 'diamond':
      return <path key={key} transform={t} d={`M${-s * 0.6} 0 L0 ${-s * 0.6} L${s * 0.6} 0 L0 ${s * 0.6} Z`} fill={color} />;
    case 'bar':
      return <rect key={key} transform={t} x={-width / 2} y={-s * 0.6} width={width} height={s * 1.2} fill={color} />;
  }
  return null;
}

function LineView({ el }: { el: LineElement }) {
  const y = el.h / 2;
  const bend = (el.curve / 100) * el.w * 0.5;
  const d = el.curve ? `M0 ${y} Q${el.w / 2} ${y - bend * 2} ${el.w} ${y}` : `M0 ${y} L${el.w} ${y}`;
  // Tangent directions at the ends, pointing outward.
  const aEnd = Math.atan2(y - (y - bend * 2), el.w - el.w / 2);
  const aStart = Math.atan2(y - (y - bend * 2), 0 - el.w / 2);
  const inset = (cap: LineCap) => (cap === 'triangle' ? el.width * 2 : 0);
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={el.color}
        strokeWidth={el.width}
        strokeLinecap={el.dash === 'dot' ? 'round' : el.start === 'none' && el.end === 'none' ? 'round' : 'butt'}
        strokeDasharray={dashArray(el.dash, el.width)}
        style={{ strokeDashoffset: 0 }}
        pathLength={el.dash === 'solid' ? undefined : undefined}
        strokeOpacity={1}
        transform={inset(el.start) || inset(el.end) ? undefined : undefined}
      />
      <rect x={0} y={0} width={el.w} height={el.h} fill="transparent" />
      {capPath(el.start, 0, y, el.curve ? aStart : Math.PI, el.width, el.color, 's')}
      {capPath(el.end, el.w, y, el.curve ? aEnd : 0, el.width, el.color, 'e')}
    </>
  );
}

// ---------------- images ----------------

function ImageView({ el, uid }: { el: ImageElement; uid: string }) {
  const env = useRenderEnv();
  const url = env.assetUrl(el.assetId);
  const clipId = `clip-${uid}`;
  const d = el.mask ? shapePath(el.mask, el.w, el.h, el.radius) : shapePath('rect', el.w, el.h, el.radius);
  const filterId = `img-${uid}`;
  const active = filtersActive(el.filters);
  const c = combinedFilters(el.filters);
  const iw = el.w / el.crop.w;
  const ih = el.h / el.crop.h;
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
        {active ? <ImageFilterDef id={filterId} filters={el.filters} w={el.w} h={el.h} /> : null}
        {c.vignette > 0 ? (
          <radialGradient id={`vig-${uid}`} cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.45" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity={Math.min(0.9, c.vignette / 100)} />
          </radialGradient>
        ) : null}
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {url ? (
          <g filter={active ? `url(#${filterId})` : undefined}>
            <image
              href={url}
              x={-el.crop.x * iw}
              y={-el.crop.y * ih}
              width={iw}
              height={ih}
              preserveAspectRatio="none"
            />
          </g>
        ) : (
          <EmptyFrame w={el.w} h={el.h} />
        )}
        {c.vignette > 0 ? <rect width={el.w} height={el.h} fill={`url(#vig-${uid})`} /> : null}
      </g>
      {el.border && el.border.width > 0 ? (
        <path d={d} fill="none" stroke={el.border.color} strokeWidth={el.border.width * 2} clipPath={`url(#${clipId})`} strokeDasharray={dashArray(el.border.dash, el.border.width)} />
      ) : null}
    </>
  );
}

function EmptyFrame({ w, h }: { w: number; h: number }) {
  const env = useRenderEnv();
  const s = Math.min(w, h);
  return (
    <>
      <rect width={w} height={h} fill="#E4E4EA" />
      {env.mode === 'edit' ? (
        <g transform={`translate(${w / 2 - s * 0.12} ${h / 2 - s * 0.09}) scale(${(s * 0.24) / 24})`} fill="#A6A6B2">
          {/* pixel landscape glyph */}
          <path d="M2 4h20v2H2zM2 6h2v12H2zM20 6h2v12h-2zM2 18h20v2H2zM15 8h3v3h-3zM5 16l4-5 3 3 2-2 4 4z" />
        </g>
      ) : null}
    </>
  );
}

// ---------------- svg graphics ----------------

const svgCache = new Map<string, { viewBox: string; inner: string; colors: string[] }>();

export function parseSvg(svg: string) {
  let hit = svgCache.get(svg);
  if (hit) return hit;
  const vb = svg.match(/viewBox\s*=\s*"([^"]+)"/i)?.[1];
  const w = svg.match(/\swidth\s*=\s*"([\d.]+)/i)?.[1];
  const h = svg.match(/\sheight\s*=\s*"([\d.]+)/i)?.[1];
  const viewBox = vb ?? `0 0 ${w ?? 24} ${h ?? 24}`;
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/i, '').replace(/<\/svg>\s*$/i, '');
  const colors = [
    ...new Set(
      [...inner.matchAll(/(?:fill|stroke|stop-color)\s*[:=]\s*"?\s*(#[0-9a-fA-F]{3,8}|currentColor)/g)].map((m) =>
        m[1].toLowerCase() === 'currentcolor' ? 'currentColor' : m[1].toUpperCase(),
      ),
    ),
  ];
  hit = { viewBox, inner, colors };
  svgCache.set(svg, hit);
  return hit;
}

function SvgView({ el }: { el: SvgElement }) {
  const parsed = parseSvg(el.svg);
  const inner = useMemo(() => {
    let out = parsed.inner;
    for (const [from, to] of Object.entries(el.colors)) {
      if (from === 'currentColor') continue;
      out = out.replace(new RegExp(from.replace('#', '#?') + '(?![0-9a-fA-F])', 'gi'), to);
    }
    return out;
  }, [parsed.inner, el.colors]);
  const current = el.colors.currentColor ?? '#0B0B0D';
  return (
    <svg
      width={el.w}
      height={el.h}
      viewBox={parsed.viewBox}
      preserveAspectRatio="none"
      style={{ color: current, overflow: 'visible' }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

// ---------------- freehand drawing ----------------

function DrawView({ el, uid }: { el: DrawElement; uid: string }) {
  const s = `scale(${el.w / Math.max(1, el.w0)} ${el.h / Math.max(1, el.h0)})`;
  return (
    <g transform={s}>
      <defs>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {el.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke={p.color}
          strokeWidth={p.width}
          strokeLinecap={p.tool === 'highlighter' ? 'square' : 'round'}
          strokeLinejoin="round"
          strokeOpacity={p.tool === 'highlighter' ? 0.42 : 1}
          filter={p.tool === 'glow' ? `url(#glow-${uid})` : undefined}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <rect width={el.w0} height={el.h0} fill="transparent" />
    </g>
  );
}

// ---------------- QR codes ----------------

const qrCache = new Map<string, { d: string; size: number }>();

function qrPath(value: string) {
  let hit = qrCache.get(value);
  if (hit) return hit;
  try {
    const qr = QRCode.create(value || ' ', { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    let d = '';
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) if (qr.modules.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
    hit = { d, size };
  } catch {
    hit = { d: '', size: 21 };
  }
  qrCache.set(value, hit);
  return hit;
}

function QrView({ el }: { el: QrElement }) {
  const { d, size } = qrPath(el.value);
  const total = size + el.margin * 2;
  return (
    <svg width={el.w} height={el.h} viewBox={`${-el.margin} ${-el.margin} ${total} ${total}`} shapeRendering="crispEdges">
      <rect x={-el.margin} y={-el.margin} width={total} height={total} fill={el.background} />
      <path d={d} fill={el.color} />
    </svg>
  );
}

// ---------------- tables ----------------

function TableView({ el }: { el: TableElement }) {
  const cw = el.w / el.cols;
  const rh = el.h / el.rows;
  const pad = Math.min(16, cw * 0.1);
  const clip = `tbl-${el.id}`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d={shapePath('rect', el.w, el.h, el.radius)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {Array.from({ length: el.rows }, (_, r) => (
          <rect
            key={r}
            x={0}
            y={r * rh}
            width={el.w}
            height={rh}
            fill={r === 0 ? el.headerFill : el.stripeFill && r % 2 === 0 ? el.stripeFill : el.bodyFill}
          />
        ))}
        {Array.from({ length: el.cols - 1 }, (_, c) => (
          <line key={`c${c}`} x1={(c + 1) * cw} x2={(c + 1) * cw} y1={0} y2={el.h} stroke={el.lineColor} strokeWidth={1} />
        ))}
        {Array.from({ length: el.rows - 1 }, (_, r) => (
          <line key={`r${r}`} x1={0} x2={el.w} y1={(r + 1) * rh} y2={(r + 1) * rh} stroke={el.lineColor} strokeWidth={1} />
        ))}
        {el.cells.map((row, r) =>
          row.map((cell, c) => (
            <text
              key={`${r}-${c}`}
              x={c * cw + pad}
              y={r * rh + rh / 2}
              dominantBaseline="central"
              fontFamily={`"${el.fontFamily}", sans-serif`}
              fontSize={el.fontSize}
              fontWeight={r === 0 ? 600 : 400}
              fill={r === 0 ? el.headerColor : el.textColor}
            >
              {cell}
            </text>
          )),
        )}
      </g>
      <path d={shapePath('rect', el.w, el.h, el.radius)} fill="none" stroke={el.lineColor} strokeWidth={1} />
    </>
  );
}

// ---------------- text ----------------

function TextView({ el, uid }: { el: TextElement; uid: string }) {
  const env = useRenderEnv();
  const layout = layoutText(el, env.fontsVersion);
  const gradId = `tg-${uid}`;
  const fill = el.gradient && el.gradient.type !== 'solid' ? `url(#${gradId})` : el.color;
  const font = {
    fontFamily: `"${el.fontFamily}", "Host Grotesk", sans-serif`,
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    fontStyle: el.italic ? 'italic' : 'normal',
    letterSpacing: `${(el.letterSpacing / 1000) * el.fontSize}px`,
  };
  const fx = el.effect;
  const amt = fx.amount / 100;
  const off = (fx.offset / 100) * el.fontSize * 0.18;
  const dir = (fx.direction * Math.PI) / 180;
  const dx = Math.cos(dir) * off;
  const dy = Math.sin(dir) * off;

  if (el.curve) return <CurvedText el={el} fill={fill} gradId={gradId} font={font} />;

  const lines = (key: string, props: React.SVGProps<SVGTextElement> & { dx0?: number; dy0?: number } = {}) => {
    const { dx0 = 0, dy0 = 0, ...rest } = props;
    return (
      <text key={key} style={font} {...rest} xmlSpace="preserve">
        {layout.lines.map((ln, i) =>
          ln.words ? (
            ln.words.map((w, j) => (
              <tspan key={`${i}-${j}`} x={w.x + dx0} y={ln.y + dy0}>
                {w.text}
              </tspan>
            ))
          ) : (
            <tspan key={i} x={ln.x + dx0} y={ln.y + dy0}>
              {ln.text || ' '}
            </tspan>
          ),
        )}
        {layout.lines.map((ln, i) =>
          ln.prefix ? (
            <tspan key={`p${i}`} x={(ln.prefixX ?? 0) + dx0} y={ln.y + dy0}>
              {ln.prefix}
            </tspan>
          ) : null,
        )}
      </text>
    );
  };

  const decorations = (color: string) =>
    el.underline || el.strike
      ? layout.lines.map((ln, i) => (
          <g key={`d${i}`}>
            {el.underline ? <rect x={ln.x} y={ln.y + el.fontSize * 0.1} width={ln.width} height={Math.max(1, el.fontSize * 0.06)} fill={color} /> : null}
            {el.strike ? <rect x={ln.x} y={ln.y - el.fontSize * 0.3} width={ln.width} height={Math.max(1, el.fontSize * 0.06)} fill={color} /> : null}
          </g>
        ))
      : null;

  const layers: React.ReactNode[] = [];
  switch (fx.kind) {
    case 'shadow':
      layers.push(
        lines('sh', { fill: fx.color, opacity: 0.35 + amt * 0.5, dx0: dx, dy0: dy, filter: `url(#blur-${uid})` }),
      );
      break;
    case 'lift':
      layers.push(lines('lift', { fill: '#000', opacity: 0.18 + amt * 0.3, dy0: el.fontSize * 0.06, filter: `url(#lift-${uid})` }));
      break;
    case 'echo':
      for (let i = 3; i >= 1; i--)
        layers.push(lines(`e${i}`, { fill: fx.color, opacity: 0.18 + (0.5 * (4 - i)) / 4, dx0: dx * i, dy0: dy * i }));
      break;
    case 'glitch':
      layers.push(lines('g1', { fill: '#00E5FF', dx0: -off * 0.8, dy0: 0 }));
      layers.push(lines('g2', { fill: '#FF2BD6', dx0: off * 0.8, dy0: 0 }));
      break;
    case 'splice':
      layers.push(lines('sp', { fill: fx.color, dx0: dx, dy0: dy }));
      break;
    case 'neon':
      layers.push(lines('n1', { fill: fx.color, filter: `url(#neon-${uid})`, opacity: 0.6 + amt * 0.4 }));
      break;
    case 'highlight':
      layers.push(
        <g key="hl">
          {layout.lines.map((ln, i) =>
            ln.text ? (
              <rect
                key={i}
                x={ln.x - el.fontSize * 0.18}
                y={ln.top + (layout.lineBox - el.fontSize * 1.18) / 2}
                width={ln.width + el.fontSize * 0.36}
                height={el.fontSize * 1.18}
                rx={el.fontSize * 0.12 * (0.5 + amt)}
                fill={fx.color}
              />
            ) : null,
          )}
        </g>,
      );
      break;
  }

  const strokeW = (Math.max(0.5, amt * 8) * el.fontSize) / 100;
  let main: React.ReactNode;
  if (fx.kind === 'hollow' || fx.kind === 'splice') {
    main = lines('main', { fill: fx.kind === 'splice' ? 'none' : 'none', stroke: el.color, strokeWidth: strokeW, strokeLinejoin: 'round' });
  } else if (fx.kind === 'outline') {
    main = lines('main', { fill, stroke: fx.color, strokeWidth: strokeW * 2, strokeLinejoin: 'round', paintOrder: 'stroke' });
  } else if (fx.kind === 'neon') {
    main = lines('main', { fill: '#FFFFFF' });
  } else {
    main = lines('main', { fill });
  }

  return (
    <>
      <defs>
        {el.gradient && el.gradient.type !== 'solid' ? fillDef(gradId, el.gradient, el.w, layout.height, env.assetUrl) : null}
        {fx.kind === 'shadow' ? (
          <filter id={`blur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={(fx.amount / 100) * el.fontSize * 0.08} />
          </filter>
        ) : null}
        {fx.kind === 'lift' ? (
          <filter id={`lift-${uid}`} x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur stdDeviation={el.fontSize * 0.08} />
          </filter>
        ) : null}
        {fx.kind === 'neon' ? (
          <filter id={`neon-${uid}`} x="-40%" y="-60%" width="180%" height="220%">
            <feGaussianBlur stdDeviation={el.fontSize * 0.06} result="a" />
            <feGaussianBlur stdDeviation={el.fontSize * 0.18} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="a" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ) : null}
      </defs>
      <rect width={el.w} height={el.h} fill="transparent" />
      {layers}
      {main}
      {decorations(el.color)}
    </>
  );
}

// Curved text: one line along an arc. Positive curve bends up (smile upside down),
// negative bends down.
export function curvedGeometry(el: Pick<TextElement, 'curve' | 'fontSize'>, textWidth: number) {
  const span = Math.min(Math.abs(el.curve) / 100, 0.98) * Math.PI * 2;
  // Text on the inside of a circle needs extra room so letters do not collide.
  const inner = el.curve < 0 ? el.fontSize * 0.9 : 0;
  const r = Math.max(textWidth / Math.max(span, 0.01), el.fontSize) + inner;
  const half = span / 2;
  const outer = r + (el.curve > 0 ? el.fontSize : 0);
  const chordW = span >= Math.PI ? 2 * outer : 2 * outer * Math.sin(half);
  const sag = outer - (el.curve > 0 ? r : outer) * Math.cos(Math.min(half, Math.PI));
  return { r, span, w: chordW + el.fontSize * 0.6, h: sag + el.fontSize * 1.3 };
}

function CurvedText({ el, fill, gradId, font }: { el: TextElement; fill: string; gradId: string; font: React.CSSProperties }) {
  const env = useRenderEnv();
  const layout = layoutText({ ...el, w: 100000, list: 'none' }, env.fontsVersion);
  const text = layout.lines.map((l) => l.text).join(' ');
  const width = layout.maxLineWidth;
  const { r } = curvedGeometry(el, width);
  const up = el.curve > 0;
  const cx = el.w / 2;
  // Baseline circle: for an upward curve the text sits on top of the circle.
  const cy = up ? el.fontSize * 1.1 + r : el.h - el.fontSize * 0.35 - r;
  const pathId = `cp-${(env.idPrefix ?? '') + el.id}`;
  const d = up
    ? `M${cx} ${cy + r} A${r} ${r} 0 1 1 ${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx} ${cy + r}`
    : `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r} ${r} 0 1 0 ${cx} ${cy - r}`;
  return (
    <>
      <defs>
        <path id={pathId} d={d} />
        {el.gradient && el.gradient.type !== 'solid' ? fillDef(gradId, el.gradient, el.w, el.h, env.assetUrl) : null}
      </defs>
      <rect width={el.w} height={el.h} fill="transparent" />
      <text style={font} fill={fill} xmlSpace="preserve">
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {el.uppercase ? text.toUpperCase() : text}
        </textPath>
      </text>
    </>
  );
}
