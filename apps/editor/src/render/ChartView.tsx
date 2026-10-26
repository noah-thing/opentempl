import type { ChartElement } from '../doc/types';

// Charts are drawn as plain SVG so they scale, export and print like any shape.

const PALETTE = ['#2B3BFF', '#FF4B39', '#FFE600', '#3EDD8A', '#FF3C8E', '#0AA0FF', '#9AA2EA', '#0B0B0D'];

function niceMax(v: number) {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * exp;
}

function fmt(v: number) {
  if (Math.abs(v) >= 1e6) return `${+(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `${+(v / 1e3).toFixed(1)}k`;
  return String(+v.toFixed(2));
}

export function ChartView({ el }: { el: ChartElement }) {
  const font = { fontFamily: `"${el.fontFamily}", sans-serif` };
  const fs = Math.max(10, Math.min(el.w, el.h) * 0.045);
  if (el.kind === 'pie' || el.kind === 'donut') return <Pie el={el} fs={fs} font={font} />;
  if (el.kind === 'progress') return <Progress el={el} fs={fs} font={font} />;

  const legendH = el.showLegend ? fs * 2.2 : 0;
  const left = fs * 3.2;
  const bottom = fs * 2.2;
  const top = legendH + fs * 0.5;
  const right = fs * 0.5;
  const pw = Math.max(10, el.w - left - right);
  const ph = Math.max(10, el.h - top - bottom);
  const all = el.series.flatMap((s) => s.values);
  const max = niceMax(Math.max(0, ...all));
  const ticks = 4;
  const n = el.labels.length;
  const horizontal = el.kind === 'bar';

  const grid = el.showGrid
    ? Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max / ticks) * i;
        if (horizontal) {
          const x = left + (pw * i) / ticks;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={top} y2={top + ph} stroke={el.gridColor} strokeWidth={1} />
              <text x={x} y={top + ph + fs * 1.4} fontSize={fs * 0.85} fill={el.textColor} opacity={0.6} textAnchor="middle" style={font}>
                {fmt(v)}
              </text>
            </g>
          );
        }
        const y = top + ph - (ph * i) / ticks;
        return (
          <g key={i}>
            <line x1={left} x2={left + pw} y1={y} y2={y} stroke={el.gridColor} strokeWidth={1} />
            <text x={left - fs * 0.5} y={y} fontSize={fs * 0.85} fill={el.textColor} opacity={0.6} textAnchor="end" dominantBaseline="central" style={font}>
              {fmt(v)}
            </text>
          </g>
        );
      })
    : null;

  let marks: React.ReactNode = null;
  if (el.kind === 'column' || el.kind === 'bar') {
    const groupSize = (horizontal ? ph : pw) / Math.max(1, n);
    const inner = groupSize * 0.72;
    const barSize = inner / Math.max(1, el.series.length);
    marks = el.series.map((s, si) =>
      s.values.slice(0, n).map((v, i) => {
        const len = (Math.max(0, v) / max) * (horizontal ? pw : ph);
        const along = i * groupSize + (groupSize - inner) / 2 + si * barSize;
        const r = Math.min(el.rounded, barSize / 2, len / 2);
        const color = s.color || PALETTE[si % PALETTE.length];
        return horizontal ? (
          <g key={`${si}-${i}`}>
            <rect x={left} y={top + along + barSize * 0.08} width={len} height={barSize * 0.84} rx={r} fill={color} />
            {el.showValues ? (
              <text x={left + len + fs * 0.4} y={top + along + barSize / 2} fontSize={fs * 0.85} fill={el.textColor} dominantBaseline="central" style={font}>
                {fmt(v)}
              </text>
            ) : null}
          </g>
        ) : (
          <g key={`${si}-${i}`}>
            <rect x={left + along + barSize * 0.08} y={top + ph - len} width={barSize * 0.84} height={len} rx={r} fill={color} />
            {el.showValues ? (
              <text x={left + along + barSize / 2} y={top + ph - len - fs * 0.4} fontSize={fs * 0.85} fill={el.textColor} textAnchor="middle" style={font}>
                {fmt(v)}
              </text>
            ) : null}
          </g>
        );
      }),
    );
  } else {
    const step = pw / Math.max(1, n - 1);
    marks = el.series.map((s, si) => {
      const pts = s.values.slice(0, n).map((v, i) => [left + i * step, top + ph - (Math.max(0, v) / max) * ph] as const);
      if (!pts.length) return null;
      const color = s.color || PALETTE[si % PALETTE.length];
      // Smooth curve through the points (Catmull-Rom to Bezier).
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
      }
      return (
        <g key={si}>
          {el.kind === 'area' ? (
            <path d={`${d} L${pts[pts.length - 1][0]} ${top + ph} L${pts[0][0]} ${top + ph} Z`} fill={color} opacity={0.22} />
          ) : null}
          <path d={d} fill="none" stroke={color} strokeWidth={Math.max(2, fs * 0.22)} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={Math.max(3, fs * 0.28)} fill="#fff" stroke={color} strokeWidth={Math.max(2, fs * 0.18)} />
              {el.showValues ? (
                <text x={x} y={y - fs * 0.8} fontSize={fs * 0.85} fill={el.textColor} textAnchor="middle" style={font}>
                  {fmt(s.values[i])}
                </text>
              ) : null}
            </g>
          ))}
        </g>
      );
    });
  }

  const labels = el.labels.map((l, i) => {
    if (horizontal) {
      const groupSize = ph / Math.max(1, n);
      return (
        <text key={i} x={left - fs * 0.5} y={top + i * groupSize + groupSize / 2} fontSize={fs * 0.9} fill={el.textColor} textAnchor="end" dominantBaseline="central" style={font}>
          {l}
        </text>
      );
    }
    const x = el.kind === 'column' ? left + (pw / Math.max(1, n)) * (i + 0.5) : left + (pw / Math.max(1, n - 1)) * i;
    return (
      <text key={i} x={x} y={top + ph + fs * 1.4} fontSize={fs * 0.9} fill={el.textColor} textAnchor="middle" style={font}>
        {l}
      </text>
    );
  });

  return (
    <>
      <rect width={el.w} height={el.h} fill="transparent" />
      {el.showLegend ? <Legend el={el} fs={fs} font={font} names={el.series.map((s) => s.name)} colors={el.series.map((s, i) => s.color || PALETTE[i % PALETTE.length])} /> : null}
      {grid}
      {!el.showGrid ? <line x1={left} x2={horizontal ? left : left + pw} y1={horizontal ? top : top + ph} y2={top + ph} stroke={el.gridColor} /> : null}
      {marks}
      {labels}
    </>
  );
}

function Legend({ el, fs, font, names, colors }: { el: ChartElement; fs: number; font: React.CSSProperties; names: string[]; colors: string[] }) {
  let x = 0;
  return (
    <g>
      {names.map((n, i) => {
        const gx = x;
        x += n.length * fs * 0.6 + fs * 2.4;
        return (
          <g key={i} transform={`translate(${gx} ${fs * 0.4})`}>
            <rect width={fs * 0.9} height={fs * 0.9} rx={fs * 0.22} fill={colors[i]} />
            <text x={fs * 1.3} y={fs * 0.45} fontSize={fs * 0.9} fill={el.textColor} dominantBaseline="central" style={font}>
              {n}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
}

function Pie({ el, fs, font }: { el: ChartElement; fs: number; font: React.CSSProperties }) {
  const values = el.series[0]?.values ?? [];
  const total = values.reduce((a, b) => a + Math.max(0, b), 0) || 1;
  const legendW = el.showLegend ? Math.min(el.w * 0.42, fs * 9) : 0;
  const size = Math.min(el.w - legendW, el.h);
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = el.h / 2;
  let a = -Math.PI / 2;
  const colors = el.labels.map((_, i) => (i === 0 ? el.series[0]?.color ?? PALETTE[0] : PALETTE[i % PALETTE.length]));
  return (
    <>
      <rect width={el.w} height={el.h} fill="transparent" />
      <defs>
        <mask id={`donut-${el.id}`}>
          <rect width={el.w} height={el.h} fill="#fff" />
          {el.kind === 'donut' ? <circle cx={cx} cy={cy} r={r * 0.58} fill="#000" /> : null}
        </mask>
      </defs>
      <g mask={`url(#donut-${el.id})`}>
        {values.map((v, i) => {
          const a0 = a;
          const a1 = a + (Math.max(0, v) / total) * Math.PI * 2;
          a = a1;
          if (a1 - a0 >= Math.PI * 2 - 0.0001) return <circle key={i} cx={cx} cy={cy} r={r} fill={colors[i]} />;
          return <path key={i} d={arc(cx, cy, r, a0, a1)} fill={colors[i]} stroke="#fff" strokeWidth={Math.max(1, r * 0.015)} />;
        })}
      </g>
      {el.showLegend
        ? el.labels.map((l, i) => (
            <g key={i} transform={`translate(${size + fs} ${cy - (el.labels.length * fs * 1.6) / 2 + i * fs * 1.6})`}>
              <rect width={fs * 0.9} height={fs * 0.9} rx={fs * 0.45} fill={colors[i]} />
              <text x={fs * 1.3} y={fs * 0.45} fontSize={fs * 0.9} fill={el.textColor} dominantBaseline="central" style={font}>
                {l}
                {el.showValues ? `  ${Math.round(((values[i] ?? 0) / total) * 100)}%` : ''}
              </text>
            </g>
          ))
        : null}
    </>
  );
}

function Progress({ el, fs, font }: { el: ChartElement; fs: number; font: React.CSSProperties }) {
  const v = Math.max(0, Math.min(100, el.series[0]?.values[0] ?? 0));
  const size = Math.min(el.w, el.h);
  const sw = size * 0.1;
  const r = size / 2 - sw / 2;
  const c = 2 * Math.PI * r;
  return (
    <>
      <rect width={el.w} height={el.h} fill="transparent" />
      <g transform={`translate(${el.w / 2} ${el.h / 2}) rotate(-90)`}>
        <circle r={r} fill="none" stroke={el.gridColor} strokeWidth={sw} />
        <circle r={r} fill="none" stroke={el.series[0]?.color ?? PALETTE[0]} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} />
      </g>
      <text x={el.w / 2} y={el.h / 2} fontSize={size * 0.22} fontWeight={600} fill={el.textColor} textAnchor="middle" dominantBaseline="central" style={font}>
        {Math.round(v)}%
      </text>
      <text x={el.w / 2} y={el.h / 2 + size * 0.17} fontSize={fs} fill={el.textColor} opacity={0.6} textAnchor="middle" style={font}>
        {el.labels[0] ?? ''}
      </text>
    </>
  );
}
