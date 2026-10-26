import { useEffect, useRef, useState } from 'react';

// The Tavla mark: a blank sheet with a folded corner and two pixel eyes that
// glance towards the pointer. Drawn on a 16 px grid like every icon.
export function Mark({ size = 28, follow = true, blink = true }: { size?: number; follow?: boolean; blink?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!follow) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      setLook({ x: Math.abs(dx) > 40 ? Math.sign(dx) : 0, y: Math.abs(dy) > 40 ? Math.sign(dy) : 0 });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [follow]);

  useEffect(() => {
    if (!blink) return;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        setClosed(true);
        window.setTimeout(() => setClosed(false), 120);
        loop();
      }, 2600 + Math.random() * 4200);
    };
    loop();
    return () => window.clearTimeout(t);
  }, [blink]);

  // Pupils are 1 x 2 pixels inside 2 x 3 eye whites; they shift one pixel.
  const px = Math.max(0, Math.min(1, 0.5 + look.x * 0.5));
  const py = look.y < 0 ? 0 : look.y > 0 ? 1 : 0.5;
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-label="Tavla">
      <path d="M2 1h9l3 3v11H2z" fill="#fff" />
      <path d="M2 1h9v1H3v12h10V5h1v10H2zM11 1h1v1h1v1h1v2h-1V4h-2z" fill="#0B0B0D" />
      <path d="M11 2v3h3v-1h-2V2z" fill="#0B0B0D" />
      {closed ? (
        <>
          <rect x="4.5" y="9" width="3" height="1" fill="#0B0B0D" />
          <rect x="8.5" y="9" width="3" height="1" fill="#0B0B0D" />
        </>
      ) : (
        <>
          <rect x={5 + px} y={7.5 + py} width="1.5" height="2" fill="#0B0B0D" />
          <rect x={9 + px} y={7.5 + py} width="1.5" height="2" fill="#0B0B0D" />
        </>
      )}
    </svg>
  );
}

// Wordmark set in the grotesk, tight, with the mark in front.
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.36, fontWeight: 600, fontSize: size, letterSpacing: '-0.04em' }}>
      <Mark size={size * 1.3} />
      tavla
    </span>
  );
}

// Eyes alone, for empty states and loaders.
export function Eyes({ size = 48, mood = 'look' }: { size?: number; mood?: 'look' | 'sleep' | 'happy' | 'wow' }) {
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      setLook({ x: (dx / d) * Math.min(1, d / 120), y: (dy / d) * Math.min(1, d / 120) });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  const w = size;
  const h = size * 0.5;
  return (
    <svg ref={ref} width={w} height={h} viewBox="0 0 40 20" aria-hidden>
      {[10, 30].map((cx) => (
        <g key={cx}>
          {mood === 'sleep' ? (
            <path d={`M${cx - 7} 10 q7 6 14 0`} fill="none" stroke="#0B0B0D" strokeWidth="2.4" strokeLinecap="round" />
          ) : mood === 'happy' ? (
            <path d={`M${cx - 7} 12 q7 -9 14 0`} fill="none" stroke="#0B0B0D" strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={cx} cy={10} rx={mood === 'wow' ? 8.6 : 8} ry={mood === 'wow' ? 9.6 : 9} fill="#fff" stroke="#0B0B0D" strokeWidth="2" />
              <circle cx={cx + look.x * 3.2} cy={10 + look.y * 3.6} r={mood === 'wow' ? 3 : 4} fill="#0B0B0D" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
