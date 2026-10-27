import { useEffect, useRef, useState } from 'react';
import type { Id, PenNode, ShapeElement } from '../doc/types';
import { makeShape } from '../doc/factory';
import { useEditor } from '../editor/Editor';
import { startDrag } from '../editor/hooks';
import type { Point } from '../lib/geom';
import { pathBounds } from '../lib/pathops';
import { inHandle, penPath } from '../render/shapes';

// The pen: click for a corner, drag for a curve, click the first point (or
// press Enter) to close the shape. Backspace takes the last point back.
// With `penEditId` set it edits an existing path instead: drag anchors and
// handles, Enter or a click outside finishes.

interface Props {
  pageId: Id;
  zoom: number;
  W: number;
  H: number;
  toLocal: (x: number, y: number) => Point;
}

export function PenLayer({ pageId, zoom, W, H, toLocal }: Props) {
  const editor = useEditor();
  const editId = editor.state.penEditId;
  const editing = editId ? (editor.s.elements[editId] as ShapeElement | undefined) : undefined;
  const [nodes, setNodes] = useState<PenNode[]>(() => (editing ? toPageNodes(editing) : []));
  const [hover, setHover] = useState<Point | null>(null);
  const live = useRef(nodes);
  live.current = nodes;
  const done = useRef(false);
  const px = 1 / zoom; // one screen pixel in page units

  const finish = () => {
    if (done.current) return;
    done.current = true;
    const pts = live.current;
    if (pts.length >= 3) commit(pts);
    editor.ui.set({ tool: 'select', penEditId: null });
  };

  const commit = (pts: PenNode[]) => {
    const b = pathBounds(penPath(pts, true));
    const w = Math.max(1, b.w);
    const h = Math.max(1, b.h);
    const local = pts.map((n) => {
      const out: PenNode = { x: round(n.x - b.x), y: round(n.y - b.y), hx: round(n.hx), hy: round(n.hy) };
      if (n.ix !== undefined) {
        out.ix = round(n.ix);
        out.iy = round(n.iy ?? 0);
      }
      return out;
    });
    const geo = { x: round(b.x), y: round(b.y), w: round(w), h: round(h), w0: round(w), h0: round(h), path: penPath(local, true), nodes: local };
    editor.doc.undo.stopCapturing();
    if (editing) {
      editor.doc.updateElement(editing.id, { ...geo, rotation: 0, flipX: false, flipY: false } as Partial<ShapeElement>);
      editor.ui.set({ selection: [editing.id] });
    } else {
      const el = makeShape('path', { ...geo, fill: { type: 'solid', color: editor.state.draw.color } });
      editor.doc.addElement(pageId, el);
      editor.ui.set({ selection: [el.id] });
    }
  };

  // Leaving the tool any other way (Escape, another tool) keeps what was drawn.
  useEffect(() => {
    done.current = false;
    return () => {
      // Still on the pen means React is only remounting (strict mode), not leaving.
      if (done.current || editor.state.tool === 'pen') return;
      done.current = true;
      if (live.current.length >= 3) commit(live.current);
      if (editor.state.penEditId) editor.ui.set({ penEditId: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        finish();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && !editing) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setNodes((n) => n.slice(0, -1));
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  const near = (a: Point, b: Point, r = 9) => Math.hypot(a.x - b.x, a.y - b.y) <= r * px;

  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const p = toLocal(e.clientX, e.clientY);
    if (editing) return editDown(e, p);
    if (nodes.length >= 3 && near(p, nodes[0])) return finish();
    const i = nodes.length;
    setNodes([...nodes, { x: p.x, y: p.y, hx: 0, hy: 0 }]);
    startDrag(
      e,
      (ev) => {
        const q = toLocal(ev.clientX, ev.clientY);
        setNodes((n) => n.map((m, j) => (j === i ? { ...m, hx: q.x - p.x, hy: q.y - p.y } : m)));
      },
      undefined,
      2,
    );
  };

  const editDown = (e: React.PointerEvent, p: Point) => {
    // Handles first: they sit on top of anchors when a curve is tight.
    // Mirrored handles move together; a broken pair (or Alt) moves one side alone.
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const [ix, iy] = inHandle(n);
      for (const side of ['out', 'in'] as const) {
        const [ox, oy] = side === 'out' ? [n.hx, n.hy] : [ix, iy];
        if ((!ox && !oy) || !near(p, { x: n.x + ox, y: n.y + oy })) continue;
        startDrag(e, (ev) => {
          const q = toLocal(ev.clientX, ev.clientY);
          setNodes((ns) =>
            ns.map((m, j) => {
              if (j !== i) return m;
              const vx = q.x - m.x;
              const vy = q.y - m.y;
              const broken = m.ix !== undefined || ev.altKey;
              if (!broken) return side === 'out' ? { ...m, hx: vx, hy: vy } : { ...m, hx: -vx, hy: -vy };
              const [kx, ky] = inHandle(m);
              return side === 'out' ? { ...m, hx: vx, hy: vy, ix: kx, iy: ky } : { ...m, ix: vx, iy: vy };
            }),
          );
        }, undefined, 0);
        return;
      }
    }
    const hit = nodes.findIndex((n) => near(p, n));
    if (hit < 0) return finish();
    if (e.altKey) {
      // Alt click turns a curve point into a corner and back.
      return setNodes((ns) =>
        ns.map((m, j) => {
          if (j !== hit) return m;
          const [ix, iy] = inHandle(m);
          return m.hx || m.hy || ix || iy ? { x: m.x, y: m.y, hx: 0, hy: 0, ix: 0, iy: 0 } : { x: m.x, y: m.y, hx: 40 * px, hy: 0 };
        }),
      );
    }
    const start = nodes[hit];
    startDrag(e, (ev) => {
      const q = toLocal(ev.clientX, ev.clientY);
      setNodes((ns) => ns.map((m, j) => (j === hit ? { ...m, x: start.x + q.x - p.x, y: start.y + q.y - p.y } : m)));
    }, undefined, 0);
  };

  const last = nodes[nodes.length - 1];
  const closing = !editing && hover && nodes.length >= 3 && near(hover, nodes[0]);
  const ghost = !editing && last && hover ? penPath([last, { ...(closing ? nodes[0] : hover), hx: 0, hy: 0 }], false) : '';
  const showHandles = editing ? nodes : last ? [last] : [];
  const a = 8 * px;

  return (
    <svg
      className="pen-layer"
      viewBox={`0 0 ${W} ${H}`}
      width={W * zoom}
      height={H * zoom}
      onPointerDown={onDown}
      onPointerMove={(e) => setHover(toLocal(e.clientX, e.clientY))}
      onDoubleClick={(e) => {
        e.stopPropagation();
        finish();
      }}
    >
      {nodes.length > 1 ? (
        <path d={penPath(nodes, !!editing || nodes.length > 2)} fill={editor.state.draw.color} fillOpacity={0.18} fillRule="evenodd" stroke="none" />
      ) : null}
      <path d={penPath(nodes, !!editing)} fill="none" stroke="var(--cobalt)" strokeWidth={1.5 * px} />
      {ghost ? <path d={ghost} fill="none" stroke="var(--cobalt)" strokeWidth={px} strokeDasharray={`${4 * px} ${3 * px}`} /> : null}
      {showHandles.map((n, i) => {
        const [ix, iy] = inHandle(n);
        return (
          <g key={`h${i}`}>
            {[
              [n.hx, n.hy],
              [ix, iy],
            ].map(([dx, dy], k) =>
              dx || dy ? (
                <g key={k}>
                  <line x1={n.x} y1={n.y} x2={n.x + dx} y2={n.y + dy} stroke="var(--cobalt)" strokeWidth={px} />
                  <circle cx={n.x + dx} cy={n.y + dy} r={3.5 * px} fill="var(--sheet)" stroke="var(--cobalt)" strokeWidth={1.5 * px} />
                </g>
              ) : null,
            )}
          </g>
        );
      })}
      {nodes.map((n, i) => {
        const big = i === 0 && closing;
        const s = big ? a * 1.5 : a;
        return (
          <rect
            key={i}
            x={n.x - s / 2}
            y={n.y - s / 2}
            width={s}
            height={s}
            fill={i === nodes.length - 1 && !editing ? 'var(--cobalt)' : 'var(--sheet)'}
            stroke="var(--cobalt)"
            strokeWidth={1.5 * px}
          />
        );
      })}
    </svg>
  );
}

// A path shape's anchors in page space, with its stretch, flips and rotation applied.
function toPageNodes(el: ShapeElement): PenNode[] {
  if (!el.nodes) return [];
  const sx = (el.w / (el.w0 || el.w)) * (el.flipX ? -1 : 1);
  const sy = (el.h / (el.h0 || el.h)) * (el.flipY ? -1 : 1);
  const a = ((el.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const cx = el.w / 2;
  const cy = el.h / 2;
  const vec = (x: number, y: number) => [x * cos - y * sin, x * sin + y * cos];
  return el.nodes.map((n) => {
    const lx = n.x * Math.abs(sx) * Math.sign(sx) + (sx < 0 ? el.w : 0) - cx;
    const ly = n.y * Math.abs(sy) * Math.sign(sy) + (sy < 0 ? el.h : 0) - cy;
    const [px, py] = vec(lx, ly);
    const [hx, hy] = vec(n.hx * sx, n.hy * sy);
    const out: PenNode = { x: el.x + cx + px, y: el.y + cy + py, hx, hy };
    if (n.ix !== undefined) [out.ix, out.iy] = vec(n.ix * sx, (n.iy ?? 0) * sy);
    return out;
  });
}

const round = (n: number) => Math.round(n * 100) / 100;
