import { useEffect, useRef } from 'react';
import { useEditor } from '../editor/Editor';
import { useUI } from '../editor/hooks';

// Rulers along the top and left of the workspace, measured in design units of
// the active page. Drag out of a ruler onto the page to place a guide; drag a
// guide back into the ruler to remove it.

const SIZE = 22;

function step(zoom: number) {
  const target = 70 / zoom; // roughly one labelled tick every 70 screen px
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  for (const m of [1, 2, 5, 10]) if (pow * m >= target) return pow * m;
  return pow * 10;
}

export function Rulers() {
  const editor = useEditor();
  const show = useUI((s) => s.showRulers);
  const zoom = useUI((s) => s.zoom);
  const active = useUI((s) => s.activePageId);
  const top = useRef<HTMLCanvasElement>(null);
  const left = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) return;
    let raf = 0;
    const draw = () => {
      const page = document.querySelector(`[data-page-id="${editor.state.activePageId}"]`) as HTMLElement | null;
      const t = top.current;
      const l = left.current;
      if (page && t && l) {
        const pr = page.getBoundingClientRect();
        const tr = t.getBoundingClientRect();
        const lr = l.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const z = editor.state.zoom;
        const st = step(z);
        for (const [c, horizontal, rect] of [
          [t, true, tr],
          [l, false, lr],
        ] as const) {
          const w = Math.round(rect.width * dpr);
          const h = Math.round(rect.height * dpr);
          if (c.width !== w || c.height !== h) {
            c.width = w;
            c.height = h;
          }
          const ctx = c.getContext('2d')!;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, rect.width, rect.height);
          // Highlight the page's extent.
          const origin = horizontal ? pr.left - rect.left : pr.top - rect.top;
          const extent = horizontal ? pr.width : pr.height;
          ctx.fillStyle = '#EDEDF0';
          if (horizontal) ctx.fillRect(origin, 0, extent, SIZE);
          else ctx.fillRect(0, origin, SIZE, extent);
          // Selection extent in cobalt.
          const b = editor.bounds();
          if (b && editor.state.selection.length && editor.s.elementPage[editor.state.selection[0]] === editor.state.activePageId) {
            ctx.fillStyle = 'rgba(43,59,255,0.18)';
            if (horizontal) ctx.fillRect(origin + b.x * z, 0, b.w * z, SIZE);
            else ctx.fillRect(0, origin + b.y * z, SIZE, b.h * z);
          }
          ctx.strokeStyle = '#8A8A96';
          ctx.fillStyle = '#4A4A55';
          ctx.font = '500 9.5px "Host Grotesk", sans-serif';
          ctx.lineWidth = 1;
          const len = horizontal ? rect.width : rect.height;
          const startUnit = Math.floor(-origin / z / st) * st;
          for (let u = startUnit; (origin + u * z) < len; u += st / 5) {
            const p = Math.round(origin + u * z) + 0.5;
            const major = Math.abs(u / st - Math.round(u / st)) < 1e-6;
            const tick = major ? 8 : 4;
            ctx.beginPath();
            if (horizontal) {
              ctx.moveTo(p, SIZE);
              ctx.lineTo(p, SIZE - tick);
            } else {
              ctx.moveTo(SIZE, p);
              ctx.lineTo(SIZE - tick, p);
            }
            ctx.stroke();
            if (major) {
              const label = String(Math.round(u));
              if (horizontal) ctx.fillText(label, p + 3, 10);
              else {
                ctx.save();
                ctx.translate(10, p - 3);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(label, 0, 0);
                ctx.restore();
              }
            }
          }
          ctx.fillStyle = '#DEDEE4';
          if (horizontal) ctx.fillRect(0, SIZE - 1, rect.width, 1);
          else ctx.fillRect(SIZE - 1, 0, 1, rect.height);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [show, editor, zoom, active]);

  if (!show) return null;

  const startGuide = (axis: 'x' | 'y') => (e: React.PointerEvent) => {
    const pageId = editor.state.activePageId;
    if (!pageId) return;
    e.preventDefault();
    const page = document.querySelector(`[data-page-id="${pageId}"]`) as HTMLElement;
    const existing = editor.state.pageGuides[pageId] ?? { x: [], y: [] };
    const idx = existing[axis].length;
    const move = (ev: PointerEvent) => {
      const r = page.getBoundingClientRect();
      const z = editor.state.zoom;
      const v = Math.round(axis === 'x' ? (ev.clientX - r.left) / z : (ev.clientY - r.top) / z);
      const cur = editor.state.pageGuides[pageId] ?? { x: [], y: [] };
      const list = cur[axis].slice();
      list[idx] = v;
      editor.ui.set({ pageGuides: { ...editor.state.pageGuides, [pageId]: { ...cur, [axis]: list } } });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const r = page.getBoundingClientRect();
      const inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (!inside) {
        const cur = editor.state.pageGuides[pageId] ?? { x: [], y: [] };
        editor.ui.set({ pageGuides: { ...editor.state.pageGuides, [pageId]: { ...cur, [axis]: cur[axis].filter((_, i) => i !== idx) } } });
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <>
      <canvas ref={top} className="ruler ruler-top" onPointerDown={startGuide('y')} title="Drag down to add a guide" />
      <canvas ref={left} className="ruler ruler-left" onPointerDown={startGuide('x')} title="Drag right to add a guide" />
      <button className="ruler-corner" title="Clear guides on this page" onClick={() => active && editor.ui.set({ pageGuides: { ...editor.state.pageGuides, [active]: { x: [], y: [] } } })} />
    </>
  );
}
